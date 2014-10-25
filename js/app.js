var app = angular.module('passman', ['ngResource','ngTagsInput','ngClipboard','LocalStorageModule']).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
}]);
app.factory('ItemService', ['$http', function($http) {
   return{
    getItems : function(tags) {
        return $http({
            url: OC.generateUrl('apps/passman/api/v1/getbytags?tags='+ tags.join(',')),
            method: 'GET',
        })
    }
 }
}]);

app.controller('appCtrl', function($scope,ItemService,localStorageService) {
	console.log('appCtrl');
 	$scope.items = [];
 	$scope.tags = [];
 	$scope.selectedTags = []
 	$scope.noFavIcon = OC.imagePath('passman','lock.svg');
 	$scope.loadItems = function(tags){
	 	ItemService.getItems(tags).success(function(data){
	 		$scope.tags = [];
	 		$scope.items=data.items;
	 		for(var i=0;i < data.items.length;i++){
	 			var tags = data.items[i].tags;
	 			if(tags){
		 			for(t=0; t < tags.length; t++){
		 				var tag = tags[t].trim();
		 				if($scope.tags.indexOf(tag)===-1){
		 					$scope.tags.push(tag);
		 				}
		 			}
	 			}
	 		}
	   	});
   }
   //$scope.loadItems([]);
   
   $scope.$watch("selectedTags",function(v){
   	if(!$scope.encryptionKey){
   		return;
   	}
   	
   	var tmp = [];
   	for (name in v) {
   		tmp.push(v[name].text)
   	}
   	$scope.loadItems(tmp);
   },true);
   
   	$scope.selectTag = function(tag){
		$scope.selectedTags.push({text: tag})
	}
	

	$scope.decryptThis = function(encryptedData){
		var decryptedString = window.atob(encryptedData);
		try{
			decryptedString = sjcl.decrypt($scope.encryptionKey, decryptedString);
		} catch(e){
			console.log('Invalid key!');
			decryptedString = '';
		}
		
		return decryptedString;
	};

	$scope.encryptThis = function(str){
		var encryptedString = str;
		try{
			encryptedString = sjcl.encrypt($scope.encryptionKey, encryptedString)
		} catch(e){
			console.log('Invalid key!');
			encryptedString = '';
		}
		encryptedString = window.btoa(encryptedString);
		return encryptedString;
	};
	
	$scope.setEncryptionKey = function(key){
		$scope.encryptionKey = key;
	}
	
	$scope.showEncryptionKeyDialog = function(){
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
						localStorageService.set('encryptionKey', $('#ecKey').val());
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
	}
	
	/**
	 *Onload -> Check if localstorage has key if not show dialog 
	 */
	if(!localStorageService.get('encryptionKey')){
		$scope.showEncryptionKeyDialog();
	} else {
		$scope.setEncryptionKey(localStorageService.get('encryptionKey'));
		$scope.loadItems([]);
	}
	
});

app.controller('navigationCtrl', function($scope) {
	console.log('navigationCtrl');
   
});

app.controller('contentCtrl', function($scope,$sce) {
  console.log('contentCtrl');
  
  $scope.showItem = function(item){
  	var encryptedFields = ['account','email','password','description'];
  	for(var i=0;i< encryptedFields.length;i++){
  		item[encryptedFields[i]] = $scope.decryptThis(item[encryptedFields[i]]);
  	}
  	for(var i=0;i < item.customFields.length;i++){
  		item.customFields[i].label = $scope.decryptThis(item.customFields[i].label);
  		item.customFields[i].value = $scope.decryptThis(item.customFields[i].value);
  	}
  	for(var i=0;i < item.files.length;i++){
  		item.files[i].filename = $scope.decryptThis(item.files[i].filename);
  		item.files[i].size = OC.Util.humanFileSize(item.files[i].size);
  		item.files[i].icon = (item.files[i].type.indexOf('image') !== -1) ? 'filetype-image' : 'filetype-file';
  	}
  	item.description = $sce.trustAsHtml(item.description);
  	$scope.currentItem = item;
  }
  
  $scope.copied = function(what){
  	OC.Notification.showTimeout('Copied '+ what.toLowerCase() +' to clipboard');
  }
});


app.directive('togglepw', ['$compile',
    function($compile,$tooltip) {
        return {
            restrict: 'A',
            transclude: false,
            scope:{
            	pw: '='	
            },
            link: function(scope, element, attrs,ngModelCtrl) {
            		scope.curPW = '******';
            		scope.hSText = 'Show';
            		var el = angular.element('<span>{{curPW}} <span ng-click="togglePW()" class="link">[{{hSText}} password]</span></span>');
            		element.html($compile(el)(scope));
            		scope.pwVisible = false;
            		
            		scope.togglePW = function(){
            			if(!scope.pwVisible){
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
            	
} }]);


/***
 *Extend the OC Notification
 */
var notificationTimer;
OC.Notification.showTimeout = function(str,timeout){
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