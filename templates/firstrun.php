<div>
	<div id="firstRun">
		<div id="fieldsetContainer">
			<fieldset>
				<legend>Welcome</legend>
				Welcome to PassMan, the password manager for ownCloud!<br />In the next steps you will learn how to use it.
			</fieldset>
			<fieldset>
				<legend>Tags</legend>
				<br />Your tags will appear here.<br />An tag has 2 settings:<br />
				- Required password score -> The minimum password score the password must match when this tag is applied<br /><br />
				- Renewal period (days) -> When this is set, you will be notified when its time to renew the password<br />
				<br />
				<br />
				<b>Assignment: Change the example tags to your likings, then click next.</b>
				<br />
				Hint: Mouse over the tags to see the <i class="icon icon-settings"></i> icon.

			</fieldset>
			<fieldset>
				<legend>Set encryption key</legend>
				This key is used to encrypt all your sensive data.<br />
				<b>This key is private and never send to the server</b><br />
				Enter your encryption key in the field below<br />
				<input id="frEncKey" type="password" autocomplete="false">
			</fieldset>
			<fieldset>
				<legend>Items</legend>
				Here are your example items, you're free to edit or delete them.<br />
				Items contain your username / password or any other sensitive information.<br />

				Hint: click on the arrow (<i class="icon icon-caret-dark more"></i>) to expand an menu to display various options for an item.
			</fieldset>
			<fieldset>
				<legend>
					Editing items
				</legend>
				<span id="introEdit">Click on edit to edit an item</span><br />
				<ul style="list-style-type: none;" class="firstRunUl">
					<li>
						<b>General</b><br />
						Your general password info is here.<br />
						Eg: The label of the item, Login / username, email.
						Also there is an password field.
					</li>
					<li>
						<b>Password</b><br />
						Password generation & password generation settings.<br />
						If you require a more complex password, this is the tab you need<br />
						It has an build in password generator with many settings.
					</li>
					<li>
						<b>Files</b><br />
						You can upload files, with a max of 5Mb.<br />
						Files are first encrypted with your encryption key and then send to the server.<br />
						Because encryption / decryption is a complex process it can take a while on mobile phones.
					</li>
					<li>
						<b>Custom fields</b><br />
						If the default fields are not enough your you, then here you can add your own fields.<br />
						It also offers an option to let the value be hidden so it is handled as a password.
					</li>
					<li>
						<b>OTP Settings</b><br />
						Passman has a build in OTP (One Time Password) generator.<br />
						If you don't know what a OTP is then i suggest you enable it.<br />
						Services that have options for a One Time Password<br />
						- <a href="https://help.github.com/articles/about-two-factor-authentication/" target="_blank">Github</a><br />
						- <a href="https://www.google.com/landing/2step/" target="_blank">Google</a><br />
						- <a href="https://www.dropbox.com/en/help/363" target="_blank">Dropbox</a><br />
						- <a href="http://windows.microsoft.com/en-us/windows/two-step-verification-faq" target="_blank">OneDrive</a><br />
						- <a href="http://support.apple.com/en-us/HT204152" target="_blank">iCloud</a><br />
						And a lot <a href="https://twofactorauth.org/">more</a>.
					</li>
				</ul>
			</fieldset>
			</div>


		</div>
</div>