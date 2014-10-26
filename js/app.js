var app = angular.module('passman', ['ngResource', 'ngTagsInput', 'ngClipboard', 'LocalStorageModule']).config(['$httpProvider',
function($httpProvider) {
  $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
}]);

app.factory('ItemService', ['$http',
function($http) {
  return {
    getItems : function(tags) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/getbytags?tags=' + tags.join(',')),
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
    create : function(item) {
      return $http({
        url : OC.generateUrl('apps/passman/api/v1/item'),
        data: item,
        method : 'PUT',
      })
    }
  }
}]);

app.controller('appCtrl', function($scope, ItemService, localStorageService,$http) {
  console.log('appCtrl');
  $scope.items = [];
  $scope.tags = [];
  $scope.selectedTags = []
  $scope.noFavIcon = OC.imagePath('passman', 'lock.svg');
  $scope.loadItems = function(tags) {
    ItemService.getItems(tags).success(function(data) {
      $scope.tags = [];
      $scope.items = data.items;
      for (var i = 0; i < data.items.length; i++) {
        var tags = data.items[i].tags;
        if (tags) {
          for ( t = 0; t < tags.length; t++) {
            var tag = tags[t].text.trim();
            if ($scope.tags.indexOf(tag) === -1) {
              $scope.tags.push(tag);
            }
          }
        }
      }
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
    $scope.loadItems(tmp);
  }, true);

  $scope.selectTag = function(tag) {
    $scope.selectedTags.push({
      text : tag
    })
  };

  $scope.decryptThis = function(encryptedData) {
    var decryptedString = window.atob(encryptedData);
    try {
      decryptedString = sjcl.decrypt($scope.encryptionKey, decryptedString);
    } catch(e) {
      console.log('Invalid key!');
      decryptedString = '';
    }

    return decryptedString;
  };

  $scope.encryptThis = function(str) {
    var encryptedString = str;
    try {
      encryptedString = sjcl.encrypt($scope.encryptionKey, encryptedString)
    } catch(e) {
      console.log('Invalid key!',e);
      encryptedString = '';
    }
    encryptedString = window.btoa(encryptedString);
    return encryptedString;
  };

  $scope.setEncryptionKey = function(key) {
    $scope.encryptionKey = key;
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
  
  /**
   *Onload -> Check if localstorage has key if not show dialog
   */
  if (!localStorageService.get('encryptionKey')) {
    $scope.showEncryptionKeyDialog();
  } else {
    $scope.setEncryptionKey(window.atob(localStorageService.get('encryptionKey')));
  }

  $('#item_tabs').tabs();
});

app.controller('navigationCtrl', function($scope) {
  console.log('navigationCtrl');

});

app.controller('contentCtrl', function($scope, $sce,$compile) {
  console.log('contentCtrl');
  $scope.currentItem = {};
  $scope.showItem = function(item) {
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
        item.files[i].size = OC.Util.humanFileSize(item.files[i].size);
        item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
      }
    }

    //item.description = $sce.trustAsHtml(item.description);
    item.decrypted = true;
    $scope.currentItem = item;
    $scope.requiredPWStrength = 0;
  };

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

app.controller('addEditItemCtrl', function($scope, ItemService) {
  console.log('addEditItemCtrl');
  $scope.pwFieldVisible = false;
  $scope.newCustomfield = {};
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
    $scope.newCustomfield = {};
  };
  
  $scope.usePw = function(){
    $scope.currentItem.password =  $scope.generatedPW;
    $scope.currentItem.passwordConfirm = $scope.generatedPW;
  }
  
  $scope.saveItem = function(item){
    $scope.errors = [];
    var saveThis = angular.copy(item);
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

app.directive('togglepw', ['$compile',
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
      var el = angular.element('<span>{{curPW}} <span ng-click="togglePW()" class="link">[{{hSText}} password]</span></span>');
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
    }
  }
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