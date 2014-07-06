firstRun = true;
$(document).ready(function(){
	var firstrun ='<div id="firstRun">';
		firstrun += '<div id="fieldsetContainer"><fieldset><legend>Welcome</legend>'
		firstrun += 'Welcome to PassMan, the password manager for ownCloud!<br />In the next steps you will learn how to use it.'
		firstrun += '</fieldset>'
		firstrun += '<fieldset><legend>Folders</legend>'
		firstrun += '<img src="http://puu.sh/9Z6s9/d77db8c517.png"><br />Right click on a folder to get an context menu.<br />Under settings you can set the required strength for the passwords in this folder.'
		firstrun += '</fieldset>'
		firstrun += '<fieldset><legend>Items</legend>'
		firstrun += 'Items contain your username / password or any other sensive information.<br /><img src="http://puu.sh/9Z6BK/6df2317a34.png"><br />When you are in a folder you can create / edit / delete items.<br />'
		firstrun += '</fieldset>'
		firstrun += '<fieldset><legend>Last few things...</legend>'
		firstrun += 'In the next screen you will be asked to enter your encryption key.<br />This key will be used to encrypt all information.<br /><strong>This key is private and therefore is never send to the server</strong>'
		firstrun += '</fieldset></div></div>'
		$(firstrun).dialog({width: 420, modal: true,draggable: false, resizable: false});
		$('#firstRun').parent().find('.ui-dialog-buttonpane').remove();
		$('#firstRun').parent().find('.ui-dialog-titlebar-close').remove();
		$('#fieldsetContainer').formToWizard();
		
		
		$(document).on('click','#finishFirstRun',function(){
			$('#firstRun').dialog('destroy').remove();
			$.get(OC.generateUrl('apps/passman/disablefirstrun'));
			encryptionKeyDialog();
		})
});







/* Created by jankoatwarpspeed.com */

(function($) {
    $.fn.formToWizard = function(options) {
        options = $.extend({  
            submitButton: ''  
        }, options); 
        
        var element = this;

        var steps = $(element).find("fieldset");
        var count = steps.size();
        var submmitButtonName = "#" + options.submitButton;
        $(submmitButtonName).hide();

        // 2
        $(element).before("<ul id='steps'></ul>");

        steps.each(function(i) {
            $(this).wrap("<div id='step" + i + "'></div>");
            $(this).append("<p id='step" + i + "commands' class='commands'></p>");

            // 2
            var name = $(this).find("legend").html();
            $("#steps").append("<li id='stepDesc" + i + "'>Step " + (i + 1) + "<span>" + name + "</span></li>");
			$(this).find("legend").remove()
            if (i == 0) {
                createNextButton(i);
                selectStep(i);
            }
            else if (i == count - 1) {
                $("#step" + i).hide();
                createPrevButton(i);
            }
            else {
                $("#step" + i).hide();
                createPrevButton(i);
                createNextButton(i);
            }
        });

        function createPrevButton(i) {
            var stepName = "step" + i;
            $("#" + stepName + "commands").append("<a href='#' id='" + stepName + "Prev' class='prev button'>< Back</a>");

            $("#" + stepName + "Prev").bind("click", function(e) {
                $("#" + stepName).hide();
                $("#step" + (i - 1)).show();
                $(submmitButtonName).hide();
                selectStep(i - 1);
            });
        }

        function createNextButton(i) {
            var stepName = "step" + i;
            $("#" + stepName + "commands").append("<a href='#' id='" + stepName + "Next' class='next button'>Next ></a>");

            $("#" + stepName + "Next").bind("click", function(e) {
                $("#" + stepName).hide();
                $("#step" + (i + 1)).show();
                if (i + 2 == count){
                console.log(i)
                    $("#step" +(i+1) + "commands").append("<a href='#' id='finishFirstRun' class='next button'>Done ></a>");
                }
                selectStep(i + 1);
            });
        }

        function selectStep(i) {
            $("#steps li").removeClass("current");
            $("#stepDesc" + i).addClass("current");
        }

    }
})(jQuery); 