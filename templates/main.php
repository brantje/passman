<?php
\OCP\Util::addscript('passman', 'sjcl');
\OCP\Util::addscript('passman', 'angular.min');
\OCP\Util::addscript('passman', 'tagsInput.min');
\OCP\Util::addscript('passman', 'bower_components/ng-clip/dest/ng-clip.min');
\OCP\Util::addscript('passman', 'bower_components/zeroclipboard/dist/ZeroClipboard.min');
\OCP\Util::addscript('passman', 'jstorage');
\OCP\Util::addscript('passman', 'bower_components/zxcvbn/zxcvbn-async');
\OCP\Util::addscript('passman', 'pwgen');

\OCP\Util::addscript('passman', 'textAngular-rangy.min');
\OCP\Util::addscript('passman', 'textAngular.min');

\OCP\Util::addscript('passman', 'qrReader/llqrcode');
\OCP\Util::addscript('passman', 'sha');
\OCP\Util::addscript('passman', 'func');
\OCP\Util::addscript('passman', 'promise');
\OCP\Util::addscript('passman', 'app');
\OCP\Util::addscript('passman', 'app.service');
\OCP\Util::addscript('passman', 'app.directive');
\OCP\Util::addscript('passman', 'app.filter');
\OCP\Util::addscript('passman', 'module.fileReader');
\OCP\Util::addScript('passman', 'jsrsasign-4.7.0-all-min');



\OCP\Util::addStyle('passman', 'ocPassman');
\OCP\Util::addStyle('passman', 'textAngular');
\OCP\Util::addStyle('passman', 'ng-tags-input.min');
\OCP\Util::addStyle('passman', 'bootstrapGrid');
\OCP\Util::addStyle('passman', 'fontawsome/font-awesome');


?>

<div ng-app="passman" id="app" ng-controller="appCtrl">
  <div class="loaderContainer" hide-loaded>
    <div class="loader"></div>
    <div class="text"><?php p($l->t('Loading...')); ?></div>
  </div>
  <div id="app-navigation" ng-controller="navigationCtrl" style="display: none" show-loaded>
    <div id="searchTagContainer">
      <tags-input ng-model="selectedTags" removeTagSymbol="x" replace-spaces-with-dashes="false" min-length="1">
        <auto-complete source="loadTags($query)" min-length="1"></auto-complete>
      </tags-input>
    </div>


    <span style="margin-left: 5px; font-weight: bold;"><?php p($l->t('Related tags')); ?></span>
    <ul id="tagList">
      <li class="tag" ng-click="selectTag(tag)" ng-repeat="tag in tags" ng-mouseover="mouseOver = true" ng-if="arrayObjectIndexOf(selectedTags,tag) === -1"
          ng-mouseleave="mouseOver = false">
        <span class="value">{{tag}}</span>
        <i ng-show="mouseOver" ng-click="tagSettings(tag,$event);" class="icon icon-settings button"></i>
      </li>
    </ul>

    <!-- TAG Settings dialog here, so it is in the scope of navigationCtrl -->
    <div id="tagSettingsDialog" style="display: none;">
      <form id="tagSettings">
        <label for="edit_folder_complexity" class="label_cpm"><?php p($l->t('Label')); ?>:</label><br/>
        <input type="text" ng-model="tagProps.tag_label"/><br/>
        <label for="edit_folder_complexity" class="label_cpm"><?php p($l->t('Required password score')); ?>:</label><br/>
        <input type="text" ng-model="tagProps.min_pw_strength"><br/>
        <label for="renewal_period" class="label_cpm"><?php p($l->t('Renewal period (days)')); ?>:</label><br/>
        <input type="text" ng-model="tagProps.renewal_period">
      </form>
    </div>
    <div class="nav-trashbin" ng-click="selectTag('is:Deleted')"><i class="icon-delete icon"></i><a
          href="#"><?php p($l->t('Deleted passwords')); ?></a></div>

    <div id="app-settings">
      <div id="app-settings-header">
        <button class="settings-button" data-apps-slide-toggle="#app-settings-content"></button>
      </div>
      <div id="app-settings-content">
        <p class="link" ng-click="showSettings();"><?php p($l->t('Settings')); ?></p>

        <div id="sessionTimeContainer" ng-show="sessionExpireTime!=0">
          <h2><?php p($l->t('Session time')); ?></h2>
          <em><?php p($l->t('Your session will expire in')); ?>:<br/> <span ng-bind="sessionExpireTime"></span></em>
        </div>
        <p><a class="link" ng-click="lockSession()"><?php p($l->t('Lock session')); ?></a></p>
      </div>
    </div>
  </div>
  <div id="app-content" ng-controller="contentCtrl" style="display: none" show-loaded>
    <div class="content" ng-show="!editingItem">
      <div id="topContent" >
        <button class="button" id="addItem" ng-click="addItem()"><?php p($l->t('Add item')); ?></button>
        <span><input type="text" id="itemSearch" ng-model="itemFilter.label"
               class="pull-right" placeholder="Search..." clear-input />
      </div>

      <ul id="pwList">
        <li ng-repeat="item in filteredItems = (items | orderBy: 'label' | filter: itemFilter)"
            ng-mouseleave="toggle.state = false" ng-click="showItem(item);" ng-dblclick="editItem(item)"
            ng-class="{'row-active': item.id === currentItem.id}" scroll-to="item.id === selectThisItem">
          <!-- if no image proxy -->
          <img ng-src="{{item.favicon}}" fallback-src="noFavIcon"
               style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;"
               ng-if="item.favicon && !userSettings.settings.useImageProxy && !userSettings.settings.noFavIcons">
          <img style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;"
               ng-src="{{noFavIcon}}" ng-if="!item.favicon && !userSettings.settings.useImageProxy  && !userSettings.settings.noFavIcons">
          <!-- end if -->
          <!-- If image proxy === true -->
          <img image-proxy image="item.favicon" fallback="noFavIcon"
               style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;"
               ng-if="userSettings.settings.useImageProxy  && !userSettings.settings.noFavIcons">
          <img ng-if="userSettings.settings.noFavIcons"  style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;" ng-src="{{noFavIcon}}">
          <!--- // end  if-->
          <div style="display: inline-block;" class="itemLabel" ng-class="{ 'expired': item.expire_time <= today && item.expire_time > 0 }">{{item.label}}</div>
          <i class="icon-rename icon" ng-click="editItem(item)" title="Edit"></i>
          <ul class="editMenu">
            <li ng-click="toggle.state = !toggle.state" ng-class="{'show' : toggle.state}"
                off-click=' toggle.state = false'
                off-click-if='toggle.state'
                >
              <span class="icon-caret-dark more"></span>
              <ul ng-if="!showingDeletedItems">
                <li><a ng-click="editItem(item)"><?php p($l->t('Edit')); ?></a></li>
                <li><a ng-click="shareItem(item)"><?php p($l->t('Share')); ?></a></li>
                <li><a ng-click="showRevisions(item)"><?php p($l->t('Revisions')); ?></a></li>
                <li><a ng-click="deleteItem(item,true )"><?php p($l->t('Delete')); ?></a></li>
              </ul>
              <ul ng-if="showingDeletedItems">
                <li><a ng-click="recoverItem(item)"><?php p($l->t('Restore')); ?></a></li>
                <li><a ng-click="deleteItem(item,false)"><?php p($l->t('Destroy')); ?></a></li>
              </ul>
            </li>
          </ul>
          <div class="tag" ng-repeat="ttag in item.tags" ng-click="selectTag(ttag.text)"><span
                class="value">{{ttag.text}}</span></div>
        </li>
        <li ng-show="filteredItems.length === 0 && itemFilter"><div style="display: inline-block; margin-left: 10px;" class="itemLabel"><?php p($l->t('No results')); ?></div></li>
      </ul>
      <div id="infoContainer">
        <table>
          <tbody>
          <tr ng-show="currentItem.label">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Label')); ?></span>:
            </td>
            <td>
              {{currentItem.label}} <a clip-copy="currentItem.label" clip-click="copied('label')" class="link">[<?php p($l->t('Copy')); ?>]</a>
            </td>
          </tr>
          <tr ng-show="currentItem.description">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Description')); ?></span> :
            </td>
            <td>
              <div ng-bind-html="currentItem.description  | to_trusted" class="description"></div>
              <a clip-copy="currentItem.description" clip-click="copied('description')" class="link" ng-if="hasFlash">[<?php p($l->t('Copy')); ?>]</a>
            </td>
          </tr>
          <tr ng-show="currentItem.account ">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Account')); ?></span> :
            </td>
            <td>
              {{currentItem.account}} <a clip-copy="currentItem.account" clip-click="copied('account')"
                                         class="link" ng-if="hasFlash">[<?php p($l->t('Copy')); ?>]</a>
            </td>
          </tr>
          <tr ng-show="currentItem.password ">
            <td style="vertical-align: middle !important;" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Password')); ?></span> :
            </td>
            <td>
              <span pw="currentItem.password" toggle-text-stars></span> <a clip-copy="currentItem.password"
                                                                           clip-click="copied('password')"
                                                                           class="link" ng-if="hasFlash">[<?php p($l->t('Copy')); ?>]</a>
            </td>
          </tr>
          <tr ng-if="currentItem.otpsecret ">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span style="border-bottom: 1px dotted #000;" title="<?php p($l->t('One time password')); ?>"><?php p($l->t('OTP')); ?></span> :
            </td>
            <td>
              &nbsp;<span otp-generator otpdata="currentItem.otpsecret.secret"></span>
            </td>
          </tr>
          <tr ng-show="currentItem.expire_time !=0 && currentItem.expire_time">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Expires')); ?></span> :
            </td>
            <td>
              {{currentItem.expire_time | date}}
            </td>
          </tr>
          <tr ng-show="currentItem.email ">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Email')); ?></span> :
            </td>
            <td>
              {{currentItem.email}} <a clip-copy="currentItem.email" clip-click="copied('Email')" class="link">[<?php p($l->t('Copy')); ?>]</a>
            </td>
          </tr>
          <tr ng-show="currentItem.url ">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('URL')); ?></span> :
            </td>
            <td>
              {{currentItem.url}} <a clip-copy="currentItem.url" clip-click="copied('URL')" class="link">[<?php p($l->t('Copy')); ?>]</a> <a
                  make-url url="currentItem.url" class="link" target="_blank">[<?php p($l->t('Open link')); ?>]</a>
            </td>
          </tr>
		  <tr ng-show="currentItem.created ">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Created')); ?></span> :
            </td>
            <td>
              {{currentItem.created | phpTime}}
            </td>
          </tr>
		  <tr ng-show="currentItem.changed ">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float: left; margin-right: .3em;">&nbsp;</span>
              <span><?php p($l->t('Last changed')); ?></span> :
            </td>
            <td>
              {{currentItem.changed | phpTime}}
            </td>
          </tr>
          <tr ng-show="currentItem.files.length > 0 && currentItem.files">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float:left; margin-right:.3em;">&nbsp;</span>
              <span><?php p($l->t('Files & images')); ?></span> :
            </td>
            <td>
              <span ng-repeat="file in currentItem.files" class="link loadFile" ng-click="loadFile(file)"><span
                    ng-class="file.icon"></span>{{file.filename}}  ({{file.size | bytes}})</span>
            </td>
          </tr>
          <tr ng-show="currentItem.customFields.length > 0" ng-repeat="custom in currentItem.customFields">
            <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                    style="float:left; margin-right:.3em;">&nbsp;</span>
              {{custom.label}} :
            </td>
            <td>
                        <span ng-if="custom.clicktoshow==0">
                          {{custom.value}} <a clip-copy="custom.value" clip-click="copied(custom.label)"
                                              class="link">[<?php p($l->t('Copy')); ?>]</a>
                        </span>
                        <span ng-if="custom.clicktoshow==1">
                         <span pw="custom.value" toggle-text-stars></span> <a clip-copy="custom.value"
                                                                              clip-click="copied(custom.label)"
                                                                              class="link">[<?php p($l->t('Copy')); ?>]</a>
                        </span>
            </td>
          </tr>
          </tbody>
        </table>
        <table id="customFieldsTable">

        </table>
      </div><!-- end InfoContainer -->
    </div>
    <div ng-show="editingItem" class="editItem">
      <div class="row nomargin">
        <div class="tabHeader" ng-class="'tab'+tabActive" ng-init="tabActive=1">
          <div class="col-xs-2 nopadding tab1" ng-click="tabActive=1;" ng-class="{'active': tabActive==1}"><?php p($l->t('General')); ?></div>
          <div class="col-xs-2 nopadding tab2" ng-click="tabActive=2;" ng-class="{'active': tabActive==2}"><?php p($l->t('Password')); ?></div>
          <div class="col-xs-2 nopadding tab3" ng-click="tabActive=3;" ng-class="{'active': tabActive==3}" ng-show="currentItem.id"><?php p($l->t('Files')); ?></div>
          <div class="col-xs-2 nopadding tab4" ng-click="tabActive=4" ng-class="{'active': tabActive==4}"><?php p($l->t('Custom fields')); ?></div>
          <div class="col-xs-2 nopadding tab5" ng-click="tabActive=5" ng-class="{'active': tabActive==5}" tooltip="<?php p($l->t('One time password settings')); ?>"><?php p($l->t('OTP settings')); ?></div>
        </div>
      </div>

      <div class="row tab" ng-show="tabActive==1">
        <div class="row">
          <div class="col-xs-12 col-sm-6 col-md-5 col-lg-4">
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Label')); ?></label>
                <input type="text" class="form-control" ng-model="currentItem.label" autocomplete="off" id="label" required>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Login')); ?></label>
                <input type="text" name="account" ng-model="currentItem.account" id="account" class="form-control"
                       autocomplete="off">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Password')); ?></label>
                <div style="max-width:300px;">
                <input ng-show="!pwFieldVisible" type="password" name="password" ng-model="currentItem.password"
                       autocomplete="off" class="form-control">

                <input ng-show="pwFieldVisible" type="text" name="password" ng-model="currentItem.password" click-select
                       autocomplete="off" class="form-control">
                  <div style="position: relative; top: -32px; right: 5px; width: 80px; float: right; margin-bottom: -30px;">
                  <span class="icon icon-history" ng-click="generatePW(); usePw();" tooltip="Generate tooltip"></span>
                  <span title="Mask/Display the password" class="icon icon-toggle" ng-click="togglePWField()"></span>
                  <a clip-copy="currentItem.password" clip-click="copied('password')"
                     class="ui-icon ui-icon-copy"></a></div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Password (again)')); ?></label>
                <input type="password" ng-model="currentItem.passwordConfirm" autocomplete="off" class="form-control">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Email')); ?></label>
                <input type="text" name="email" ng-model="currentItem.email" autocomplete="off" class="form-control">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('URL')); ?></label>
                <input type="text" name="url" ng-model="currentItem.url" autocomplete="off" class="form-control" ng-model-options="{debounce: 750}">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Icon')); ?></label>
                <input type="text" name="url" ng-model="currentItem.favicon" autocomplete="off" class="form-control">
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-5 col-md-5">
            <div class="row">
              <div class="col-xs-12 col-sm-12 col-md-12">
                <label><?php p($l->t('Description')); ?></label>
                <div text-angular ng-model="currentItem.description"  ta-toolbar="[['bold','italics','underline','undo','redo','insertLink']]"></div>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12 col-sm-12 col-md-12">
                <label>Add tag</label>
                <tags-input ng-model="currentItem.tags" class="inputCurrentTags" removeTagSymbol="x" min-length="1"
                            replace-spaces-with-dashes="false">
                  <auto-complete source="loadTags($query)" min-length="1" max-results-to-show="2"></auto-complete>
                </tags-input>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12 col-sm-12 col-md-12">
                <label>Tags</label>
                <div class="currentTags">
                  <div ng-repeat="tag in currentItem.tags" class="pull-left tag">
                    {{tag.text}} <span ng-click="removeTag(tag)" class="icon icon-delete"></span>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="row tab" ng-show="tabActive === 2">
        <div class="row">
          <div class="col-xs-12 col-sm-6 col-md-5 col-lg-4">
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Minimal password score')); ?>: {{requiredPWStrength}}</label>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><input type="checkbox" ng-model="currentItem.overrrideComplex"><?php p($l->t('Override required password score')); ?></label>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Password')); ?></label>
                <div style="max-width:300px;">
                  <input ng-show="!pwFieldVisible" type="password" name="password" ng-model="currentItem.password"
                         autocomplete="off" class="form-control">
                  <input ng-show="pwFieldVisible" type="text" name="password" ng-model="currentItem.password"
                         autocomplete="off" class="form-control">
                  <div style="position: relative; top: -32px; right: 5px; width: 80px; float: right; margin-bottom: -30px;">
                    <span class="icon icon-history" ng-click="generatePW(); usePw();"></span>
                    <span title="Mask/Display the password" class="icon icon-toggle" ng-click="togglePWField()"></span>
                    <a clip-copy="currentItem.password" clip-click="copied('password')"
                       class="ui-icon ui-icon-copy"></a></div>
                </div>
              </div>
            </div>
            <div class="row" ng-show="currentPWInfo.entropy">
              <div class="col-xs-12">
                <span><?php p($l->t('Current password score')); ?>:</span> {{currentPWInfo.entropy}}<br/>
                <span><?php p($l->t('Crack time')); ?>:</span><br>
                <small>{{currentPWInfo.crack_time | secondstohuman}}</small>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <label><?php p($l->t('Password (again)')); ?></label>
                <input type="password" ng-model="currentItem.passwordConfirm" autocomplete="off" class="form-control">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <span ng-show="!newExpireTime && currentItem.expire_time != 0"><?php p($l->t('Password will expire at')); ?>
                  <span ng-bind="currentItem.expire_time | date"></span>
                </span>
                <span ng-show="newExpireTime"><?php p($l->t('Password will expire at')); ?>
                  <span ng-bind="newExpireTime | date"></span>
                </span>
              </div>
            </div>
          </div>
          <div class="col-sm-5 col-md-5 col-lg-3">
            <div class="row">
              <!--<span ng-click="showPwSettings=true" class="link col-xs-12" ng-show="!showPwSettings"><?php p($l->t('Show password generation settings')); ?></span>
              <span ng-click="showPwSettings=false" class="link col-xs-12" ng-show="showPwSettings"><?php p($l->t('Hide password generation settings')); ?></span>-->
              <div id="pwTools">
                <span id="custom_pw">
                    <span><?php p($l->t('Password length')); ?></span>
                    <input type="number" ng-model="pwSettings.length" style="width:50px"><br>
                    <input type="checkbox" ng-model="pwSettings.upper"><label for="upper">A-Z</label> <input
                    ng-model="pwSettings.lower" type="checkbox" id="lower"><label
                    for="lower">a-z</label>
                    <input ng-model="pwSettings.digits" type="checkbox" id="digits"><label
                    for="digits">0-9</label>
                    <input type="checkbox" id="special" ng-model="pwSettings.special"><label
                    for="special"><?php p($l->t('Special')); ?></label><br>
                    <label for="mindigits"><?php p($l->t('Minimum digit count')); ?></label> <input
                    ng-model="pwSettings.mindigits" type="text" id="mindigits" style="width:30px"><br>
                    <input type="checkbox" id="ambig" ng-model="pwSettings.ambig"><label
                    for="ambig"><?php p($l->t('Avoid ambiguous characters')); ?></label><br>
                    <input type="checkbox" ng-model="pwSettings.reqevery" id="reqevery"><label
                    for="reqevery"><?php p($l->t('Require every character type')); ?></label><br>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row tab" ng-show="tabActive==3">
        <div class="row">
          <div class="col-xs-12 col-sm-6 col-md-5 col-lg-4">
            <div class="row">
              <div class="col-xs-12">
                <input type="file" fileread="uploadQueue" item="currentItem"/>
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-5 col-lg-4">
            <div class="row">
              <div class="col-xs-12 col-md-10 col-lg-9">
                <?php p($l->t('Existing files')); ?>
                <ul id="fileList">
                  <li ng-repeat="file in currentItem.files" class="fileListItem">{{file.filename}} ({{file.size | bytes}}) <span
                      class="icon icon-delete" style="float:right;" ng-click="deleteFile(file)"></span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row tab" ng-show="tabActive==4">
        <div class="row">
          <div class="col-xs-12 col-sm-11 col-md-10 col-lg-7">
            <div class="row">
              <div class="col-xs-12">
                <h1><?php p($l->t('Add field')); ?></h1>
                <table style="width: 100%;" class="customFields">
                  <thead>
                  <tr>
                    <td><?php p($l->t('Label')); ?></td>
                    <td><?php p($l->t('Value')); ?></td>
                    <td colspan="2"><?php p($l->t('Hidden')); ?>?</td>
                  </tr>
                  </thead>
                  <tr>
                    <td><input name="customFieldName" ng-model="newCustomfield.label" type="text"
                               placeholder="Enter field name"/>
                    </td>
                    <td><input name="customFieldValue" ng-model="newCustomfield.value" type="text"
                               placeholder="Enter field value" ng-if="!newCustomfield.clicktoshow"/>
                      <input name="customFieldValue" ng-model="newCustomfield.value" type="password"
                               placeholder="Enter field value" ng-if="newCustomfield.clicktoshow"/>
                    </td>
                    <td><input type="checkbox" ng-model="newCustomfield.clicktoshow"/></td>
                    <td><span ng-click="addCField(newCustomfield)" class="icon-add icon"></span></td>
                  </tr>
                </table>
                <hr class="blue">
                <h1><?php p($l->t('Existing fields')); ?></h1>
                <table style="width: 100%;" ng-show="currentItem.customFields.length > 0">
                  <thead>
                  <tr>
                    <td><?php p($l->t('Label')); ?></td>
                    <td><?php p($l->t('Value')); ?></td>
                    <td colspan="2"><?php p($l->t('Hidden')); ?>?</td>
                  </tr>
                  </thead>
                  <tr ng-repeat="custom in currentItem.customFields">

                    <td valign="top" class="td_title">
                      <span click-for-input value="custom.label"></span></td>
                    <td>
                      <span click-for-input value="custom.value"></span>
                    </td>
                    <td>
                      <input type="checkbox" ng-checked="custom.clicktoshow==1" ng-model="custom.clicktoshow"/>
                    </td>
                    <td>
                      <i class="icon icon-delete" ng-click="removeCField(custom)"></i>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row tab" ng-show="tabActive==5">
        <div class="col-xs-12">
          <div class="col-xs-2 nopadding">
            <?php p($l->t('OTP Type')); ?>
          </div>
          <div class="col-xs-6 nopadding">
            <label for="otpImg"><input type="radio" name="seletcOTPType" value="image" ng-model="otpType" id="otpImg"><?php p($l->t('Upload an image')); ?></label>
            <label for="otpStr"><input type="radio" name="seletcOTPType" value="string" ng-model="otpType" id="otpStr"><?php p($l->t('Set the secret manually')); ?></label>
          </div>
          <div class="col-xs-12 nopadding">
            <input type="file" qrread on-read="parseQR(qrdata)" ng-show="otpType==='image'"/>
            <label ng-show="otpType==='string'"><?php p($l->t('Enter the two-factor secret')); ?></label>
            <input type="text" ng-model="currentItem.otpsecret.secret" class="otpSecret form-control" ng-show="otpType==='string'"/>
          </div>
        </div>
        <hr>
        <div class="col-sm-12"><?php p($l->t('Current OTP settings')); ?></div>
        <div class="col-sm-4">
          <img ng-src="{{currentItem.otpsecret.qrCode}}" ng-show="currentItem.otpsecret.qrCode" height="120"
               width="120">
        </div>
        <div class="col-sm-4">
          <table ng-show="currentItem.otpsecret">
            <tr ng-show="currentItem.otpsecret.type">
              <td><?php p($l->t('Type')); ?>:</td>
              <td>{{currentItem.otpsecret.type}}</td>
            </tr>
            <tr ng-show="currentItem.otpsecret.label">
              <td><?php p($l->t('Label')); ?>:</td>
              <td>{{currentItem.otpsecret.label}}</td>
            </tr>
            <tr ng-show="currentItem.otpsecret.issuer">
              <td><?php p($l->t('Issuer')); ?>:</td>
              <td>{{currentItem.otpsecret.issuer}}</td>
            </tr>
            <tr ng-show="currentItem.otpsecret.secret">
              <td><?php p($l->t('Secret')); ?>:</td>
              <td><span pw="currentItem.otpsecret.secret" toggle-text-stars></span> <a
                  clip-copy="currentItem.otpsecret.secret" clip-click="copied('URL')" class="link">[<?php p($l->t('Copy')); ?>]</a></td>
            </tr>
          </table>
        </div>
      </div>
      <div class="row tab" ng-show="errors.length > 0">
        <div class="col-xs-12 col-md-4 col-lg-1 error">
          <div ng-repeat="error in errors">{{error}}</div>
        </div>
      </div>
      <div class="row tab bottomRow">
        <div class="col-xs-12 col-sm-11 col-md-10 col-lg-7">
          <div class="pull-right btn btn-success" ng-click="saveItem(currentItem)">Save</div>
          <div class="pull-right btn btn-danger" ng-click="cancelDialog(currentItem)">Cancel</div>
        </div>
      </div>

    </div>
    <div id="dialog_files" style="display: none;">
      <img id="fileImg"/><br/>
      <span id="downloadImage"></span>
    </div>
    <div ng-controller="settingsCtrl" id="settingsDialog" ng-init="tabActive=1" style="display: none;">
      <div class="">
        <div class="col-md-12 tabHeader nopadding" ng-class="'tab'+tabActive">
          <div class="tab1 col-xs-3 col-md-2 nopadding" ng-click="tabActive=1" ng-class="{'active': tabActive==1}">
            <?php p($l->t('General')); ?>
          </div>
          <div class="tab2 col-xs-3 col-md-2 nopadding" ng-click="tabActive=2" ng-class="{'active': tabActive==2}">
            <?php p($l->t('Sharing')); ?>
          </div>
          <div class="tab3 col-xs-3 col-md-2 nopadding" ng-click="tabActive=3" ng-class="{'active': tabActive==3}">
            <?php p($l->t('Tools')); ?>
          </div>
          <div class="tab4 col-xs-3 col-md-2 nopadding" ng-click="tabActive=4" ng-class="{'active': tabActive==4}">
            <?php p($l->t('Bookmarklet')); ?>
          </div>
          <div class="tab5 col-xs-3 col-md-2 nopadding" ng-click="tabActive=5" ng-class="{'active': tabActive==5}">
            <?php p($l->t('Export')); ?>
          </div>
          <div class="tab6 col-xs-3 col-md-2 nopadding" ng-click="tabActive=6" ng-class="{'active': tabActive==6}">
            <?php p($l->t('Import')); ?>
          </div>
        </div>
        <div class="col-md-12">
          <div ng-show="tabActive==1" class="row">
            <div class="col-md-11">
              <div class="col-md-4">
              <h2><?php p($l->t('General settings')); ?></h2>
                <label><input type="checkbox" ng-model="userSettings.settings.useImageProxy"><?php p($l->t('Use image proxy on https pages')); ?></label>
                <label><input type="checkbox" ng-model="userSettings.settings.noFavIcons"><?php p($l->t('Disable favicons')); ?></label>
              </div>
              <div class="col-md-3 pull-right">
                <h2><?php p($l->t('Change Passman password')); ?></h2>
                <label><?php p($l->t('Current password')); ?></label> <input ng-model="changepw.oldpw" required>
                <label><?php p($l->t('New password')); ?></label> <input ng-model="changepw.newpw" required>
                <label><?php p($l->t('New password (repeat)')); ?></label><input ng-model="changepw.newpwr" required ng-enter="changePW()">
                <br />
                <br />
                <div class="btn btn-success" ng-click="changePW()"><?php p($l->t('Change pw')); ?></div><br />
                {{status}}
              </div>
            </div>
          </div>
        </div>
        <div ng-show="tabActive==2" class="row">
          <div class="col-sm-5">
            <label><?php p($l->t('Key size')); ?> <select ng-model="userSettings.settings.sharing.shareKeySize">
                <option value="1024"><?php p($l->t('Low')); ?> (1024 bit)</option>
                <option value="2048"><?php p($l->t('Medium')); ?> (2048 bit)</option>
                <option value="4096"><?php p($l->t('High')); ?> (4096)</option>
              </select></label>
            <?php p($l->t('Public key')); ?><br>
            <textarea
                style="width: 100%; height: 200px;">{{userSettings.settings.sharing.shareKeys.pubKeyObj}}</textarea>
          </div>
          <div class="col-sm-5">
            <label><?php p($l->t('Renew sharing keys')); ?>: <input type="button" ng-click="renewShareKeys()" value="Renew"></label>
            <?php p($l->t('Private key')); ?><br/>
            <textarea
                style="width: 100%; height: 200px;">{{userSettings.settings.sharing.shareKeys.prvKeyObj}}</textarea>
          </div>
        </div>
        <div ng-show="tabActive==3" class="row">
          <div class="col-md-11">
            <p><?php p($l->t('Here you can indentify weak passwords, all affected items will be listed. List all passwords with a score less than')); ?></p>
            <input type="text" ng-model="settings.PSC.minStrength"/>
            <button class="btn" ng-click="checkPasswords()">Show weak passwords</button>
            <div ng-show="settings.PSC.weakItemList.length > 0">You've got {{settings.PSC.weakItemList.length}} weak passwords</div>
            <div style="max-height: 300px; overflow-y: auto;">
              <table ng-table="tableParams" class="table table-striped header-fixed weakPwList">
                <thead>
                  <tr>
                    <th><?php p($l->t('Label')); ?></th>
                    <th><?php p($l->t('Score')); ?></th>
                    <th><?php p($l->t('Crack time')); ?></td>
                    <th><?php p($l->t('Password')); ?></th>
                  </tr>
                </thead>
                <tbody style="height: 230px;">
                  <tr ng-repeat="item in settings.PSC.weakItemList | orderBy:'score'">
                    <td>{{item.label}}</td>
                    <td>{{item.score}}</td>
                    <td>{{item.crack_time_display}}</td>

                    <td>
                      <span pw="item.password" toggle-text-stars></span>
                      <a ng-click="sGoToEditItem(item)" class="link">[<?php p($l->t('edit')); ?>]</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div ng-show="tabActive==4" class="row">
          <div class="col-md-11">
            <p><?php p($l->t('Drag this to your browser bookmarks and click it, if you want to save username / password quickly')); ?></p>
            <br/>

            <p ng-bind-html="bookmarklet"></p>
          </div>
        </div>
        <div ng-show="tabActive==5" class="row" ng-controller="exportCtrl">
          <div class="col-md-4">
            <div><?php p($l->t('Export items as')); ?>
              <select ng-model="exportItemas" ng-init="exportItemas = 'csv'">
                <option value="csv" selected="selected"><?php p($l->t('Passman CSV'));?></option>
                <option value="keepasscsv"><?php p($l->t('KeePass CSV'));?></option>
                <option value="json"><?php p($l->t('Passman JSON'));?></option>
                <option value="xml"><?php p($l->t('Passman XML'));?></option>
              </select> <button class="btn btn-success" ng-click="exportItemAs(exportItemas)"><?php p($l->t('Export')); ?></button>
            </div>
            <div>
              <?php p($l->t('Export only items with selected tags')); ?><br />
              <?php p($l->t('Leave empty to export all tags')); ?><br />
              <tags-input ng-model="selectedExportTags" removeTagSymbol="x" replace-spaces-with-dashes="false" min-length="1">
                <auto-complete source="loadTags($query)" min-length="1"></auto-complete>
              </tags-input>
            </div>
          </div>
          <div class="col-md-5">
            <?php p($l->t('Select fields to export')); ?>
            <label ng-repeat="fieldName in exportFields">
              <input
                type="checkbox"
                name="selectedExportFields[]"
                value="{{fruitName.prop}}"
                ng-checked="selectedExportFields.indexOf(fieldName) > -1"
                ng-click="toggleExportFieldSelection(fieldName)"
                ng-disabled="fieldName.disabledFor.indexOf(exportItemas) !== -1">
                {{fieldName.name}}
            </label>

            <b><?php p($l->t('WARNING: Password will be exported as plaintext')); ?></b>
          </div>
        </div>
        <div ng-show="tabActive===6" class="row" ng-controller="importCtrl">
          <div class="col-md-4">
            <div><?php p($l->t('Import type')); ?>
              <select ng-model="importItemas" ng-init="importItemas = 'csv'">
                <option value="csv" selected="selected"><?php p($l->t('Passman CSV'));?></option>
                <option value="keepasscsv"><?php p($l->t('KeePass CSV'));?></option>
                <option value="lastpasscsv"><?php p($l->t('LastPass CSV'));?></option>
                <option value="json"><?php p($l->t('Passman JSON'));?></option>
                <!--<option value="xml">Passman XML</option> -->
              </select></br>
              <input type="file" ng-file-select="onFileSelect($files)" >
              <button class="btn btn-success" ng-click="importItemAs(importItemas)"><?php p($l->t('Import')); ?></button>
            </div>
          </div>
          <div class="col-md-5">
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="{{importProgress}}" aria-valuemin="0" aria-valuemax="100" ng-style="{'width': importProgress+'%'}">
                {{importProgress}}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ng-controller="revisionCtrl" style="display: none;">
      <div id="revisions">
        <div class="row">
          <div class="col-md-10">
            <button class="btn btn-default pull-left" ng-click="compareSelected()"><?php p($l->t('Compare selected')); ?></button>
            <button class="btn btn-default pull-left"><?php p($l->t('Delete selected')); ?></button>
          </div>
        </div>
        <div class="revContainer">
          <div ng-repeat="revision in revisions"  ng-class="{'even': $even} ">
            <div class="col-md-1 nopadding">
              <input type="checkbox" ng-model="revision.selected">
            </div>
            <div class="col-md-3">
              <span ng-if="revision.revision_date!== 'current'">{{revision.revision_date*1000 | date:"dd/MM/yyyy HH:mm"}}<br /> <?php p($l->t('by')); ?> {{revision.user_id}}</span>
              <span ng-if="revision.revision_date=== 'current'"><?php p($l->t('Current revision by')); ?> {{revision.user_id}}</span>

            </div>
            <div class="col-md-6">
              {{revision.data.label}}
            </div>
            <div class="col-md-6">
              <a ng-click="showRevision(revision)" class="link"><?php p($l->t('Show')); ?></a>
              <span ng-if="revision.revision_date!== 'current'"> | <a class="link" ng-click="restoreRevision(revision,revision.revision_date)"><?php p($l->t('Restore')); ?></a></span>
            </div>
          </div>
        </div>
      </div>
      <div id="showRevisions">
        <table style="width:100%">
          <tr>
            <td ng-repeat="showRevision in revisionCompareArr">
              <span ng-if="showRevision.revision_date!== 'current'"><?php p($l->t('Revision of')); ?> {{showRevision.revision_date*1000 | date:"dd/MM/yyyy H:mm"}} <?php p($l->t('by')); ?> {{showRevision.user_id}}</span>
              <span ng-if="showRevision.revision_date=== 'current'"><?php p($l->t('Current revision by')); ?> {{showRevision.user_id}}</span>
            </td>
          </tr>
          <tr>
            <td ng-repeat="showRevision in revisionCompareArr">
              <table class="revisionTable">
                <tbody>
                <tr ng-show="showRevision.data.label">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('Label')); ?></span>:
                  </td>
                  <td>
                    {{showRevision.data.label}}
                  </td>
                </tr>
                <tr ng-show="showRevision.data.description">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('Description')); ?></span> :
                  </td>
                  <td>
                    <span ng-bind-html="showRevision.data.description  | to_trusted"></span>

                  </td>
                </tr>
                <tr ng-show="showRevision.data.account ">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('Account')); ?></span> :
                  </td>
                  <td>
                    {{showRevision.data.account}}
                  </td>
                </tr>
                <tr ng-show="showRevision.data.password ">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('Password')); ?></span> :
                  </td>
                  <td>
                    <span pw="showRevision.data.password" toggle-text-stars></span>
                  </td>
                </tr>
                <tr ng-if="showRevision.data.otpsecret ">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('One time password')); ?></span> :
                  </td>
                  <td>
                    &nbsp; Yes
                  </td>
                </tr>
                <tr ng-show="showRevision.data.expire_time">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('Expires')); ?></span> :
                  </td>
                  <td>
                    {{showRevision.data.expire_time | date}}
                  </td>
                </tr>
                <tr ng-show="showRevision.data.email ">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('Email')); ?></span> :
                  </td>
                  <td>
                    {{showRevision.data.email}}
                  </td>
                </tr>
                <tr ng-show="showRevision.data.url ">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float: left; margin-right: .3em;">&nbsp;</span>
                    <span><?php p($l->t('URL')); ?></span> :
                  </td>
                  <td>
                    {{showRevision.data.url}}
                  </td>
                </tr>
                <tr ng-show="showRevision.data.files.length > 0 && showRevision.data.files">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float:left; margin-right:.3em;">&nbsp;</span>
                    <span><?php p($l->t('Files & Images')); ?></span> :
                  </td>
                  <td>
            <span ng-repeat="file in currentItem.files" class="link loadFile"><span
                  ng-class="file.icon"></span>{{file.filename}}  ({{file.size | bytes}})</span>
                  </td>
                </tr>
                <tr ng-show="showRevision.data.customFields.length > 0" ng-repeat="custom in showRevision.data.customFields">
                  <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e"
                                                          style="float:left; margin-right:.3em;">&nbsp;</span>
                    {{custom.label}} :
                  </td>
                  <td>
                      <span ng-if="custom.clicktoshow==0">
                        {{custom.value}}
                      </span>
                      <span ng-if="custom.clicktoshow==1">
                       <span pw="custom.value" toggle-text-stars></span>
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>

      </div>
    </div>
  </div>
  <!-- End contentCtrl -->

  <!--- Start sharing -->
  <div ng-controller="shareCtrl">
    <div id="shareDialog" style="display: none;" ng-init="tabActive=1">
      <div ng-show="userSettings.settings.sharing.shareKeys">
        <div class="tabHeader" ng-class="'tab'+tabActive">
          <div class="col-xs-4 tab1" ng-click="tabActive=1" ng-class="{'active': tabActive==1}">
            <?php p($l->t('Users & Groups')); ?>
          </div>
          <div class="col-xs-4 tab2" ng-click="tabActive=2" ng-class="{'active': tabActive==2}">
            <?php p($l->t('Links')); ?>
          </div>
        </div>
        <div class="row tabContent">
          <div class="col-md-6" ng-show="tabActive==1">
            <?php p($l->t('Enter the users / groups you want to share the password with')); ?>
            <tags-input ng-model="shareSettings.shareWith" removeTagSymbol="x" replace-spaces-with-dashes="false"
                        min-length="1">
              <auto-complete source="loadUserAndGroups($query)" min-length="1" max-results-to-show="6"></auto-complete>
            </tags-input>
            <table width="100%">
              <th>
                <tr>
                  <td><?php p($l->t('Name')); ?></td>
                  <td><?php p($l->t('Type')); ?></td>
                </tr>
              </th>
              <tr ng-repeat="sharetargets in shareSettings.shareWith">
                <td>{{sharetargets.text}}</td>
                <td>{{sharetargets.type}}</td>
              </tr>
            </table>
          </div>
          <div class="col-xs-8" ng-show="tabActive==2">
            <label><input type="checkbox" ng-model="shareSettings.allowShareLink" ng-click="createShareUrl()"/><?php p($l->t('Create share link')); ?></label>

            <div ng-show="shareSettings.allowShareLink">
              <?php p($l->t('Your share link')); ?>:
              <input type="text" click-select ng-model="shareSettings.shareUrl" class="shareUrl"/>
            </div>
          </div>

        </div>
      </div>
      <div ng-show="!userSettings.settings.sharing.shareKeys">
              <?php p($l->t(' Generating sharing keys. This step is only necessary once, please wait.')); ?>
      </div>
    </div>
  </div>
  <!-- end sharing -->


  <div id="encryptionKeyDialog" style="display: none;">
    <p><?php p($l->t('Enter your encryption key.')); ?></p>
    <p><?php p($l->t('If this is the first time you use Passman, this key will be used for encryption of your passwords')); ?></p>
    <input type="password" id="ecKey" style="width: 150px;"  ng-enter="doLogin()"/><br/>
    <input type="checkbox" id="ecRemember" name="ecRemember"/><label for="ecRemember"><?php p($l->t('Remember this key ')); ?></label>
    <select id="rememberTime">
      <option value="15"><?php p($l->n('%n minute','%n minutes',15)); ?></option>
      <option value="30"><?php p($l->n('%n minute','%n minutes',30)); ?></option>
      <option value="60"><?php p($l->n('%n minute','%n minutes',60)); ?></option>
      <option value="180"><?php p($l->n('%n hour','%n hours',3)); ?></option>
      <option value="480"><?php p($l->n('%n hour','%n hours',8)); ?></option>
      <option value="1440"><?php p($l->n('%n day','%n days',1)); ?></option>
      <option value="10080"><?php p($l->n('%n day','%n days',7)); ?></option>
      <option value="43200"><?php p($l->n('%n day','%n days',30)); ?></option>
      <option value="86400"><?php p($l->n('%n day','%n days',60)); ?></option>
    </select>
  </div>

</div>
<!-- End appCtrl -->
