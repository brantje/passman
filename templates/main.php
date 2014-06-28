<?php
\OCP\Util::addStyle('passman', 'jstree-theme/style');
\OCP\Util::addscript('passman', 'jstree.min');

\OCP\Util::addStyle('passman', 'simplePassMeter/simplePassMeter');
\OCP\Util::addscript('passman', 'jquery.simplePassMeter.min');

\OCP\Util::addscript('passman', 'encryption');
\OCP\Util::addscript('passman', 'jsStorage');

\OCP\Util::addscript('passman', 'zeroClipboard/zeroClipboard');

\OCP\Util::addStyle('passman', 'ocPassman');
\OCP\Util::addscript('passman', 'ocPassman');

?>
<div id="app">
	<div id="app-navigation">
	<div id="jsTree">
		
	  </div>
  	</div>
	<div id="app-content">
		<div id="topContent">
					<div id="crumbs">
							<div class="crumb last svg" data-dir="/documents">	
									<a>Root</a>
							</div>
					</div>  
					<button class="button " id="addItem" disabled="disabled">Create item</button>
					<button class="button" id="editItem" disabled="disabled">Edit item</button>
					<button class="button" id="deleteItem" disabled="disabled">Delete item</button>
		</div>
		<div id="pwList">
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
			<li>Label</li>
		</div>
		<div id="infoContainer">
			<table>
                <tbody><tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>Label :</td>
                    <td>
                        <input type="hidden" id="hid_label" value="">
                        <div id="id_label" style="display:inline;"></div>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>Description :</td>
                    <td>
                        <div id="id_desc" style="font-style:italic;display:inline;"></div><input type="hidden" id="hid_desc" value="">
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>Password :</td>
                    <td>
                        <div id="id_pw" style="float:left;"></div>
                        <input type="hidden" id="hid_pw" value="">
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>Account :</td>
                    <td>
                        <div id="id_login" style="float:left;"></div>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>Email :</td>
                    <td>
                        <div id="id_email" style="display:inline;"></div>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>URL :</td>
                    <td>
                        <div id="id_url" style="display:inline;"></div>
                    </td>
                </tr>
                <tr>
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float:left; margin-right:.3em;">&nbsp;</span>Files &amp; Images :</td>
                    <td>
                        <div id="id_files" style="display:inline;font-size:11px;"></div>
                        <div id="dialog_files" style="display: none;">

                        </div>
                    </td>
                </tr>

                <tr style="display: none;">
                    <td valign="top" class="td_title"><span class="ui-icon ui-icon-carat-1-e" style="float: left; margin-right: .3em;">&nbsp;</span>Tags :</td>
                    <td>
                        <div id="id_tags" style="display:inline;"></div>
                    </td>
                </tr>
                </tbody></table>
		</div>
	</div>
</div>
<div id="editAddItemDialog" style="display: none;">
   <form method="post" name="new_item" id="editNewItem">
   		<input type="hidden" id="item_id" name="item_id" value=""/>
   		<input type="hidden" id="folderid" name="folderid" value=""/>
        <div id="item_tabs">
        <ul role="tablist">
            <li><a href="#tabs-01">Definition</a></li>
            <li><a href="#tabs-02">Password &amp; Visibility</a></li>
            <li><a href="#tabs-03">Files &amp; Images</a></li>

        </ul>
        <div id="tabs-01">
            <label>Label : </label>
            <input type="text" name="label" id="label"><br />
            <label>Description : </label>
            <span id="desc_span">
                <textarea rows="5" name="desc" id="desc"></textarea>
            </span>
            <br>
            <label for="item_login" class="label_cpm">Login (if needed) : </label>
            <input type="text" name="account" id="account">
            <label for="" class="label_cpm">Email : </label>
            <input type="text" name="email" id="email">
            <label for="" class="label_cpm">URL : </label>
            <input type="text" name="url" id="url">
        </div>
        <div id="tabs-02">
            <div>
                <label>Required complexity</label>
                <span id="complex_attendue"><b>Not defined</b></span>
            </div>
            <label class="label_cpm">Password :</label>
            <input type="password" id="pw1" name="pw1">
            <label for="" class="label_cpm">Confirm :</label>
            <input type="password" name="pw2" id="pw2" >
            <label for="" class="label_cpm">Override required complexity : </label>
            <input type="checkbox" id="override">
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
                <br /><div id="passwordStrengthDiv"></div>
            </div>
         </div>
        <div id="tabs-03" >
                <div id="item_upload_list"></div><br>
                <span id="item_attach_pickfiles" class="button">select</span>
                <span id="item_attach_uploadfiles" class="button">Start uploading files</span>
            </div>
        </div>
        <div class="button cancel">Cancel</div>
        <div class="button save">Save</div>
        </div>
    </form>
</div>
  
 <div id="folderSettingsDialog" style="display: none;">
 	<form id="folderSettings">
 	<input type="hidden" name="folderId"  id="folderId"/>
 	<label for="edit_folder_complexity" class="label_cpm">Required complexity: </label><br />
    <select id="min_pw_strength" name="min_pw_strength">
                <option value="">---</option><option value="0">Very weak</option><option value="25">Weak</option><option value="50">Medium</option><option value="60">Strong</option><option value="70">Very strong</option><option value="80">Heavy</option><option value="90">Very heavy</option>
    </select><br />
    <label for="renewal_period" class="label_cpm">Renewal period (days): </label>
    <input type="text" name="renewal_period" id="renewal_period" >
    </form>
    <div class="button cancel">Cancel</div>
    <div class="button save">Save</div>
 </div> 

<div id="encryptionKeyDialog">
	<p>Eneter your encryption key.<br />If this if the first time you use Passman, this key will be used for encryption your passwords</p>
	<input type="password" id="ecKey" style="width: 150px;" /><br />
	<input type="checkbox" id="ecRemember" />Remeber this key for 
	<select id="rememberTime">
		<option value="15">15 Minutes</option>
		<option value="15">30 Minutes</option>
		<option value="60">60 Minutes</option>
		<option value="180">3 Hours</option>
		<option value="480">8 Hours</option>
		<option value="1440">1 Day</option>
		<option value="10080">7 Days</option>
		<option value="forever">Forever</option>
	</select>
	
</div>
<div id="notificationContainer">
	
</div>
  