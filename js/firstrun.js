firstRun = true;
$(document).ready(function(){
    var firstrun = $.get(OC.webroot + '/apps/passman/templates/firstrun.php',function(data){
        $('<div id="firstRun">'+data+'</div>').dialog({
            width: 460,
            modal: true,
            draggable: false,
            resizable: false,
            closeOnEscape: false,
            position:['center','top+80']
        });
        setTimeout(function(){
            $('[aria-describedby="encryptionKeyDialog"]').hide();
        },5);
        $('#firstRun').parent().find('.ui-dialog-buttonpane').remove();
        $('#firstRun').parent().find('.ui-dialog-titlebar-close').remove();
        $('#fieldsetContainer').formToWizard();

        $('[aria-describedby="firstRun"]').css({top: '60px'})

        $(document).on('click','#finishFirstRun',function(){
            $('#firstRun').dialog('destroy').remove();
            $.get(OC.generateUrl('apps/passman/disablefirstrun'));
            $('.ui-widget-overlay.ui-front').remove();

        });
    });
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
                if(i==1){
                    this.checkTags = function() {
                        var tags,invalidTags;
                        tags = angular.element('#app').scope().tags;
                        invalidTags = 0;
                        angular.forEach(tags,function(tag){
                           if(tag.match(/Example (.*)/)){
                              invalidTags +=1;
                           }
                        });
                        if(invalidTags > 0){
                            OC.Notification.showTimeout('You have to edit '+ invalidTags +' tags to go to the next step');
                        } else {
                            return true
                        }
                    };
                    if(!this.checkTags()) {
                        return
                    }
                }
                if(i==2){
                    if($('#frEncKey').val()!=''){
                        angular.element('#app').scope().setEncryptionKey($('#frEncKey').val());
                    } else {
                        OC.Notification.showTimeout('Please set your encryption key');
                        return;
                    }
                }
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
            if(i === 1){
                $('#tagList').css('position','absolute');
                $('#tagList').css('z-index','400');
            }
            if(i === 2){
                $('#tagList').css('position','initial');
                $('#tagList').css('z-index','1');
            }
            if(i === 3){
                $('[aria-describedby="firstRun"]').animate({ top: '250' },500);
                $('#pwList').css({
                    'position':'absolute',
                    'z-index':'400' ,
                    'background':'#fff'
                });

                $('#pwList > li:first-child').click();
                setTimeout(function() {
                    $('#pwList > li:first-child .editMenu li').click();
                },100);
            }
            if(i === 4){
                $('#pwList').css({
                    'position':'initial',
                    'z-index': '2'
                })
            }
        }

    }
})(jQuery); 