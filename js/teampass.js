var teampassPasses = [];

function handleFileChange(evt){
	 //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
	      var contents = e.target.result;
        	console.log( "Got the file.n" 
              +"name: " + f.name + "n"
              +"type: " + f.type + "n"
              +"size: " + f.size + " bytesn"
              + "starts with: " + contents.substr(1, contents.indexOf("n"))
        );
        teampassPasses = JSON.parse(contents);
      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
}

function importTeamPassDialog() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {

		$('<div><p>First follow the instructions <a href="https://github.com/brantje/teampass-to-passman" target="_blank">here</a><input type="file" id="importFile"/>').dialog({
			buttons : {
				"Import" : function() {
					importTeamPass();
				},
				"Cancel" : function() {
					$(this).dialog("close");

				}
			},
			title : "Import password and folders team teampass."
		})
		document.getElementById('importFile').addEventListener('change', handleFileChange, false);
	} else {
		alert('The File APIs are not fully supported by your browser. Therefore an import is not supported');
	}
}





function importTeamPass() {
	var i = 0;
	$.each(teampassPasses, function() {
		this.foldertitle = this.foldertitle.replace(/^\s+|\s+$/g,'');  
		ourFolder = findFolderByName(this.foldertitle)
		if (ourFolder) {
			var createUrl = OC.generateUrl('apps/passman/api/v1/item');
			var encPw = (this.pw) ? Aes.Ctr.encrypt(this.pw, getEncKey(), 256) : null;
			var importData = {
				label : this.label,
				folderid : ourFolder.id.replace('ajson', ''),
				desc : this.description,
				account : this.login,
				pw1 : encPw,
				email : this.email,
				url : this.url,

			}
			$.post(createUrl, importData, function(data) {
			 	console.log('Inserted '+importData.label);
			 })
			delete teampassPasses[i];
		} else {
			if (ourFolder || this.folder_parent == 0) {
				console.log('Folder '+ this.foldertitle + ' not found, skipping item');
				var item = this
				/*$.post(OC.generateUrl('apps/passman/api/v1/folders/new'), {
					'folderId' : 'new',
					'parent' : item.folder_parent,
					'title' : item.foldertitle
				}, function(data) {
					if (data.folderid) {
						var folders = $(document).data('folderStructure');
						folders.push({
							'id' : "ajson" + data.folderid,
							'parent' : 'ajson' + item.folder_parent,
							'text' : item.foldertitle,
							'renewal_period' : 0,
							'min_pw_strength' : 0
						})
						$(document).data('folderStructure', folders);
						/*
						 * set_id is not working, as work arround i add the item to the array, destroy the tree and rebuld it.
						 * Not neat i know..
						 */
					/*}
				})*/
			}
		}
		i++;
	})
	
	$('#jsTree').jstree("destroy");
	generateFolderStructure()
	teampassPasses.clean(undefined)
}


function sleep(millis, callback) {
    setTimeout(function()
            { callback(); }
    , millis);
}
function findFolderByName(name){
	var folder;
	
	$.each($(document).data('folderStructure'),function(){
		if(name.indexOf(this.text) >-1)
			folder = this;
	})
	return folder;
}
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

