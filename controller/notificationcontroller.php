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
   */
  public function add($subject,$subjectParams=array(),$message='',$messageParams=array(),$link,$user=null,$type,$priority) {
    $affectedUser = ($user) ? $user : $this->userId;
    \OC::$server->getActivityManager()-> publishActivity(
    'passman',
    $subject,// The subject. Eg: '%s shared an item with you' %s is given in the parameter below
    $subjectParams, //The parameters. The number of %s must match the array's length
    $message, // Message, see: subject
    $messageParams, //Message params: see subjectParams
    null,
    $link, //The link (No more doc yet)
    $affectedUser, //The affected user
    $type, // Type of activity eg: password_edited
    $priority // Prio see below
    /*
      const PRIORITY_VERYLOW  = 10;
      const PRIORITY_LOW      = 20;
      const PRIORITY_MEDIUM   = 30;
      const PRIORITY_HIGH     = 40;
      const PRIORITY_VERYHIGH = 50;
     */
    );
	$response = func_get_args();
	return $response;
      /*'passman',
      $msg, array($item->name), 'Message that item is expired', array(),
    '', '', $this->user, '', PRIORITY_MEDIUM)*/;
  }
}