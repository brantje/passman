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
      Regenerate server keys:
      <input  class="regenerateShareKeys" type="button" value="Regenerate" original-title="">
    </div>
  </form>
</div>