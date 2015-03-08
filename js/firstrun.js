firstRun = true;
$(document).ready(function () {
  var firstrun = $.get(OC.generateUrl('apps/passman/firstrun'), function (data) {
    console.log();
    $('<div id="firstRun">' + $(data).find('#firstRun').html() + '</div>').dialog({
      width: 460,
      modal: true,
      draggable: true,
      resizable: false,
      closeOnEscape: false,
      position: ['center', 'top+80']
    });
    setTimeout(function () {
      $('[aria-describedby="encryptionKeyDialog"]').hide();
    }, 5);
    $('#firstRun').parent().find('.ui-dialog-buttonpane').remove();
    $('#firstRun').parent().find('.ui-dialog-titlebar-close').remove();
    $('#fieldsetContainer').formToWizard();

    $('[aria-describedby="firstRun"]').css({top: '60px'})

    $(document).on('click', '#finishFirstRun', function () {
      $('#firstRun').dialog('destroy').remove();
      $.get(OC.generateUrl('apps/passman/disablefirstrun'));
      $('.ui-widget-overlay.ui-front').remove();
      clearInterval(window.editingItemsInterval);
      $('.bottomRow .btn-danger').click();
    });
  });
});

(function ($) {
  $.fn.formToWizard = function (options) {
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

    steps.each(function (i) {
      $(this).wrap("<div id='step" + i + "'></div>");
      $(this).append("<p id='step" + i + "commands' class='commands'></p>");

      // 2
      var name = $(this).find("legend").html();
      $("#steps").append("<li id='stepDesc" + i + "'>Step " + (i + 1) + "<span>" + name + "</span></li>");
      $(this).find("legend").remove();

      if (i == 0) {
        createNextButton(i);
        createCancelButton(i)
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

    function createCancelButton (i) {
      var stepName = "step" + i;
      $("#" + stepName + "commands").append('<span class="btn btn-default" id="' + stepName + 'Cancel">'+ OC.L10N.translate('passman','Cancel') +'</a>');

      $("#" + stepName + "Cancel").bind("click", function (e) {
        $('#firstRun').dialog('destroy').remove();
        $.get(OC.generateUrl('apps/passman/disablefirstrun'));
        $('.ui-widget-overlay.ui-front').remove();
      });
    }

    function createPrevButton (i) {
      var stepName = "step" + i;
      $("#" + stepName + "commands").append("<span href='#' id='" + stepName + "Prev' class='btn btn-default'>< "+ OC.L10N.translate('passman','Back') +"</span>");

      $("#" + stepName + "Prev").bind("click", function (e) {
        $("#" + stepName).hide();
        $("#step" + (i - 1)).show();
        $(submmitButtonName).hide();
        selectStep(i - 1);
      });
    }

    function createNextButton (i) {
      var stepName = "step" + i;
      $("#" + stepName + "commands").append("<span href='#' id='" + stepName + "Next' class='next  btn btn-default'>"+ OC.L10N.translate('passman','Next') +" ></span>");

      $("#" + stepName + "Next").bind("click", function (e) {
        if (i == 1) {
          this.checkTags = function () {
            var tags, invalidTags;
            tags = angular.element('#app').scope().tags;
            invalidTags = 0;
            angular.forEach(tags, function (tag) {
              if (tag.match(/Example (.*)/)) {
                invalidTags += 1;
              }
            });
            if (invalidTags > 0) {
              var str = OC.L10N.translate('passman','You have to edit %s tags to go to the next step').replace(/%s/g, invalidTags);
              OC.Notification.showTimeout(str);
            } else {
              return true
            }
          };
          if (!this.checkTags()) {
            return
          }
        }
        if (i == 2) {
          if ($('#frEncKey').val() != '') {
            angular.element('#app').scope().setEncryptionKey($('#frEncKey').val());
            angular.element('#app').scope().loadItems([],false);

          } else {
			  OC.Notification.showTimeout( OC.L10N.translate('passman','Please set your encryption key') );
			  return;
		  }
        }
        $("#" + stepName).hide();
        $("#step" + (i + 1)).show();
        if (i + 2 == count) {
          $("#step" + (i + 1) + "commands").append("<button id='finishFirstRun' class='next btn btn-success'>"+  OC.L10N.translate('passman','Done')  +" ></button>");
        }
        selectStep(i + 1);
      });
    }

    function selectStep (i) {
      $("#steps li").removeClass("current");
      $("#stepDesc" + i).addClass("current");
      if (i === 1) {
        $('#tagList').css('position', 'absolute');
        $('#tagList').css('z-index', '400');
      }
      if (i === 2) {
        $('#tagList').css('position', 'initial');
        $('#tagList').css('z-index', '1');
      }
      if (i === 3) {
        $('[aria-describedby="firstRun"]').animate({top: '250'}, 500);
        $('#pwList').css({
          'position': 'absolute',
          'z-index': '400',
          'background': '#fff'
        });

        $('#pwList > li:first-child').click();

      }
      if (i === 4) {
        $('#pwList > li:first-child').click();
        $('[tooltip]').tooltip({
          show: 50,
          track: true
        });
        $('.firstRunUl > li').css('display', 'none');
        $('#finishFirstRun').hide();
        setTimeout(function () {
          var intervalTimer, isBlinking = false, counter = 0;
          $('#pwList > li:first-child .editMenu li').click();

          intervalTimer = setInterval(function () {
            if (!isBlinking) {
              $('.editMenu:eq(0)').find('ul > li:eq(0)').css('background', '#c9c9c9');
              $('.editMenu:eq(0)').find('ul > li:eq(0) > a').css('color', 'black');
              isBlinking = true;
            } else {
              $('.editMenu:eq(0)').find('ul > li:eq(0)').css('background', '#383C43');
              $('.editMenu:eq(0)').find('ul > li:eq(0) > a').css('color', '#fff');
              isBlinking = false;
            }
            counter++;
            if (counter === 6) {
              $('.editMenu:eq(0)').find('ul > li:eq(0)').css('background', '#383C43');
              $('.editMenu:eq(0)').find('ul > li:eq(0) > a').css('color', '#fff');
              isBlinking = false;
              clearInterval(intervalTimer);
            }
          }, 500);

          setTimeout(function () {
            var tabIndex = -1;

            var nextTbBtn = '<button class="btn btn-default next" id="frNextTab">'+  OC.L10N.translate('passman','Next tab') +'</button>';
            var prevTbBtn = '<button class="btn btn-default next" id="frPrevTab">'+  OC.L10N.translate('passman','Previous tab')  +'</button>';
            $('#finishFirstRun').after(prevTbBtn).after(nextTbBtn);

            $('.editMenu:eq(0)').find('ul > li:eq(0) > a').click();
            var winHeight = $(window).height() - 425;
            $('[aria-describedby="firstRun"]').animate({top: winHeight}, 500);
            $('#pwList').css({
              'position': 'initial',
              'z-index': '2'
            });
            $('.editItem').css({
              'position': 'absolute',
              'z-index': '400',
              'background': '#fff',
              'width': '100%'
            });
            $('#introEdit').remove();
            var nextTab = function () {
              tabIndex++;
              if (tabIndex == 5) {
                tabIndex = 1;
              }
              $('.firstRunUl').children().css('display', 'none');
              $($('.firstRunUl').children()[tabIndex]).css('display', 'block');
              $($('.editItem .tabHeader').children()[tabIndex]).click();

              var animationTimeout = setTimeout(function () {
                if (tabIndex === 0) {
                  $('[aria-describedby="firstRun"]').animate({top: winHeight}, 500);
                }
                if (tabIndex === 1) { //password
                  $('[aria-describedby="firstRun"]').animate({top: 340}, 500);
                } else if (tabIndex === 2) { //Files
                  $('[aria-describedby="firstRun"]').animate({top: 200}, 500);
                } else if (tabIndex === 3) { //Custom fields
                  $('[aria-describedby="firstRun"]').animate({top: 280}, 500);
                } else if (tabIndex >= 4) { //OTP Settings
                  tabIndex = -1;
                  $('[aria-describedby="firstRun"]').animate({top: 230}, 500);
                  $('#finishFirstRun').show();
                }
                clearTimeout(animationTimeout);
              }, 50)
            };
            var prevTab = function () {
              $('.firstRunUl').children().css('display', 'none');
              tabIndex--;
              if (tabIndex == -2) {
                tabIndex = 3
              }
              if (tabIndex === -1) {
                tabIndex = 4;
              }


              $($('.firstRunUl').children()[tabIndex]).css('display', 'block');
              $($('.editItem .tabHeader').children()[tabIndex]).click();
              var animationTimeout = setTimeout(function () {
                if (tabIndex <= 0) {
                  $('[aria-describedby="firstRun"]').animate({top: winHeight}, 500);
                }
                if (tabIndex === 1) { //password
                  $('[aria-describedby="firstRun"]').animate({top: 340}, 500);
                } else if (tabIndex === 2) { //Files
                  $('[aria-describedby="firstRun"]').animate({top: 200}, 500);
                } else if (tabIndex === 3) { //Custom fields
                  $('[aria-describedby="firstRun"]').animate({top: 280}, 500);
                } else if (tabIndex === 4) { //OTP Settings
                  $('[aria-describedby="firstRun"]').animate({top: 230}, 500);
                }
                clearTimeout(animationTimeout);
              }, 50)
            };

            //window.editingItemsInterval = setInterval(nextTab,6000);//Tab loop
            nextTab();
            $('#frNextTab').click(nextTab);
            $('#frPrevTab').click(prevTab);
          }, 3000);//Timer edit item
        }, 100);
        /* $('.editMenu:eq(0)').find('ul > li:eq(0) > a').click(); */
      }
    }

  }
})(jQuery); 