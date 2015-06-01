<div class="section" id="passman">
  <h2>Passman</h2>
  <form name="passman">
    <div>
      <label><input type="checkbox" name="disableSharingNonHTTPS" value="<?php p($_['disableSharingNonHTTPS']); ?>">Disable sharing on HTTP pages</label>
    </div>
    <div>
      <label>Key length server
        <select name="keyLengthServer">
          <option value="1024">1024</option>
          <option value="2048">2048</option>
          <option value="4096">4096</option>
        </select>
      </label>
    </div>
    <div>
      <label>Key length client
        <select name="keyLengthClient">
          <option value="1024">1024</option>
          <option value="2048">2048</option>
          <option value="4096">4096</option>
        </select>
      </label>
    </div>

    <div>
      <label>Server public key<br />
       <textarea name="publicServerKey">
         <?php p($_['publicServerKey']); ?>
       </textarea>
      </label>
    </div>
    <div>
      <label>Server private key<br />
        <textarea name="privateServerKey">
         <?php p($_['privateServerKey']); ?>
       </textarea>
      </label>
    </div>
    <div>
      <input class="sharingKeyServerSettings" type="button" value="Key generation settings" />
      <input  class="regenerateShareKeys" type="button" value="Regenerate server keys" original-title=""/>
      <span id="sharingGenerationSettings" style="visibility: collapse; ">
        <form name="passman_server_key">
          <input type="text" name="keyLength" />
          <input type="text" name="serverName" />
        </form>
      </span>
    </div>
  </form>
</div>