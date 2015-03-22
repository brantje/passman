<?php
\OCP\Util::addscript('passman', 'sjcl');
\OCP\Util::addscript('passman', 'angular.min');
\OCP\Util::addscript('passman', 'tagsInput.min');
\OCP\Util::addscript('passman', 'bower_components/ng-clip/dest/ng-clip.min');
\OCP\Util::addscript('passman', 'bower_components/zeroclipboard/dist/ZeroClipboard.min');
\OCP\Util::addscript('passman', 'jstorage');
\OCP\Util::addscript('passman', 'bower_components/zxcvbn/zxcvbn-async');
\OCP\Util::addscript('passman', 'pwgen');
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
		<div class="tabHeader" ng-class="'tab'+tabActive" ng-init="tabActive=1">
			<div class="col-xs-2 nopadding tab1" ng-click="tabActive=1;"
				 ng-class="{'active': tabActive==1}"><?php p($l->t('General')); ?></div>
			<div class="col-xs-2 nopadding tab2" ng-click="tabActive=2;"
				 ng-class="{'active': tabActive==2}"><?php p($l->t('Password')); ?></div>
			<div class="col-xs-3 nopadding tab4" ng-click="tabActive=4"
				 ng-class="{'active': tabActive==4}"><?php p($l->t('Custom fields')); ?></div>
			<div class="col-xs-3 nopadding tab5" ng-click="tabActive=5"
				 ng-class="{'active': tabActive==5}"><?php p($l->t('OTP Settings')); ?></div>
		</div>
		<div class="row nomargin" ng-show="tabActive==1">
			<div class="row">
				<div
					class="col-xs-1 formLabel"><?php p($l->t('Label')); ?></div>
				<div class="col-xs-7"><input type="text"
											 ng-init="currentItem.label = '<?php p($_['label']); ?>'"
											 ng-model="currentItem.label"
											 autocomplete="off" id="labell"
											 required></div>
				<div class="col-xs-1"><!-- if no image proxy -->
					<img ng-src="{{currentItem.favicon}}"
						 fallback-src="noFavIcon"
						 style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 10px;"
						 ng-if="currentItem.favicon">
					<img
						style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 10px;"
						ng-src="{{noFavIcon}}"
						ng-if="!currentItem.favicon && !userSettings.settings.useImageProxy">
					<!-- end if -->

					<!-- If image proxy === true -->
					<img image-proxy image="currentItem.favicon"
						 fallback="noFavIcon"
						 style="height: 16px; width: 16px; float: left; margin-left: 8px; margin-right: 4px; margin-top: 5px;"
						 ng-if="userSettings.settings.useImageProxy">
				</div>
			</div>
			<div class="row">
				<div
					class="col-xs-1 formLabel"><?php p($l->t('Description')); ?></div>
				<div class="col-xs-7"><textarea rows="4" name="desc" id="desc"
												ng-model="currentItem.description"
												cols="3"></textarea></div>
			</div>
			<div class="row">
				<div
					class="col-xs-1 formLabel"><?php p($l->t('Login')); ?></div>
				<div class="col-xs-7"><input type="text" name="account"
											 ng-model="currentItem.account"
											 id="account"
											 autocomplete="off"></div>
			</div>
			<div class="row">
				<div
					class="col-xs-1 formLabel"><?php p($l->t('Email')); ?></div>
				<div class="col-xs-7"><input type="text" name="email"
											 ng-model="currentItem.email"
											 autocomplete="off"></div>
			</div>
      <div class="row">
        <div
          class="col-xs-1 formLabel"><?php p($l->t('Password')); ?></div>
        <div class="col-xs-4">
          <input ng-show="!pwFieldVisible" type="password"
                 name="password" ng-model="currentItem.password"
                 autocomplete="off">
          <input ng-show="pwFieldVisible" type="text" click-select
                 name="password" ng-model="currentItem.password"
                 autocomplete="off">
        </div>
        <div class="col-xs-3 col-sm-3 col-md-3 nopadding">
					<span class="icon icon-history"
                ng-click=" $event.preventDefault(); generatePW($evt); usePw();"></span>
					<span title="Mask/Display the password"
                class="icon icon-toggle"
                ng-click="togglePWField()"></span>
          <a clip-copy="currentItem.password"
             clip-click="copied('password')"
             class="ui-icon ui-icon-copy pull-right nomargin icon-copy"></a>
        </div>
      </div>
      <div class="row">
        <div
          class="col-xs-1 formLabel"><?php p($l->t('Password (again)')); ?></div>
        <div class="col-xs-4">
          <input type="password"
                 ng-model="currentItem.passwordConfirm"
                 autocomplete="off">
        </div>
      </div>
			<div class="row">
				<div class="col-xs-1 formLabel"><?php p($l->t('URL')); ?></div>
				<div class="col-xs-7"><input type="text" name="url"
											 ng-blur="updateFavIcon()"
											 ng-init="currentItem.url = '<?php p($_['url']); ?>'"
											 ng-model="currentItem.url"
											 autocomplete="off"></div>
				<div ng-show="favIconLoading" class="loader"
					 style="height: 10px; width: 10px; border-width: 5px; display: inline-block; margin-top: 10px; margin-left: 10px;"></div>
			</div>
			<div class="row">
				<div class="col-xs-1 formLabel"><?php p($l->t('Icon')); ?></div>
				<div class="col-xs-7"><input type="text" name="url"
											 ng-model="currentItem.favicon"
											 autocomplete="off"></div>
			</div>
			<div class="row">
				<div class="col-xs-1 formLabel"><?php p($l->t('Tags')); ?></div>
				<div class="col-xs-7">
					<tags-input ng-model="currentItem.tags" removeTagSymbol="x"
								min-length="1"
								replace-spaces-with-dashes="false">
						<auto-complete source="loadTags($query)" min-length="1"
									   max-results-to-show="2"></auto-complete>
					</tags-input>
				</div>
			</div>
		</div>
		<div class="row nomargin" ng-show="tabActive==2">
			<div class="row">
				<div
					class="col-xs-12 formLabel"><?php p($l->t('Minimal password score')); ?>
					: {{requiredPWStrength}}
				</div>
				<div class="col-xs-12">
					<input type="checkbox"
						   ng-model="currentItem.overrrideComplex"><label
						class="label_cpm"><?php p($l->t('Override required score')); ?></label>
				</div>
			</div>
			<div class="row">
				<div
					class="col-xs-1 formLabel"><?php p($l->t('Password')); ?></div>
				<div class="col-xs-4">
					<input ng-show="!pwFieldVisible" type="password"
						   name="password" ng-model="currentItem.password"
						   autocomplete="off">
          <input ng-show="pwFieldVisible" type="text" click-select
						   name="password" ng-model="currentItem.password"
						   autocomplete="off">
				</div>
				<div class="col-xs-3 col-sm-3 col-md-3 nopadding">
					<span class="icon icon-history"
						  ng-click="$event.preventDefault(); generatePW(); usePw();"></span>
					<span title="Mask/Display the password"
						  class="icon icon-toggle"
						  ng-click="togglePWField()"></span>
					<a clip-copy="currentItem.password"
					   clip-click="copied('password')"
					   class="ui-icon ui-icon-copy pull-right nomargin icon-copy"></a>
				</div>
			</div>
			<div class="row" ng-show="currentPWInfo">
				<div class="col-xs-11">
					<span><?php p($l->t('Current password score')); ?>:</span>
					{{currentPWInfo.entropy}}<br/>
					<span><?php p($l->t('Crack time')); ?>:</span><br>
					<small>{{currentPWInfo.crack_time | secondstohuman}}</small>
				</div>
			</div>
			<div class="row">
				<div
					class="col-xs-1 formLabel"><?php p($l->t('Password (again)')); ?></div>
				<div class="col-xs-4">
					<input type="password"
						   ng-model="currentItem.passwordConfirm"
						   autocomplete="off">
				</div>
			</div>
			<div class="row">
				<div class="col-xs-11">
                <span
					ng-show="!newExpireTime && currentItem.expire_time != 0"><?php p($l->t('Password will expire at ')); ?>
					<span ng-bind="currentItem.expire_time | date"></span>
                </span>
                <span
					ng-show="newExpireTime"><?php p($l->t('Password will expire at ')); ?>
					<span ng-bind="newExpireTime | date"></span>
                </span>
				</div>
			</div>
			<div class="row">
				<span ng-click="showPwSettings=true" class="link col-xs-12"
					  ng-show="!showPwSettings"><?php p($l->t('Show password generation settings')); ?></span>
				<span ng-click="showPwSettings=false" class="link col-xs-12"
					  ng-show="showPwSettings"><?php p($l->t('Hide password generation settings')); ?></span>

				<div id="pwTools" ng-show="showPwSettings">
					<span id="custom_pw">
              <span><?php p($l->t('Password length')); ?></span>
              <input type="number" ng-model="pwSettings.length"
					 style="width:30px"><br>
              <input type="checkbox" ng-model="pwSettings.upper"><label
				  for="upper">A-Z</label> <input
				  ng-model="pwSettings.lower" type="checkbox" id="lower"><label
				  for="lower">a-z</label>
              <input ng-model="pwSettings.digits" type="checkbox"
					 id="digits"><label
				  for="digits">0-9</label>
              <input type="checkbox" id="special" ng-model="pwSettings.special"><label
				  for="special"><?php p($l->t('Special')); ?></label><br>
              <label
				  for="mindigits"><?php p($l->t('Minimum digit count')); ?></label> <input
				  ng-model="pwSettings.mindigits" type="text" id="mindigits"
				  style="width:30px"><br>
              <input type="checkbox" id="ambig"
					 ng-model="pwSettings.ambig"><label
				  for="ambig"><?php p($l->t('Avoid ambiguous characters')); ?></label><br>
              <input type="checkbox" ng-model="pwSettings.reqevery"
					 id="reqevery"><label
				  for="reqevery"><?php p($l->t('Require every character type')); ?></label><br>
          </span>
				</div>
			</div>
		</div>
		<div class="row nomargin" ng-show="tabActive==4">
			<div class="row">
				<div class="col-xs-11">
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
							<td><input name="customFieldName"
									   ng-model="newCustomfield.label"
									   type="text"
									   placeholder="Enter field name"/>
							</td>
							<td><input name="customFieldValue"
									   ng-model="newCustomfield.value"
									   type="text"
									   placeholder="Enter field value" />
							</td>
							<td><input type="checkbox"
									   ng-model="newCustomfield.clicktoshow"/>
							</td>
							<td><span ng-click="addCField(newCustomfield)"
									  class="icon-add icon"></span></td>
						</tr>
					</table>
					<hr class="blue">
					<h1><?php p($l->t('Existing fields')); ?></h1>
					<table style="width: 100%;"
						   ng-show="currentItem.customFields.length > 0">
						<thead>
						<tr>
							<td><?php p($l->t('Label')); ?></td>
							<td><?php p($l->t('Value')); ?></td>
							<td colspan="2"><?php p($l->t('Hidden')); ?>?</td>
						</tr>
						</thead>
						<tr ng-repeat="custom in currentItem.customFields">

							<td valign="top" class="td_title">
								<span click-for-input
									  value="custom.label"></span></td>
							<td>
								<span click-for-input
									  value="custom.value"></span>
							</td>
							<td>
								<input type="checkbox"
									   ng-checked="custom.clicktoshow==1"
									   ng-model="custom.clicktoshow"/>
							</td>
							<td>
								<i class="icon icon-delete"
								   ng-click="removeCField(custom)"></i>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<div class="row nomargin" ng-show="tabActive==5">

			<div class="col-xs-12">
				<div class="col-xs-2 nopadding">
					<?php p($l->t('OTP Type')); ?>
				</div>
				<div class="col-xs-6 nopadding">
					<input type="radio" name="seletcOTPType" value="image"
						   ng-model="otpType" id="otpImg"><label
						for="otpImg"><?php p($l->t('Upload an image')); ?></label><br/>
					<input type="radio" name="seletcOTPType" value="string"
						   ng-model="otpType" id="otpStr"><label
						for="otpStr"><?php p($l->t('Set the secret manually')); ?></label>
				</div>
				<div class="col-xs-12 nopadding">
					<input type="file" qrread on-read="parseQR(qrdata)"
						   ng-show="otpType==='image'"/>
					<label
						ng-show="otpType==='string'"><?php p($l->t('Enter the two-factor secret')); ?>
						<input type="text"
							   ng-model="currentItem.otpsecret.secret"
							   class="otpSecret"/></label>
				</div>
			</div>
			<hr>
			<div
				class="col-sm-12"><?php p($l->t('Current OTP settings')); ?></div>
			<div class="col-sm-4">
				<img ng-src="{{currentItem.otpsecret.qrCode}}"
					 ng-show="currentItem.otpsecret.qrCode" height="120"
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
						<td><span pw="currentItem.otpsecret.secret"
								  toggle-text-stars></span> <a
								clip-copy="currentItem.otpsecret.secret"
								clip-click="copied('URL')"
								class="link">[<?php p($l->t('Copy')); ?>]</a>
						</td>
					</tr>
				</table>
			</div>
		</div>
	</div>
	<div class="buttons">
		<button class="button save" ng-click="saveItem(currentItem)">Save
		</button>
	</div>
</div>
<div id="encryptionKeyDialog" style="display: none;">
	<p><?php p($l->t('Enter your encryption key. If this is the first time you use Passman, this key will be used for encryption of your passwords')); ?></p>
	<input type="password" id="ecKey" style="width: 150px;" /><br/>
	<input type="checkbox" id="ecRemember" name="ecRemember"/><label for="ecRemember"><?php p($l->t('Remember this key ')); ?></label>
	<select id="rememberTime">
		<option value="15">15 <?php p($l->t('Minutes')); ?></option>
		<option value="15">30 <?php p($l->t('Minutes')); ?></option>
		<option value="60">60 <?php p($l->t('Minutes')); ?></option>
		<option value="180">3 <?php p($l->t('Hours')); ?></option>
		<option value="480">8 <?php p($l->t('Hours')); ?></option>
		<option value="1440">1 <?php p($l->t('Day')); ?></option>
		<option value="10080">7 <?php p($l->t('Days')); ?></option>
		<option value="43200">30 <?php p($l->t('Days')); ?></option>
	</select>
</div>
