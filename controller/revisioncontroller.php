<?php
/**
 * ownCloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Sander Brand <brantje@gmail.com>
 * @copyright Sander Brand 2014
 */

namespace OCA\Passman\Controller;

use \OCA\Passman\BusinessLayer\TagBusinessLayer;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;

class RevisionController extends Controller {
  private $userId;
  private $revisionManager;


  public function __construct($appName, $request, $userId,$revisionManager) {
    parent::__construct($appName, $request);
    $this->userId = $userId;
    $this->revisionManager = $revisionManager;
  }

  /**
   * CAUTION: the @Stuff turn off security checks, for this page no admin is
   *          required and no CSRF check. If you don't know what CSRF is, read
   *          it up in the docs or you might create a security hole. This is
   *          basically the only required method to add this exemption, don't
   *          add it to any other method if you don't exactly know what it does
   *
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function save($id,$data) {

    $this->revisionManager->save($id,$this->userId,$data);
  }

  /**
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  function getrevisions($id){
    $result = $this->revisionManager->getRevisions($id,$this->userId);
    return $result;
  }

  /**
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  function getallrevisions(){
    $result = $this->revisionManager->getAllRevisions($this->userId);
    return $result;
  }
  function update($revision){
    $result = $this->revisionManager->update($revision);
    return $result;
  }

}