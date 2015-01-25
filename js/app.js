/**
 *A lil bit of jQuery is needed..
 */

$(document).ready(function () {
  'use strict';
  /* Resize the pwList */
  window.resizeList = function(){
    var containerHeight,containerWidth,listHeight;
    listHeight = $('#pwList').height();
    containerHeight = $('#app-content').height();
    containerWidth = $('#app-content').width();
    $('#pwList').height(containerHeight - $('#infoContainer').height() - 85);
    $('#pwList').width(containerWidth - 2);
    $('#topContent').width(containerWidth - 2);
  };
  $(window).resize(resizeList);
  resizeList();
  var lastTime;
  $(document).on('keyup',function(evt){
    if(evt.keyCode === 16){
      if(!lastTime){
        lastTime = new Date().getTime();
      } else {
        var curr = new Date().getTime();
        if(curr-lastTime < 2000){
          $('#itemSearch').focus();
          lastTime = null;
        } else {
          lastTime = null;
        }
      }
    }
  });
  /* Load javascript translations */
 // OC.L10N.load('passman',function(){ console.log('loaded'); });
  /*Example usage: OC.L10N.translate('passman','Files') */

  /**
   * Notifications are powered by ownCloud, and therefore outside the scope of the app.
   * With the following code we can still use the [Undo] feature.
   */
  window.findItemByID = function(id){
    var items,foundItem=false;
    items = angular.element('#app-content').scope().items;
    angular.forEach(items, function(item){
      if(item.id === id){
        foundItem = item;
      }
    });
   return foundItem;
  };

  $(document).on('click','.undoDelete',function(){
    var item = findItemByID($(this).attr('data-item-id'));
    angular.element('#app-content').scope().recoverItem(angular.element('#app-content').scope().lastDeletedItem);
    angular.element('#app-content').scope().$apply();
  });
  $(document).on('click','.undoRestore',function(){
    var item = findItemByID($(this).attr('data-item-id'));
    angular.element('#app-content').scope().deleteItem(angular.element('#app-content').scope().lastRecoveredItem,true);
    angular.element('#app-content').scope().$apply();
  });
});

var app;
app = angular.module('passman', ['textAngular', 'ngSanitize', 'ngResource', 'ngTagsInput', 'ngClipboard', 'offClick', 'ngClickSelect']).config(['$httpProvider','$locationProvider',
    function ($httpProvider,$locationProvider) {
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        }).hashPrefix('!');
    }]);


app.controller('appCtrl', function ($scope, ItemService, $http, $window, $timeout, settingsService,$rootScope,$location) {
  'use strict';
  console.log('appCtrl');
  var today =  new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  $scope.today = today.getTime();
  
  $scope.items = [];
  $scope.showingDeletedItems = false;
  $scope.tags = [];
  $scope.selectedTags = [];
  $scope.noFavIcon = OC.imagePath('passman', 'lock.svg');
  $scope.sessionExpireTime = 0;
  $scope.itemFilter = {visible: true};
  $scope.expireNotificationShown = false;
  settingsService.getSettings().success(function(data){
    $scope.userSettings = data;
    $window.userSettings = data;
  });
  if($location.hash().match(/selectItem=([0-9]+)/)){
    $scope.selectThisItem = $location.hash().match(/selectItem=([0-9]+)/)[1];
  }
  $scope.loadItems = function (tags, showDeleted) {
    var idx = tags.indexOf('is:Deleted');
    if (idx >= 0) {
      tags.splice(idx, 1);
    }
    ItemService.getItems(tags, showDeleted).success(function (data) {
      $scope.tags = [];
      //$scope.items = data.items;
      var tmp = [], i, t, tag,item,items = [];

      for (i = 0; i < data.items.length; i++) {
        tags = data.items[i].tags;
        if (tags) {
          for (t = 0; t < tags.length; t++) {
            tag = tags[t].text.trim();
            if (tmp.indexOf(tag) === -1) {
              tmp.push(tag);
            }
          }
        }
        if(data.items[i].id === $scope.selectThisItem){
          $scope.$broadcast('showItem',data.items[i]);
        }
        item = data.items[i];
        item.tags.sort(function(a,b) {
          return a.text.toLowerCase() < b.text.toLowerCase()
        });
        item.visible = true;
        items.push(item);
      }
      $scope.items = items;
      tmp.sort(function (x, y) {
        var a = String(x).toUpperCase(), b = String(y).toUpperCase();
        if (a > b) {
          return 1;
        }
        if (a < b) {
          return -1;
        }
        return 0;
      });
      $scope.tags = tmp;
      $rootScope.$broadcast('loaded');
      $window.resizeList();
      $location.hash('')
    });
  };
  //$scope.loadItems([]);

  $scope.$watch("selectedTags", function (v) {
    if (!$scope.encryptionKey) {
      return;
    }

    var tmp = [], i;
    for (i = 0; i < v.length; i++) {
      tmp.push(v[i].text);
    }
    /*for (name in v) {
      tmp.push(v[name].text)
    }*/
    $scope.showingDeletedItems = tmp.indexOf('is:Deleted') !== -1;
    $scope.loadItems(tmp, $scope.showingDeletedItems);
  }, true);

  $scope.selectTag = function (tag) {
    $scope.selectedTags.push({
      text: tag
    });
  };

  $scope.encryptObject = function(object){
    var ec = JSON.stringify(object);
    return $scope.encryptThis(ec);
  };
  $scope.decryptObject = function(str){
    var s = $scope.decryptThis(str);
    return  JSON.parse(s);
  };

  $scope.decryptItem = function(rawItem){
    var item = angular.copy(rawItem), encryptedFields = ['account', 'email', 'password', 'description'], i;
    if (!item.decrypted) {
      for (i = 0; i < encryptedFields.length; i++) {
        if (item[encryptedFields[i]]) {
          item[encryptedFields[i]] = $scope.decryptThis(item[encryptedFields[i]]);
        }
      }
      if(item.customFields) {
        for (i = 0; i < item.customFields.length; i++) {
          item.customFields[i].label = $scope.decryptThis(item.customFields[i].label);
          item.customFields[i].value = $scope.decryptThis(item.customFields[i].value);
        }
      }
      if(item.files) {
        for (i = 0; i < item.files.length; i++) {
          item.files[i].filename = $scope.decryptThis(item.files[i].filename);
          item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
        }
      }
      if(item.otpsecret) {
        item.otpsecret = $scope.decryptObject(item.otpsecret);
      }
    }
    return item;
  };
  $scope.encryptItem = function(rawItem){
    var item = angular.copy(rawItem), encryptedFields = ['account', 'email', 'password', 'description'], i;
    if (!item.decrypted) {
      for (i = 0; i < encryptedFields.length; i++) {
        if (item[encryptedFields[i]]) {
          item[encryptedFields[i]] = $scope.encryptThis(item[encryptedFields[i]]);
        }
      }
      if(item.customFields) {
        for (i = 0; i < item.customFields.length; i++) {
          item.customFields[i].label = $scope.encryptThis(item.customFields[i].label);
          item.customFields[i].value = $scope.encryptThis(item.customFields[i].value);
        }
      }
      if(item.files) {
        for (i = 0; i < item.files.length; i++) {
          item.files[i].filename = $scope.encryptThis(item.files[i].filename);
          item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
        }
      }
      if(item.otpsecret) {
        item.otpsecret = $scope.encryptObject(item.otpsecret);
      }
    }
    return item;
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

  $scope.showSettings = function () {
    $('#settingsDialog').dialog({
      modal: true,
      width: '750px',
      title: 'Settings',
      height: 545,
      position:['center','top+50'],
      open: function(){
       /* $('.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix').remove();*/
        console.log($scope.userSettings);
      }
    });
  };
  var countLSTTL = function () {
    var numyears, numdays, numhours, numminutes, numseconds, time = $.jStorage.getTTL("encryptionKey"), seconds, str = '';
    time = time / 1000;

    if (time === 0) {
      $scope.lockSession();
    }
    if (time < 300 &&  $scope.expireNotificationShown === false) {
      OC.Notification.showTimeout('Your session expires in 5 minutes');
      $scope.expireNotificationShown = true;
    }

    seconds = Math.floor(time);
    numyears = Math.floor(seconds / 31536000);
    numdays = Math.floor((seconds % 31536000) / 86400);
    numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;

    if (numyears > 0) {
      str += numyears + " years ";
    }
    if (numdays > 0) {
      str += numdays + " days ";
    }
    if (numhours < 10) {
      numhours = "0" + numhours;
    }
    if (numminutes < 10) {
      numminutes = "0" + numminutes;
    }
    if (numseconds < 10) {
      numseconds = "0" + numseconds;
    }
    str += numhours + ":";
    str += numminutes + ":";
    str += numseconds;

    $scope.sessionExpireTime = str;
    $scope.ttlTimer = $timeout(countLSTTL, 1000);
  };

  $scope.doLogin = function(){
    if ($('#ecKey').val() === '') {
      OC.Notification.showTimeout("Encryption key can't be empty!");
      return false;
    }
    $('#encryptionKeyDialog').dialog("close");

    $scope.setEncryptionKey($('#ecKey').val());
    $scope.loadItems([]);
    if ($('#ecRemember:checked').length > 0) {
      $.jStorage.set('encryptionKey', window.btoa($('#ecKey').val()));
      if ($('#rememberTime').val() !== 'forever') {
        var time = $('#rememberTime').val() * 60 * 1000;
        $.jStorage.setTTL("encryptionKey", time);
        countLSTTL();
      }
    }
    $('#ecKey').val('');
    $('#ecRemember').removeAttr('checked');
    $('#rememberTime').val('15');
    //$rootScope.$broadcast('loaded');
  };

  $scope.showEncryptionKeyDialog = function () {
    var showEncDTimeout;
    showEncDTimeout = $timeout(function(){
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
            $scope.doLogin();
          }
        }
      });
      $timeout.cancel(showEncDTimeout);
    },20);
  };

  $scope.loadTags = function (query) {
    return $http.get(OC.generateUrl('apps/passman/api/v1/tags/search?k=' + query));
  };

  /*
   * Lock session
   */
  $scope.lockSession = function () {
    $scope.showEncryptionKeyDialog();
    $.jStorage.set('encryptionKey', '');
    $timeout.cancel($scope.ttlTimer);
    $scope.items = [];
    $scope.tags = [];
  };
  /**
   *Onload -> Check if localstorage has key if not show dialog
   */

  if (!$.jStorage.get('encryptionKey')) {
    if( typeof firstRun === "boolean") {
      if(firstRun=== true){
        $scope.loadItems([]);
      }
    } else {
      $scope.showEncryptionKeyDialog();
    }
  } else {
    $scope.setEncryptionKey(window.atob($.jStorage.get('encryptionKey')));
    //$scope.loadItems([]);
    countLSTTL();
  }
});

app.controller('navigationCtrl', function ($scope, TagService) {
  'use strict';
  $scope.tagProps = {};

  $scope.tagSettings = function (tag, $event) {
    var oldTag = angular.copy(tag);
    $event.stopPropagation();
    TagService.getTag(tag).success(function (data) {
      $scope.tagProps = data;
      $('#tagSettingsDialog').dialog({
        title: data.tag_label,
        width: 210,
        buttons: {
          "Save": function () {
            var t = this;
            TagService.update($scope.tagProps).success(function () {
              $(t).dialog('close');
              $scope.tags[$scope.tags.indexOf(tag)] = $scope.tagProps.tag_label;
              angular.forEach($scope.items,function(item){
                var hadMatch = false;
                angular.forEach(item.tags,function(itemTag){
                  if(itemTag.text === oldTag){
                    itemTag.text = $scope.tagProps.tag_label;
                    hadMatch = true;
                  }
                });
                if(hadMatch){
                  item.tags.sort(function(a,b) {
                    return a.text.toLowerCase() < b.text.toLowerCase();
                  });
                }
              });
              $scope.tags.sort(function(a,b) {
                return a.toLowerCase() > b.toLowerCase();
              });
            });
          },
          "Close": function () {
            $(this).dialog('close');
          }
        }
      });
    });
  };

});

app.controller('contentCtrl', function ($scope, $sce, ItemService,$rootScope,$timeout) {
  console.log('contentCtrl');
  $scope.currentItem = {};
  $scope.editing = false;

  $scope.$on('showItem',function(evt,item){
    $scope.showItem(item);
  });

  $scope.showItem = function (rawItem) {
    var item = rawItem, encryptedFields = ['account', 'email', 'password', 'description'], i;
    if (!item.decrypted) {
      for (i = 0; i < encryptedFields.length; i++) {
        if (item[encryptedFields[i]]) {
          if(item[encryptedFields[i]]){
            item[encryptedFields[i]] = $scope.decryptThis(item[encryptedFields[i]]);
          }
        }
      }
      for (i = 0; i < item.customFields.length; i++) {
        item.customFields[i].label = $scope.decryptThis(item.customFields[i].label);
        item.customFields[i].value = $scope.decryptThis(item.customFields[i].value);
      }
      for (i = 0; i < item.files.length; i++) {
        item.files[i].filename = $scope.decryptThis(item.files[i].filename);
        item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
      }
      if(item.otpsecret) {
        item.otpsecret = $scope.decryptObject(item.otpsecret);
      }
    }
    if(item.url){
      if(item.url.indexOf('https:') === -1 && item.url.indexOf('http:') === -1){
        item.url = 'http://'+ item.url;
      }
    }
    item.decrypted = true;
    $scope.pwOnLoad = angular.copy(item.password);
    $scope.currentItem = item;
    $scope.currentItem.passwordConfirm = item.password;
    $scope.requiredPWStrength = 0;
  };


  $scope.shareItem = function (item) {
    $rootScope.$broadcast('shareItem', item);
  };

  $scope.showRevisions = function (item) {

    $rootScope.$broadcast('showRevisions', item);
  };

  $scope.recoverItem = function (item,clickedOnUndo) {
    var saveThis = angular.copy(item), encryptedFields = ['account', 'email', 'password', 'description'], i;
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
    saveThis.isRecovered = true;
    ItemService.recover(saveThis).success(function () {
      var idx;
      $scope.lastRecoveredItem = item;
      if(window.findItemByID(item.id)) {
        for (i = 0; i < $scope.items.length; i++) {
          if ($scope.items[i].id == item.id) {
            idx = $scope.items.indexOf(item);
            $scope.items.splice(idx, 1);
          }
        }
      } else {
        $scope.items.push(item);
      }
    });
    OC.Notification.showTimeout('<div>' + item.label + ' recoverd <span class="undoRestore" data-item-id="'+ item.id +'">[Undo]</span></span></div>');
  };

  $scope.deleteItem = function (item, softDelete, clickedOnUndo) {
    var i, idx;
    if (softDelete) {
      var saveThis = angular.copy(item), encryptedFields = ['account', 'email', 'password', 'description'], i;
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
      saveThis.isDeleted = true;

      ItemService.softDestroy(saveThis).success(function () {
        $scope.lastDeletedItem = angular.copy(item);
        if(window.findItemByID(item.id)){
          for (i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].id === item.id) {
              idx = $scope.items.indexOf(item);
              $scope.items.splice(idx, 1);
            }
          }
        } else {
          $scope.items.push(item);
        }
      });

      OC.Notification.showTimeout('<div>' + item.label + ' deleted <span class="undoDelete" data-item-id="'+ item.id +'">[Undo]</span></div>',6500);
    } else {
      ItemService.destroy(item).success(function () {
        for (i = 0; i < $scope.items.length; i++) {
          if ($scope.items[i].id === item.id) {
            idx = $scope.items.indexOf(item);
            $scope.items.splice(idx, 1);
          }
        }
      });
      OC.Notification.showTimeout('<div>' + item.label + ' destroyed</div>');
    }
  };

  /**
   *Download a file, still uses a lot of jQuery....
   */
  $scope.loadFile = function (file) {
    ItemService.getFile(file.id).success(function (data) {
      var fileData, imageData;
      if (data.type.indexOf('image') >= 0 && data.size < 4194304) {
        imageData = $scope.decryptThis(data.content);
        $('#fileImg').attr('src', imageData);
        $('#downloadImage').html('<a href="' + imageData + '" download="' + $scope.decryptThis(escapeHTML(data.filename)) + '">Save this image</a>');
        $('#fileImg').load(function () {
          $('#dialog_files').dialog({
            width: 'auto',
            title: $scope.decryptThis(data.filename),
            buttons: {
              "Close": function () {
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
              my: "center",
              at: "center",
              of: window
            });
          }
        });
      } else {
        fileData = $scope.decryptThis(data.content);
        //console.log(fileData);
        $('<div>Due popup blockers you have to click the below button to download your file.</div>').dialog({
          title: "Download " + escapeHTML($scope.decryptThis(data.filename)),
          content: 'test',
          buttons: {
            "Download": function () {
              var uriContent = dataURItoBlob(fileData, data.type), a = document.createElement("a");
              a.style = "display: none";
              a.href = uriContent;
              a.download = escapeHTML($scope.decryptThis(data.filename));
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(uriContent);
              $(this).remove();
            },
            "Cancel": function () {
              $(this).dialog('destroy').remove();
            }
          }
        });
      }
    });
  };


  $scope.copied = function (what) {
    OC.Notification.showTimeout('Copied ' + what.toLowerCase() + ' to clipboard');
  };
  $scope.addItem = function () {
    var newItem = {
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
      url: '',
      visible: true
    };

    $scope.requiredPWStrength = 0;
    $scope.editItem(newItem);

  };


  $scope.editItem = function(item){
    $scope.editingItem = true;
    $scope.currentItem = item;
    $scope.itemBackupData = angular.copy(item)
    $scope.itemBackupData.oldItem = item;
    $sce.trustAsHtml($scope.currentItem.description);
  };

  /*$scope.editItem = function (item) {
    $scope.currentItem = item;
    $scope.editing = true;
    $sce.trustAsHtml($scope.currentItem.description);
    $('#editAddItemDialog').dialog({
      title: 'Edit item',
      width: 420,
      minHeight: 480,
      height:480,
      position:['center','top+30'],
      open: function(){
        $('#labell').blur();
        if(!$('.ui-dialog-buttonset').find('.button.save')){
          $('.button.cancel').appendTo('.ui-dialog-buttonset');
          $('.button.save').appendTo('.ui-dialog-buttonset');
          $scope.errors = [];
        }
      },
      close: function(){
        $scope.errors = [];
      }
    });
  };*/

  $scope.pwFieldVisible = false;
  $scope.newCustomfield = {clicktoshow: 0};
  $scope.newExpireTime = 0;
  $scope.uploadQueue = {};
  $scope.generatedPW = '';
  $scope.pwInfo = {};

  $scope.QRCode = {};
  $scope.favIconLoading = false;
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
  }, true);

  $scope.$watch('currentItem.tags', function (newVal) {
    if (!newVal) {
      return;
    }
    $scope.requiredPWStrength = 0;
    $scope.renewal_period = undefined;
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
        if($scope.renewal_period === undefined){
          if(tag.renewal_period > 0){
            $scope.renewal_period = tag.renewal_period * 1;
            $scope.currentItem.expire_time = $scope.today+(86400000 * $scope.renewal_period);
          }
        }

        if (tag.renewal_period < $scope.renewal_period && tag.renewal_period > 0) {
          $scope.renewal_period = tag.renewal_period * 1;
          if($scope.currentItem.password===''){
            $scope.currentItem.expire_time = $scope.today+(86400000 * $scope.renewal_period);
          }
        }
      }
    }
  }, true);

  $scope.removeTag =function(tag){
    var idx;
    angular.forEach($scope.currentItem.tags,function(t){
      if(tag.text === t.text){
        idx = $scope.currentItem.tags.indexOf(t);
        $scope.currentItem.tags.splice(idx,1);
      }
    });
  };

  $scope.$watch('currentItem.url',function(newVal){
    if(!newVal){
      return;
    }
    $scope.updateFavIcon();
  });

  $scope.updateFavIcon = function(){
    $scope.favIconLoading = true;
    var hashedUrl = window.btoa( $scope.currentItem.url)
    $.get(OC.generateUrl('apps/passman/api/v1/item/getfavicon/'+ hashedUrl),function(data){
      $scope.currentItem.favicon = data.favicon;
      $scope.favIconLoading = false;
    });
  };

  $scope.closeDialog = function () {
    $scope.generatedPW = '';
    $scope.currentPWInfo = {};
    $scope.currentItem.overrrideComplex = false;
    $scope.editing = false;
    $scope.editingItem = false;
    $scope.errors = [];

  };

  $scope.cancelDialog = function(currentItem){
    var backupitem = $scope.itemBackupData;
    delete backupitem.oldItem;
    $scope.currentItem = $scope.decryptItem(backupitem);
    $scope.editing = false;
    $scope.editingItem = false;
    $scope.errors = [];
    $scope.currentItem.overrrideComplex = false;
    currentItem.label = backupitem.label;
  };

  $scope.generatePW = function () {
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

  $scope.parseQR = function(qrData){
    //console.log(qrData);
    var re = /otpauth:\/\/(totp|hotp)\/(.*)\?(secret|issuer)=(.*)&(issuer|secret)=(.*)/, parsedQR,qrInfo;
    $scope.QRCode.imgData = qrData.image;
    parsedQR = (qrData.qrData.match(re));
    qrInfo = {
      type: parsedQR[1],
      label: decodeURIComponent(parsedQR[2]),
      qrCode: qrData.image
    };
    qrInfo[parsedQR[3]] = parsedQR[4];
    qrInfo[parsedQR[5]] = parsedQR[6];
    $scope.currentItem.otpsecret = qrInfo;
  };

  $scope.usePw = function () {
    $scope.currentItem.password = $scope.generatedPW;
    $scope.currentItem.passwordConfirm = $scope.generatedPW;
  };

  $scope.saveItem = function (item) {
    $scope.errors = [];
    var saveThis = angular.copy(item), unEncryptedItem = item, encryptedFields = ['account', 'email', 'password', 'description'], i;
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
    if ($scope.requiredPWStrength > $scope.currentPWInfo.entropy && !$scope.currentItem.overrrideComplex || ($scope.requiredPWStrength && item.password==='')) {
      $scope.errors.push("Minimal password score not met");
    }
    if($scope.pwOnLoad === unEncryptedItem.password){
      if(saveThis.expire_time <= $scope.today && saveThis.expire_time > 0){
        $scope.errors.push("Password is expired, please change it.");
      }
    } else{
      if($scope.renewal_period > 0){
        var itemExpireDate = $scope.currentItem.expire_time * 1,days;
        if (itemExpireDate !== 0 && $scope.renewal_period === '0') {
          if (itemExpireDate < $scope.today && $scope.editing) {
            days = 86400000 * $scope.renewal_period;
            saveThis.expire_time = $scope.today + days;
          }
        }
      }
    }

    if ($scope.errors.length === 0) {
      delete saveThis.passwordConfirm;
      if (saveThis.id) {
        ItemService.update(saveThis).success(function (data) {
          if (data.success) {
            $scope.errors = [];
            unEncryptedItem.expire_time = data.success.expire_time;
            $scope.$parent.currentItem = data.success;
            $scope.closeDialog();
          }
        });
      } else {
        ItemService.create(saveThis).success(function (data) {
          $scope.closeDialog();
          saveThis.id = data.id;
          $scope.items.push(saveThis);
        });
      }
    }
  };
});

app.controller('settingsCtrl', function ($scope,$sce,settingsService,shareService) {
  $scope.settings = {
    PSC: {
      minStrength: 40,
      weakItemList: []
    }
  };
  $scope.shareSettingsLoaded = false;

  var http = location.protocol, slashes = http.concat("//"), host = slashes.concat(window.location.hostname), complete = host + location.pathname;
  $scope.bookmarklet = $sce.trustAsHtml("<a class=\"button\" href=\"javascript:(function(){var a=window,b=document,c=encodeURIComponent,e=c(document.title),d=a.open('" + complete + "add?url='+c(b.location)+'&title='+e,'bkmk_popup','left='+((a.screenX||a.screenLeft)+10)+',top='+((a.screenY||a.screenTop)+10)+',height=465px,width=375px,resizable=0,alwaysRaised=1');a.setTimeout(function(){d.focus()},300);})();\">Save in passman</a>");



  $scope.checkPasswords = function () {
    $scope.settings.PSC.weakItemList = [];
    var i, pwd, tmp;
    for (i = 0; i < $scope.items.length; i++) {
      tmp = angular.copy($scope.items[i]);
      console.log('Checking ',tmp.label);
        if(tmp.password){
          try{
            pwd = zxcvbn($scope.decryptThis(tmp.password));
            if (pwd.entropy < $scope.settings.PSC.minStrength) {
              console.log(pwd);
              tmp.score = pwd.entropy;
              tmp.password = pwd.password;
              tmp.crack_time_display = pwd.crack_time_display;
              tmp.originalItem = $scope.items[i];
              if (tmp.password !== '') {
                $scope.settings.PSC.weakItemList.push(tmp);
              }
            }
          }  catch (e){
          console.log('Error ',e)
          }
       }
    }
  };



  $scope.renewShareKeys = function(){
    var keypair = shareService.generateShareKeys();
    $scope.userSettings.settings.sharing.shareKeys = keypair;
  };

  $scope.sGoToEditItem = function(item){
    $scope.showItem(item.originalItem);
    $scope.editItem(item.originalItem);
    $('#settingsDialog').dialog('close');
  };


  $scope.$watch("userSettings",function(newVal){
    if(!newVal){
      return;
    }
    if(!$scope.shareSettingsLoaded){
      $scope.shareSettingsLoaded = true;
    } else {
      console.log($scope.userSettings)
      settingsService.saveSettings($scope.userSettings);
      /** Settings have changed, if key size changed, generate new key pairs?? */
    }
  },true);

});
app.controller('exportCtrl', function($scope){
  $scope.exportItemAs = function(type){
    console.log(type);

    var exportAsCSV,exportTags=[],exportAsJson,exportAsXML;
    /*
     First check if we have tags
     */
    angular.forEach($scope.selectedExportTags, function(tag){
      exportTags.push(tag.text);
    });
    exportAsCSV = function(){
      var items,exportArr = [$scope.selectedExportFields];
      items = angular.copy($scope.items);
      angular.forEach(items,function(item){
        var item = $scope.decryptItem(item);
        var exportItem = [];
        angular.forEach($scope.selectedExportFields,function(selectedField){
          var lowerCase = selectedField.toLowerCase();
          var value = item[lowerCase];
          exportItem.push(value.replace(/<\/?[^>]+(>|$)/g, "").replace(/(\r\n|\n|\r)/gm," "));
        });
        if($scope.selectedExportTags.length === 0){
          exportArr.push(exportItem);
        } else {
          var foundTag = false;
          angular.forEach(item.tags,function(itemTag){
            if(exportTags.indexOf(itemTag.text) > -1 && foundTag === false){
              exportArr.push(exportItem);
              foundTag = true;
            };
          });
        }
      });
      console.log(exportArr);
      var content = exportArr;
      var finalVal = '';

      for (var i = 0; i < content.length; i++) {
        var value = content[i];

        for (var j = 0; j < value.length; j++) {
          var innerValue =  value[j]===null?'':value[j].toString();
          var result = innerValue.replace(/"/g, '""');
          if (result.search(/("|,|\n)/g) >= 0)
            result = '"' + result + '"';
          if (j > 0)
            finalVal += ',';
          finalVal += result;
        }

        finalVal += '\n';
      }
      var encodedUri = encodeURI("data:text/csv;charset=utf-8,"+finalVal);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", 'passman_items.csv');
      link.click();
    };

    exportAsJson = function(returnData){
      returnData = false || returnData;
      var items,exportArr = [];
      items = angular.copy($scope.items);
      angular.forEach(items,function(item){
        var item = $scope.decryptItem(item);
        var exportItem = {};

        angular.forEach($scope.selectedExportFields,function(selectedField){
          var lowerCase = selectedField.prop;
          var value = item[lowerCase];
          if(lowerCase ==='customFields'){
            exportItem.customFields = [];
            for(var i=0; i < item.customFields.length; i++){
              delete item.customFields[i].id;
              delete item.customFields[i].clicktoshow;
              delete item.customFields[i].item_id;
              delete item.customFields[i].user_id;
              exportItem.customFields.push(item.customFields[i])
            }
          }
          if(lowerCase === 'tags'){
            exportItem.tags = [];
            for(var i=0; i < item.tags.length; i++){
              exportItem.tags[i] = {text: item.tags[i].text };
            }
          }
          if(typeof value === "string"){
            value = value.replace(/<\/?[^>]+(>|$)/g, "").replace(/(\r\n|\n|\r)/gm," ");
            exportItem[lowerCase] = value;
          }
        });
        if($scope.selectedExportTags.length === 0){
          exportArr.push(exportItem);
        } else {
          var foundTag = false;
          angular.forEach(item.tags,function(itemTag){
            if(exportTags.indexOf(itemTag.text) > -1 && foundTag === false){
              exportArr.push(exportItem);
              foundTag = true;
            };
          });
        }
      });
      console.log(exportArr);
      if(!returnData) {
        var encodedUri = encodeURI("text/json;charset=utf-8,"+ JSON.stringify(exportArr));
        var link = document.createElement("a");
        link.setAttribute("href", 'data:'+encodedUri);
        link.setAttribute("download", 'passman_items.json');
        link.click();
      } else {
        return exportArr;
      }
    };

    exportAsXML =function() {
      var o = exportAsJson(true);
      var tab = '';
      var toXml = function(v, name, ind) {
        var xml = "";
        if(typeof(v) === 'function'){
          return '';
        }
        if (v instanceof Array) {
          for (var i=0, n=v.length; i<n; i++)
            xml += ind + toXml(v[i], name, ind+"\t") + "\n";
        }
        else if (typeof(v) == "object") {
          var hasChild = false;
          xml += ind + "<" + name;
          for (var m in v) {
            if (m.charAt(0) == "@")
              xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
              hasChild = true;
          }
          xml += hasChild ? ">" : "/>";
          if (hasChild) {
            for (var m in v) {
              if (m == "#text")
                xml += v[m];
              else if (m == "#cdata")
                xml += "<![CDATA[" + v[m] + "]]>";
              else if (m.charAt(0) != "@")
                xml += toXml(v[m], m, ind+"\t");
            }
            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
          }
        }
        else {
          xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
        }
        return xml;
      }, xml="";
      for (var m in o)
        xml += toXml(o[m], m, "");
      var result =  tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
      var data = '<?xml version="1.0" encoding="utf-8"?>'+result;
      console.log(data)
      var blob = new Blob([data], {type: "text/xml"});

      saveAs(blob, "passman items.xml");
      /*
       var link = document.createElement("a");
       link.setAttribute("href", 'data:'+encodedUri);
       link.setAttribute("download", 'passman_items.json');
       link.click();*/
    };

    switch(type) {
      case "csv":
        exportAsCSV();
        break;
      case "json":
        exportAsJson();
        break;
      case "xml":
        exportAsXML();
        break;
    }
  };


  $scope.selectedExportTags = [];
  //$scope.exportFields = ['Label','Account','Email','Password','URL','Description','Custom fields'];

  $scope.exportFields = [{
    name: 'Label',
    prop: 'label',
    disabledFor: []
  },
  {
    name: 'Account',
    prop: 'account',
    disabledFor: []
  },{
    name: 'Email',
    prop: 'email',
    disabledFor: []
  },
  {
    name: 'Password',
    prop: 'password',
    disabledFor: []
  },
  {
    name: 'URL',
    prop: 'url',
    disabledFor: []
  },{
    name: 'Description',
    prop: 'description',
    disabledFor: []
  },
  {
    name: 'Custom Fields',
    prop: 'customFields',
    disabledFor: ['csv']
  },
  {
    name: 'Tags',
    prop: 'tags',
    disabledFor: ['csv']
  }];

  $scope.selectedExportFields= [$scope.exportFields[0],$scope.exportFields[1],$scope.exportFields[2],$scope.exportFields[3],$scope.exportFields[4],$scope.exportFields[5]];
  $scope.toggleExportFieldSelection = function toggleSelection(exportField) {
    var idx = $scope.selectedExportFields.indexOf(exportField);

    // is currently selected
    if (idx > -1) {
      $scope.selectedExportFields.splice(idx, 1);
    }

    // is newly selected
    else {
      $scope.selectedExportFields.push(exportField);
    }
  };
});
app.controller('importCtrl', function($scope){
  $scope.importItemAs = function(type){
    switch(type) {
      case "csv":
        exportAsCSV();
        break;
      case "json":
        exportAsJson();
        break;
      case "xml":
        exportAsXML();
        break;
    }
  }
});
app.controller('revisionCtrl', function ($scope, RevisionService,$rootScope,ItemService) {
  $scope.revisionCompareArr = [];

  $rootScope.$on('showRevisions', function (event, item) {
    RevisionService.getRevisions(item.id).success(function(data){
      $scope.revisions = data;
      var tmp = {
        user_id: item.user_id,
        revision_date:'current',
        data: item
      };
      $scope.revisions.unshift(tmp);
      $('#revisions').dialog({
        width: 450,
        title: 'Revisions of '+ item.label,
        position:['center','top+30'],
        buttons:{
          "close": function(){
            $(this).dialog('destroy');
          }
        }
      });
    });
  });
  $scope.compareSelected = function(){
    $scope.revisionCompareArr = [];
    angular.forEach($scope.revisions,function(revision){
      if(revision.selected){
        var revData = $scope.decryptItem(revision.data);
        revision.data = revData;
        $scope.revisionCompareArr.push(revision);
      }
    });
    $scope.openRevisionsDialog('600px');
  };
  $scope.showRevision = function(revision){
    $scope.revisionCompareArr = [];
    var revData = $scope.decryptItem(revision.data);
    revision.data = revData;
    $scope.revisionCompareArr.push(revision);
    $scope.openRevisionsDialog('auto');
  };

  $scope.openRevisionsDialog = function(width){
    $('#showRevisions').dialog({
      width: width,
      position:['center','top+30'],
      buttons: {
        "Close": function(){
          $(this).dialog('destroy');
        }
      }
    });
  };

  $scope.restoreRevision = function(revision,date){
    revision.data.restoredRevision = date;
    ItemService.update(revision.data).success(function(){
      OC.Notification.showTimeout(revision.data.label +' restored to the revision of '+ moment(date*1000).format("MMMM D, YYYY hh:mm"));
      $scope.revisions[0].data = revision.data;
      var old = $scope.encryptItem(angular.copy($scope.currentItem));
      var tmp = {
        user_id: old.user_id,
        revision_date:new Date().getTime()/1000,
        data: old
      };
      $scope.revisions.splice(1, 0, tmp);

      $scope.$emit('showItem',angular.copy(revision.data));
      angular.forEach($scope.items,function(item){
        if(item.id === revision.data.id){
          item.label = revision.data.label;
        }
      });
    });

  };

});
app.controller('shareCtrl', function ($scope, $http, settingsService,$timeout,$rootScope,$location, shareService) {
  $scope.shareSettings = {allowShareLink: false, shareWith: []};
  $scope.loadUserAndGroups = function ($query) {
    /* Enter the url where we get the search results for $query
     * As example i entered apps/passman/api/v1/sharing/search?k=
     */
    return $http.get(OC.generateUrl('apps/passman/api/v1/sharing/search?k=' + $query));
  };

  $scope.createShareUrl = function () {
    if (!$scope.shareSettings.allowShareLink) {
      $scope.shareSettings.allowShareLink = true;
    }
    if ($scope.shareSettings.allowShareLink === true) {
      /**
       *Share url generation here
       */
      $scope.shareSettings.shareUrl = generatePassword(24);
    }
  };
   /*
   * The function used for sharing
   */
  var shareItem = function (rawItem) {

    var item = angular.copy(rawItem), encryptedFields = ['account', 'email', 'password', 'description'], i;
    if (!item.decrypted) {
      for (i = 0; i < encryptedFields.length; i++) {
        if (item[encryptedFields[i]]) {
          item[encryptedFields[i]] = $scope.decryptThis(item[encryptedFields[i]]);
        }
      }
      for (i = 0; i < item.customFields.length; i++) {
        item.customFields[i].label = $scope.decryptThis(item.customFields[i].label);
        item.customFields[i].value = $scope.decryptThis(item.customFields[i].value);
      }
      for (i = 0; i < item.files.length; i++) {
        item.files[i].filename = $scope.decryptThis(item.files[i].filename);
        item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
      }
    }
    /*
     * item now contain a unencrypted item (= password)
     */
    console.log('Share this item:', item);
    $scope.sharingItem = item;
    /**
     *Show the sharing dialog
     */
    $('#shareDialog').dialog({
      title: 'Share ' + item.label,
      close: function () {
        $scope.sharingItem = {allowShareLink: false};
        $scope.shareSettings = {};
      },
      buttons: {
        "Share": function () {
          $scope.createSharedItem();
        }
      }
    });

    if ($location.protocol() === 'http') {
      $('#shareDialog').dialog('close');
      $('<div>Sharing over http might be insecure <a href="" target="_blank" class="link">[Read more]</a></div>').dialog({
        modal: true,
        width: 315,
        buttons: {
          "close": function (event, ui) {
            $(this).dialog('destroy');
            $('#shareDialog').dialog('open');
          }
        }
      });
    }

    $scope.createSharedItem = function () {
      item = angular.copy($scope.sharingItem);
      /** Do all special encryption etc here */


      /** And then share it */
      var shareItem = {item: item};
      shareService.shareItem(shareItem).success(function (data) {
        /** Data contains the response from server */
        console.log(data);
      });
    };
  };
  /**
   *Catch the shareItem event
   */
  $rootScope.$on('shareItem', function (event, data) {
    if (event) {
      shareItem(data);
      if(!$scope.userSettings.settings.sharing.shareKeys){
        $timeout(function(){
          var keypair = shareService.generateShareKeys();
          $scope.userSettings.settings.sharing.shareKeys = keypair;
          settingsService.saveSettings($scope.userSettings);
        },500);
      }
    }
  });
});



var t = function () { };
/* Check if t function exists if not, create it to prevent errors */
if (null === t) {
  function t (app, string) {
    console.log('Fuck, l10n failed to load', 'App: ' + app, 'String: ' + string);
    return string;
  }
}
