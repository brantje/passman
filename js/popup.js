$(document).ready(function(){
  $('#header').remove();
});
var app = angular.module('passman', ['ngResource', 'ngTagsInput', 'ngClipboard', 'offClick']).config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
    }]);
app.controller('popupCtrl', function ($scope,ItemService,$window,$http,$timeout) {
  $scope.currentItem = {};
  $scope.noFavIcon = OC.imagePath('passman', 'lock.svg');
  $scope.encryptObject = function(object){
    var ec = JSON.stringify(object);
    return $scope.encryptThis(ec);
  };
  $scope.decryptObject = function(str){
    var s = $scope.decryptThis(str);
    return  JSON.parse(s);
  };

  $scope.decryptThis = function (encryptedData, encKey) {
    var decryptedString = window.atob(encryptedData), encKey2 = (encKey) ? encKey : $scope.getEncryptionKey();
    try {
      decryptedString = sjcl.decrypt(encKey2, decryptedString);
    } catch (e) {
      console.log('Invalid key!');
      decryptedString = '';
    }

    return decryptedString;
  };

  $scope.encryptThis = function (str, encKey) {
    var encryptedString = str, encKey2 = (encKey) ? encKey : $scope.getEncryptionKey();
    try {
      encryptedString = sjcl.encrypt(encKey2, encryptedString);
    } catch (e) {
      console.log('Invalid key!', e);
      encryptedString = '';
    }
    encryptedString = window.btoa(encryptedString);
    return encryptedString;
  };
  $scope.getEncryptionKey = function () {
    return $scope.encryptionKey;
  };

  $scope.setEncryptionKey = function (key) {
    $scope.encryptionKey = key;
  };

  $scope.showEncryptionKeyDialog = function () {
    $('#encryptionKeyDialog').dialog({
      draggable: false,
      resizable: false,
      closeOnEscape: false,
      modal: true,
      /*open: function (event, ui) {
       //$(".ui-dialog-titlebar-close").hide();
       },*/
      buttons: {
        "Ok": function () {
          if ($('#ecKey').val() === '') {
            OC.Notification.showTimeout("Encryption key can't be empty!");
            return false;
          }
          $(this).dialog("close");

          $scope.setEncryptionKey($('#ecKey').val());
          if ($('#ecRemember:checked').length > 0) {
            $.jStorage.set('encryptionKey', window.btoa($('#ecKey').val()));
            if ($('#rememberTime').val() !== 'forever') {
              var time = $('#rememberTime').val() * 60 * 1000;
              $.jStorage.setTTL("encryptionKey", time);
            }
          }
          $('#ecKey').val('');
          $('#ecRemember').removeAttr('checked');
          $('#rememberTime').val('15');
        }
      }
    });
  };

  if (!$.jStorage.get('encryptionKey')) {
    $scope.showEncryptionKeyDialog();
  } else {
    $scope.setEncryptionKey(window.atob($.jStorage.get('encryptionKey')));
    //$scope.loadItems([]);
  }

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
   /* otpsecret: {},*/
    tags: [],
    url: ''
  };
  $scope.favIconLoading = false;
  $scope.pwFieldVisible = false;
  $scope.newCustomfield = {clicktoshow: 0};
  $scope.newExpireTime = 0;
  $scope.uploadQueue = {};
  $scope.generatedPW = '';
  $scope.pwInfo = {};
  $scope.QRCode = {};
  $scope.currentPWInfo = {};
  $scope.pwSettings = {
    length: 12,
    upper: true,
    lower: true,
    digits: true,
    special: false,
    mindigits: 3,
    ambig: false,
    reqevery: true
  };
  /** The binding is fucked up...
   $scope.$watch('$parent.currentItem',function(n){
    $scope.currentItem = n;
  },true);
   $scope.$watch('currentItem',function(n){
    $scope.$parent.currentItem = n;
  },true);*/

  $scope.$watch('currentItem.password', function (newVal) {
    if (typeof zxcvbn !== 'function') {
      return;
    }
    if (!newVal) {
      return;
    }
    $scope.currentPWInfo = zxcvbn(newVal);
    var today = new Date().getTime(), itemExpireDate = $scope.currentItem.expire_time * 1,days;
    if (itemExpireDate !== 0 && $scope.renewal_period === '0') {
      if (itemExpireDate < today && $scope.editing) {
        days = 86400000 * $scope.renewal_period;
        $scope.newExpireTime = today + days;
      }
    }
  }, true);
  $scope.copied = function (what) {
    OC.Notification.showTimeout('Copied ' + what.toLowerCase() + ' to clipboard');
  };
  $scope.$watch('currentItem.tags', function (newVal) {
    if (!newVal) {
      return;
    }
    $scope.requiredPWStrength = 0;
    $scope.renewal_period = 0;
    var i, tag;
    for (i = 0; i < newVal.length; i++) {
      tag = newVal[i];
      if (tag.min_pw_strength) {
        if (tag.min_pw_strength > $scope.requiredPWStrength) {
          /** @namespace tag.min_pw_strength */
          $scope.requiredPWStrength = tag.min_pw_strength;
        }
      }
      if (tag.renewal_period) {
        if (tag.renewal_period > $scope.renewal_period) {
          $scope.renewal_period = tag.renewal_period * 1;
        }
      }
    }
  }, true);
  $scope.generatePW = function ($evt) {
    console.log($evt);
    $scope.generatedPW = generatePassword($scope.pwSettings.length, $scope.pwSettings.upper, $scope.pwSettings.lower, $scope.pwSettings.digits, $scope.pwSettings.special, $scope.pwSettings.mindigits, $scope.pwSettings.ambig, $scope.pwSettings.reqevery);
    $scope.pwInfo = zxcvbn($scope.generatedPW);
  };
  //     allow spec char       //minimum digits  Avoid Ambiguous Characters     Require Every Character Type
  //generatePassword(length, upper, lower, digits, special,                 mindigits,      ambig,                       reqevery)
  $scope.togglePWField = function () {
    $scope.pwFieldVisible = ($scope.pwFieldVisible === false);
  };

  $scope.addCField = function (customField) {
    if (!customField.label || !customField.value) {
      return;
    }
    $scope.currentItem.customFields.push(customField);
    $scope.newCustomfield = {clicktoshow: 0};
  };

  $scope.removeCField = function (customField) {
    var i, idx;
    for (i = 0; i < $scope.currentItem.customFields.length; i++) {
      if ($scope.currentItem.customFields[i].id === customField.id) {
        idx = $scope.currentItem.customFields.indexOf(customField);
        $scope.currentItem.customFields.splice(idx, 1);
      }
    }
    if (customField.id) {
      ItemService.removeCustomfield(customField.id);
    }
  };
  $scope.loadTags = function (query) {
    return $http.get(OC.generateUrl('apps/passman/api/v1/tags/search?k=' + query));
  };
  $scope.deleteFile = function (file) {
    var i, idx;
    ItemService.deleteFile(file).success(function () {
      for (i = 0; i < $scope.currentItem.files.length; i++) {
        if ($scope.currentItem.files[i].id === file.id) {
          idx = $scope.currentItem.files.indexOf(file);
          $scope.currentItem.files.splice(idx, 1);
        }
      }
    });
  };

  $scope.updateFavIcon = function(){
    $scope.favIconLoading = true;
    var hashedUrl = window.btoa( $scope.currentItem.url)
    $.get(OC.generateUrl('apps/passman/api/v1/item/getfavicon/'+ hashedUrl),function(data){
      console.log(data)
      $scope.currentItem.favicon = data.favicon;
      $scope.favIconLoading = false;
      $scope.$apply();
    });
  };

  var loadFavIconTimer = $timeout(function(){
    $scope.updateFavIcon();
    $timeout.cancel(loadFavIconTimer);

  },50);
  $scope.parseQR = function(qrData){
    console.log(qrData)
    var re = /otpauth:\/\/(totp|hotp)\/(.*)\?(secret|issuer)=(.*)&(issuer|secret)=(.*)/, parsedQR,qrInfo;
    parsedQR = (qrData.qrData.match(re));
    qrInfo = {
      type: parsedQR[1],
      label: decodeURIComponent(parsedQR[2]),
      qrCode: qrData.image
    };
    qrInfo[parsedQR[3]] = parsedQR[4];
    qrInfo[parsedQR[5]] = parsedQR[6];
    $scope.currentItem.otpsecret = qrInfo;
    $scope.$apply();
  };

  $scope.usePw = function () {
    $scope.currentItem.password = $scope.generatedPW;
    $scope.currentItem.passwordConfirm = $scope.generatedPW;
  };

  $scope.saveItem = function (item) {
    $scope.errors = [];
    var saveThis = angular.copy(item), unEncryptedItem = angular.copy(saveThis), encryptedFields = ['account', 'email', 'password', 'description'], i;
    for (i = 0; i < encryptedFields.length; i++) {
      saveThis[encryptedFields[i]] = $scope.encryptThis(saveThis[encryptedFields[i]]);
    }
    if (saveThis.customFields.length > 0) {
      for (i = 0; i < saveThis.customFields.length; i++) {
        saveThis.customFields[i].label = $scope.encryptThis(saveThis.customFields[i].label);
        saveThis.customFields[i].value = $scope.encryptThis(saveThis.customFields[i].value);
        saveThis.customFields[i].clicktoshow = (saveThis.customFields[i].clicktoshow) ? 1 : 0;
      }
    }
    if(saveThis.otpsecret) {
      saveThis.otpsecret = $scope.encryptObject(saveThis.otpsecret);
    }
    /**
     *Field checking
     */
    if (item.password !== item.passwordConfirm) {
      $scope.errors.push("Passwords do not match");
    }
    if ($scope.requiredPWStrength > $scope.currentPWInfo.entropy) {
      $scope.errors.push("Minimal password score not met");
    }
    saveThis.expire_time = $scope.newExpireTime;
    if ($scope.errors.length === 0) {
      delete saveThis.passwordConfirm;
      if (saveThis.id) {
        ItemService.update(saveThis).success(function (data) {
          if (data.success) {
            $scope.errors = [];
            unEncryptedItem.expire_time = data.success.expire_time;
            $scope.$parent.currentItem = unEncryptedItem;
            $scope.closeDialog();
          }
        });
      } else {
        ItemService.create(saveThis).success(function () {
          OC.Notification.showTimeout('Item created!',3000);
          $timeout(function(){
            $window.close();
          },3400);
        });
      }
    }
  };
});
var t = function () { };
/* Check if t function exists if not, create it to prevent errors  */
if (null === t) {
  function t (app, string) {
    console.log('Fuck, l10n failed to load', 'App: ' + app, 'String: ' + string);
    return string;
  }
}