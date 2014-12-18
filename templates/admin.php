<div class="section" id="passman">
  <h2>Passman</h2>
  <p><?php p($l->t('Sync ownCloud to openfire')) ?></p>
  <div id="openfireConfigServer">
    <input type="text" name="openfire_server_url" id="openfire_server_url"
           value="<?php p($_['openfire_server_url'])?>"
           original-title="<?php p($l->t('domain.tld[:port]')) ?>"
           placeholder="<?php p($l->t('domain.tld[:port]')) ?>"
           style="width:250px;"
    />
    <br /><em><?php p($l->t('Openfire host')) ?></em>
  </div>
  <div id="openfireConfigKey">
    <input type="text" name="openfire_secret_key" id="openfire_secret_key"
           value="<?php p($_['openfire_secret_key'])?>"
           style="width:250px;"
    />
    <br /><em><?php p($l->t('Secret key')) ?></em>
  </div>
  <br /><button type="button" id="openfire_apply"><?php p($l->t('Apply')) ?></button><span id="ofr"></span>
</div>