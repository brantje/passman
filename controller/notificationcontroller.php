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

class NotificationController extends Controller {
  private $userId;



  public function __construct($appName, $request, $userId) {
    parent::__construct($appName, $request);
    $this->userId = $userId;
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
   * @subject = One of these: item_created, item_edited, item_apply_revision
   *                          item_deleted, item_recovered, item_destroyed,
   *                          item_expired, item_shared
   *
   *
   *
   *
   * @subjectParams =  Subject     | Subject params
   *                  item_created = array($itemName,$user)
   *                  item_edited = array($itemName,$user)
   *                  item_apply_revision = array($itemName,$user,$revision);
   *                  item_deleted = array($itemName,$user)
   *                  item_recovered = array($itemName,$user)
   *                  item_destroyed = array($itemName,$user)
   *                  item_expired = array($itemName)
   *                  item_shared = array($itemName)
   * @message = Custom message (not needed)
   * @messageParams = Message params (not needed)
   * @link = will be -> <ownCloud>/apps/activity/$link
   * @user = Target user
   * @type = Can be passman_password or passman_password_shared
   * @priority = Int -> [10,20,30,40,50]
   */
  public function add($subject,$subjectParams=array(),$message='',$messageParams=array(),$link='',$user=null,$type='',$priority=30) {
    $affectedUser = ($user) ? $user : $this->userId;
    //$type = 'passman_'.$subject;

    \OC::$server->getActivityManager()-> publishActivity(
    'passman',
    $subject,
    $subjectParams,
    $message,
    $messageParams,
    null,
    $link, //The link (No more doc yet)
    $affectedUser,
    $type,
    $priority
    );
	return array('success'=>'ok');
  }
}
