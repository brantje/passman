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
     <tags-input ng-model="selectedTags" removeTagSymbol="x" replace-spaces-with-dashes="false">
         <auto-complete source="loadTags($query)" min-length="1"></auto-complete>
     </tags-input>
     <span>Related Tags</span>
    </div>
      <ul id="tagList">
        <li class="tag" ng-click="selectTag(tag)" ng-repeat="tag in tags | orderBy:'tag'" ng-mouseover="mouseOver = true" ng-mouseleave="mouseOver = false"><span class="value">{{tag}}</span><i ng-show="mouseOver" class="icon icon-settings button"></i></li>
      </ul>
    </div>
    <div id="app-content" ng-controller="contentCtrl">
        <div id="topContent">
              <button class="button" id="addItem" ng-click="addItem()">Add item</button>
              <button class="button" id="editItem">Edit item</button>
              <button class="button" id="deleteItem">Delete item</button>
              <!--button class="button" id="restoreItem">Restore item</button-->
        </div>
        <ul id="pwList">
          <li ng-repeat="item in items | orderBy: 'item.label'" ng-mouseover="mouseOver = true" ng-mouseleave="mouseOver = false" ng-click="showItem(item)" ng-dblclick="editItem(item)">
          <img ng-src="{{item.favicon}}" style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-if="item.favicon">
          <img style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-src="{{noFavIcon}}" ng-if="!item.favicon">
          <div style="display: inline-block;" class="itemLabel">{{item.label}}</div>
          <span class="rowTools" ng-show="mouseOver"> <div><i class="icon-rename icon" title="Edit" ng-click="editItem(item)"></i></div></span>
          <i class="icon-delete icon" ng-style="{visibility: mouseOver && 'visible' || 'hidden'}" title="Delete" style="float: right;" ng-click="delete(item)"></i>
          <div class="tag" ng-repeat="ttag in item.tags" ng-click="selectTag(ttag.text)"><span class="value">{{ttag.text}}</span></div> 
          
          
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
              <tr ng-show="currentItem.description!=''">
                <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>
                  Description :</td>
                <td>
                  <pre style="display: inline-block;">{{currentItem.description}}</pre>
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
        </div> <!-- end InfoContainer -->
        
        <!-- Add / edit item -->
        <div id="editAddItemDialog" style="display: none;" ng-controller="addEditItemCtrl">
            {{errors}}
           <form method="get" name="new_item" id="editNewItem">
            <div id="item_tabs">
                <ul role="tablist">
                    <li><a href="#tabs-01">Definition</a></li>
                    <li><a href="#tabs-02">Password &amp; Visibility</a></li>
                    <li><a href="#tabs-03">Files &amp; Images</a></li>
                    <li><a href="#tabs-04">Custom fields</a></li>
        
                </ul>
                <div id="tabs-01">
                    <label>Label : </label> 
                    <input type="text" ng-model="currentItem.label" autocomplete="off" required><br />
                    <label>Description : </label>
                    <span id="desc_span">
                        <textarea rows="4" name="desc" id="desc" ng-model="currentItem.description"></textarea>
                    </span>
                    <br>
                    <label for="item_login" class="label_cpm">Login (if needed) : </label>
                    <input type="text" name="account" ng-model="currentItem.account" id="account" autocomplete="off">
                    <label for="" class="label_cpm">Email : </label>
                    <input type="text" name="email" ng-model="currentItem.email" autocomplete="off">
                    <label for="" class="label_cpm">URL : </label>
                    <input type="text" name="url" ng-model="currentItem.url" autocomplete="off">
                    <label for="item_login" class="label_cpm">Tags : </label>
                     <tags-input ng-model="currentItem.tags" removeTagSymbol="x" replace-spaces-with-dashes="false">
                   <auto-complete source="loadTags($query)" min-length="1" max-results-to-show="2"></auto-complete>
               </tags-input>
                </div>
                <div id="tabs-02">
                    <div>
                        <label>Minimal password score</label>
                        <span id="complex_attendue">{{requiredPWStrength}}</span><label style="display:inline-block;" class="label_cpm"><input type="checkbox" ng-model="currentItem.overrrideComplex">Override required score</label>
                    </div>
                    <label class="label_cpm">Password :</label>
                    <input ng-show="!pwFieldVisible" type="password" name="password" ng-model="currentItem.password" autocomplete="off">
                    <span ng-show="pwFieldVisible" class="pwPreview">{{currentItem.password}} <a clip-copy="currentItem.password" clip-click="copied('password')" class="link">[Copy]</a></span>
                    <span title="Mask/Display the password" class="icon icon-toggle" ng-click="togglePWField()"></span>
                    <div ng-show="currentPWInfo">Current password score: {{currentPWInfo.entropy}}</div>
                    <label for="" class="label_cpm">Confirm :</label>
                    <input type="password" ng-model="currentItem.passwordConfirm" autocomplete="off">
                    
                    
                 <div id="pwTools">
                        <span id="custom_pw">
                            Password Length <input type="number" ng-model="pwSettings.length" style="width:30px"><br>
                            <input type="checkbox"  ng-model="pwSettings.upper"><label for="upper">A-Z</label> <input  ng-model="pwSettings.lower" type="checkbox" id="lower"><label for="lower">a-z</label> 
                            <input  ng-model="pwSettings.digits" type="checkbox" id="digits"><label for="digits">0-9</label>
                            <input type="checkbox" id="special"  ng-model="pwSettings.special"><label for="special">Special</label><br>
                            <label for="mindigits">Minimum Digit Count</label> <input  ng-model="pwSettings.mindigits" type="text" id="mindigits" style="width:30px"><br>
                            <input type="checkbox" id="ambig" ng-model="pwSettings.ambig"><label for="ambig">Avoid Ambiguous Characters</label><br>
                            <input type="checkbox" ng-model="pwSettings.reqevery" id="reqevery"><label for="reqevery">Require Every Character Type</label><br>
                        </span>
                        <button class="button" ng-click="generatePW()">Generate password</button>
                         <button class="button"ng-show="generatedPW!=''" ng-click="usePw()">Use password</button>
                        <div ng-show="generatedPW">Generated password: <br />{{generatedPW}}</div>
                        <br />
                        <b ng-show="generatedPW">Generated password score: {{pwInfo.entropy}}</b>
                    </div>
                 </div>
                </form>
                <div id="tabs-03">
                  <form enctype="multipart/form-data" id="fileUploader">
                    <input name="uploadFile" type="file" id="fileInput" multiple="true"/>
                  <h2>Files:</h2>
                  <ul id="fileList">
                    <li ng-repeat="file in currentItem.files" class="fileListItem">{{file.filename}} ({{file.size}}) <span class="icon icon-delete" style="float:right;" ng-click="deleteFile(file)"></span></li>
                  </ul>         
                  
                </form>
                </div>
                <div id="tabs-04" >
                        <h1>Add field</h1>
                        <table style="width: 100%;" cellpadding="5">
                          <tr>
                            <td>
                              <input name="customFieldName" ng-model="newCustomfield.label" type="text" placeholder="Enter field name"/>
                            </td>
                            <td>
                              <input name="customFieldValue" ng-model="newCustomfield.value" type="text" placeholder="Enter field value"/>
                            </td>
                            <td class="addCFieldRow"><span ng-click="addCField(newCustomfield)" class="icon-add icon"></span></td>
                          </tr>
                        </table>
                        <h1>Existing fields</h1>
                        <table style="width: 100%;">
                          <tr ng-repeat="custom in currentItem.customFields">
                      <td valign="top" class="td_title">
                        {{custom.label}} :</td>
                      <td>
                        {{custom.value}}
                      </td>
                    </tr>
                        </table>
                </div>
            <button class="button cancel" ng-click="closeDialog()">Cancel</button>
            <button class="button save" ng-click="saveItem(currentItem)" ng-disabled="!new_item.$valid">Save</button>
            </div>
        </div><!-- end add / edit item -->
        
        </div> <!-- End contentCtrl --> 
    </div> <!-- End appCtrl -->
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
