var teampassData = [];

function handleFileChange(evt) {
	//Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0];

	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			teampassData = JSON.parse(contents);
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

	$(document).data('importFolders', [])
	importTeamPassFolders();

	//clean up

}

function importTeamPassFolders() {
	counter = 0;
	if (teampassData.folders.length != 0) {
		$.each(teampassData.folders, function(key) {
			var folder = this;

			if (folder.parent_id == 0) {
				var postData = {
					'folderId' : 'new',
					'parent' : 0,
					'title' : folder.title
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
								'text' : folder.title,
								'renewal_period' : 0,
								'min_pw_strength' : 0
							})
							$(document).data('importFolders', folders);
							console.log('Added ' + folder.title)
							teampassData.folders[counter] = null;
						}
					}
				});

			} else {
				if (!findImportFolderByName(folder.name)) {
					var parentFolder = findImportFolderByName(folder.parent_title);
					console.log('Parent', parentFolder);
					if (parentFolder != '') {
						var parentId = parentFolder.id;
						var postData = {
							'folderId' : 'new',
							'parent' : parentId,
							'title' : folder.title
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
										'parent' : parentId,
										'text' : folder.title,
										'renewal_period' : 0,
										'min_pw_strength' : 0
									})
									$(document).data('importFolders', folders);
									console.log('Added ' + folder.title)
									teampassData.folders[counter] = null;
								}
							}
						});

					}
				} else {
					teampassData.folders[counter] = null;
				}
			}
			counter++;
		});
		teampassData.folders = teampassData.folders.clean();
	}
	console.log(teampassData, teampassData.folders.length);
	if (teampassData.folders.length != 0) {
		console.log('Next round!')
		importTeamPassFolders()
	} else {
		//import passes
		importTeampassItems();
	}
}

function importTeampassItems() {
	$.each(teampassData.items, function() {
		var ImportToFolder = (this.folder_title) ? findImportFolderByName(this.folder_title.toString().trim()) : null;
		var createUrl = OC.generateUrl('apps/passman/api/v1/item');
		var encPw = (this.pw) ? Aes.Ctr.encrypt(this.pw, getEncKey(), 256) : null;
		if (ImportToFolder) {
			postData = {

				'label' : this.label,
				'folderid' : ImportToFolder.id,
				'desc' : this.description,
				'account' : this.login,
				'pw1' : encPw,
				'email' : this.email,
				'url' : this.url
			}
			$.ajax({
				async : false,
				type : "POST",
				url : createUrl,
				dataType : 'JSON',
				data : postData,
				success : function(data) {
					console.log('Added item' + postData.label)
				}
			});
		} else {
			console.log('Could not import item', this)
			console.log('Error folder not found', ImportToFolder)
		}
	})
	showNotification("Import complete, enjoy!.")
	$('#jsTree').jstree('destroy')
	loadFolders();
	$('#importFile').val('');
	teampassData = [];
	$(document).data('importFolders', {})
}

function findImportFolderByName(name) {
	var foundFolder = '';
	$.each($(document).data('importFolders'), function() {
		if (this.text.indexOf(name) > -1)
			foundFolder = this;
	})
	return foundFolder;
}

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
};
Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

$(document).ready(function() {
	if ($(document).data('importers')) {
		var importers = $(document).data('importers');
		importers.push['Teampass', 'importTeamPassDialog']
	} else {
		var importer = [['Teampass', 'importTeamPassDialog']];
		$(document).data('importers', importer);
	}

})
