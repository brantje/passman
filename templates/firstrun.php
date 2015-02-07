<div id="firstRun">
	<div id="fieldsetContainer">
		<fieldset>
			<legend><?php p($l->t('Welcome')); ?></legend>
				<?php p($l->t('Welcome to Passman, the password manager for ownCloud!'));?>
				<br />
				<?php p($l->t('In the next steps you will learn how to use it.')); ?>
		</fieldset>
		<fieldset>
			<legend><?php p($l->t('Tags')); ?></legend>
			<?php p($l->t('These are your example tags.'));?><br />
			<?php p($l->t('Tags can be assigned to passwords, giving them common properties like minimal')); ?> <span tool-tip title="<?php p($l->t('Passman automatically computes a score for each password to estimate its strength. A higher score means a stronger password.')); ?>" style="border-bottom: 1px dashed black"><?php p($l->t('password score')); ?></span> <?php p($l->t('and renewal time.')); ?><br />
			<?php p($l->t('For example, a "banking" tag could require a') . ' '); ?><span tool-tip title="<?php p($l->t('Passman automatically computes a score for each password to estimate its strength. A higher score means a stronger password.')); ?>" style="border-bottom: 1px dashed black"><?php p($l->t('password score')); ?></span> <?php p($l->t('of 60 and to be changed every month.')); ?><br />
			<?php p($l->t('While a "forums" tag requires a') . ' '); ?><span tool-tip title="<?php p($l->t('Passman automatically computes a score for each password to estimate its strength. A higher score means a stronger password.')); ?>" style="border-bottom: 1px dashed black"><?php p($l->t('password score')); ?></span> <?php p($l->t('of 30 and to be changed every year.')); ?>
			<br />
			<br />
			<b><?php p($l->t('Assignment: Change the example tags to your likings, then click next.')); ?></b>
			<br />
			<?php p($l->t('Hint: Mouse over the tags to see the') . ' '); ?><i class="icon icon-settings"></i> <?php p($l->t('icon')); ?>.

		</fieldset>
		<fieldset>
			<legend><?php p($l->t('Set encryption key')); ?></legend>
			<?php p($l->t('This key is used to encrypt all your sensitive data.')); ?><br />
			<b><?php p($l->t('This key is private and never sent to the server.')); ?></b><br />
			<?php p($l->t('Enter your encryption key in the field below')); ?><br />
			<input id="frEncKey" type="password" autocomplete="false">
		</fieldset>
		<fieldset>
			<legend><?php p($l->t('Items')); ?></legend>
			<?php p($l->t('Here are your example items, you\'re free to edit or delete them.')); ?><br />
			<?php p($l->t('Items contain your username / password or any other sensitive information.')); ?><br />

			<?php p($l->t('Hint: click on the arrow')); ?> (<i class="icon icon-caret-dark more"></i>) <?php p($l->t('to expand a menu to display various options for an item.')); ?>
		</fieldset>
		<fieldset>
			<legend>
				<?php p($l->t('Editing items')); ?>
			</legend>
			<span id="introEdit"><?php p($l->t('Click on edit to edit an item')); ?></span><br />
			<ul style="list-style-type: none;" class="firstRunUl">
				<li>
					<b><?php p($l->t('General')); ?></b><br />
					<?php p($l->t('Your general password info is here.')); ?><br />
					<?php p($l->t('E.g.: The label of the item, Login / username, email.')); ?><br />
					<?php p($l->t('There is also a password field.')); ?>
				</li>
				<li>
					<b><?php p($l->t('Password')); ?></b><br />
					<?php p($l->t('Password generation & password generation settings.')); ?><br />
					<?php p($l->t('If you require a more complex password, this is the tab you need')); ?><br />
					<?php p($l->t('It has a built-in password generator with many settings.')); ?>
				</li>
				<li>
					<b><?php p($l->t('Files')); ?></b><br />
					<?php p($l->t('You can upload files with a maximum of 5 MB.')); ?><br />
					<?php p($l->t('Files are first encrypted with your encryption key and then sent to the server.')); ?><br />
					<?php p($l->t('Because encryption / decryption is a complex process it can take a while on mobile phones.')); ?>
				</li>
				<li>
					<b><?php p($l->t('Custom fields')); ?></b><br />
					<?php p($l->t('If the default fields are not sufficient for you, then you can add your own fields here.')); ?><br />
					<?php p($l->t('It also offers an option to let the value be hidden so it is handled as a password.')); ?>
				</li>
				<li>
					<b><?php p($l->t('OTP Settings')); ?></b><br />
					<?php p($l->t('Passman has a built-in OTP (One Time Password) generator.')); ?><br />
					<?php p($l->t('If you don\'t know what a OTP is then I suggest you enable it.')); ?><br />
					<?php p($l->t('Services that have options for a One Time Password')); ?><br />
					- <a href="https://help.github.com/articles/about-two-factor-authentication/" target="_blank"><?php p($l->t('GitHub'));?></a><br />
					- <a href="https://www.google.com/landing/2step/" target="_blank"><?php p($l->t('Google')); ?></a><br />
					- <a href="https://www.dropbox.com/en/help/363" target="_blank"><?php p($l->t('Dropbox')); ?></a><br />
					- <a href="http://windows.microsoft.com/en-us/windows/two-step-verification-faq" target="_blank"><?php p($l->t('OneDrive')); ?></a><br />
					- <a href="http://support.apple.com/en-us/HT204152" target="_blank"><?php p($l->t('iCloud')); ?></a><br />
				<?php p($l->t('And a lot')); ?> <a href="https://twofactorauth.org/"><?php p($l->t('more')); ?></a>.
				</li>
			</ul>
		</fieldset>
		</div>


	</div>
