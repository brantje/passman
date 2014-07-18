$(document).ready(function() {
	if ($(document).data('importers')) {
		var importers = $(document).data('importers');
		importers.push(['Keepass 2.x', 'importKeepass2Dialog'])
		importers.push(['Keepass 1.x', 'importKeepass2Dialog'])
	} else {
		var importer = [['Keepass 2.x', 'importKeepass2Dialog']];
		var importer = [['Keepass 1.x', 'importKeepass2Dialog']];
		$(document).data('importers', importer);
	}
})
var keypassData = '"Group Tree","Account","Login Name","Password","Web Site","Comments"\n"General\\Network","Server 1","Root","password1","",""\n"General\\Network","server 2","root","password2","",""\n"General","Test 1 key","","owrfm6fqjs2cpWbMgvkY","",""'

function processData(allText) {
	var allTextLines = allText.split(/\r\n|\n/);
	var headers = allTextLines[0].split(',');
	var lines = [];
	for (var i = 1; i < allTextLines.length; i++) {
		var data = allTextLines[i].split(':');
		data = data[0].split(',')
		if (data.length == headers.length) {
			var tarr = [];
			for (var j = 0; j < headers.length; j++) {
				tarr[headers[j].toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')] = data[j].replace('"','').replace('"','').trim();
				//tarr.push([headers[j],data[j]]);
			}
			lines.push(tarr);
		}
	}
	return lines;
}

function handleKeyPassFileChange(evt) {
	//Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0];

	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			keypassData = contents;
			importKeePass2()
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}

function importKeepass2Dialog() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {

		$('<div id="keepassDialog"><p><a href="https://github.com/brantje/passman/wiki/Import-keepass" target="_blank" class="link">Read here how to export your keepass db</a><input type="file" id="importFile"/>').dialog({
			buttons : {
				"Import" : function() {
					importKeePass2();
				},
				"Cancel" : function() {
					$(this).dialog("close");

				}
			},
			title : "Import keepass items."
		})
		document.getElementById('importFile').addEventListener('change', handleKeyPassFileChange, false);
	} else {
		alert('The File APIs are not fully supported by your browser. Therefore an import is not supported');
	}
}

function importKeePass2() {
	$(document).data('importFolders',[])
	var rows = processData(keypassData);
	
	$.each(rows, function(k, v) {
		folder = v['group-tree']
		var tags = folder.replace('\\',',');
		var postData = {

			'label' : v.account,
			'tags' : tags,
			'desc' : encryptThis(v['comments']),
			'account' : encryptThis(v['login-name']),
			'pw1' : encryptThis(v['password']),
			'email' : encryptThis(''),
			'url' : encryptThis(v['web-site'])
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
				if(k==rows.length-1){
					KPImportDone();
				}
			}
		});
	})
}
function KPImportDone(){
	loadItems();
	$('#keepassDialog').dialog('destroy').remove();
	$('<div>The import was a success!</div>').dialog({
		title: "Keepass import",
		buttons : {
				"close": function(){
					$(this).dialog('destroy').remove();
				}
		}
	});
}
