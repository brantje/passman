$(document).ready(function() {
	if ($(document).data('importers')) {
		var importers = $(document).data('importers');
		importers.push(['LastPass', 'importlastPassDialog'])
	} else {
		var importer = [['LastPass 2', 'importlastPassDialog']];
		$(document).data('importers', importer);
	}
})


function processLastPassData(strData,strDelimiter) {
	strDelimiter = (strDelimiter || ",");
	var objPattern = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"
	), "gi");
	var arrData = [[]];
	var arrMatches = null;

	while ( arrMatches = objPattern.exec(strData)) {
		var strMatchedDelimiter = arrMatches[1];
		if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {

			arrData.push([]);

		}

		var strMatchedValue;
		if (arrMatches[2]) {

			strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

		} else {
			strMatchedValue = arrMatches[3];

		}
		arrData[arrData.length - 1].push(strMatchedValue);
	}

	return (arrData );
}


function handleKeyPassFileChange(evt) {
	//Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0];

	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			lastPassData = contents;
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}

function importlastPassDialog() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {

		$('<div  id="lastPassPopup"><p><a href="https://github.com/brantje/passman/wiki/Import-lastpass" target="_blank" class="link">Read here how to export your LastPass db</a><input type="file" id="importFile"/>').dialog({
			buttons : {
				"Import" : function() {
					importLastPass();
				},
				"Cancel" : function() {
					$(this).dialog("close");

				}
			},
			title : "Import LastPass items."
		})
		document.getElementById('importFile').addEventListener('change', handleKeyPassFileChange, false);
	} else {
		alert('The File APIs are not fully supported by your browser. Therefore an import is not supported');
	}
}

function importLastPass() {
	$(document).data('importFolders',[])
	lastPassData = processLastPassData(lastPassData);
	console.log(lastPassData[0])
	importLastPassItems()	
}

function importLastPassItems(){
	$.each(lastPassData,function(k,v){
		var url = v[0];
		var username = v[1];
		var password = v[2];
		var desc = v[3];
		var label = v[4];
		postData = {

			'label' : label,
			'tags' :v[5],
			'desc' : encryptThis(desc),
			'account' : encryptThis(username),
			'pw1' : encryptThis(password),
			'email' : encryptThis(''),
			'url' : encryptThis(url)
		}
		var createUrl = OC.generateUrl('apps/passman/api/v1/item');
		$.ajax({
			async : false,
			type : "POST",
			url : createUrl,
			dataType : 'JSON',
			data : postData,
			success : function(data) {
				console.log('Added item ' + postData.label)
				if(k==lastPassData.length-1){
					lpImportDone();
				}
			}
		});
	
	})
}
function lpImportDone(){
	loadItems();
	$('#lastPassPopup').dialog('destroy').remove();
	$('<div>The import was a success!</div>').dialog({
		title: "LastPass import",
		buttons : {
				"close": function(){
					$(this).dialog('destroy').remove();
				}
		}
	});
}
function findLastPassFolderByName(name) {
	var foundFolder = '';
	$.each($(document).data('importFolders'), function() {
		if (this.text.indexOf(name) > -1)
			foundFolder = this;
	})
	return foundFolder;
}
