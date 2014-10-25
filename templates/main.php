<?php
\OCP\Util::addscript('passman', 'sjcl');
\OCP\Util::addscript('passman', 'angular.min');
\OCP\Util::addscript('passman', 'tagsInput.min');
\OCP\Util::addscript('passman', 'bower_components/ng-clip/dest/ng-clip.min');
\OCP\Util::addscript('passman', 'bower_components/zeroclipboard/dist/ZeroClipboard.min');
\OCP\Util::addscript('passman', 'bower_components/angular-local-storage/dist/angular-local-storage.min');
\OCP\Util::addscript('passman', 'app');

\OCP\Util::addStyle('passman', 'ocPassman');
\OCP\Util::addStyle('passman', 'ng-tags-input.min');


?>
<div ng-app="passman" id="app" ng-controller="appCtrl">
  	<div id="app-navigation" ng-controller="navigationCtrl">
  		<div id="searchTagContainer">
	 	 <tags-input ng-model="selectedTags" removeTagSymbol="x">
	 	 	  
	 	 </tags-input>
		 <span>Related Tags</span>
	 	</div>
  		<ul id="tagList">
  			<li class="tag" ng-click="selectTag(tag)" ng-repeat="tag in tags | orderBy:'tag'" ng-mouseover="mouseOver = true" ng-mouseleave="mouseOver = false"><span class="value">{{tag}}</span><i ng-show="mouseOver" class="icon icon-settings button"></i></li>
  		</ul>
  	</div>
    <div id="app-content" ng-controller="contentCtrl">
				<div id="topContent">
							<button class="button" id="addItem">Add item</button>
							<button class="button" id="editItem">Edit item</button>
							<button class="button" id="deleteItem">Delete item</button>
							<!--button class="button" id="restoreItem">Restore item</button-->
				</div>
				<ul id="pwList">
					<li ng-repeat="item in items | orderBy: 'item.label'" ng-mouseover="mouseOver = true" ng-mouseleave="mouseOver = false" ng-click="showItem(item)">
					<img ng-src="{{item.favicon}}" style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-if="item.favicon">
					<img style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-src="{{noFavIcon}}" ng-if="!item.favicon">
					<div style="display: inline-block;" class="itemLabel">{{item.label}}</div>
					<span class="rowTools" ng-show="mouseOver"> <div><i class="icon-rename icon" title="Edit" ng-click="edit(item)"></i></div></span>
					<i class="icon-delete icon" ng-style="{visibility: mouseOver && 'visible' || 'hidden'}" title="Delete" style="float: right;" ng-click="delete(item)"></i>
					<div class="tag" ng-repeat="ttag in item.tags" ng-click="selectTag(ttag)"><span class="value">{{ttag}}</span></div> 										
					</li>
				</ul> 
				<div id="infoContainer">
					<table>
					  <tbody>
					    <tr ng-show="currentItem.label">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	Label :</td>
					      <td>
					        {{currentItem.label}} <a clip-copy="currentItem.label" clip-click="copied('label')" class="link">[Copy]</a>
					      </td>
					    </tr>
					    <tr ng-show="currentItem.description">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	Description :</td>
					      <td >
					        <div ng-bind-html="currentItem.description || unsafe"></div>
					        <a clip-copy="currentItem.description" clip-click="copied('description')" class="link">[Copy]</a>
					      </td>
					    </tr>
					    <tr ng-show="currentItem.password">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	Password :</td>
					      <td>
					        <span pw="currentItem.password" togglepw></span>  <a clip-copy="currentItem.password" clip-click="copied('password')" class="link">[Copy]</a>
					      </td>
					    </tr>
					    <tr ng-show="currentItem.expire_time!=0 && currentItem.expire_time">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	Expires :</td>
					      <td>
					      	{{currentItem.expire_time}}
					      </td>
					    </tr>
					    <tr ng-show="currentItem.account">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	Account :</td>
					      <td>
					        {{currentItem.account}} <a clip-copy="currentItem.account" clip-click="copied('account')" class="link">[Copy]</a>
					      </td>
					    </tr>
					    <tr ng-show="currentItem.email">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	Email :</td>
					      <td>
					        {{currentItem.email}} <a clip-copy="currentItem.email" clip-click="copied('E-mail')" class="link">[Copy]</a>
					      </td>
					    </tr>
					    <tr ng-show="currentItem.url">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
					      	URL :</td>
					      <td>
					        {{currentItem.url}} <a clip-copy="currentItem.url" clip-click="copied('URL')" class="link">[Copy]</a>
					      </td>
					    </tr>
					    <tr ng-show="currentItem.files.length > 0 && currentItem.files">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float:left; margin-right:.3em;">&nbsp;</span>
					      	Files &amp; Images :</td>
					      <td>
					        <span ng-repeat="file in currentItem.files" class="link loadFile" ng-click="loadFile(file)"><span ng-class="file.icon"></span>{{file.filename}}  {{file.size}}
					      </td>
					    </tr>
					    <tr ng-show="currentItem.customFields.length > 0" ng-repeat="custom in currentItem.customFields">
					      <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float:left; margin-right:.3em;">&nbsp;</span>
					      	{{custom.label}} :</td>
					      <td>
					        {{custom.value}} <a clip-copy="custom.value" clip-click="copied(custom.label)" class="link">[Copy]</a>
					      </td>
					    </tr>
					  </tbody>
					</table>
                <table id="customFieldsTable">
                	
                </table>
				</div>
    	  </div>
    </div>
	<div id="encryptionKeyDialog" style="display: none;">
	<p>Enter your encryption key.<br />If this if the first time you use Passman, this key will be used for encryption your passwords</p>
	<input type="password" id="ecKey" style="width: 150px;" /><br />
	<input type="checkbox" id="ecRemember" name="ecRemember"/><label for="ecRemember">Remember this key</label> 
	<!--select id="rememberTime">
		<option value="15">15 Minutes</option>
		<option value="15">30 Minutes</option>
		<option value="60">60 Minutes</option>
		<option value="180">3 Hours</option>
		<option value="480">8 Hours</option>
		<option value="1440">1 Day</option>
		<option value="10080">7 Days</option>
		<option value="43200">30 Days</option>
	</select-->
	
	</div>
</div>
