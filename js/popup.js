String.prototype.repeat = function(num) {
	return new Array(num + 1).join(this);
}
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

$(document).ready(function() {
	$(document).data('minPWStrength',-1);
	$(document).data('renewalPeriod',0);
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
	passwordRatings = [{
		"minScore" : 0,
		"className" : "meterFail",
		"text" : "Very weak"
	}, {
		"minScore" : 25,
		"className" : "meterWarn",
		"text" : "Weak"
	}, {
		"minScore" : 50,
		"className" : "meterWarn",
		"text" : "Medium"
	}, {
		"minScore" : 60,
		"className" : "meterGood",
		"text" : "Strong"
	}, {
		"minScore" : 70,
		"className" : "meterGood",
		"text" : "Very strong"
	}, {
		"minScore" : 80,
		"className" : "meterExcel",
		"text" : "Heavy"
	}, {
		"minScore" : 90,
		"className" : "meterExcel",
		"text" : "Very heavy"
	}];
	$('#pw1').simplePassMeter({
		container : '#passwordStrengthDiv',
		requirements : {},
		defaultText : "Complexity",
		ratings : passwordRatings
	});

	$('#pw1').bind({
		"score.simplePassMeter" : function(jQEvent, score) {
			$(document).data('passwordScore', score);
			if (score > 0)
				$('.simplePassMeterText').append(' (' + score + ' points)');
		}
	});

	setTimeout(function() {
		$('#slideshow').remove();
	}, 600);

	$(document).on('click', '#save', function(e) {
		var ERROR = '';
		var formData = $('.pw_desc').serializeObject();
		formData.folderid = $('#folder').val();
		var createUrl = OC.generateUrl('apps/passman/api/v1/item');
		/*var passwordStrength = $(document).data('passwordScore');
		 var requiredStrength = getRating(folderSettings.min_pw_strength);
		 if (passwordStrength < requiredStrength.minScore && $('#override:checked').length == 0) {
		 ERROR = 'Password complexity is not fulfilled!';
		 }*/
		if (formData.pw1 != formData.pw2) {
			ERROR = 'Passwords do not match!';
		}
		if (formData.label == '') {
			ERROR = 'A label is mandatory!';
		}

		var ignoredEncryptionFields = ['folderid', 'item_id', 'label','url'];
		$.each(formData, function(k, v) {
			if ($.inArray(k, ignoredEncryptionFields) == -1) {
				formData[k] = encryptThis(v);
			}
		});
		formData.customFields = [];

		if ($(document).data('renewalPeriod') > 0) {
			var from = new Date()
			var expireDate = new Date();
			formData.expire_time = expireDate.addDays($(document).data('renewalPeriod') * 1);
		} else {
			formData.expire_time = 0;
		}

		console.log(formData);
		if (!ERROR) {
			$.post(createUrl, formData, function(data) {
				console.log(data)
				window.close()
			})
		} else {
			alert(ERROR);
		}

	})
	var saveCurrentTagData = function(evt,ui){
		$(document).data('minPWStrength',0);
		$(document).data('renewalPeriod',0);
		 var tagData = $(document).data('tagsData');
		 $.each($("#tags").tagit("assignedTags"),function(k,v){
		 	$.get(OC.generateUrl('apps/passman/api/v1/tag/load'),{'tag': v},function(data){
		 		console.log(data);
		 		if(data.tag.min_pw_strength*1 > $(document).data('minPWStrength')){
		 			console.log(data);
		 			$(document).data('minPWStrength', data.tag.min_pw_strength)
		 			var r = getRating(data.tag.min_pw_strength)
		 			console.log(r);
		 			$('#complex_attendue').text(r.text);
		 		}
		 		if(data.tag.renewal_period > $(document).data('renewalPeriod')){
		 			$(document).data('renewalPeriod', data.tag.renewal_period)
		 		}
		 	});
		 });
		 
	};
	$('#tags').tagit({
		allowSpaces : true,
		autocomplete : {
			source : function(request, response) {
				$.ajax({
					url : OC.generateUrl('apps/passman/api/v1/tags/search'),
					dataType : "json",
					data : {
						k : request.term
					},
					success : function(data) {
						response($.map(data, function(item) {
							return {
								label : item.label,
								value : item.label
							};
						}));
					}
				});
			}
		},
		afterTagAdded: saveCurrentTagData,
		afterTagRemoved: saveCurrentTagData 
	});

	var ls = $.jStorage.get("ENC_KEY");
	if (!ls || !$.jStorage.storageAvailable()) {
		encryptionKeyDialog();
	} else {
		setEncKey($.jStorage.get("ENC_KEY"));
	}

})
function encryptionKeyDialog() {
	$('#encryptionKeyDialog').dialog({
		draggable : false,
		resizable : false,
		closeOnEscape : false,
		modal : true,
		open : function(event, ui) {
			//$(".ui-dialog-titlebar-close").hide();
		},
		buttons : {
			"Ok" : function() {
				if ($('#ecKey').val() == '') {
					return false;
				}
				$(this).dialog("close");
				setEncKey($('#ecKey').val());
				if ($('#ecRemember:checked').length > 0) {
					$.jStorage.set("ENC_KEY", $('#ecKey').val());
					if ($('#rememberTime').val() != 'forever') {
						var time = $('#rememberTime').val() * 60 * 1000;
						$.jStorage.setTTL("ENC_KEY", time);
					}
				}
				$('#ecKey').val('');
				$('#ecRemember').removeAttr('checked');
				$('#rememberTime').val('15');
			}
		}
	});

	$('#ecKey').keypress(function(event) {
		if (event.keyCode == 13) {
			$('.ui-dialog-buttonpane button').click();
		}

	});

	$('#rememberTime').change(function() {
		$('#ecRemember').attr('checked', 'checked');
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
function setEncKey(key) {
	$(document).data('ENC_KEY', key);
}

function getEncKey() {
	return $(document).data('ENC_KEY');
}

/**
 * Generate salt
 */
function generateSalt(len) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";

	for (var i = 0; i < len; i++)
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
function decryptThis(str) {
	encryptedString = window.atob(str);
	var decryptionKey = getEncKey();
	var decryptedString = sjcl.decrypt(decryptionKey, encryptedString);
	return decryptedString;
}
