<?php
\OCP\Util::addscript('passman', 'sjcl');
\OCP\Util::addscript('passman', 'angular.min');
\OCP\Util::addscript('passman', 'tagsInput.min');
\OCP\Util::addscript('passman', 'bower_components/ng-clip/dest/ng-clip.min');
\OCP\Util::addscript('passman', 'bower_components/zeroclipboard/dist/ZeroClipboard.min');
\OCP\Util::addscript('passman', 'jstorage');
\OCP\Util::addscript('passman', 'bower_components/zxcvbn/zxcvbn-async');
\OCP\Util::addscript('passman', 'pwgen');
\OCP\Util::addscript('passman', 'ng-click-select');
\OCP\Util::addscript('passman', 'qrReader/llqrcode');
\OCP\Util::addscript('passman', 'sha');
\OCP\Util::addscript('passman', 'func');
\OCP\Util::addscript('passman', 'popup');
\OCP\Util::addscript('passman', 'app.service');
\OCP\Util::addscript('passman', 'app.directive');
\OCP\Util::addscript('passman', 'app.filter');

\OCP\Util::addStyle('passman', 'ocPassman');
\OCP\Util::addStyle('passman', 'popup');
\OCP\Util::addStyle('passman', 'ng-tags-input.min');
\OCP\Util::addStyle('passman', 'bootstrapGrid');
?>

<div ng-controller="popupCtrl" ng-app="passman">
  <div class="container">
    <form method="get" name="new_item" id="editNewItem">
    <div class="tabHeader" ng-class="'tab'+tabActive" ng-init="tabActive=1">
      <div class="col-xs-2 nopadding tab1" ng-click="tabActive=1;" ng-class="{'active': tabActive==1}">General</div>
      <div class="col-xs-2 nopadding tab2" ng-click="tabActive=2;" ng-class="{'active': tabActive==2}">Password</div>
      <div class="col-xs-2 nopadding tab3" ng-click="tabActive=3; " ng-class="{'active': tabActive==3}"
           ng-show="currentItem.id">Files
      </div>
      <div class="col-xs-3 nopadding tab4" ng-click="tabActive=4" ng-class="{'active': tabActive==4}">Custom fields</div>
      <div class="col-xs-3 nopadding tab5" ng-click="tabActive=5" ng-class="{'active': tabActive==5}">OTP settings</div>
    </div>
    <div class="row nomargin" ng-show="tabActive==1">
      <div class="row">
        <div class="col-xs-1 formLabel">Label</div>
        <div class="col-xs-7"><input type="text" ng-init="currentItem.label = '<?php p($_['label']); ?>'" ng-model="currentItem.label" autocomplete="off" id="labell" required></div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">Description</div>
        <div class="col-xs-7"><textarea rows="4" name="desc" id="desc" ng-model="currentItem.description"
                                        cols="3"></textarea></div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">Login</div>
        <div class="col-xs-7"><input type="text" name="account" ng-model="currentItem.account" id="account"
                                     autocomplete="off"></div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">Email</div>
        <div class="col-xs-7"><input type="text" name="email" ng-model="currentItem.email" autocomplete="off"></div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">URL</div>
        <div class="col-xs-7"><input type="text" name="url" ng-init="currentItem.url = '<?php p($_['url']); ?>'" ng-model="currentItem.url" autocomplete="off"></div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">Tags</div>
        <div class="col-xs-7">
          <tags-input ng-model="currentItem.tags" removeTagSymbol="x" min-length="1" replace-spaces-with-dashes="false">
            <auto-complete source="loadTags($query)" min-length="1" max-results-to-show="2"></auto-complete>
          </tags-input>
        </div>
      </div>
    </div>
    <div class="row nomargin" ng-show="tabActive==2">
      <div class="row">
        <div class="col-xs-12 formLabel">Minimal password score: {{requiredPWStrength}}</div>
        <div class="col-xs-12">
          <input type="checkbox" ng-model="currentItem.overrrideComplex"><label class="label_cpm">Override required
            score</label>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">Password</div>
        <div class="col-xs-5">
          <input ng-show="!pwFieldVisible" type="password" name="password" ng-model="currentItem.password"
                 autocomplete="off">
          <span ng-show="pwFieldVisible" class="pwPreview">{{currentItem.password}}</span>
        </div>
        <div class="col-xs-3 col-sm-3 col-md-3 nopadding">
          <span class="icon icon-history" ng-click="generatePW(); usePw();"></span>
          <span title="Mask/Display the password" class="icon icon-toggle" ng-click="togglePWField()"></span>
          <a clip-copy="currentItem.password" clip-click="copied('password')"
             class="ui-icon ui-icon-copy pull-right nomargin icon-copy"></a>
        </div>
      </div>
      <div class="row" ng-show="currentPWInfo">
        <div class="col-xs-11">
          <span>Current password score:</span> {{currentPWInfo.entropy}}<br/>
          <span>Crack time:</span><br>
          <small>{{currentPWInfo.crack_time | secondstohuman}}</small>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-1 formLabel">Password (again)</div>
        <div class="col-xs-5">
          <input type="password" ng-model="currentItem.passwordConfirm" autocomplete="off">
        </div>
      </div>
      <div class="row">
        <div class="col-xs-11">
                <span ng-show="!newExpireTime && currentItem.expire_time != 0">Password will expire at
                  <span ng-bind="currentItem.expire_time | date"></span>
                </span>
                <span ng-show="newExpireTime">Password will expire at
                  <span ng-bind="newExpireTime | date"></span>
                </span>
        </div>
      </div>
      <div class="row">
        <span ng-click="showPwSettings=true" class="link col-xs-12" ng-show="!showPwSettings">Show password generation settings</span>
        <span ng-click="showPwSettings=false" class="link col-xs-12" ng-show="showPwSettings">Hide password generation settings</span>

        <div id="pwTools" ng-show="showPwSettings">
              <span id="custom_pw">
                  <span>Password Length</span>
                  <input type="number" ng-model="pwSettings.length" style="width:30px"><br>
                  <input type="checkbox" ng-model="pwSettings.upper"><label for="upper">A-Z</label> <input
                  ng-model="pwSettings.lower" type="checkbox" id="lower"><label
                  for="lower">a-z</label>
                  <input ng-model="pwSettings.digits" type="checkbox" id="digits"><label
                  for="digits">0-9</label>
                  <input type="checkbox" id="special" ng-model="pwSettings.special"><label
                  for="special">Special</label><br>
                  <label for="mindigits">Minimum Digit Count</label> <input
                  ng-model="pwSettings.mindigits" type="text" id="mindigits" style="width:30px"><br>
                  <input type="checkbox" id="ambig" ng-model="pwSettings.ambig"><label
                  for="ambig">Avoid Ambiguous Characters</label><br>
                  <input type="checkbox" ng-model="pwSettings.reqevery" id="reqevery"><label
                  for="reqevery">Require Every Character Type</label><br>
              </span>
          <button class="button" ng-click="generatePW()">Generate password</button>
          <button class="button" ng-show="generatedPW!=''"
                  ng-click="usePw()">Use password
          </button>
          <div ng-show="generatedPW"><span>Generated password:</span> <br/>{{generatedPW}}</div>
          <b ng-show="generatedPW"><span>Generated password score</span>:
            {{pwInfo.entropy}}</b><br/>
          <b ng-show="generatedPW"><span>Crack time</span>: {{pwInfo.crack_time | secondstohuman}}</b>
        </div>
      </div>
    </div>
    <div class="row nomargin" ng-show="tabActive==3">
      <div class="row">
        <div class="col-xs-11">
          <input type="file" fileread="uploadQueue" item="currentItem"/>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-11">
          Existing files
          <ul id="fileList">
            <li ng-repeat="file in currentItem.files" class="fileListItem">{{file.filename}} ({{file.size | bytes}}) <span
                class="icon icon-delete" style="float:right;" ng-click="deleteFile(file)"></span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="row nomargin" ng-show="tabActive==4">
      <div class="row">
        <div class="col-xs-11">
          <h1>Add field</h1>
          <table style="width: 100%;" class="customFields">
            <thead>
            <tr>
              <td>Label</td>
              <td>Value</td>
              <td colspan="2">Hidden?</td>
            </tr>
            </thead>
            <tr>
              <td><input name="customFieldName" ng-model="newCustomfield.label" type="text" placeholder="Enter field name"/>
              </td>
              <td><input name="customFieldValue" ng-model="newCustomfield.value" type="text"
                         placeholder="Enter field value"/>
              </td>
              <td><input type="checkbox" ng-model="newCustomfield.clicktoshow"/></td>
              <td><span ng-click="addCField(newCustomfield)" class="icon-add icon"></span></td>
            </tr>
          </table>
          <hr class="blue">
          <h1>Existing fields</h1>
          <table style="width: 100%;" ng-show="currentItem.customFields.length > 0">
            <thead>
            <tr>
              <td>Label</td>
              <td>Value</td>
              <td colspan="2">Hidden?</td>
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
    <div class="row nomargin" ng-show="tabActive==5">
      <div class="col-xs-12">
        <div class="col-xs-2 nopadding">
          OTP type
        </div>
        <div class="col-xs-6 nopadding">
          <input type="radio" name="seletcOTPType" value="image" ng-model="otpType" id="otpImg"><label for="otpImg">Upload
            an image</label><br/>
          <input type="radio" name="seletcOTPType" value="string" ng-model="otpType" id="otpStr"><label for="otpStr">Set the
            secret manually</label>
        </div>
        <div class="col-xs-12 nopadding">
          <input type="file" qrread on-read="parseQR(qrdata)" ng-show="otpType==='image'"/>
          <label ng-show="otpType==='string'">Enter the 2 factor secret <input type="text"
                                                                               ng-model="currentItem.otpsecret.secret"
                                                                               class="otpSecret"/></label>
        </div>
      </div>
      <hr>
      <div class="col-sm-12">Current OTP settings</div>
      <div class="col-sm-4">
        <img ng-src="{{currentItem.otpsecret.qrCode}}" ng-show="currentItem.otpsecret.qrCode" height="120" width="120">
      </div>
      <div class="col-sm-4">
        <table ng-show="currentItem.otpsecret">
          <tr ng-show="currentItem.otpsecret.type">
            <td>Type:</td>
            <td>{{currentItem.otpsecret.type}}</td>
          </tr>
          <tr ng-show="currentItem.otpsecret.label">
            <td>Label:</td>
            <td>{{currentItem.otpsecret.label}}</td>
          </tr>
          <tr ng-show="currentItem.otpsecret.issuer">
            <td>Issuer:</td>
            <td>{{currentItem.otpsecret.issuer}}</td>
          </tr>
          <tr ng-show="currentItem.otpsecret.secret">
            <td>Secret:</td>
            <td><span pw="currentItem.otpsecret.secret" toggle-text-stars></span> <a
                clip-copy="currentItem.otpsecret.secret" clip-click="copied('URL')" class="link">[Copy]</a></td>
          </tr>
        </table>
      </div>
    </div>

    </form>
  </div>
<div class="buttons">
  <button class="button cancel" ng-click="closeDialog()">Cancel</button>
  <button class="button save" ng-click="saveItem(currentItem)" ng-disabled="!new_item.$valid">Save</button>
</div>
</div>
<div id="encryptionKeyDialog" style="display: none;">
  <p>Enter your encryption key. If this if the first time you use Passman, this key will be used for encryption your
    passwords</p>
  <input type="password" id="ecKey" style="width: 150px;" /><br />
  <input type="checkbox" id="ecRemember" name="ecRemember" /><label for="ecRemember">Remember this key</label>
  <select id="rememberTime">
    <option value="15">15 Minutes</option>
    <option value="15">30 Minutes</option>
    <option value="60">60 Minutes</option>
    <option value="180">3 Hours</option>
    <option value="480">8 Hours</option>
    <option value="1440">1 Day</option>
    <option value="10080">7 Days</option>
    <option value="43200">30 Days</option>
  </select>

</div>