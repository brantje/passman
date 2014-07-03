$(document).ready(function() {
	if ($(document).data('importers')) {
		var importers = $(document).data('importers');
		importers.push(['LastPass', 'importlastPassDialog'])
	} else {
		var importer = [['LastPass 2', 'importlastPassDialog']];
		$(document).data('importers', importer);
	}
})

Array.prototype.unique = function() {
    var unique = [];
    for (var i = 0; i < this.length; i++) {
        if (unique.indexOf(this[i]) == -1) {
            unique.push(this[i]);
        }
    }
    return unique;
};

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
	lastPassData.shift();
	
	var lpFolders = new Array();
	
	$.each(lastPassData, function(k, v) {
		/*
		 * push the folders in an array
		 */
		if(v[5].trim()!=''){
			lpFolders[k] = v[5];
	}
	})
	lpFolders[lpFolders.length+1] = 'No category'
	importLastPassFolders(lpFolders.unique().clean(""));		
}
function importLastPassFolders(f){
	
	$.each(f,function(k,v){
		if(v==""){
		 v = 'No category'
		}
		var postData = {
					'folderId' : 'new',
					'parent' : 0,
					'title' : v
				}
					
				 $.ajax({
					async : false,
					type : "POST",
					url : OC.generateUrl('apps/passman/api/v1/folders/new'),
					dataType : 'JSON',
					data : postData,
					success : function(data) {
						if (data.folderid) {
							var folders = $(document).data('importFolders');
							folders.push({
								'id' : data.folderid,
								'parent' : 0,
								'text' : postData.title,
								'renewal_period' : 0,
								'min_pw_strength' : 0
							})
							$(document).data('importFolders', folders);
							console.log('Added ' + postData.title)
							if(k==f.length-1){
								importLastPassItems()
							}
						}
					}
				});
				
		
	})
}
function importLastPassItems(){
	$.each(lastPassData,function(k,v){
		var url = v[0];
		var username = v[1];
		var password = v[2];
		var desc = v[3];
		var label = v[4];
		if(v[5]==''){
			v = 'No category';
		}
		var folder = findLastPassFolderByName(v[5])
		postData = {

			'label' : encryptThis(label),
			'folderid' : folder.id,
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
	$('#jsTree').jstree('destroy')
	loadFolders();
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
