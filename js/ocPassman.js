$.fn.serializeObject = function() {
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

if (!Date.prototype.toISOString) {( function() {

			function pad(number) {
				var r = String(number);
				if (r.length === 1) {
					r = '0' + r;
				}
				return r;
			}


			Date.prototype.toISOString = function() {
				return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) + 'Z';
			};

		}() );
}


jQuery(document).ready(function($) {

	/*
	 * Stop all snap.js timers
	 */
	var highestTimeoutId = setTimeout(";");
	for (var i = 0; i < highestTimeoutId; i++) {
		clearTimeout(i);
	}
	Snap = null;
	
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
	
	/**
	 * Bind click to show the item information. Bind hover to show actions
	 * Bind .action click to handle actions
	 */
	$(document).on('click','#pwList li',function(evt) {
		$('#pwList li').removeClass('row-active');
		$(this).addClass('row-active');
		loadItem($(this).attr('data-id'));
		$('#editItem').attr('disabled',false);
		$('#deleteItem').attr('disabled',false);

	});
	$('#pwList').click(function(){
		$('#editItem').attr('disabled','disabled');
		$('#deleteItem').attr('disabled','disabled');
		$('#pwList li').removeClass('row-active');
		var mapper = {id_label:'',id_desc: '',hid_pw: '',id_login:'',id_email: '', id_url: '',id_files: '',id_tags: ''};
		$.each(mapper,function(k,v){ (k!='hid_pw') ? $('#'+k).html(v) : $('#'+k).val(v);});
		$('#showPW').remove();
		$('#copyPW').remove();
		$('#id_pw').html('');
		$('#id_files').html('');
		$('#customFieldsTable').html('');
	});
	
	$(document).on('dblclick','#pwList li',function(evt) {
		editItem($('.row-active').attr('data-id'));
	});
	
	$('#editItem').click(function(){
		editItem($('.row-active').attr('data-id'));
	});
	$('#deleteItem').click(function(){
		deleteItem($('.row-active').attr('data-id'));
	});

	$('#addItem').click(function() {
		if(selectedFolder.id!='ajson0'){
		openForm({item_id:0, folderid: selectedFolder.id.replace('ajson','')});
		}
	});
	
	$(document).on('click','.link.loadFile',function(){
		var fileId = $(this).attr('data-fileid');
		loadFile(fileId);
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
	passwordRatings = [
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
       			 ];
	$('#pw1').simplePassMeter({
				  container: '#passwordStrengthDiv',
				  requirements: {},
				  defaultText : "Complexity",
       			  ratings: passwordRatings
	});
	
	$('#pw1').bind({
        "score.simplePassMeter" : function(jQEvent, score) {
        	$(document).data('passwordScore',score);
        	if(score > 0)
            	$('.simplePassMeterText').append(' ('+score+' points)');
        }
    });
	
	$('#fileInput').change(function () {
	  addFilesToItem(this.files);
	});
	

	$(document).on('click','.fileListItem .icon-delete',function(){
		deleteFile($(this).parent().attr('data-fileid'));
	});


	$('#editAddItemDialog .cancel').click(function(){
		$('#editAddItemDialog').dialog('close');
	});
	
	$(document).on('click','#showPW',function(){
		if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off'){
	        /* currently it's not been toggled, or it's been toggled to the 'off' state,
	           so now toggle to the 'on' state: */
	           $(this).attr('data-toggled','on');
	           $('#id_pw').text(decryptThis($('#hid_pw').val()));
	    }
	    else if ($(this).attr('data-toggled') == 'on'){
	        /* currently it has been toggled, and toggled to the 'on' state,
	           so now turn off: */
	           $(this).attr('data-toggled','off');
	           var starPW ='';
			   for(i = 0; i <12; i++){
					starPW += '*';
			   }
			   $('#id_pw').html(starPW);
	    }
	});
		
	$('#customFieldName').keyup(function(evt){
		if(evt.keyCode==13 && $(this).val()!=''){
			$('#customFieldValue').focus();
		}
	});
	$('#customFieldValue').keyup(function(evt){
		if(evt.keyCode==13 && $(this).val()!=''){
			$('#existingFields').prepend('<tr class="new" data-cFieldId="0"><td class="fieldName">'+$('#customFieldName').val()+ '</td><td>'+ $('#customFieldValue').val());
			$('#customFieldValue').val('');
			$('#customFieldName').val('').focus();
		}
	});
	

	$(document).on('dblclick', '#existingFields tr td', function() {
		var value = $(this).text();
		$(this).html('');
		$('<input></input>').attr({
			'type' : 'text',
			'size' : '25',
			'value' : value
		}).appendTo($(this)).focus()
		$(this).find('input').blur(function(){
			$(this).parent().text($(this).val());
		});
		
	});

	
	$('#editAddItemDialog .save').click(saveItem);
	
	$('#folderSettingsDialog .cancel').click(function(){
		$('#folderSettingsDialog').dialog('close');
	});
	
	$('#folderSettingsDialog .save').click(function(){
		var foldersettings = $.extend($(document).data('currentFolder'),$('#folderSettings').serializeObject());
		foldersettings.id = foldersettings.id.replace('ajson','');
		foldersettings.parent = foldersettings.parent.replace('ajson','');
		foldersettings.title = foldersettings.text;
		$.post(OC.generateUrl('apps/passman/api/v1/folders/'+foldersettings.id),foldersettings,function(){
			$('#folderSettingsDialog').dialog('close');
			foldersettings.id = 'ajson'+foldersettings.id;
		});
	});
	
	
	

	
	/**
	 * Request the user encryption key (if it is not found)
	 */
	var ls = $.jStorage.get("ENC_KEY");
	if(!ls || !$.jStorage.storageAvailable()){
	    encryptionKeyDialog();
	}
	else
	{
		setEncKey($.jStorage.get("ENC_KEY"));
		$('#sessionTimeContainer').show();
		countLSTTL();
		/* Load the folders */
		loadFolders();
	}
	$('.lockSession').click(function(){
		resetStorageKey();
		encryptionKeyDialog();
	});
	$('.import.link').click(importDialog);
});
function importDialog(){
	
	var option ='';
	$.each($(document).data('importers'),function(k,importer){
		var name = importer[0];
		var func = importer[1];
		option += '<option value="'+ func + '">'+ name +'</option>';
	});
	html = 'Select the importer you want to use';
	html += '<select id="importer">'+ option +'</select>';
	$('<div>'+html+'</div>').dialog({
		close:  function(){
					$(this).remove();	
				},
		buttons: {
					"Ok": function(){
						window[$('#importer').val()]();
						$(this).dialog('destroy').remove();	
					},
					"Cancel": function(){
						$(this).dialog('destroy').remove();	
					}
		}
		
	});
}

function countLSTTL() {
	var expire = $.jStorage.getTTL('ENC_KEY') / 1000;
	var days = Math.floor(expire / 86400);
	var hours = Math.floor((expire - (days * 86400 )) / 3600);
	var minutes = Math.floor((expire - (days * 86400 ) - (hours * 3600 )) / 60);
	var secs = Math.floor((expire - (days * 86400 ) - (hours * 3600 ) - (minutes * 60)));

	var str = '';
	if (days > 0)
		str += days + ' days ';
	if (hours < 10)
		hours = '0' + hours;
	if (minutes < 10)
		minutes = '0' + minutes;
	if (secs < 10)
		secs = '0' + secs;
	str += hours + ':';
	str += minutes + ':';
	str += secs;

	$('#sessionExpire').text(str);
	if (days == 0 && hours == "00" && minutes == "00" && secs == "00") {
		resetStorageKey();
		encryptionKeyDialog();
	} else {

		ttltimer = setTimeout(function() {
			countLSTTL();
		}, 1000);
	}
}


function encryptionKeyDialog(){
	$('#encryptionKeyDialog').dialog({
						modal: true,
						open: function(event, ui) { 
							$(".ui-dialog-titlebar-close").hide(); 
						},
						buttons: { "Ok": function() {
								if($('#ecKey').val()==''){
									showNotification("Encryption key can't be empty!");
									return false;
								}
								$(this).dialog("close");
								loadFolders();
								setEncKey($('#ecKey').val());
								if($('#ecRemember:checked').length > 0){
									$.jStorage.set("ENC_KEY", $('#ecKey').val());
									if($('#rememberTime').val() != 'forever'){
										var time = $('#rememberTime').val()*60*1000;
										$.jStorage.setTTL("ENC_KEY", time);
										$('#sessionTimeContainer').show();
										countLSTTL();
									}
								}
							    $('#ecKey').val('');
							    $('#ecRemember').removeAttr('checked');
							    $('#rememberTime').val('15');
							} 
						}
				});
					
	 $('#ecKey').keypress(function(event) { 
	 	if(event.keyCode==13){
	 		$('.ui-dialog-buttonpane button').click();
	 	}
	 	
	 });
	 
	 $('#rememberTime').change(function(){
	 	$('#ecRemember').attr('checked','checked');
	 });
}

/**
 * Set encryption key
 */
function setEncKey(key){
	$(document).data('ENC_KEY',key);
}

function getEncKey(){
	return $(document).data('ENC_KEY');
}
function resetStorageKey(){
	$.jStorage.deleteKey("ENC_KEY");
	$(document).data('ENC_KEY');
}
/**
 * Encrypt a string with the algorithm
 */
function encryptThis(str){
	return Aes.Ctr.encrypt(str,getEncKey(),256);
}
/**
 * Decrypt a string with the algorithm
 */
function decryptThis(str){
	return Aes.Ctr.decrypt(str, getEncKey(), 256);
}
function loadFolders(){
	$.getJSON(OC.generateUrl('apps/passman/api/v1/folders')).success(function(data) { 
		var folders = [{'id': 'ajson0','parent': '#','text': 'Root'}];
		$.each(data.folders,function(k,v){
			var parent = (this.id==0) ? '#' : 'ajson'+this.parent_id;
			var folderData = {'id': "ajson"+ this.id,'parent': parent,'text': this.title,'renewal_period': this.renewal_period,'min_pw_strength': this.min_pw_strength};
			folders.push(folderData);
		});
		$(document).data('folderStructure',folders);
		generateFolderStructure();
	});
}
function generateFolderStructure(){
	/* Setup menu */
	$.jstree.defaults.contextmenu.show_at_node = false;
	var plugins = (isMobile()==false) ? ["contextmenu", "state","dnd"] :["contextmenu", "state"];
	$('#jsTree').jstree({
		"core" : {
			// so that create works
			"check_callback" : true,
			'data' : $(document).data('folderStructure'),
		},
		"plugins" : plugins,
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
	}).bind('rename_node.jstree', function(node, obj) {
		updateFolder(node, obj);
	}).bind('delete_node.jstree', function(node, obj) {
		CreateDialog('Are you sure?', 'This will delete all child folders and items in this folder', "I'm sure", "Cancel", function(obj) {
			$.each(obj.node.children_d, function(k, v) {
				deleteFolder(v.replace('ajson',''));
			});
			deleteFolder(obj.node.id.replace('ajson',''));
			
		}.bind(node, obj), function() {
			$('#jsTree').jstree('destroy');
			generateFolderStructure();
		});
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
		loadFolder(data.node.id.replace('ajson', ''));
		$('#pwList').click();
		}).bind('loaded.jstree', function(evt) {
		$('#jsTree').jstree('open_node', $('#ajson0'));
		$('#jsTree').bind("move_node.jstree", function(event, object) {
			/**
			 * When a folder is moved
			 * @TODO Save folder order 
			 */
			updateFolder(event,object);
		});
	});
	$(document).on('click', '.crumb', function() {
		$('.jstree-clicked').removeClass('jstree-clicked');
		$(document).data('dirid', $(this).attr('data-dir'));
		$("#jsTree").jstree("select_node", '#' + $(this).attr('data-dir')).trigger("select_node.jstree");
	}); 

	//loadFolder(0);
}

function getFolderById(id){
	var folder;
	
	$.each($(document).data('folderStructure'),function(){
		if(id==this.id || (id.toString().replace('ajson','') == this.id.toString().replace('ajson','')))
			folder = this;
	});
	return folder;
}
/**
 * Show folder settings
 */
function folderSettings(node){
	var currentFolder = getFolderById(node.id);
	$(document).data('currentFolder',currentFolder);
	$('#folderId').val(currentFolder.id.replace('ajson',''));
	$('#min_pw_strength').val(currentFolder.min_pw_strength);
	$('#renewal_period').val(currentFolder.renewal_period);
	$('#folderSettingsDialog').dialog({ title: currentFolder.text+" settings",width: 200, close: 
										function() {
		  									$('#edit_folder_complexity').val('');
											$('#renewal_period').val('');
										}
	});
}
/**
 * Rename a folder by context menu refference
 */
function updateFolder(node, obj){ 
	console.log(node,obj);
	var f = obj.node;
	var folderID = f.id.replace('ajson','');
	var parent = f.parent.replace('ajson','');
	var title = f.text;
	$.post(OC.generateUrl('apps/passman/api/v1/folders/'+folderID),{'folderId': folderID,'parent': parent,'title': title },function(data){
		if(data.folderid){
			 var folders = $(document).data('folderStructure');
			  folders.push({'id': "ajson"+ data.folderid,'parent': 'ajson'+parent,'text': title,'renewal_period': 0,'min_pw_strength': 0});
			  $(document).data('folderStructure',folders);
			 /* 
			  * set_id is not working, as work arround i add the item to the array, destroy the tree and rebuld it.
			  * Not neat i know..
			  */
			 $('#jsTree').jstree("destroy");
			 generateFolderStructure();
		}
		else
		{
			var f = getFolderById('ajson'+folderID);
			f.text = title;
		}
	});
}

/**
 * Delete a folder by id
 */
function deleteFolder(folderId){
	console.log(folderId);
	
	var tempstorage = [];
	$.each($(document).data('folderStructure'),function(){
		if('ajson'+folderId !=this.id){
			tempstorage.push(this);
		}
	});
	$(document).data('folderStructure',tempstorage);
	$.ajax({
	    url: OC.generateUrl('apps/passman/api/v1/folders/'+folderId),
	    type: 'DELETE',
	    async: false,
	    success: function(result) {
	        
	    }
	});
}

/**
 * Load the items in a folder
 * @param {int} folderId
 */
function loadFolder(folderId){
	$('#pwList').html('');
	if(folderId!=0){
		$('#addItem').attr('disabled',false);
	}
	else
	{
		$('#addItem').attr('disabled','disabled');
		$('#addItem').attr('disabled','disabled');
	}
	$('#pwList').html('<span id="itemsLoading" class="icon-loading icon" style="height: 32px; width: 32px; margin-left: 10px;"></span>');
	$.get(OC.generateUrl('apps/passman/api/v1/items/'+folderId),function(data){
		$('#itemsLoading').remove();
		if(data.items.length != 0){
			$.each(data.items,function(){
				 var append = '<li data-id='+ this.id +'><div style="display: inline-block;">'+ decryptThis(this.label)+'</div></li>';
				 $('#pwList').append(append);
				if(!isMobile()){
					makeDragable();
				} 
			});
		}
		else
		{
			$('#pwList').html('Folder is empty');
		}
		
		selectedFolder = getFolderById(folderId);
	});
}

function makeDragable(){
	$('#pwList li').draggable({
		helper: 'clone',
		appendTo: 'body',
		revert: "invalid",
		 start: function (event, ui) {
                $(ui.helper).css("margin-left", event.clientX - $(event.target).offset().left+10);
                $(ui.helper).css("margin-top", event.clientY - $(event.target).offset().top-10);
            }
	});
	/*$('#ajson0 li').droppable({
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      drop: function( event, ui ) {
      	if(event.type=="drop"){
      		var itemId = $(ui.draggable[0]).attr('data-id');
      		var targetFolder = event.target.id.replace('ajson','').trim()
      		$.post(OC.generateUrl('apps/passman/api/v1/item/move/'+itemId+'/'+ targetFolder),{},function(d){
      			$('li[data-id="'+itemId+'"]').remove();
      		});
      	}
      }
    });*/
}

/**
 * Load an item
 * @param {int} id
 */
function loadItem(id,rawDesc) {
	$.get(OC.generateUrl('apps/passman/api/v1/item/' + id), function(data) {
		$('#id_files').html('');
		$('#customFieldsTable').html('');
		var item = data.item;
		item.description = nl2br(item.description);
		
		
		
		var mapper = {
			id_label :  decryptThis(item.label),
			id_desc : decryptThis(item.description),
			hid_pw : item.password,
			id_login : decryptThis(item.account),
			id_email : decryptThis(item.email),
			id_url : decryptThis(item.url),
			files : item.files,
			id_tags : ''
		};
		$.each(mapper, function(k, v) {
			(k != 'hid_pw') ? $('#' + k).html(v) : $('#' + k).val(v);
		});
		var copyableFields = ['id_login','id_desc','id_url','id_email'];
		
	
		$.each(copyableFields, function(k, v) {
			if (mapper[v] != '') {
				if (v != 'id_url') {
					$('#' + v).append('<span id="copy' + v + '" class="copy">[Copy]</span>');
					var client = new ZeroClipboard($('#copy'+v));
					client.on('ready', function(event) {
						client.on('copy', function(event) {
							var clipboard = event.clipboardData;
							clipboard.setData("text/plain", $('<div>'+mapper[v]+'</div>').text());
							showNotification("Password copied to clipboard");
						});
					});
				} else {
					$('#' + v).append('<a href="' + mapper[v] + '" target="_blank" class="copy link">[Go to url]</span>');
				}
			}
		}); 
		
		if(item.customFields.length > 0){
			$.each(item.customFields,function(k,field){
				var row = '<tr><td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>'+ decryptThis(field.label) +' :</td>';
                    row +='<td><div id="id_'+field.label+'" style="float:left;">'+ decryptThis(field.value) +'</div></td></tr>'
				$('#customFieldsTable').append(row);
			});
		}
		var starPW = '';
		for ( i = 0; i < 12; i++) {
			starPW += '*';
		}
		var append = '<span id="showPW">[Show]</span> <span id="copyPW">[Copy]</span>';
		$('#id_pw').html(starPW).after(append);
		var client = new ZeroClipboard($('#copyPW'));
		client.on('ready', function(event) {
			client.on('copy', function(event) {
				var clipboard = event.clipboardData;
				clipboard.setData("text/plain",  decryptThis(item.password));
				showNotification("Password copied to clipboard");
			});
		});
		if(mapper.files){
			$.each(mapper.files,function(){
				var icon = (this.type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
				$('#id_files').append('<span class="link loadFile" data-fileid="'+this.id+'"> <span class="'+ icon +'"></span>'+ decryptThis(this.filename) +' (' + humanFileSize(this.size) + ')' );
			});
		}
		else
		{
			$('#id_files').html('');
		}
			
		
		return mapper;
	});
}

function getRating(str){
	var scoreInfo;
	 $.each(passwordRatings,function(k,v){
	 	if(str >= this.minScore)
	 		scoreInfo = this;
	 });
	return scoreInfo;
}

function openForm(mapper) {
	var folderPwStrength = getRating(selectedFolder.min_pw_strength);
	$('#complex_attendue').html('<b>' + folderPwStrength.text + '</b>');
	$('#editAddItemDialog').dialog({
		"width" : ($(document).width() > 425) ? 425 : $(document).width() - 10,
		close : function(event, ui) {
			$(this).dialog('destroy');
			document.getElementById("editNewItem").reset();
			$('#pw1').trigger('keyup.simplePassMeter');
			$('#item_tabs').tabs('destroy');
			$('#complex_attendue').html('<b>Not defined</b>').removeAttr('class');
			$('#editAddItemDialog .error').remove();
			$('#existingFields').html('')
			$('#fileList').html('')
		}
	});
	$('#item_tabs').tabs();
	if (mapper != null) {
		if(mapper.item_id != 0){
			$('a[href="#tabs-03"]').show();
		}
		else
		{
			$('a[href="#tabs-03"]').hide();
		}
		$.each(mapper, function(k, v) {
			$('#' + k).val(v.toString().replace(/<br \/>/g,"\n"));
		});
		if (mapper.pw1) {
			$('#pw1').change().trigger('keyup.simplePassMeter');
		}
		$(document).data('p',mapper.pw1);
		if(mapper.files){
			$.each(mapper.files,function(){
				var data = this;
				var filename =  (data.filename.length >= 20) ? data.filename.substring(0, 20)+'...' : data.filename;
				$('#fileList').append('<li data-filename="' + data.filename + '" data-fileid="'+ data.id +'" class="fileListItem">' + filename + ' (' + humanFileSize(data.size) + ') <span class="icon icon-delete" style="float:right;"></span></li>');
			});
		}
		if(mapper.customFields){
			$.each(mapper.customFields,function(k,field){
				var row = '<tr data-cFieldId='+ field.id +'><td>'+ decryptThis(field.label) +'</td>';
                    row +='<td>'+decryptThis(field.value)+'</td></tr>'
					$('#existingFields').append(row)
			});
		}
	}

}; 

function saveItem() {
	formData = $('#editNewItem').serializeObject();
	$('#editAddItemDialog .error').remove();
	var ERROR = false;
	var createUrl = OC.generateUrl('apps/passman/api/v1/item');
	var updateUrl = OC.generateUrl('apps/passman/api/v1/item/' + formData.item_id);
	var postUrl = (formData.item_id == 0) ? createUrl : updateUrl;

	/**
	 *
	 */
	var passwordStrength = $(document).data('passwordScore');
	var requiredStrength = getRating(selectedFolder.min_pw_strength);
	if (passwordStrength < requiredStrength.minScore && $('#override:checked').length == 0) {
		ERROR = 'Password complexity is not fulfilled!';
	}
	if (formData.pw1 != formData.pw2) {
		ERROR = 'Passwords do not match!';
	}
	if (formData.label == '') {
		ERROR = 'A label is mandatory!';
	}
	var customFields = [];
	$.each($('#existingFields tr'),function(){
		var fieldName = $(this).children('td:first').text();
		var fieldId = ($(this).attr('data-cFieldId')=='0') ? '' : $(this).attr('data-cFieldId');
		var fieldValue = $(this).children("td:nth-child(2)").text();
		customFields.push( {id: fieldId, name: encryptThis(fieldName), value: encryptThis(fieldValue)} );
	});
	
	var ignoredEncryptionFields = ['folderid','item_id'];
	$.each(formData,function(k,v){
		if($.inArray(k,ignoredEncryptionFields)==-1){
			formData[k] = encryptThis(v);
		}
	});
	formData.customFields = customFields;
	formData.changedPw = ($(document).data('p') != $('#pw1').val()) ? true : false;
	if($('#expire_time').val() != ''){
		if(selectedFolder.renewal_period > 0 && $('#pw1').val()==0){
			var expireTime = new Date($('#expire_time').val());
			if(expireTime < new Date() && formData.changedPw==false){
				ERROR = 'The password is expired, you must renew it before you can save';
			}
		}
	}
	if (!ERROR) {
		$.post(postUrl, formData, function(data) {
			if (data.success) {
				$('#pwList li[data-id=' + data.success.id + ']').html('<div style="display: inline-block;">'+ decryptThis(data.success.label) +'</div>');
				loadItem(data.success.id);
				$('#showPW').remove();
				$('#copyPW').remove();
			} else {
				var append = '<li data-id=' + data.itemid + '><div style="display: inline-block;">' + decryptThis(formData.label) + '</div></li>';
				if($('#pwList').text()!='Folder is empty'){
					$('#pwList').append(append);
				}else{
					$('#pwList').html(append);
				}
			}
			$('#editAddItemDialog').dialog('close');
		});
	} else {
		$('#editAddItemDialog').prepend('<div class="error">' + ERROR + '</div>');
	}
}


function editItem(itemId) {
	
	$.get(OC.generateUrl('apps/passman/api/v1/item/' + itemId), function(data) {
		var item = data.item;
		item.password = decryptThis(item.password);
		var edtmapper = {
			item_id : item.id,
			folderid : item.folderid,
			label : decryptThis(item.label),
			desc : decryptThis(item.description),
			pw1 : item.password,
			pw2 : item.password,
			account : decryptThis(item.account),
			email : decryptThis(item.email),
			url : decryptThis(item.url),
			files : item.files,
			expire_time: item.expire_time,
			id_tags : '',
			customFields: item.customFields
		};
		openForm(edtmapper);
	});
}




function deleteItem(itemId){
	$.ajax({
    url: OC.generateUrl('apps/passman/api/v1/item/'+itemId),
    type: 'DELETE',
    success: function(data) {
        $('#pwList li[data-id='+ data.deleted+']').slideUp(function(){$(this).remove();});
    }
});
}

function addFilesToItem(files) {
	var itemId = $('#item_id').val();
	//Will be changed later
	//var allowedMimeTypes = ['image/x-icon', 'image/tiff', 'image/svg+xml', 'image/pipeg', 'image/ief', 'image/bmp', 'image/gif', 'image/jpeg', 'application/pkixcmp', 'application/pkix-crl', 'image/jpeg', 'image/png', 'application/pdf', 'application/pkix-cert', 'application/pkixcmp', 'application/x-x509-ca-cert', 'text/html', 'text/plain', 'text/x-vcard', 'application/x-pkcs12', 'application/x-pkcs7-certificates', 'pplication/x-pkcs7-mime', 'application/x-pkcs7-certreqresp', 'application/vnd.ms-powerpoint', 'application/vnd.ms-outlook', 'application/vnd.ms-excel', 'application/postscript', 'application/pkcs10,', 'application/pkix-crl', 'application/msword'];
	$.each(files, function() {
		file = this;

		reader = new FileReader();
		reader.onloadend = (function(file) {
			return function(evt) {
				if (file.size < 20971520) {
					var dataURL = evt.target.result;
					var mimeType = dataURL.split(",")[0].split(":")[1].split(";")[0];
					var encryptedFile = encryptThis(dataURL);
					var postData = {
						item_id : itemId,
						filename :  encryptThis(file.name),
						type : file.type,
						mimetype : mimeType,
						size : file.size,
						content : encryptedFile
					};
					//if ($.inArray(mimeType, allowedMimeTypes) !== -1) {
						$.post(OC.generateUrl('apps/passman/api/v1/item/' + itemId + '/addfile'), postData, function(data) {
							$('#fileList').append('<li data-filename="' + data.filename + '" data-fileid="'+ data.id +'">' + file.name + ' (' + humanFileSize(file.size) + ') <span class="icon icon-delete" style="float:right;"></span></li>');
						});
					//}
					//else
					//{
					//	$('#fileList').append('<li class="error">' + file.name + ' mimetype: ' + mimeType +' not allowed</li>')//.delay(5000).slideUp();
					//}

				} else {
					$('#fileList').append('<li>' + file.name + ' Can\'t upload max file size: ' + humanFileSize(20971520) + '</li>');
				}
			};
		})(file);
		reader.readAsDataURL(file);
	});
}






function loadFile(fileId) {
	$.get(OC.generateUrl('/apps/passman/api/v1/item/file/' + fileId), function(data) {
		console.log(data);
		/* Show the image if it is ofcourse */
		if (data.type.indexOf('image') >= 0) {
			var imageData = decryptThis(data.content);
			$('#fileImg').attr('src', imageData);
			$('#downloadImage').html('<a href="'+ imageData +'" download="'+ data.filename +'">Save this image</a>');
			$('#fileImg').load(function() {
				$('#dialog_files').dialog({
					width : 'auto',
					title : data.filename
				});
				var win = $(window);
				if ($('#fileImg').width() > win.width() || $('#fileImg').height() > win.height()) {
					$('#fileImg').css('width', $(window).width() * 0.8);
						$('#dialog_files').parent().position({
						    my: "center",
						    at: "center",
						    of: window
						});
				}
			});
		} else {
			var fileData = decryptThis(data.content);
			//console.log(fileData);
			$('<div>Due popup blockers you have to click the below button to download your file.</div>').dialog({
				title : "Download " + data.filename,
				content : 'test',
				buttons : {
					"Download" : function() {
						var uriContent = dataURItoBlob(fileData,data.type);
						/*var newWindow = window.open(uriContent, data.filename);*/
						var a = document.createElement("a");
						a.style = "display: none";
						a.href = uriContent;
				        a.download = data.filename;
				        a.click();
				        window.URL.revokeObjectURL(url);
						$(this).remove();
					},
					"Cancel" : function() {
						$(this).dialog('destroy').remove();
					}
				}
			});
		}
	});
}

function dataURItoBlob(dataURI, ftype) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
 
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
 
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
 
    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab], {type: ftype}) ;
   	
    return URL.createObjectURL(bb);
}
/**
 * @todo delete file
 * @param {Object} str
 */
function deleteFile(fileId){
	$.ajax({
	    url: OC.generateUrl('apps/passman/api/v1/item/file/'+fileId),
	    type: 'DELETE',
	    success: function(result) {
	        $('li[data-fileid="'+ fileId+'"]').slideUp();
	    }
	});
}

/* General functions */

/**
 * Ask the user something.
 * When the user presses ok the callback will be executed
 * @t title
 * @m message
 * 
 */
function CreateDialog(t,m,okText, cancelText, okCallback, cancelCallback) {
        $('<div>'+m+'</div>' ).dialog({
        	title: t,
            resizable: false,
            height:'auto',
            buttons: [{
                text: okText,
                click : function() {    
                    $( this ).dialog( "destroy" ).remove();
                    okCallback();
                    }
                }, {
                text: cancelText,
                click: function() {
                    $( this ).dialog( "destroy" ).remove();
                    cancelCallback();
                }}]
            });
}

/**
 * Show a notification
 * @param {Object} str
 */

function showNotification(str) {
	OC.Notification.show(str);
	setTimeout(function(){
		OC.Notification.hide();
	},3000);
}


function nl2br (str, is_xhtml) {   
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

function isMobile(){
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 		return true;
    } else{
    	return false;	
    }
}
