<?php
\OCP\Util::addscript('passman', 'sjcl');
\OCP\Util::addscript('passman', 'angular.min');
\OCP\Util::addscript('passman', 'tagsInput.min');
\OCP\Util::addscript('passman', 'bower_components/ng-clip/dest/ng-clip.min');
\OCP\Util::addscript('passman', 'bower_components/zeroclipboard/dist/ZeroClipboard.min');
\OCP\Util::addscript('passman', 'bower_components/angular-local-storage/dist/angular-local-storage.min');
\OCP\Util::addscript('passman', 'bower_components/zxcvbn/zxcvbn-async'); 
\OCP\Util::addscript('passman', 'pwgen');
\OCP\Util::addscript('passman', 'app');

\OCP\Util::addStyle('passman', 'ocPassman');
\OCP\Util::addStyle('passman', 'ng-tags-input.min');

?>
<div ng-app="passman" id="app" ng-controller="appCtrl">
    <div id="app-navigation" ng-controller="navigationCtrl">
      <div id="searchTagContainer">
     <tags-input ng-model="selectedTags" removeTagSymbol="x" replace-spaces-with-dashes="false" min-length="1">
         <auto-complete source="loadTags($query)" min-length="1"></auto-complete>
     </tags-input>
     <span t="'Related Tags'"></span>
    </div>
      <ul id="tagList">
        <li class="tag" ng-click="selectTag(tag)" ng-repeat="tag in tags" ng-mouseover="mouseOver = true" ng-mouseleave="mouseOver = false">
          <span class="value">{{tag}}</span>
          <i ng-show="mouseOver" ng-click="tagSettings(tag,$event);" class="icon icon-settings button"></i>
       </li>
      </ul>
      
      <!-- TAG Settings dialog here, so it is in the scope of navigationCtrl -->
      <div id="tagSettingsDialog" style="display: none;">
        <form id="tagSettings">
          <label for="edit_folder_complexity" class="label_cpm" t="'Label:'"></label><br />
          <input type="text" ng-model="tagProps.tag_label" /><br />
          <label for="edit_folder_complexity" class="label_cpm" t="'Required password score:'"></label><br />
          <input type="text" ng-model="tagProps.min_pw_strength"><br />
          <label for="renewal_period" class="label_cpm" t="'Renewal period (days):'"></label><br />
          <input type="text" ng-model="tagProps.renewal_period">
        </form>
      </div> 
          <div class="nav-trashbin" ng-click="selectTag('is:Deleted')"><i class="icon-delete icon"></i><a href="#">Deleted passwords</a></div>
   
    <div id="app-settings">
      <div id="app-settings-header">
        <button class="settings-button" data-apps-slide-toggle="#app-settings-content"></button>
      </div>
      <div id="app-settings-content">
          <p class="settings link">Settings</p>
          <p class="import link">Import data</p>
          <div id="sessionTimeContainer" style="display: none;">
            <h2>Session time</h2>
            <em>Your session will expire in:<br /><span id="sessionExpire"></span></em>
          </div>
          <p><a class="link" ng-click="lockSession()">Lock session</a></p>
      </div>
    </div>
    </div>
    <div id="app-content" ng-controller="contentCtrl">
        <div id="topContent">
              <button class="button" id="addItem" ng-click="addItem()" t="'Add item'"></button>
              <button class="button" id="editItem" ng-click="editItem(currentItem)" t="'Edit item'" ng-show="currentItem"></button>
              <button class="button" id="deleteItem" ng-click="deleteItem(currentItem,true)" t="'Delete item'" ng-show="currentItem"></button>
        </div>
        <ul id="pwList">
          <li ng-repeat="item in items | orderBy: 'label'" ng-mouseover="mouseOver = true" ng-mouseleave="mouseOver = false; toggle.state = false" ng-click="showItem(item);" ng-dblclick="editItem(item)">
            <img ng-src="{{item.favicon}}" fallback-src="noFavIcon" style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-if="item.favicon">
            <img style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-src="{{noFavIcon}}" ng-if="!item.favicon">
            <div style="display: inline-block;" class="itemLabel">{{item.label}}</div>
            <ul class="editMenu" ng-style="{visibility: mouseOver && 'visible' || 'hidden'}">
              <li ng-click="toggle.state = !toggle.state" ng-class="{'show' : toggle.state}" off-click=' toggle.state = false' off-click-if='toggle.state'>
                <span class="icon-caret-dark more"></span>  
                <ul ng-if="!showingDeletedItems">
                  <li><a ng-click="editItem(item)" t="'Edit'"></a></li>
                  <li><a ng-click="deleteItem(item,true )" t="'Delete'"></a></li>
                  <li><a t="'Share'" ng-click="shareItem(item)"></a></li>
                </ul>
                <ul ng-if="showingDeletedItems">
                  <li><a ng-click="recoverItem(item)" t="'Restore'"></a></li>
                  <li><a ng-click="deleteItem(item,false)" t="'Destroy'"></a></li>
                </ul>
              </li>
            </ul>
            <div class="tag" ng-repeat="ttag in item.tags" ng-click="selectTag(ttag.text)"><span class="value">{{ttag.text}}</span></div> 
         </li>
        </ul> 
        <div id="infoContainer">
          <table>
            <tbody>
              <tr ng-show="currentItem.label">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                  <span t="'Label'"></span>:</td>
                <td>
                  {{currentItem.label}} <a clip-copy="currentItem.label" clip-click="copied('label')" class="link">[Copy]</a>
                </td>
              </tr>
              <tr ng-show="currentItem">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                   <span t="'Description'"></span> :</td>
                <td>
                   <div ng-bind-html="currentItem.description| decrypt | to_trusted"></div>
                  <a clip-copy="currentItem.description | decrypt" clip-click="copied('description')" class="link">[Copy]</a>
                </td>
              </tr>
              <tr ng-show="currentItem.password">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                   <span t="'Password'"></span> :</td>
                <td>
                  <span pw="currentItem.password | decrypt" toggle-text-stars></span>  <a clip-copy="currentItem.password" clip-click="copied('password')" class="link">[Copy]</a>
                </td>
              </tr>
              <tr ng-show="currentItem.expire_time!=0 && currentItem.expire_time">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                   <span t="'Expires'"></span> :</td>
                <td>
                  {{currentItem.expire_time}}
                </td>
              </tr>
              <tr ng-show="currentItem.account">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                   <span t="'Account'"></span> :</td>
                <td>
                  {{currentItem.account| decrypt}} <a clip-copy="currentItem.account| decrypt" clip-click="copied('account')" class="link">[Copy]</a>
                </td>
              </tr>
              <tr ng-show="currentItem.email">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                   <span t="'Email'"></span> :</td>
                <td>
                  {{currentItem.email| decrypt}} <a clip-copy="currentItem.email | decrypt" clip-click="copied('E-mail')" class="link">[Copy]</a>
                </td>
              </tr>
              <tr ng-show="currentItem.url">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                   <span t="'URL'"></span> :</td>
                <td>
                  {{currentItem.url}} <a clip-copy="currentItem.url" clip-click="copied('URL')" class="link">[Copy]</a>
                </td>
              </tr>
              <tr ng-show="currentItem.files.length > 0 && currentItem.files">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float:left; margin-right:.3em;">&nbsp;</span>
                   <span t="'Files & Images'"></span> :</td>
                <td>
                  <span ng-repeat="file in currentItem.files" class="link loadFile" ng-click="loadFile(file)"><span ng-class="file.icon"></span>{{file.filename | decrypt}}  ({{file.size | bytes}})
                </td>
              </tr>
              <tr ng-show="currentItem.customFields.length > 0" ng-repeat="custom in currentItem.customFields">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float:left; margin-right:.3em;">&nbsp;</span>
                  {{custom.label | decrypt}} :</td>
                <td>
                  <span ng-if="custom.clicktoshow==0">
                    {{custom.value | decrypt}} <a clip-copy="custom.value | decrypt" clip-click="copied(custom.label | decrypt)" class="link">[Copy]</a>
                  </span>
                  <span ng-if="custom.clicktoshow==1">
                   <span pw="custom.value | decrypt" toggle-text-stars></span> <a clip-copy="custom.value | decrypt" clip-click="copied(custom.label | decrypt)" class="link">[Copy]</a>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
                <table id="customFieldsTable">
                  
                </table>
        </div> <!-- end InfoContainer -->
        
        <!-- Add / edit item -->
        <div id="editAddItemDialog" style="display: none;" ng-controller="addEditItemCtrl">
           <div class="error" ng-show="errors">
             <div ng-repeat="error in errors">{{error}}</div>
           </div>
           <form method="get" name="new_item" id="editNewItem">
            <div id="item_tabs">
                <ul role="tablist">
                    <li><a href="#tabs-01" t="'Definition'"></a></li>
                    <li><a href="#tabs-02" t="'Password & Visibility'"></a></li>
                    <li><a href="#tabs-03" t="'Files & Images'" ng-show="currentItem.id"></a></li>
                    <li><a href="#tabs-04" t="'Custom fields'"></a></li>
        
                </ul>
                <div id="tabs-01">
                    <label t="'Label'"></label> 
                    <input type="text" ng-model="currentItem.label" autocomplete="off" required><br />
                    <label t="'Description'"></label>
                    <span id="desc_span">
                        <textarea rows="4" name="desc" id="desc" ng-model="currentItem.description"></textarea>
                    </span>
                    <br>
                    <label for="item_login" class="label_cpm" t="'Login (if needed)'"></label>
                    <input type="text" name="account" ng-model="currentItem.account" id="account" autocomplete="off">
                    <label for="" class="label_cpm" t="'Email'"> </label>
                    <input type="text" name="email" ng-model="currentItem.email" autocomplete="off">
                    <label for="" class="label_cpm" t="'URL'"></label>
                    <input type="text" name="url" ng-model="currentItem.url" autocomplete="off">
                    <label for="item_login" class="label_cpm" t="'Tags'"></label>
                     <tags-input ng-model="currentItem.tags" removeTagSymbol="x" min-length="1" replace-spaces-with-dashes="false">
                   <auto-complete source="loadTags($query)" min-length="1" max-results-to-show="2"></auto-complete>
               </tags-input>
                </div>
                <div id="tabs-02">
                    <div>
                       <span t="'Minimal password score:'"></span><span id="complex_attendue">{{requiredPWStrength}}</span>
                        <label class="label_cpm"><input type="checkbox" ng-model="currentItem.overrrideComplex" t="'Override required score'"></label>
                    </div>
                    <label class="label_cpm" t="'Password'"></label>
                    <input ng-show="!pwFieldVisible" type="password" name="password" ng-model="currentItem.password" autocomplete="off">
                    <span ng-show="pwFieldVisible" class="pwPreview">{{currentItem.password}} <a clip-copy="currentItem.password" clip-click="copied('password')" class="link">[Copy]</a></span>
                    <span title="Mask/Display the password" class="icon icon-toggle" ng-click="togglePWField()"></span>
                    <div ng-show="currentPWInfo">
                      <span t="'Current password score:'"></span> {{currentPWInfo.entropy}}<br />
                      <span t="'Crack time:'"></span> {{currentPWInfo.crack_time | secondstohuman}}
                    </div>
                    <label for="" class="label_cpm" t="'Confirm'"></label>
                    <input type="password" ng-model="currentItem.passwordConfirm" autocomplete="off">
                    
                    
                 <div id="pwTools">
                        <span id="custom_pw">
                            <span t="'Password Length'"></span> <input type="number" ng-model="pwSettings.length" style="width:30px"><br>
                            <input type="checkbox"  ng-model="pwSettings.upper"><label for="upper">A-Z</label> <input  ng-model="pwSettings.lower" type="checkbox" id="lower"><label for="lower" t="'a-z'"></label> 
                            <input  ng-model="pwSettings.digits" type="checkbox" id="digits"><label for="digits" t="'0-9'"></label>
                            <input type="checkbox" id="special"  ng-model="pwSettings.special"><label for="special" t="'Special'"></label><br>
                            <label for="mindigits" t="'Minimum Digit Count'"></label> <input  ng-model="pwSettings.mindigits" type="text" id="mindigits" style="width:30px"><br>
                            <input type="checkbox" id="ambig" ng-model="pwSettings.ambig"><label for="ambig" t="'Avoid Ambiguous Characters'"></label><br>
                            <input type="checkbox" ng-model="pwSettings.reqevery" id="reqevery"><label for="reqevery" t="'Require Every Character Type'"></label><br>
                        </span>
                        <button class="button" ng-click="generatePW()" t="'Generate password'"></button>
                         <button class="button"ng-show="generatedPW!=''" ng-click="usePw()" t="'Use password'"></button>
                        <div ng-show="generatedPW"><span t="'Generated password:'"></span> <br />{{generatedPW}}</div>
                        <br />
                        <b ng-show="generatedPW"><span t="'Generated password score'"></span>: {{pwInfo.entropy}}</b><br />
                        <b ng-show="generatedPW"><span t="'Crack time'"></span>: {{pwInfo.crack_time | secondstohuman}}</b>
                    </div>
                 </div>
                </form>
                <div id="tabs-03">
                  <form enctype="multipart/form-data" id="fileUploader">
                    
                    <input type="file"  fileread="uploadQueue" item="currentItem"/>
                  <h2 t="'Files'">:</h2>
                  <ul id="fileList">
                    <li ng-repeat="file in currentItem.files" class="fileListItem">{{file.filename}} ({{file.size | bytes}}) <span class="icon icon-delete" style="float:right;" ng-click="deleteFile(file)"></span></li>
                  </ul>         
                  
                </form>
                </div>
                <div id="tabs-04" >
                        <h1 t="'Add field'"></h1>
                        <table style="width: 100%;">
                          <thead>
                              <tr>
                                <td t="'Label'"></td>
                                <td t="'Value'"></td>
                                <td colspan="2" t="'Hidden?'"></td>
                              </tr>
                          </thead>
                          <tr>
                        <td><input name="customFieldName" ng-model="newCustomfield.label" type="text" placeholder="Enter field name"/></td>
                        <td><input name="customFieldValue" ng-model="newCustomfield.value" type="text" placeholder="Enter field value"/></td>
                        <td><input type="checkbox" ng-model="newCustomfield.clicktoshow" /></td>
                        <td><span ng-click="addCField(newCustomfield)" class="icon-add icon"></span></td>
                        </tr>
                        </table>
                        <hr class="blue">
                        <h1>Existing fields</h1>
                        <table style="width: 100%;" ng-show="currentItem.customFields.length > 0">
                          <thead>
                              <tr>
                                <td t="'Label'"></td>
                                <td t="'Value'"></td>
                                <td colspan="2" t="'Hidden?'"></td>
                              </tr>
                          </thead>
                          <tr ng-repeat="custom in currentItem.customFields">
                            
                            <td valign="top" class="td_title">
                              <span click-for-input value="custom.label"></span></td>
                            <td>
                               <span click-for-input value="custom.value"></span>
                            </td>
                            <td>
                              <input type="checkbox" ng-checked="custom.clicktoshow==1" ng-model="custom.clicktoshow" />
                            </td>
                            <td>
                              <i class="icon icon-delete" ng-click="removeCField(custom)"></i>
                            </td>
                          </tr>
                        </table>
                </div>
            <button class="button cancel" ng-click="closeDialog()" t="'Cancel'"></button>
            <button class="button save" ng-click="saveItem(currentItem)" ng-disabled="!new_item.$valid" t="'Save'"></button>
            </div>
        </div><!-- end add / edit item -->
          <div id="dialog_files" style="display: none;">
              <img id="fileImg" /><br />
              <span id="downloadImage"></span>
          </div>
        </div> <!-- End contentCtrl --> 
    </div> <!-- End appCtrl -->
  <div id="encryptionKeyDialog" style="display: none;">
  <p>Enter your encryption key. If this if the first time you use Passman, this key will be used for encryption your passwords</p>
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
