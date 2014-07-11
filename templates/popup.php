<?php
\OCP\Util::addStyle('passman', 'simplePassMeter/simplePassMeter');
\OCP\Util::addscript('passman', 'jquery.simplePassMeter.min');
\OCP\Util::addscript('passman', 'encryption');
\OCP\Util::addscript('passman', 'jsStorage');
\OCP\Util::addStyle('passman', 'ocPassman');
\OCP\Util::addStyle('passman', 'popup');
\OCP\Util::addScript('passman', 'popup');
print_unescaped('<script> var folder = ' . $_['folders'] . '</script>');
print_unescaped('<script> var foldersPlain = ' . $_['foldersPlain'] . '</script>');
?>

<form class="addPw">

	<h1>Add a password</h1>
	<div class="close_btn">
		<a href="javascript:self.close()" class="ui-icon ui-icon-closethick"> Close </a>
	</div>
	<fieldset class="pw_desc">
		<ul>
			<li>
				<label for="label">Label: </label>
				<input type="text" name="label" class="label" value="<?php p($_['label']); ?>"
				placeholder="Label" />
			</li>

			<li>
				<label for="url">URL: </label>
				<input type="text" name="url" class="url_input" value="<?php p($_['url']); ?>"
				placeholder="URL" />
			</li>
			<li>
				<label for="account">Account: </label>
				<input type="text" name="account" class="account"	placeholder="Account" />
			</li>
			<li>
				<label for="email">Email: </label>
				<input type="text" name="email" class="email"	placeholder="e-mail" />
			</li>
			<li>
				<label for="url">Password: </label>
				<input type="password" name="pw1" id="pw1"/><br />
				<div id="pwTools">
                <span id="custom_pw">
                    <input type="checkbox" id="pw_numerics" checked="checked"><label for="pw_numerics">123</label>
                    <input type="checkbox" id="pw_maj" checked="checked"><label for="pw_maj">ABC</label>
                    <input type="checkbox" id="pw_symbols"><label for="pw_symbols">@#&amp;</label>
                    &nbsp;<label for="pw_size">Size : </label>
                    &nbsp;<span ><input type="number" size="2" id="pw_size" value="8" style="font-size:10px;" ></span>
                </span>
                <span class="icon-history icon" title="Generate password"></span>
                <span class="icon-paste icon" title="Copy password"></span>
                <span title="Mask/Display the password" class="icon icon-toggle"></span>
            	</div>
			</li>
			<li>
				<label for="url">Repeat password: </label>
				<input type="password" name="pw2"  id="pw2"/>
				
				<div id="passwordStrengthDiv"></div>
			</li>

			<li>
				<label for="folder">Folder: </label><br /><select id="folder" id="folder" name="folder"></select>Required complexity: <span id="complex_attendue">Very weak</span>  
			</li>

			<li>
				<textarea name="desc" class="desc" value=""
					placeholder="Description"></textarea>
			</li>

			<li>
				<input type="button" id="save" class="submit button" value="Save" />
			</li>

		</ul>

	</fieldset>
</form>

<div id="encryptionKeyDialog" style="display: none;">
	<p>Enter your encryption key.<br />If this if the first time you use Passman, this key will be used for encryption your passwords</p>
	<input type="password" id="ecKey" style="width: 150px;" /><br />
	<input type="checkbox" id="ecRemember" name="ecRemember"/><label for="ecRemember">Remeber this key for</label> 
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