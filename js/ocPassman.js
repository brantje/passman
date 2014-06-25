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
	/* Setup menu */
	$('#jsTree').jstree({
		"core" : {
			// so that create works
			"check_callback" : true
		},
		"plugins" : ["contextmenu"],
		"contextmenu" : {
			"items" : function($node) {
				var tree = $("#jsTree").jstree(true);
				return {
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
	}).bind('rename_node.jstree', function(node, ref) {
		console.log('onrename');
	}).bind('delete_node.jstree', function(node, ref) {
		console.log('ondelete');
		return false;
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
	}).jstree('open_node', $('#node-1'));

	$(document).on('click', '.crumb', function() {
		$('.jstree-clicked').removeClass('jstree-clicked');
		$(document).data('dirid', $(this).attr('data-dir'));
		$("#jsTree").jstree("select_node", '#' + $(this).attr('data-dir')).trigger("select_node.jstree");
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
            $('.simplePassMeterText').append(' ('+score+' points)');
        }
    });
	$('.button.cancel').click(function() {
		$('#editAddItemDialog').dialog('destroy');
		document.getElementById("editNewItem").reset();
	});
});

