/**
 *A lil bit of jQuery is needed..
 * For active rows and the search. 
 */
$(document).ready(function(){
  $(document).on('click','#pwList li',function(){
    $('.row-active').removeClass('row-active');
    $(this).addClass('row-active')
  })
})


var app = angular.module('passman', ['ngResource', 'ngTagsInput', 'ngClipboard', 'LocalStorageModule','offClick']).config(['$httpProvider',
function($httpProvider) {
  $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
}]);

app.factory('ItemService', ['$http',
function($http) {
  return {
    getItems : function(tags,showDeleted) {
      var queryUrl = (!showDeleted) ? OC.generateUrl('apps/passman/api/v1/getbytags?tags=' + tags.join(',')) : OC.generateUrl('apps/passman/api/v1/items/getdeleted?tags=' + tags.join(','));
      return $http({
        url : queryUrl,
        method : 'GET',
      })
    },
    update : function(item) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/'+item.id),
        data: item,
        method : 'PATCH',
      })
    },
    softDestroy : function(item) {
     item.delete_date = Math.floor(new Date().getTime() / 1000);
     return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/'+item.id),
        data: item,
        method : 'PATCH',
      })
    },
    recover : function(item) {
     item.delete_date = 0;
     return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/'+item.id),
        data: item,
        method : 'PATCH',
      })
    },
    destroy : function(item) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/delete/'+item.id),
        method : 'DELETE',
      })
    },
    create : function(item) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item'),
        data: item,
        method : 'PUT',
      })
    },
    removeCustomfield : function(id) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/field/delete/'+id),
        method : 'DELETE',
      })
    },
    getFile: function(id){
      return $http({
        url : OC.generateUrl('/apps/passman/api/v1/item/file/' + id),
        method : 'GET',
      })
    },
    uploadFile: function(file){
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/' + file.item_id + '/addfile'),
        method : 'PUT',
        data: file
      })
    },
    deleteFile: function(file){
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item/file/' + file.id),
        method : 'DELETE',
      })
    }
  }
}]);
app.factory('TagService', ['$http',
function($http) {
  return {
    getTag : function(tag) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/tag/load?tag='+tag),
        method : 'GET',
      })
    },
    update : function(tag) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/tag/update'),
        method : 'PATCH',
        data: tag
      })
    }
  }
}]);

app.controller('appCtrl', function($scope, ItemService, localStorageService,$http,$window) {
  console.log('appCtrl');
  $scope.items = [];
  $scope.showingDeletedItems = false;
  $scope.tags = [];
  $scope.selectedTags = []
  $scope.noFavIcon = OC.imagePath('passman', 'lock.svg');
 
  
  $scope.loadItems = function(tags,showDeleted) {
    var idx = tags.indexOf('is:Deleted');
    console.log(idx)
    if(idx >= 0){
       tags.splice(idx,1);
    }
    ItemService.getItems(tags,showDeleted).success(function(data) {
      $scope.tags = [];
      $scope.items = data.items;
      var tmp = []
      for (var i = 0; i < data.items.length; i++) {
        var tags = data.items[i].tags;
        if (tags) {
          for ( t = 0; t < tags.length; t++) {
            var tag = tags[t].text.trim();
            if (tmp.indexOf(tag) === -1) {
              tmp.push(tag);
            }
          }
        }
      }
      tmp.sort(function(x,y){ 
        var a = String(x).toUpperCase(); 
        var b = String(y).toUpperCase(); 
        if (a > b) 
           return 1 
        if (a < b) 
           return -1 
        return 0; 
      });
      $scope.tags = tmp;
    });
  };
  //$scope.loadItems([]);

  $scope.$watch("selectedTags", function(v) {
    if (!$scope.encryptionKey) {
      return;
    }

    var tmp = [];
    for (name in v) {
      tmp.push(v[name].text)
    }
    if(tmp.indexOf('is:Deleted')!==-1){
      $scope.showingDeletedItems = true;
    } else {
      $scope.showingDeletedItems = false;
    }
    $scope.loadItems(tmp,$scope.showingDeletedItems);
  }, true);

  $scope.selectTag = function(tag) {
    $scope.selectedTags.push({
      text : tag
    })
  };

  $window.decryptThis =  $scope.decryptThis = function(encryptedData,encKey) {
    var decryptedString = window.atob(encryptedData);
    var encKey = (encKey) ? encKey : $window.c;
    try {
      decryptedString = sjcl.decrypt(encKey, decryptedString);
    } catch(e) {
      console.log('Invalid key!');
      decryptedString = '';
    }

    return decryptedString;
  };

  $scope.encryptThis = $scope.encryptThis = function(str,encKey) {
    var encryptedString = str;
    var encKey = (encKey) ? encKey : $window.c;
    try {
      encryptedString = sjcl.encrypt(encKey, encryptedString)
    } catch(e) {
      console.log('Invalid key!',e);
      encryptedString = '';
    }
    encryptedString = window.btoa(encryptedString);
    return encryptedString;
  };

  $scope.setEncryptionKey = function(key) {
    $window.c = key;
  };

  $scope.showEncryptionKeyDialog = function() {
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
            OC.Notification.showTimeout("Encryption key can't be empty!");
            return false;
          }
          $(this).dialog("close");
          $scope.setEncryptionKey($('#ecKey').val());
          $scope.loadItems([]);
          if ($('#ecRemember:checked').length > 0) {
            localStorageService.set('encryptionKey', window.btoa($('#ecKey').val()));
            /*if ($('#rememberTime').val() != 'forever') {
             var time = $('#rememberTime').val() * 60 * 1000;
             $.jStorage.setTTL("ENC_KEY", time);

             $('#sessionTimeContainer').show();
             countLSTTL();
             }*/
          }
          $('#ecKey').val('');
          $('#ecRemember').removeAttr('checked');
          //$('#rememberTime').val('15');
        }
      }
    });
  };

  $scope.loadTags = function(query) {
    return $http.get(OC.generateUrl('apps/passman/api/v1/tags/search?k=' + query));
  };
  
  /* 
   * Lock session
   */
  $scope.lockSession = function(){
    $scope.showEncryptionKeyDialog();
    localStorageService.set('encryptionKey','');
    $scope.items = [];
  }
  /**
   *Onload -> Check if localstorage has key if not show dialog
   */
  if (!localStorageService.get('encryptionKey')) {
    $scope.showEncryptionKeyDialog();
  } else {
    $scope.setEncryptionKey(window.atob(localStorageService.get('encryptionKey')));
    $scope.loadItems([]);
  }

  $('#item_tabs').tabs();
});

app.controller('navigationCtrl', function($scope,TagService) {
  $scope.tagProps = {};
  
  $scope.tagSettings = function(tag,$event){
    $event.stopPropagation();
    TagService.getTag(tag).success(function(data){
      $scope.tagProps = data;
      $('#tagSettingsDialog').dialog({
        title: data.tag_label,
        width: 210,
        buttons:{
          "Save": function(){
            console.log($scope.tagProps)
            var t = this;
            TagService.update($scope.tagProps).success(function(data){
              $(t).dialog('close');
            })
          },
          "Close": function(){ $(this).dialog('close') }
        }
      });
    });
  }

});

app.controller('contentCtrl', function($scope, $sce,$compile,ItemService) {
  console.log('contentCtrl');
  $scope.currentItem = {};
  $scope.showItem = function(item) {
    /*var encryptedFields = ['account', 'email', 'password', 'description'];
    if (!item.decrypted) {
      for (var i = 0; i < encryptedFields.length; i++) {
        if(item[encryptedFields[i]]){
          item[encryptedFields[i]] = $scope.decryptThis(item[encryptedFields[i]]);
        }
      }
      for (var i = 0; i < item.customFields.length; i++) {
       item.customFields[i].label = $scope.decryptThis(item.customFields[i].label);
       item.customFields[i].value = $scope.decryptThis(item.customFields[i].value);
      }
      for (var i = 0; i < item.files.length; i++) {
        item.files[i].filename = $scope.decryptThis(item.files[i].filename);
        item.files[i].size = item.files[i].size;
        item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
      }
    }

    item.decrypted = true;*/
    $scope.currentItem = item;
    $scope.currentItem.passwordConfirm = item.password;
    $scope.requiredPWStrength = 0;
  };
  
  $scope.recoverItem = function(item){
    ItemService.recover(item).success(function() {
        for (var i = 0; i < $scope.items.length; i++) {
          if ($scope.items[i].id == item.id) {
            var idx = $scope.items.indexOf(item);
            $scope.items.splice(idx, 1)
          }
        }
      });
      OC.Notification.showTimeout('<div>'+ item.label +' recoverd</div>');
  }

  $scope.shareItem = function(rawItem){
    var item = angular.copy(rawItem);
    var encryptedFields = ['account', 'email', 'password', 'description'];
    if (!item.decrypted) {
      for (var i = 0; i < encryptedFields.length; i++) {
        if(item[encryptedFields[i]]){
          item[encryptedFields[i]] = $scope.decryptThis(item[encryptedFields[i]]);
        }
      }
      for (var i = 0; i < item.customFields.length; i++) {
       item.customFields[i].label = $scope.decryptThis(item.customFields[i].label);
       item.customFields[i].value = $scope.decryptThis(item.customFields[i].value);
      }
      for (var i = 0; i < item.files.length; i++) {
        item.files[i].filename = $scope.decryptThis(item.files[i].filename);
        item.files[i].size = item.files[i].size;
        item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
      }
    }
    console.log(item)
  }

  $scope.deleteItem = function(item, softDelete) {
    console.log(item, softDelete)
    if (softDelete) {
      ItemService.softDestroy(item).success(function() {
        for (var i = 0; i < $scope.items.length; i++) {
          if ($scope.items[i].id == item.id) {
            var idx = $scope.items.indexOf(item);
            $scope.items.splice(idx, 1)
          }
        }
      });
      OC.Notification.showTimeout('<div>'+ item.label +' deleted</div>');
    } else {
      ItemService.destroy(item).success(function() {
        for (var i = 0; i < $scope.items.length; i++) {
          if ($scope.items[i].id == item.id) {
            var idx = $scope.items.indexOf(item);
            $scope.items.splice(idx, 1)
          }
        }
      });
      OC.Notification.showTimeout('<div>'+ item.label +' destroyed</div>');
    }
  };

  /**
   *Download a file, still uses a lot of jQuery.... 
   */
  $scope.loadFile = function(file) {
    ItemService.getFile(file.id).success(function(data) {
      if (data.type.indexOf('image') >= 0 && data.size < 4194304) {
        var imageData = $scope.decryptThis(data.content);
        $('#fileImg').attr('src', imageData);
        $('#downloadImage').html('<a href="' + imageData + '" download="' + $scope.decryptThis(escapeHTML(data.filename)) + '">Save this image</a>');
        $('#fileImg').load(function() {
          $('#dialog_files').dialog({
            width : 'auto',
            title : $scope.decryptThis(data.filename),
            buttons : {
              "Close" : function() {
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
              my : "center",
              at : "center",
              of : window
            });
          }
        });
      } else {
        var fileData = $scope.decryptThis(data.content);
        //console.log(fileData);
        $('<div>Due popup blockers you have to click the below button to download your file.</div>').dialog({
          title : "Download " + escapeHTML($scope.decryptThis(data.filename)),
          content : 'test',
          buttons : {
            "Download" : function() {
              var uriContent = dataURItoBlob(fileData, data.type);
              /*var newWindow = window.open(uriContent, data.filename);*/
              var a = document.createElement("a");
              a.style = "display: none";
              a.href = uriContent;
              a.download = escapeHTML($scope.decryptThis(data.filename));
              document.body.appendChild(a);
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
    })
  }


  $scope.copied = function(what) {
    OC.Notification.showTimeout('Copied ' + what.toLowerCase() + ' to clipboard');
  };
  $scope.addItem = function(){
    $scope.currentItem = {
      account: '',
      created: '',
      customFields: [],
      delete_date: "0",
      description: "",
      email: '',
      expire_time: 0,
      favicon: '',
      files: [],
      label: '',
      password: '',
      passwordConfirm: '',
      tags: [],
      url: ''
    };
    
    $scope.requiredPWStrength = 0;
    $scope.editItem({});
    
  }
  
  $scope.editItem = function(item) {
    $sce.trustAsHtml($scope.currentItem.description);
    $('#editAddItemDialog').dialog({
      title : 'Edit item',
      "width" : ($(document).width() > 425) ? 'auto' : $(document).width() - 10,
    });
  };
});

app.controller('addEditItemCtrl', function($scope,ItemService) {
  console.log('addEditItemCtrl');
  $scope.pwFieldVisible = false;
  $scope.newCustomfield = {clicktoshow: 0};
  $scope.uploadQueue = {}
  $scope.generatedPW = '';
  $scope.pwInfo = {};
  $scope.currentPWInfo = {};
  $scope.pwSettings ={
    length: 12,
    upper: true,
    lower: true,
    digits: true,
    special: false,
    mindigits: 3,
    ambig: false,
    reqevery: true
  }
  /** The binding is fucked up...
  $scope.$watch('$parent.currentItem',function(n){
    $scope.currentItem = n;
  },true);
  $scope.$watch('currentItem',function(n){
    $scope.$parent.currentItem = n;
  },true);*/
  
  $scope.$watch('currentItem.password',function(newVal){
    if(typeof zxcvbn != 'function'){
      return;
    }
    $scope.currentPWInfo = zxcvbn(newVal);
  },true);
  
  $scope.$watch('currentItem.tags',function(newVal){
    if(!newVal){
      return;
    }
    for(var i=0; i< newVal.length;i++){      var tag = newVal[i];
      if(tag.min_pw_strength){
        if(tag.min_pw_strength >  $scope.requiredPWStrength){
          $scope.requiredPWStrength = tag.min_pw_strength;
        }
      }
    }
  },true);
  
  $scope.closeDialog = function(){
    $('#editAddItemDialog').dialog('close');
    $scope.generatedPW = '';
    $scope.currentPWInfo = {};
  }
  $scope.generatePW = function(){
    $scope.generatedPW = generatePassword($scope.pwSettings.length, $scope.pwSettings.upper, $scope.pwSettings.lower, $scope.pwSettings.digits, $scope.pwSettings.special, $scope.pwSettings.mindigits, $scope.pwSettings.ambig, $scope.pwSettings.reqevery);
    $scope.pwInfo = zxcvbn($scope.generatedPW );
  };
                                            //     allow spec char       //minimum digits  Avoid Ambiguous Characters     Require Every Character Type
  //generatePassword(length, upper, lower, digits, special,                 mindigits,      ambig,                       reqevery)
  $scope.togglePWField = function(){
    $scope.pwFieldVisible = ($scope.pwFieldVisible==false) ? true : false;
  };
  
  $scope.addCField = function(customField){
    if(!customField.label || !customField.value){
      return;
    }
    $scope.currentItem.customFields.push(customField);
    $scope.newCustomfield = {clicktoshow: 0};
  };
 
  $scope.removeCField = function(customField) {
    for (var i = 0; i < $scope.currentItem.customFields.length; i++) {
      if ($scope.currentItem.customFields[i].id == customField.id) {
        var idx = $scope.currentItem.customFields.indexOf(customField);
        $scope.currentItem.customFields.splice(idx, 1)
      }
    }
    if(customField.id){
      ItemService.removeCustomfield(customField.id);
    }
  }

  $scope.deleteFile = function(file) {
    ItemService.deleteFile(file).success(function() {
      for (var i = 0; i < $scope.currentItem.files.length; i++) {
        if ($scope.currentItem.files[i].id == file.id) {
          var idx = $scope.currentItem.files.indexOf(file);
          $scope.currentItem.files.splice(idx, 1)
        }
      }
    })
  }

  
  $scope.usePw = function(){
    $scope.currentItem.password =  $scope.generatedPW;
    $scope.currentItem.passwordConfirm = $scope.generatedPW;
  }
  
  $scope.saveItem = function(item){
    $scope.errors = [];
    var saveThis = angular.copy(item);
    var unEncryptedItem = angular.copy(saveThis);
    var encryptedFields = ['account', 'email', 'password', 'description'];
    for (var i = 0; i < encryptedFields.length; i++) {
      if(encryptedFields[i]=='description'){
        saveThis[encryptedFields[i]] = saveThis[encryptedFields[i]];
      }
      saveThis[encryptedFields[i]] = $scope.encryptThis(saveThis[encryptedFields[i]]);
    }
    if(saveThis.customFields.length > 0){
      for (var i = 0; i < saveThis.customFields.length; i++) {
        saveThis.customFields[i].label = $scope.encryptThis(saveThis.customFields[i].label);
        saveThis.customFields[i].value = $scope.encryptThis(saveThis.customFields[i].value);
        saveThis.customFields[i].clicktoshow = (saveThis.customFields[i].clicktoshow) ? 1 : 0; 
      }
    }
    
    /**
     *Field checking 
     */
    if(item.password != item.passwordConfirm){
      $scope.errors.push("Passwords do not match")
    }
    if($scope.requiredPWStrength > $scope.currentPWInfo.entropy){
      $scope.errors.push("Minimal password score not met")
    } 
    
    if($scope.errors.length==0){
      delete saveThis.passwordConfirm;
      if(saveThis.id){
        ItemService.update(saveThis).success(function(data){
          if(data.success){
            $scope.errors = [];
            $scope.closeDialog();
            $scope.$parent.currentItem = unEncryptedItem;
          }
        });
      } else {
        ItemService.create(saveThis).success(function(data){
            $scope.closeDialog();            saveThis.id = data.id;
            $scope.items.push(saveThis);
        });
      }
    }
  }
});

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

app.filter('secondstohuman', function() {
  return function(seconds) {
    seconds = Math.floor(seconds)
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400); 
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    return numyears + " years " +  numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
  }
});

app.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  }
});

app.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
}]);

app.filter('decrypt', ['$window', function($window){
        return function(text) {
            if(!text){
              return;
            }
            return decryptThis(text,$window.c);
        };
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

/***
 *Extend the OC Notification
 */
var notificationTimer;
OC.Notification.showTimeout = function(str, timeout) {
  OC.Notification.hide();
  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }
  timeout = (!timeout) ? 3000 : timeout;
  OC.Notification.showHtml(str);
  notificationTimer = setTimeout(function() {
    OC.Notification.hide();
  }, timeout);
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
  var bb = new Blob([ab], {
    type : ftype
  });

  return URL.createObjectURL(bb);
}
