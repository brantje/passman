app.directive('toggleTextStars', ['$compile',
  function ($compile, $tooltip) {
    return {
      restrict: 'A',
      transclude: false,
      scope: {
        pw: '='
      },
      link: function (scope, element) {
        scope.curPW = '******';
        scope.hSText = 'Show';
        var el = angular.element('<span>{{curPW}} <span ng-click="togglePW()" class="link">[{{hSText}}]</span></span>');
        element.html($compile(el)(scope));
        scope.pwVisible = false;

        scope.togglePW = function () {
          if (!scope.pwVisible) {
            scope.curPW = scope.pw;
            scope.pwVisible = true;
            scope.hSText = 'Hide';
          } else {
            scope.curPW = '******';
            scope.pwVisible = false;
            scope.hSText = 'Show';
          }
        }
        scope.$watch('pw', function (n, o) {
          if (scope.pwVisible) {
            scope.curPW = scope.pw;
          }
        })
      }
    }
  }]);

app.directive('otpGenerator', ['$compile','$timeout',
function($compile,$timeout) {
  return {
    restrict : 'A',
    transclude : false,
    scope : {
      otpdata : '='
    },
    link : function(scope, element) {
      scope.otp = null;
      scope.timeleft = null;
      scope.timer = null;
      var updateOtp = function() {
        if(!scope.otpdata){
          return;
        }
        var key = base32tohex(scope.otpdata);
        var epoch = Math.round(new Date().getTime() / 1000.0);
        var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');
        var hmacObj = new jsSHA(time, 'HEX');
        var hmac = hmacObj.getHMAC(key, 'HEX', 'SHA-1', "HEX");
        var offset = hex2dec(hmac.substring(hmac.length - 1));
        var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
        otp = (otp).substr(otp.length - 6, 6);
        scope.otp = otp;

      };

      var timer = function(){
        var epoch = Math.round(new Date().getTime() / 1000.0);
        var countDown = 30 - (epoch % 30);
        if (epoch % 30 == 0) updateOtp();
        scope.timeleft = countDown;
        scope.timer = $timeout(timer,1000);

      };
      scope.copiedotp = function(){
        OC.Notification.showTimeout("Copied One time password to clipboard")
      }
      scope.$watch("otpdata",function(n){
        if(n){
          $timeout.cancel(scope.timer);
          updateOtp();
          timer();
        } else {
          $timeout.cancel(scope.timer);
        }
      },true);
      var html = '<span pw="otp" toggle-text-stars></span> <a clip-copy="otp" clip-click="copiedotp()" class="link">[Copy]</a> Time left: {{timeleft}}';
      element.html($compile(html)(scope));

      scope.$on(
          "$destroy",
          function( event ) {
            $timeout.cancel(scope.timer);
          }
      );
    }
  }
}]);


app.directive('clickForInput', ['$compile',
function($compile, $tooltip) {
  return {
    restrict : 'A',
    transclude : false,
    scope : {
      value : '='
    },
    link : function(scope, element, attrs, ngModelCtrl) {
      element.html(scope.value)
      element.on('click',function(){
        if(!scope.isInput){
          var ele = angular.element('<input type="text" ng-model="value" value="'+ scope.value +'">');
          var c = $compile(ele)(scope);
          element.html(c);
          scope.isInput = true;
        }
      });
    }
  }
}]);

app.directive('t', ['$compile',
function($compile, $tooltip) {
  return {
    restrict : 'A',
    transclude : false,
    scope : {
      value : '=t'
    },
    link : function(scope, element, attrs, ngModelCtrl) {
      element.html(scope.value);
      
    }
  }
}]);

app.directive('fallbackSrc', function () {
  var fallbackSrc = {
    scope:{
      fallbackSrc: '=fallbackSrc'
    },
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", scope.fallbackSrc);
      });
    }
   }
   return fallbackSrc;
});

app.directive("fileread", ['ItemService',
function(ItemService) {
  return {
    scope : true,
    link : function(scope, element, attributes) {
      element.bind("change", function(changeEvent) {
        var reader = new FileReader();
        file = changeEvent.target.files[0]
        reader.readAsDataURL(changeEvent.target.files[0]);
         
        reader.onloadend = (function(file) {
          return function(evt) {
            if (file.size < 20971520) {
              var dataURL = evt.target.result;
              var mimeType = dataURL.split(",")[0].split(":")[1].split(";")[0];
              var encryptedFile = scope.encryptThis(dataURL);
              var postData = {
                item_id : scope.currentItem.id,
                filename : scope.encryptThis(file.name),
                type : file.type,
                mimetype : mimeType,
                size : file.size,
                content : encryptedFile
              };
              console.log(postData)
              ItemService.uploadFile(postData).success(function(data){
                var icon = (data.type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
                scope.currentItem.files.push({
                    filename: scope.decryptThis(data.filename),
                    size: file.size, 
                    icon: icon,
                    id: data.id,
                    item_id: data.item_id
                });
                element.value = '';
              });
            } else {
                angular.element('#fileList').append('<li>' + file.name + ' Can\'t upload max file size: ' + OC.Util.humanFileSize(20971520) + '</li>');
            }
          };
        })(file);
      });
    }
  }
}]); 


app.directive("qrread", ['$parse','$compile',function($parse,$compile) {
  return {
    scope : true,
    link : function(scope, element, attributes) {
      var gCtx = null,gCanvas = null,  c= 0, stype= 0, gUM=false, webkit=false, moz=false;
      var invoker = $parse(attributes.onRead);
      scope.imageData = null;

      qrcode.callback = function(result){
        //console.log('QR callback:',result);
        invoker(scope, {qrdata: {qrData: result, image: scope.imageData } });
        //element.val('');
      }
      element.bind("change", function(changeEvent) {
        var reader = new FileReader(),file = changeEvent.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = (function(theFile) {
          return function(e) {
            //gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
            scope.imageData = e.target.result;
            qrcode.decode(e.target.result);
          };
        })(file);
      });
    }
  }
}]);


angular.module('offClick',[]).directive('offClick', ['$document', function ($document) {
        
    function targetInFilter(target,filter){
        if(!target || !filter) return false;
        var elms = angular.element(filter);
        var elmsLen = elms.length;
        for (var i = 0; i< elmsLen; ++i)
            if(elms[i].contains(target)) return true;
        return false;
    }
    
    return {
        restrict: 'A',
        scope: {
            offClick: '&',
            offClickIf: '&'
        },
        link: function (scope, elm, attr) {

            if (attr.offClickIf) {
                scope.$watch(scope.offClickIf, function (newVal, oldVal) {
                        if (newVal && !oldVal) {
                            $document.on('click', handler);
                        } else if(!newVal){
                            $document.off('click', handler);
                        }
                    }
                );
            } else {
                $document.on('click', handler);
            }

            scope.$on('$destroy', function() {
                $document.off('click', handler);
            });

            function handler(event) {
                // This filters out artificial click events. Example: If you hit enter on a form to submit it, an
                // artificial click event gets triggered on the form's submit button.
                if (event.pageX == 0 && event.pageY == 0) return;
                
                var target = event.target || event.srcElement;
                if (!(elm[0].contains(target) || targetInFilter(target, attr.offClickFilter))) {
                    scope.$apply(scope.offClick());
                }
            }
        }
    };
}]);