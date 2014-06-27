$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

jQuery(document).ready(function($) {
	containerHeight = $('#app-content').height();
	containerWidth = $('#app-content').width();
	$('#pwList').height(containerHeight - $('#infoContainer').height() - 85);
	$('#pwList').width(containerWidth - 2);

	$(window).resize(function() {
		containerHeight = $('#app-content').height();
		containerWidth = $('#app-content').width();
		$('#pwList').height(containerHeight - $('#infoContainer').height() - 85);
		$('#pwList').width(containerWidth - 2);
	});
	

	$('#pwList li').click(function(evt) {
		$('#pwList li').removeClass('row-active');
		$(this).addClass('row-active');
		/* Load Item */

	}).hover(function() {
		var appendhtml = '<span id="actions"><a href="#" class="action" data-action="Share" original-title=""><span class="icon-share icon"></span><span>Share</span></a><a href="#" class="action" data-action="Edit" original-title=""><span class="icon-rename icon"></span><span>Edit</span></a><a href="#" class="action" original-title=""><span class="icon-delete icon"></span><span>Delete</span></a></span>';
		$(this).append(appendhtml);
	}, function() {
		$('#actions').remove();
	});

	var openForm = function(v) {
		$('#editAddItemDialog').dialog({
			"width" : ($(document).width() > 425) ? 425 : $(document).width() - 10,
			close : function(event, ui) {
				$(this).dialog('destroy');
				document.getElementById("editNewItem").reset();
				$('#pw1').trigger('keyup.simplePassMeter');
				$('#item_tabs').tabs( 'destroy');
			}
		});
	  $('#item_tabs').tabs();
	};

	$('#addItem').click(function() {
		openForm(null);
	});

	$('#custom_pw').buttonset();
	$('#pwTools').tooltip();

	$('.icon-toggle').toggle(function() {
		$("#pw1").attr('type', 'text');
	}, function() {
		$("#pw1").attr('type', 'password');
	});
	$('.icon-paste').click(function() {
		$('#pw2').val($('#pw1').val());
	});
	$('.icon-history').click(function() {
		var length = $('#pw_size').val();
		var charset = "", retVal = "";

		var pw_symbols = "!\"#$%&'()*+,-./:;< = >?@[\\]^_`{|}~";
		var pw_digits = '0123456789';
		var pw_uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var pw_lowers = 'abcdefghijklmnopqrstuvwxyz';

		if ($('#pw_numerics:checked').length > 0) {
			charset += pw_digits;
		}
		if ($('#pw_maj:checked').length > 0) {
			charset += pw_lowers + pw_uppers;
		}
		//
		if ($('#pw_symbols:checked').length > 0) {
			charset += pw_symbols;
		}
		for (var i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}
		$('#pw1').val(retVal).change().focus().trigger('keyup.simplePassMeter');
	});
	$('#pw1').simplePassMeter({
				  container: '#passwordStrengthDiv',
				  requirements: {},
				  defaultText : "Complexity",
       			  ratings: [
				            {	
				            	"minScore": 0,
				                "className": "meterFail",
				                "text": "Very weak"
				            },
				            {	
				            	"minScore": 25,
				                "className": "meterWarn",
				                "text": "Weak"
				            },
				            {	
				            	"minScore": 50,
				                "className": "meterWarn",
				                "text": "Medium"
				            },
				            {	
				            	"minScore": 60,
				                "className": "meterGood",
				                "text": "Strong"
				            },
				            {	"minScore": 70,
				                "className": "meterGood",
				                "text": "Very strong"
				            },
				            {	
				            	"minScore": 80,
				                "className": "meterExcel",
				                "text": "Heavy"
				            },
				            {	
				            	"minScore": 90,
				                "className": "meterExcel",
				                "text": "Very heavy"
				            }
       			 ]
	});
	
	$('#pw1').bind({
        "score.simplePassMeter" : function(jQEvent, score) {
        	if(score > 0)
            	$('.simplePassMeterText').append(' ('+score+' points)');
        }
    });

	$('#folderSettingsDialog .save').click(function(){
		$(document).data('currentFolder');
		
		var foldersettings = $.extend($(document).data('currentFolder'),$('#folderSettings').serializeObject());
		foldersettings.id = foldersettings.id.replace('ajson','');
		foldersettings.parent = foldersettings.parent.replace('ajson','');
		foldersettings.title = foldersettings.text;
		console.log(foldersettings);
		$.post(OC.generateUrl('apps/passman/api/v1/folders/'+foldersettings.id),foldersettings,function(){
			$('#folderSettingsDialog').dialog('close');
			foldersettings.id = 'ajson'+foldersettings.id
		})
	})
	
	/* Load the folders */
	loadFolders()
});
function loadFolders(){
	$.getJSON(OC.generateUrl('apps/passman/api/v1/folders')).success(function(data) { 
		var folders = [{'id': 'ajson0','parent': '#','text': 'Root'}]
		$.each(data.folders,function(k,v){
			var parent = (this.id==0) ? '#' : 'ajson'+this.parent_id;
			var folderData = {'id': "ajson"+ this.id,'parent': parent,'text': this.title,'renewal_period': this.renewal_period,'min_pw_strength': this.min_pw_strength}
			folders.push(folderData)
		});
		$(document).data('folderStructure',folders);
		generateFolderStructure();
	});
}
function generateFolderStructure(){
	/* Setup menu */
	$('#jsTree').jstree({
		"core" : {
			// so that create works
			"check_callback" : true,
			'data': $(document).data('folderStructure')
		},
		"plugins" : ["contextmenu"],
		"contextmenu" : {
			"items" : function($node) {
				var tree = $("#jsTree").jstree(true);
				return {
					"Settings" : {
						"separator_before" : false,
						"separator_after" : true,
						"label" : "Settings",  
						"action" : function(obj) {
							folderSettings($node);
						}
					},
					"Create" : {
						"separator_before" : false,
						"separator_after" : false,
						"label" : "Create",
						"action" : function(obj) {
							$node = tree.create_node($node);
							tree.edit($node);
						}
					},
					"Rename" : {
						"separator_before" : false,
						"separator_after" : false,
						"label" : "Rename",
						"action" : function(obj) {
							tree.edit($node);
						}
					},
					"Remove" : {
						"separator_before" : false,
						"separator_after" : false,
						"label" : "Remove",
						"action" : function(obj) {
							tree.delete_node($node);
						}
					}
				};
			}
		}
	}).bind('create_node.jstree', function(node, ref) {
		console.log('oncreate');

	}).bind('rename_node.jstree', function(node, obj) {
		renameFolder(node,obj);
	}).bind('delete_node.jstree', function(node, ref) {
		deleteFolder(ref)
	}).bind("select_node.jstree", function(event, data) {
		var ids = (data) ? $('#jsTree').jstree("get_path", data.node.id) : $('#jsTree').jstree("get_path", $(document).data('dirid'));
		var path = "";
		$.each(ids, function(k, v) {
			var l = ids.length;
			var classes = (k == l - 1) ? 'crumb last svg' : 'crumb';
			v2 = v.replace(/\s+/g, ' ');
			dir = $('.jstree-node:contains(' + v + ')');
			dir = dir[dir.length - 1];
			path += '<div class="' + classes + '" data-dir="' + $(dir).attr('id') + '"><a>' + v2 + '</a></div>';
		});
		$('#crumbs').html(path);
	}).bind('loaded.jstree',function(evt){
		$(this).jstree('open_node', $('#ajson0'));
	});
	$(document).on('click', '.crumb', function() {
		$('.jstree-clicked').removeClass('jstree-clicked');
		$(document).data('dirid', $(this).attr('data-dir'));
		$("#jsTree").jstree("select_node", '#' + $(this).attr('data-dir')).trigger("select_node.jstree");
	});
}

function getFolderById(id){
	var currentFolder;
	$.each($(document).data('folderStructure'),function(){
		if(id==this.id)
			currentFolder = this;
	})
	return currentFolder;
}

function folderSettings(node){
	var currentFolder = getFolderById(node.id);
	console.log(node)
	console.log(currentFolder);
	$(document).data('currentFolder',currentFolder);
	$('#folderId').val(currentFolder.id.replace('ajson',''));
	$('#min_pw_strength').val(currentFolder.min_pw_strength)
	$('#renewal_period').val(currentFolder.renewal_period)
	$('#folderSettingsDialog').dialog({ title: currentFolder.text+" settings",width: 200, close: 
										function() {
		  									$('#edit_folder_complexity').val('')
											$('#renewal_period').val('')
										}
	});
}

function renameFolder(node, obj){ 
	var f = obj.node;
	var folderID = f.id.replace('ajson','');
	var parent = f.parent.replace('ajson','');
	var title = f.text;
	$.post(OC.generateUrl('apps/passman/api/v1/folders/'+folderID),{'folderId': folderID,'parent': parent,'title': title },function(data){
		console.log(data);
		if(data.folderid){
			 var folders = $(document).data('folderStructure');
			  folders.push({'id': "ajson"+ data.folderid,'parent': 'ajson'+parent,'text': title,'renewal_period': 0,'min_pw_strength': 0})
			  $(document).data('folderStructure',folders);
			 /* 
			  * set_id is not working, as work arround i add the item to the array, destroy the tree and rebuld it.
			  * Not neat i know..
			  */
			 $('#jsTree').jstree("destroy");
			 generateFolderStructure()
		}
		else
		{
			var f = getFolderById('ajson'+folderID);
			f.text = title;
		}
	});
}

function deleteFolder(ref){
	var folderID = ref.node.id.replace('ajson','');
	$.ajax({
	    url: OC.generateUrl('apps/passman/api/v1/folders/'+folderID),
	    type: 'DELETE',
	    success: function(result) {
	        // Do something with the result
	    }
	});
}
