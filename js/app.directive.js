
app.directive('toggleTextStars', ['$compile',
function($compile, $tooltip) {
  return {
    restrict : 'A',
    transclude : false,
    scope : {
      pw : '='
    },
    link : function(scope, element, attrs, ngModelCtrl) {
      scope.curPW = '******';
      scope.hSText = 'Show';
      var el = angular.element('<span>{{curPW}} <span ng-click="togglePW()" class="link">[{{hSText}}]</span></span>');
      element.html($compile(el)(scope));
      scope.pwVisible = false;

      scope.togglePW = function() {
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
      scope.$watch('pw',function(n,o){
        if(scope.pwVisible){
          scope.curPW = scope.pw;
        }
      })
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
                    item_id: data.item_id,
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