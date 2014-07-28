/**
 * @TODO [00:26] <AnybodyElse> nearly overall you're missing to sanitize the variables
   [00:26] <AnybodyElse> e.g. escapeHTML(item.label)
 */
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
Array.prototype.unique = function() {
    var unique = [];
    for (var i = 0; i < this.length; i++) {
        if (unique.indexOf(this[i]) == -1) {
            unique.push(this[i]);
        }
    }
    return unique;
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
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}; 

Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};
jQuery(document).ready(function($) {
	containerHeight = $('#app-content').height();
	containerWidth = $('#app-content').width();
	notificationTimer = 0;
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
	$(document).on('click', '#pwList li', function(evt) {
		if (evt.target.nodeName == "LI" || evt.target.className=="itemLabel") {
			$('#pwList li').removeClass('row-active');
			$(this).addClass('row-active');
			loadItem($(this).attr('data-id'));
			if (isMobile()) {
				if ($("#searchTags").tagit("assignedTags").join(',').indexOf('is:Deleted') < 0) {
					$('#editItem').attr('disabled', false);
					$('#deleteItem').attr('disabled', false);
					$("#restoreItem").attr('disabled', 'disabled');
				} else {
					$("#restoreItem").attr('disabled', false);
				}
			}
		}
		if (evt.target.className == "delete-icon icon") {
			deleteItem($(this).attr('data-id'));
		}
		if (evt.target.className == "edit-icon icon") {
			editItem($(this).attr('data-id'));
		}
		if (evt.target.className == "icon-history icon") {
			restoreItem($(this).attr('data-id'));
		}
	}); 

	$('#pwList').click(function(){
		$('#editItem').attr('disabled','disabled');
		$('#deleteItem').attr('disabled','disabled');
		$("#restoreItem").attr('disabled','disabled');
		$('#pwList li').removeClass('row-active');
		var mapper = {id_label:'',id_desc: '',hid_pw: '',id_login:'',id_email: '', id_url: '',id_files: '',id_tags: ''};
		$.each(mapper,function(k,v){ (k!='hid_pw') ? $('#'+k).html(v) : $('#'+k).val(v);});
		$('#showPW').remove();
		$('#copyPW').remove();
		$('#id_pw').html('');
		$('#id_files').html('');
		$('#customFieldsTable').html('');
		$('#id_expires').html('');
	});
	
	if (!isMobile()) {
		$(document).on({
		    mouseenter: function () {
		    	var tags = 	$("#searchTags").tagit("assignedTags").join(',');
				if(tags.indexOf('is:Deleted') >= 0){
		        	$(this).find('i').css('visibility','visible');
		       	}
		       	else
		       	{
		        	$(this).find('.itemLabel').after('<span class="rowTools"> <div><i class="edit-icon icon" title="Edit"></i></div></span>');
		        	$(this).find('i').css('visibility','visible');
		        }
		        
		    },
		    mouseleave: function () {
		        //stuff to do on mouse leave 
		        $('.rowTools').remove();
		        $(this).find('i').css('visibility','hidden');
		    }
		},"#pwList li");
	}
	$(document).on('dblclick','#pwList li',function(evt) {
		editItem($('.row-active').attr('data-id'));
	});
	
	$('#editItem').click(function(){
		editItem($('.row-active').attr('data-id'));
	});
	$('#deleteItem').click(function(){
		deleteItem($('.row-active').attr('data-id'));
	});
	$('#restoreItem').click(function(){
		restoreItem($('.row-active').attr('data-id'));
	});

	$('#addItem').click(function() {
		openForm({item_id:0});
	});
	
	$(document).on('click','.link.loadFile',function(){
		var fileId = $(this).attr('data-fileid');
		loadFile(fileId);
	});
	
	$('#custom_pw').buttonset();
	$('body').tooltip();

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
	 $('#fileInput').after('<span id="uploading">Uploading...</span>');
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
	$('#addCField').click(function(evt){
		if($('#customFieldValue').val().trim() != '' && $('#customFieldName').val().trim() != ''){
			$('#existingFields').prepend('<tr class="new" data-cFieldId="0"><td class="fieldName">'+$('#customFieldName').val()+ '</td><td>'+ $('#customFieldValue').val());
		}
		$('#customFieldValue').val('');
		$('#customFieldName').val('').focus();
	});

	$(document).on('dblclick', '#existingFields tr td', function() {
		var value = $(this).text();
		$(this).html('');
		$('<input></input>').attr({
			'type' : 'text',
			'size' : '25',
			'value' : value
		}).appendTo($(this)).focus();
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
	
	$('#searchbox').prop('autocomplete','off');
	$("#searchbox").autocomplete({
		source : function(request, response) {
			$('#Code').val();
			//clear code value
			$.ajax({
				url : OC.generateUrl('apps/passman/api/v1/item/search/' + $('#searchbox').val()),
				type : 'GET',
				data: {q: $('#searchbox').val()},
				contentType : "application/json; charset=utf-8",
				dataType : 'json', //What kind of Result is expected. (Ex json, xml, etc)
				success : function(data) {
					var item = [];
					if(data.length > 0)
					$.each(data, function() {
						item.push(this);
					});
					else{
						item.push({label: 'no results'});
					}
					response(item);
				}
			});
		},
		minLength : 1,
		open: function(){
			$('.ui-autocomplete').css('max-width', '220px');
		},
		select : function(event, ui) {
			event.preventDefault();
			/* Get tree structure */
				$("#searchTags").tagit("removeAll");
				setTimeout(function(){
					//$('#pwList').animate({ scrollTop: $('li[data-id="' + ui.item.id+'"]').position().top-50 +'px' });
					$('li[data-id="' + ui.item.id+'"]').scrollintoview({duration: "slow"});
					$('li[data-id="' + ui.item.id+'"]').click();
					$("#searchbox").val('').blur();
				},250);
				
			
		},
		focus : function(event, ui) {
			event.preventDefault();

		}
	}).
	data("ui-autocomplete")._renderItem = function(ul, item) {
		var line1 = '';
		if (item.id) {
			if (item.email && !item.account)
				line1 = 'Email: ' + decryptThis(item.email) + '<br />';
			if (!item.email && item.account)
				line1 = 'Account: ' + decryptThis(item.account) + '<br />';
			if (item.description) {
				if (decryptThis(item.description).length > 0) {
					item.description = $('<div>' + decryptThis(item.description) + '</div>').text().trim();
					var desc = (item.description.length >= 15) ? item.description.substring(0, 15) + '...' : item.description;
					line1 += 'Description: ' + desc;
				}
			}
			if (item.foldername) {
				line1 += (line1 == '') ? 'Folder: ' + item.foldername : '<br />Folder:' + item.foldername;
			}

			var icon = 'icon-lock';
			var txt = "<span class=\"" + icon + " icon\"></span><strong>" + item.label + "</strong><br><font class=\"description\">" + line1 + "</font>";
		} else {
			var icon = 'no-result';
			var txt = item.label;
		}
		return $("<li></li>").data("item.autocomplete", item).append("<a>"+ txt + "</a>").appendTo(ul);
	};

	$('#searchTags').tagit({
		allowSpaces: true,
		singleField: true,
		placeholderText: "Search here",
		afterTagAdded: loadItems,
		afterTagRemoved: loadItems,
		autocomplete: { source: function( request, response ) {
                $.ajax({
                    url: OC.generateUrl('apps/passman/api/v1/tags/search'),
                    dataType: "json",
                    data: {
                        k: request.term
                    },
                    success: function( data ) {
                        response($.map( data, function( item ) {
                            return {
                                label: item.label,
                                value: item.label
                            };
                        }));
                    }
                });
        }
	}
	});
	
	var saveCurrentTagData = function(evt, ui) {
		$(document).data('minPWStrength', -1);
		$(document).data('renewalPeriod', 0);
		var tagData = $(document).data('tagsData');
		$.each($("#tags").tagit("assignedTags"), function(k, v) {
			$.get(OC.generateUrl('apps/passman/api/v1/tag/load'), {
				'tag' : v
			}, function(data) {
				if (data) {
					if(data.tag.min_pw_strength > $(document).data('minPWStrength')) {
						$(document).data('minPWStrength', data.tag.min_pw_strength);
						var r = getRating(data.tag.min_pw_strength);
						$('#complex_attendue').text(r.text);
					}
				}
				if (data.tag.renewal_period > $(document).data('renewalPeriod')) {
					$(document).data('renewalPeriod', data.tag.renewal_period);
				}
			});
		});

	}; 

	
	$('#tags').tagit({
		allowSpaces: true,
		autocomplete: { source: function( request, response ) {
                $.ajax({
                    url: OC.generateUrl('apps/passman/api/v1/tags/search'),
                    dataType: "json",
                    data: {
                        k: request.term
                    },
                    success: function( data ) {
                    	response($.map( data, function( item ) {
                            return {
                                label: item.label,
                                value: item.label,
                                min_pw_strength: item.min_pw_strength,
                                renewal_period: item.renewal_period
                            };
                        }));
                    }
                });
        	}
		},
		afterTagAdded: saveCurrentTagData,
		afterTagRemoved: saveCurrentTagData 
	});

	$(document).on({
	    mouseenter: function () {
	        $(this).find('.value').after('<i class="icon icon-settings button"></i>');
	    },
	    mouseleave: function () {
	        //stuff to do on mouse leave
	        $(this).find('i').remove();
	    }
	},"#tagList .tag");
	
	
	
	$(document).on('click','.tag',function(evt){
		if(evt.target.className != 'icon icon-settings button'){
			var tagvalue = $(this).find('.value').text();
			$("#searchTags").tagit("createTag", tagvalue);
		}
	});
	
	$(document).on('click','.tag i.icon.icon-settings.button',function(){
		var tagValue = $(this).parent().find('.value').text().trim();
		/*tag*/
		$.get(OC.generateUrl('apps/passman/api/v1/tag/load'),{'tag': tagValue},function(data){
			$.each(data.tag,function(k,v){
				$('#'+k).val(v);
			});
			$('#tagSettingsDialog').dialog({
				title: 'Settings for tag '+ tagValue,
				buttons:{
					"Save": function(){
						var formData = {};
						formData.tag = $('#tagSettings').serializeObject();
						$.post(OC.generateUrl('apps/passman/api/v1/tag/update'),formData,function(d){
							 $('#tagSettingsDialog').dialog( "close" );
							 $('li.tag').find(':contains('+tagValue+')').text(formData.tag.tag_label);
						});
					},
					"Cancel": function(){
						 $( this ).dialog( "close" );
					}
				}
			});
		});
		
	});
	
	$(document).on('click','.undo',function(){
		window[$(this).attr('data-function')]($(this).attr('data-arg'),true);
	});
	
	/**
	 * Request the user encryption key (if it is not found), and the first run wizard is not shown.
	 */
	if(typeof firstRun === 'undefined'){
		var ls = $.jStorage.get("ENC_KEY");
		if(!ls || !$.jStorage.storageAvailable()){
		    encryptionKeyDialog();
		}
		else
		{
			setEncKey($.jStorage.get("ENC_KEY"));
			$('#sessionTimeContainer').show();
			countLSTTL();
			loadItems();
		}
	}
	$('.lockSession').click(function(){
		resetStorageKey();
		encryptionKeyDialog();
	});
	$('.import.link').click(importDialog);
	$('.settings.link').click(showSettings);
	$('.nav-trashbin').click(function(){
		$("#searchTags").tagit("createTag", 'is:Deleted');
	});
	
	
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
						draggable: false, resizable: false,closeOnEscape: false,
						modal: true,
						open: function(event, ui) { 
							//$(".ui-dialog-titlebar-close").hide(); 
						},
						buttons: { "Ok": function() {
								if($('#ecKey').val()==''){
									showNotification("Encryption key can't be empty!");
									return false;
								}
								$(this).dialog("close");
								setEncKey($('#ecKey').val());
								loadItems();
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
 * Test function to test encryption/decryption
 */
function testEnc(a,test){
	if(typeof test === 'undefined'){
		test = false;
	}
	var input = a;
	console.log('Input: '+ input);
	var e = encryptThis(input,test);
	console.log('Encrypted '+ e)
	console.log('Decryption result: '+ decryptThis(e,test));
}

/**
 * Generate salt
 */
function generateSalt(len){
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Encrypt a string with the algorithm
 */

function encryptThis(str) {
	var encryptedString = str;
	var encryptionKey = getEncKey();

	encryptedString = sjcl.encrypt(encryptionKey, encryptedString)
	
	encryptedString = window.btoa(encryptedString);
	return encryptedString;
}
/**
 * Decrypt a string with the algorithm
 */
function decryptThis(str){
	encryptedString = window.atob(str);
	var decryptionKey = getEncKey();
	var decryptedString = sjcl.decrypt(decryptionKey,encryptedString); 
	return decryptedString;
}


/**
 * Load the items 
 * 
 */
function loadItems(){
	var tags = 	$("#searchTags").tagit("assignedTags").join(',');
	var showingDeleted = 0;
	if(tags.indexOf('is:Deleted') >= 0){
		var url = OC.generateUrl('apps/passman/api/v1/items/getdeleted');
		tags = $("#searchTags").tagit("assignedTags").clean('is:Deleted').join(',');
		$('#addItem').attr('disabled','disabled');
		$('#editItem').attr('disabled','disabled');
		$('#deleteItem').attr('disabled','disabled');
		$('#restoreItem').show();
		showingDeleted =1;
	}
	else
	{
		var url = OC.generateUrl('apps/passman/api/v1/getbytags');
		$('#addItem').attr('disabled',false);
		$('#restoreItem').hide();
	}
	$('#pwList').html('');
	$('#pwList').html('<span id="itemsLoading" class="icon-loading icon" style="height: 32px; width: 32px; margin-left: 10px;"></span>');
	$.get(url,{'tags': tags},function(data){
		$('#itemsLoading').remove();
		var itemtags = [];
		if(data.items.length != 0){
			$.each(data.items,function(){
			 	var inlineTags = '';
				  if(this.tags != null){
				 	$.each(this.tags,function(k,v){
				 		itemtags.push(v);
				 		inlineTags += '<div class="tag"><div class="value">'+ escapeHTML(v) +'</div></div>';
				 	});
				 }
				 var favIcon = '<span class="icon-lock icon"></span>';
				 if(this.favicon){
				 	var favIconLocation = this.favicon;
				 	if(location.protocol=='https:'){
					 	 favIconLocation = OC.generateUrl('/apps/passman/imageproxy?url='+ this.favicon);
				 	}
				 	
					 favIcon = '<img src="'+ favIconLocation +'" style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;">';
				 }
			 	 var deleteIcon = (showingDeleted==0) ? '<i class="delete-icon icon" title="Delete" style="float: right; visibility: hidden;"></i>' : '<i class="icon-history icon" title="Recover" style="float: right; visibility: hidden;"></i>';
				 var append = '<li data-id='+ this.id +'>'+ favIcon +'<div style="display: inline-block;" class="itemLabel">'+ escapeHTML(this.label) +'</div>'+ deleteIcon +''+ inlineTags  +'</li>';
				try{
					var username = decryptThis(this.account);
				 	$('#pwList').append(append);
				} catch(e){
					/**
					 * Wrong master password given, hide the entries
					 */
					console.log('Wrong master pw');
				}
				 
			});
			var tagListItems = '';
			itemtags = itemtags.unique().sort(function(a, b) {
			    if (a.toLowerCase() < b.toLowerCase()) return -1;
			    if (a.toLowerCase() > b.toLowerCase()) return 1;
			    return 0;
			  });
			$.each(itemtags,function(k,v){
				if($.inArray(v,$("#searchTags").tagit("assignedTags")) == -1){
					tagListItems += '<li class="tag"><span class="value">'+v+'</span></li>';
				}
			});
			$('#tagList').html(tagListItems);
		}
		else
		{
			$('#pwList').html('Folder is empty');
			var http = location.protocol;
			var slashes = http.concat("//");
			var host = slashes.concat(window.location.hostname);
			var complete = host+location.pathname;
			var bookmarklet = "<a class=\"button\" href=\"javascript:(function(){var a=window,b=document,c=encodeURIComponent,e=c(document.title),d=a.open('"+ complete +"add?url='+c(b.location)+'&title='+e,'bkmk_popup','left='+((a.screenX||a.screenLeft)+10)+',top='+((a.screenY||a.screenTop)+10)+',height=750px,width=550px,resizable=1,alwaysRaised=1');a.setTimeout(function(){d.focus()},300);})();\">Save in passman</a>";
			bookmarklet = "<div id=\"rootMessage\"><div class=\"bkm_hint\">Drag this to your browser bookmarks and click it, when you want to save username / password quickly:</div><br>"+ bookmarklet +"<p></p>";
			$('#pwList').html(bookmarklet);
		}
	});
	
	/*else
	{

	}*/
}

/**
 * Load an item
 * @param {int} id
 */
function loadItem(id) {
	$('.loadingItem').show();
	$.get(OC.generateUrl('apps/passman/api/v1/item/' + id),{'id': id}, function(data) {
		$('#id_files').html('');
		$('#customFieldsTable').html('');
		var item = data.item;

		item.description = decryptThis(item.description);
		var mapper = {
			id_label :  escapeHTML(item.label),
			id_desc : item.description,
			hid_pw : item.password,
			id_login : escapeHTML(decryptThis(item.account)),
			id_email : escapeHTML(decryptThis(item.email)),
			id_url : escapeHTML(item.url),
			files : item.files,
			id_tags : ''
		};
		$.each(mapper, function(k, v) {
			(k != 'hid_pw') ? $('#' + k).html(v) : $('#' + k).val(v);
		});
		var copyableFields = ['id_login','id_desc','id_url','id_email','tags'];
		
		if(!isMobile()){
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
						$('#' + v).append('<a href="' + escapeHTML(mapper[v]) + '" target="_blank" class="copy link">[Go to url]</span>');
					}
				}
			}); 
		}
		if(item.expire_time != 0){
			console.log(item.expire_time);
			$('#id_expires').html(formatDate(escapeHTML(item.expire_time)));
		}
		if(item.customFields.length > 0){
			$.each(item.customFields,function(k,field){
				var row = '<tr><td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>'+ escapeHTML(decryptThis(field.label)) +' :</td>';
                    row +='<td><div id="id_'+field.label+'" style="float:left;">'+ escapeHTML(decryptThis(field.value)) +'</div></td></tr>';
				$('#customFieldsTable').prepend(row);
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
				$('#id_files').append('<span class="link loadFile" data-fileid="'+this.id+'"> <span class="'+ icon +'"></span>'+ escapeHTML(decryptThis(this.filename)) +' (' + escapeHTML(humanFileSize(this.size)) + ')' );
			});
		}
		else
		{
			$('#id_files').html('');
		}
		$('.loadingItem').hide();	
		
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
	var dTitle = (mapper.label) ? 'Edit '+mapper.label : 'Add new item';
	$(document).data('tagsData',[]);
	
//	$('#complex_attendue').html('<b>' + folderPwStrength.text + '</b>');
	$('#editAddItemDialog').dialog({
		title: dTitle,
        "width" : ($(document).width() > 425) ? 'auto' : $(document).width() - 10,
		beforeClose : function(event, ui) {
			$("#tags").tagit("removeAll");
			for(name in CKEDITOR.instances)
			{
				CKEDITOR.instances[name].destroy();
			}
			$('#editAddItemDialog').dialog('destroy');
			document.getElementById("editNewItem").reset();
			$('#pw1').trigger('keyup.simplePassMeter');
			$('#item_tabs').tabs('destroy');
			$('#complex_attendue').html('<b>Not defined</b>').removeAttr('class');
			$('#editAddItemDialog .error').remove();
			$('#existingFields').html('');
			$('#fileList').html('');
			$('#fileInput').val('');
			$(document).data('minPWStrength',0);
		 	$(document).data('renewalPeriod',0);
		 	
			//CKEDITOR.instances.desc.destroy()
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
			if(v!=null)
				$('#' + k).val(escapeHTML(v.toString().replace(/<br \/>/g,"\n")));
		});
		if (mapper.pw1) {
			$('#pw1').change().trigger('keyup.simplePassMeter');
		}
		$(document).data('p',mapper.pw1);
		if(mapper.files){
			$.each(mapper.files,function(){
				var data = this;
				var filename =  (data.filename.length >= 20) ? data.filename.substring(0, 20)+'...' : data.filename;
				$('#fileList').append('<li data-filename="' + decryptThis(data.filename) + '" data-fileid="'+ data.id +'" class="fileListItem">' + escapeHTML(decryptThis(data.filename)) + ' (' + humanFileSize(data.size) + ') <span class="icon icon-delete" style="float:right;"></span></li>');
			});
		}
		CKEDITOR.replace( 'desc' );
		CKEDITOR.instances.desc.setData(mapper.desc);
		
		
		if(mapper.customFields){
			$.each(mapper.customFields,function(k,field){
				var row = '<tr data-cFieldId='+ field.id +'><td>'+escapeHTML(decryptThis(field.label)) +'</td>';
                    row +='<td>'+ escapeHTML(decryptThis(field.value))+'</td></tr>';
					$('#existingFields').prepend(row);
			});
		}
		if(mapper.Tags !=null){
			mapper.Tags = mapper.Tags.split(',');
			$.each(mapper.Tags,function(k,v){
				$("#tags").tagit("createTag", v);
			});
		}
	}
	

}; 

function saveItem() {
	formData = $('#editNewItem').serializeObject();
	formData.desc = CKEDITOR.instances.desc.getData();
	$('#editAddItemDialog .error').remove();
	var ERROR = false;
	var createUrl = OC.generateUrl('apps/passman/api/v1/item');
	var updateUrl = OC.generateUrl('apps/passman/api/v1/item/' + formData.item_id);
	var postUrl = (formData.item_id == 0) ? createUrl : updateUrl;

	/**
	 *
	 */
	var passwordStrength = $(document).data('passwordScore');
	var requiredStrength = $(document).data('minPWStrength');
	if (passwordStrength < requiredStrength && $('#override:checked').length == 0) {
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
	
	var ignoredEncryptionFields = ['folderid','item_id','label','expire_time','url'];
	$.each(formData,function(k,v){
		if($.inArray(k,ignoredEncryptionFields)==-1){
			formData[k] = encryptThis(v);
		}
	});
	formData.tags = $("#tags").tagit("assignedTags").join(',');
	formData.customFields = customFields;
	formData.changedPw = ($(document).data('p') != $('#pw1').val()) ? true : false;
	
	if($(document).data('renewalPeriod') > 0 && formData.changedPw==0){
		var expireTime = new Date($('#expire_time').val());
		if(expireTime < new Date() && formData.changedPw==false){
			ERROR = 'The password is expired, you must renew it before you can save';
		}
	}
	if(formData.changedPw==true && $(document).data('renewalPeriod') > 0 ){
		var from = new Date();
		var expireDate = new Date();
		formData.expire_time = expireDate.addDays($(document).data('renewalPeriod')*1);
	}
	else{
		formData.expire_time = 0;
	}
	
	if (!ERROR) {
		$.post(postUrl, formData, function(data) {
			if (data.success) {
				$('#pwList li[data-id=' + data.success.id + ']').html('<span class="icon-lock icon"></span><div style="display: inline-block;">'+escapeHTML(data.success.label) +'</div>');
				loadItems();
				loadItem(data.success.id);
				$('#showPW').remove();
				$('#copyPW').remove();
				$(document).data('p','');
				setTimeout(function(){
					$('li[data-id="' + data.success.id+'"]').scrollintoview({duration: "slow"});
					$('li[data-id="' + data.success.id+'"]').click()
				},400);
			} else {
				var append = '<li data-id=' + data.itemid + '><span class="icon-lock icon"></span><div style="display: inline-block;">' + escapeHTML(formData.label) + '</div></li>';
				setTimeout(function(){
					$('li[data-id="' + data.success.id+'"]').scrollintoview({duration: "slow"});
					$('li[data-id="' + data.success.id+'"]').click()
				},400);
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
	
	$.get(OC.generateUrl('apps/passman/api/v1/item/' + itemId),{'id': itemId}, function(data) {
		var item = data.item;
		item.password = decryptThis(item.password);
		var edtmapper = {
			item_id : item.id,
			label : item.label,
			desc : decryptThis(item.description),
			pw1 : item.password,
			pw2 : item.password,
			account : decryptThis(item.account),
			email : decryptThis(item.email),
			url : item.url,
			files : item.files,
			expire_time: item.expire_time,
			Tags : item.tags,
			customFields: item.customFields
		};
		openForm(edtmapper);
	});
}




function deleteItem(itemId,undo){
	undo = (typeof undo === 'undefined') ? false : true;
	$.ajax({
    url: OC.generateUrl('apps/passman/api/v1/item/delete/'+itemId),
    data:{'id': itemId},
    type: 'GET',
    success: function(data) {
		var label = $('#pwList li[data-id='+ itemId +']').find('.itemLabel').text();
       	$('#pwList li[data-id='+ data.deleted+']').slideToggle();
        showNotification(label+' removed. <a href="#" class="undo" data-function="restoreItem" data-arg="'+ itemId +'" style="text-decoration: underline">Undo</a>',10000);
    }
});
}
function restoreItem(itemId,undo){
	undo = (typeof undo === 'undefined') ? false : true;
	$.ajax({
    url: OC.generateUrl('apps/passman/api/v1/item/restore/'+itemId),
    data:{'id': itemId},
    type: 'GET',
    success: function(data) {
        var label = $('#pwList li[data-id='+ itemId +']').find('.itemLabel').text();
        $('#pwList li[data-id='+ data.restored+']').slideToggle();
       	showNotification(label +' recoverd. <a href="#" class="undo" data-function="deleteItem" data-arg="'+ itemId +'" style="text-decoration: underline">Undo</a>',10000);
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
							$('#fileList').append('<li data-filename="' + escapeHTML(data.filename) + '" data-fileid="'+ data.id +'">' + escapeHTML(file.name) + ' (' + humanFileSize(file.size) + ') <span class="icon icon-delete" style="float:right;"></span></li>');
							$('#uploading').remove();
							$('#fileInput').val('');
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
	$.get(OC.generateUrl('/apps/passman/api/v1/item/file/' + fileId),{'fileid': fileId}, function(data) {
		console.log(data);
		/* Show the image if it is ofcourse */
		if (data.type.indexOf('image') >= 0 && data.size < 4194304) {
			var imageData = decryptThis(data.content);
			$('#fileImg').attr('src', imageData);
			$('#downloadImage').html('<a href="'+ imageData +'" download="'+ escapeHTML(data.filename) +'">Save this image</a>');
			$('#fileImg').load(function() {
				$('#dialog_files').dialog({
					width : 'auto',
					title : decryptThis(data.filename),
					buttons: {
						"Close": function(){
							$(this).dialog('destroy');
							$('#fileImg').attr('src', '');
							$('#downloadImage').html('');
						}
					}
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
				title : "Download " + escapeHTML(decryptThis(data.filename)),
				content : 'test',
				buttons : {
					"Download" : function() {
						var uriContent = dataURItoBlob(fileData,data.type);
						/*var newWindow = window.open(uriContent, data.filename);*/
						var a = document.createElement("a");
						a.style = "display: none";
						a.href = uriContent;
				        a.download = escapeHTML(decryptThis(data.filename));
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
	    data: {'fileid': fileId},
	    type: 'DELETE',
	    success: function(result) {
	        $('li[data-fileid="'+ fileId+'"]').slideUp();
	    }
	});
}

function showSettings(){
	var html = '<div>';
		html += 'Date format (same as the php <a href="http://php.net/date" target="_blank" class="link">date</a> function): <br />';
		html += '<input id="df" type="text" value="'+ $.jStorage.get("date_format") +'">';
		html += '</div>';
		
		$(html).dialog({
			title: "Settings",
			buttons:{
				"Save": function(){
					$.jStorage.set("date_format",$('#df').val());
					$(this).dialog('destroy').remove();
				},
				"Cancel": function(){
					$(this).dialog('destroy').remove();
				}
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

function showNotification(str,timeout) {
	OC.Notification.hide();
	if(notificationTimer){
		clearTimeout(notificationTimer);
	}
	timeout = (!timeout) ? 3000 : timeout;
	OC.Notification.showHtml(str);
	notificationTimer = setTimeout(function(){
		OC.Notification.hide();
	},timeout);
}

function formatDate(datestr){
	var dateformat = ($.jStorage.get("date_format")) ? $.jStorage.get("date_format") : 'default';
	switch(dateformat){
		case "default":
			return new Date(datestr).toLocaleString();
		break;
		
		default:
			return date(dateformat,new Date(datestr));
		break;
	}
}

function nl2br (str, is_xhtml) {   
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

function isMobile(){
	 return !!('ontouchstart' in window);
}

