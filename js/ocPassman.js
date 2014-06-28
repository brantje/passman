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
	
	/**
	 * Bind click to show the item information. Bind hover to show actions
	 * Bind .action click to handle actions
	 */
	$(document).on('click','#pwList li',function(evt) {
		$('#pwList li').removeClass('row-active');
		$(this).addClass('row-active');
		loadItem($(this).attr('data-id'));
		$('#editItem').attr('disabled',false)
		$('#deleteItem').attr('disabled',false)

	})
	$('#pwList').click(function(){
		$('#editItem').attr('disabled','disabled');
		$('#deleteItem').attr('disabled','disabled');
		$('#pwList li').removeClass('row-active');
		var mapper = {id_label:'',id_desc: '',hid_pw: '',id_login:'',id_email: '', id_url: '',id_files: '',id_tags: ''}
		$.each(mapper,function(k,v){ (k!='hid_pw') ? $('#'+k).html(v): $('#'+k).val(v)});
		$('#showPW').remove();
		$('#copyPW').remove();
		$('#id_pw').html('');
		
		
	})
	$(document).on('dblclick','#pwList li',function(evt) {
		editItem($('.row-active').attr('data-id'));
	})
	
	$('#editItem').click(function(){
		editItem($('.row-active').attr('data-id'));
	})
	$('#deleteItem').click(function(){
		deleteItem($('.row-active').attr('data-id'));
	})

	$('#addItem').click(function() {
		if(selectedFolder.id!='ajson0'){
		openForm({item_id:0, folderid: selectedFolder.id.replace('ajson','')});
		}
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
    
	$('#editAddItemDialog .cancel').click(function(){
		$('#editAddItemDialog').dialog('close');
	})
	
	$(document).on('click','#showPW',function(){
		if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off'){
	        /* currently it's not been toggled, or it's been toggled to the 'off' state,
	           so now toggle to the 'on' state: */
	           $(this).attr('data-toggled','on');
	           $('#id_pw').text(Aes.Ctr.decrypt($('#hid_pw').val(),getEncKey(),256));
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
	})
	
	$('#editAddItemDialog .save').click(saveItem)
	
	$('#folderSettingsDialog .cancel').click(function(){
		$('#folderSettingsDialog').dialog('close');
	})
	
	$('#folderSettingsDialog .save').click(function(){
		var foldersettings = $.extend($(document).data('currentFolder'),$('#folderSettings').serializeObject());
		foldersettings.id = foldersettings.id.replace('ajson','');
		foldersettings.parent = foldersettings.parent.replace('ajson','');
		foldersettings.title = foldersettings.text;
		$.post(OC.generateUrl('apps/passman/api/v1/folders/'+foldersettings.id),foldersettings,function(){
			$('#folderSettingsDialog').dialog('close');
			foldersettings.id = 'ajson'+foldersettings.id
		})
	})
	
	/* Load the folders */
	loadFolders()
	
	/* Load items in the root folder */
	setTimeout(function(){loadFolder(0)},250);
	
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
	}
	$('.lockSession').click(function(){
		resetStorageKey();
		encryptionKeyDialog();
	})
	
	 /* Auto complete search */

	$("#searchbox").autocomplete({
		source : function(request, response) {
			$('#Code').val();
			//clear code value
			$.ajax({
				url : OC.generateUrl('apps/passman/api/v1/item/search/'+$('#searchbox').val()),
				type : 'GET',
				contentType : "application/json; charset=utf-8",
				dataType : 'json', //What kind of Result is expected. (Ex json, xml, etc)
				success : function(data) {
					var item = [];
					$.each(data,function(){
						item.push(this)
					})
					response(item);
				}
			})
		},
		minLength : 1,
		select : function(event, ui) {
			event.preventDefault();
			console.log(ui.item);
			$('#jsTree').jstree("select_node",'#ajson'+ui.item.folderid);
			setTimeout(function(){
					$('li[data-id="'+ui.item.id+'"]').addClass('row-active');
					loadItem(ui.item.id);
					$('#searchbox').val('').blur();
			},250);
		},
		focus : function(event, ui) {
			event.preventDefault();
			
		}
	}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
		var line1 = '';
		if(item.email && !item.account)
			line1 = 'Email: '+ item.email+'<br />';
		if(!item.email && item.account)
			line1 = 'Account: '+ item.account+'<br />';
		if(item.description){
			var desc = (item.description.length >= 15) ? item.description.substring(0, 15)+'...' : item.description;
			line1 +=  'Description: '+ desc;
		}
        return $( "<li></li>" )
            .data( "item.autocomplete", item )
            .append( "<a>" + item.label + "<br><font class=\"description\">" + line1 + "</font></a>" )
            .appendTo( ul );
    };

});


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
		secs = '0' + secs
	str += hours + ':';
	str += minutes + ':';
	str += secs;

	$('#sessionExpire').text(str)
	if (days == 0 && hours == "00" && minutes == "00" && secs == "00") {
		resetStorageKey();
		encryptionKeyDialog();
	} else {
		ttltimer = setTimeout(function() {
			countLSTTL()
		}, 1000)
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
									showNotification("Encryption key can't be empty!")
									return false;
								}
								$(this).dialog("close");
								setEncKey($('#ecKey').val())
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
					})
					
	 $('#ecKey').keypress(function(event) { 
	 	if(event.keyCode==13){
	 		$('.ui-dialog-buttonpane button').click()
	 	}
	 	
	 })
	 
	 $('#rememberTime').change(function(){
	 	$('#ecRemember').attr('checked','checked');
	 })
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
		loadFolder($(dir).attr('id').replace('ajson',''));
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
	var folder;
	
	$.each($(document).data('folderStructure'),function(){
		if(id==this.id || (id.toString().replace('ajson','') == this.id.toString().replace('ajson','')))
			folder = this;
	})
	return folder;
}
/**
 * Show folder settings
 */
function folderSettings(node){
	var currentFolder = getFolderById(node.id);
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
/**
 * Rename a folder by context menu refference
 */
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

/**
 * Delete a folder by context menu refference
 */
function deleteFolder(ref){
	var folderID = ref.node.id.replace('ajson','');
	$.ajax({
	    url: OC.generateUrl('apps/passman/api/v1/folders/'+folderID),
	    type: 'DELETE',
	    success: function(result) {
	        
	    }
	});
}

/**
 * Load the items in a folder
 * @param {int} folderId
 */
function loadFolder(folderId){
	if(folderId!=0){
		$('#addItem').attr('disabled',false)
	}
	else
	{
		$('#addItem').attr('disabled','disabled');
		$('#addItem').attr('disabled','disabled');
	}
	$('#pwList').html('<span id="itemsLoading" class="icon-loading icon" style="height: 32px; width: 32px; margin-left: 10px;"></span>')
	$.get(OC.generateUrl('apps/passman/api/v1/items/'+folderId),function(data){
		$('#itemsLoading').remove();
		if(data.items.length != 0){
			$.each(data.items,function(){
				 var append = '<li data-id='+ this.id +'><div style="display: inline-block;">'+ this.label+'</div></li>';
				 $('#pwList').append(append);
			})
		}
		else
		{
			$('#pwList').html('Folder is empty');
		}
		
		selectedFolder = getFolderById(folderId);
	})
}
/**
 * Load an item
 * @param {int} id
 */


function loadItem(id) {
	$.get(OC.generateUrl('apps/passman/api/v1/item/' + id), function(data) {
		var item = data.item;
		item.description = nl2br(item.description);
		var mapper = {
			id_label : item.label,
			id_desc : item.description,
			hid_pw : item.password,
			id_login : item.account,
			id_email : item.email,
			id_url : item.url,
			id_files : '',
			id_tags : ''
		}
		$.each(mapper, function(k, v) {
			(k != 'hid_pw') ? $('#' + k).html(v) : $('#' + k).val(v)
		})
		var starPW = '';
		for ( i = 0; i < 12; i++) {
			starPW += '*';
		}
		var append = '<span id="showPW">[Show]</span> <span id="copyPW">[Copy]</span>';
		$('#id_pw').html(starPW).after(append);
		var client = new ZeroClipboard($('#copyPW'))
		client.on('ready', function(event) {
			client.on('copy', function(event) {
				var clipboard = event.clipboardData;
				clipboard.setData("text/plain",  Aes.Ctr.decrypt(item.password, getEncKey(), 256));
				showNotification("Password copied to clipboard")
			});
		});
		return mapper;
	})
}

function getRating(str){
	var scoreInfo;
	 $.each(passwordRatings,function(k,v){
	 	if(str >= this.minScore)
	 		scoreInfo = this
	 })		
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
		}
	});
	$('#item_tabs').tabs();
	if (mapper != null) {
		$.each(mapper, function(k, v) {
			$('#' + k).val(v)
		})
		if (mapper.pw1) {
			$('#pw1').change().trigger('keyup.simplePassMeter');
		}
	}

}; 

function saveItem() {
	formData = $('#editNewItem').serializeObject();
	$('#editAddItemDialog .error').remove();
	var ERROR = false;
	var createUrl = OC.generateUrl('apps/passman/api/v1/item');
	var updateUrl = OC.generateUrl('apps/passman/api/v1/item/' + formData.item_id)
	var postUrl = (formData.item_id == 0) ? createUrl : updateUrl;

	/**
	 * @TODO Add form check logic, password encryption
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
	formData.pw1 = Aes.Ctr.encrypt(formData.pw1, getEncKey(), 256);
	formData.pw2 = Aes.Ctr.encrypt(formData.pw2, getEncKey(), 256);
	if (!ERROR) {
		$.post(postUrl, formData, function(data) {
			if (data.success) {
				$('#pwList li[data-id=' + data.success.id + ']').html(data.success.label);
				loadItem(data.success.id);
				$('#showPW').remove();
				$('#copyPW').remove();
			} else {
				var append = '<li data-id=' + data.itemid + '><div style="display: inline-block;">' + formData.label + '</div></li>';
				if($('#pwList').text()!='Folder is empty'){
					$('#pwList').append(append);
				}else{
					$('#pwList').html(append);
				}
			}
			$('#editAddItemDialog').dialog('close');
		})
	} else {
		$('#editAddItemDialog').prepend('<div class="error">' + ERROR + '</div>')
	}
}


function editItem(itemId) {
	$.get(OC.generateUrl('apps/passman/api/v1/item/' + itemId), function(data) {
		var item = data.item;
		item.password = Aes.Ctr.decrypt(item.password, getEncKey(), 256);
		var edtmapper = {
			item_id : item.id,
			folderid : item.folderid,
			label : item.label,
			desc : item.description,
			pw1 : item.password,
			pw2 : item.password,
			account : item.account,
			email : item.email,
			url : item.url,
			id_files : '',
			id_tags : ''
		}
		openForm(edtmapper);
	})
}


function deleteItem(itemId){
	$.ajax({
    url: OC.generateUrl('apps/passman/api/v1/item/'+itemId),
    type: 'DELETE',
    success: function(data) {
    	console.log(data)
        $('#pwList li[data-id='+ data.deleted+']').slideUp(function(){$(this).remove()});
    }
});
}


function showNotification(str) {
	OC.Notification.show(str)
	setTimeout(function(){
		OC.Notification.hide()
	},3000)
}


function nl2br (str, is_xhtml) {   
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}