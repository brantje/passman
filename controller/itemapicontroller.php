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

use OCA\Passman\Activity;
use \OCA\Passman\BusinessLayer\TagBusinessLayer;
use \OCA\Passman\BusinessLayer\ItemBusinessLayer;
use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;

class ItemApiController extends Controller {
  private $userId;
  private $ItemBusinessLayer;
  private $tagBusinessLayer;
  private $faviconFetcher;
  private $revisionController;
  private $notification;

  public function __construct($appName, IRequest $request, ItemBusinessLayer $ItemBusinessLayer, $userId, $tagBusinessLayer, $faviconFetcher, $revisionController,$notificationController) {
    parent::__construct($appName, $request);
    $this->userId = $userId;
    $this->ItemBusinessLayer = $ItemBusinessLayer;
    $this->tagBusinessLayer = $tagBusinessLayer;
    $this->request = $request;
    $this->faviconFetcher = $faviconFetcher;
    $this->revisionController = $revisionController;
    $this->notification = $notificationController;
  }


  /**
   * CAUTION: the @Stuff turn off security checks, for this page no admin is
   *          required and no CSRF check. If you don't know what CSRF is, read
   *          it up in the docs or you might create a security hole. This is
   *          basically the only required method to add this exemption, don't
   *          add it to any other method if you don't exactly know what it does
   *
   * @NoAdminRequired
   */
  public function index() {
    $result['items'] = $this->ItemBusinessLayer->listItems($this->userId);
    return new JSONResponse($result);
  }

  /**
   * CAUTION: the @Stuff turn off security checks, for this page no admin is
   *          required and no CSRF check. If you don't know what CSRF is, read
   *          it up in the docs or you might create a security hole. This is
   *          basically the only required method to add this exemption, don't
   *          add it to any other method if you don't exactly know what it does
   *
   * @NoAdminRequired
   */
  public function getdeleted($tags) {
    //$tags = $this->params('tags');
    $tags = (empty($tags)) ? false : $tags;
    $result['items'] = $this->ItemBusinessLayer->getByTag($tags, $this->userId, true);
    return new JSONResponse($result);
  }

  /**
   * @NoAdminRequired
   */
  public function get($id) {
    $itemId = $id;
    $result['item'] = $this->ItemBusinessLayer->get($itemId, $this->userId);

    return new JSONResponse($result);
  }

  /**
   * @NoAdminRequired
   *
   */
  public function getbytag($id,$tags) {
    $itemId = $id;
    //$tags = $this->params('tags');
    $tags = (empty($tags)) ? false : $tags;
    $result['items'] = $this->ItemBusinessLayer->getByTag($tags, $this->userId, false);

    return new JSONResponse($result);
  }

  /**
   * Create item function
   *
   * @param Folder ID
   *
   * @NoAdminRequired
   */
  public function create($account,$created,$description,$email,$favicon,$label,$password,$expire_time,$url,$otpsecret,$tags,$customFields) {
    $errors = array();
    $userId = $this->userId;
    $item['account'] = $account;
    $item['created'] = $created;
    $item['description'] = $description;
    $item['email'] = $email;
    $item['favicon'] = $favicon;
    $item['label'] = $label;
    $item['password'] =  $password;
    $item['expire_time'] = ($expire_time) ? $expire_time : 0;
    $item['user_id'] = $this->userId;
    $item['url'] = $url;
    $item['otpsecret'] = $otpsecret;


    if (empty($item['label'])) {
      array_push($errors, 'Label is mandatory');
    }
    if (empty($errors)) {
      $result['itemid'] = $this->ItemBusinessLayer->create($item);
      if (!empty($customFields)) {
        foreach ($customFields as $key => $field) {
          if (empty($field['id'])) {
            $field->id = $this->ItemBusinessLayer->createField($field, $userId, $result['itemid']);
          } else {
            $field->id = $this->ItemBusinessLayer->updateField($field, $userId, $result['itemid']);
          }
        }
      }
      if (!empty($tags)) {
        //$this->tagBusinessLayer->removeTags($id);
        foreach ($tags as $tag) {
          $t = $this->tagBusinessLayer->search($tag['text'], $userId, true);
          if ($t) {
            $this->tagBusinessLayer->linkTagXItem($tag['text'], $userId, $result['itemid']);
          } else {
            $this->tagBusinessLayer->create($tag['text'], $userId);
            $this->tagBusinessLayer->linkTagXItem($tag['text'], $userId, $result['itemid']);
          }
        }
      }
    } else {
      $result['errors'] = $errors;
    }
    $remoteUrl = \OCP\Util::linkToRoute('passman.page.index').'#selectItem='. $result['itemid'];
    $this->notification->add(Activity::SUBJECT_ITEM_CREATED_SELF,array($item['label'],$this->userId),'',array(),$remoteUrl, null, Activity::TYPE_ITEM_ACTION);
    $item['id'] = $result['itemid'];
    return new JSONResponse($item);
  }

  /**
   * Mass Update items
   *
   * @param Folder ID
   *
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function massupdate($items,$files,$revs) {
    /*



    */
    foreach($items as $item){
     $this->update(
        $item['id'],
        $item['account'],
        $item['created'],
        $item['description'],
        $item['email'],
        $item['favicon'],
        $item['label'],
        $item['password'],
        $item['expire_time'],
        $item['delete_date'],
        $item['url'],
        $item['otpsecret'],
        $item['tags'],
        $item['customFields'],
        false,
        false,
        false,
        true
      );
    }
    foreach($files as $file){
      $this->deletefile($file['id']);
      $this->addfile($file['item_id'],$file['filename'],$file['type'],$file['mimetype'],$file['size'],$file['content']);
    }
    foreach($revs as $revision){
      $this->revisionController->update($revision);
    }

    $response = array("success"=>true);
    return new JSONResponse($response);
  }

  /**
   * Update to create and edit items
   *
   * @param Folder ID
   *
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function update($id,$account,$created,$description,$email,$favicon,$label,$password,$expire_time,$delete_date=0,$url,$otpsecret,$tags,$customFields,$restoredRevision=false,$isDeleted=false,$isRecovered=false,$skipNotifications=false) {
    $errors = array();

    $item = array();
    $item['id'] = $id;
    $item['account'] = $account;
    $item['created'] = $created;
    $item['description'] = $description;
    $item['email'] = $email;
    $item['favicon'] = $favicon;
    $item['label'] = $label;
    $item['password'] = $password;
    $item['expire_time'] = $expire_time;
    $item['delete_date'] = $delete_date;
    $item['url'] = $url;
    $item['otpsecret'] = $otpsecret; $this->params('otpsecret');


    $maxRenewalPeriod = 0;
    if (empty($label)) {
      array_push($item['label'], 'Label is mandatory');
    }

    $curItem = $this->ItemBusinessLayer->get($id, $this->userId);
    if (empty($curItem)) {
      array_push($errors, 'Item not found');
    }


    if (empty($errors)) {


      if (!empty($customFields)) {
        $customFieldsInDB = $this->ItemBusinessLayer->getItemFields($item['id'], $this->userId);
        foreach ($customFields as $key => $field) {
          if (empty($field['id'])) {
            $field->id = $this->ItemBusinessLayer->createField($field, $this->userId, $item['id']);
          } else {
            $field->id = $this->ItemBusinessLayer->updateField($field, $this->userId, $item['id']);
          }
        }
      }
      if (!empty($tags)) {
        $this->tagBusinessLayer->removeTags($id);
        foreach ($tags as $tag) {
          $r = $this->tagBusinessLayer->search($tag['text'], $this->userId);
          if ($r) {
            $this->tagBusinessLayer->linkTagXItem($tag['text'], $this->userId, $item['id']);
            if ($r[0]['renewal_period'] > $maxRenewalPeriod) {
              $maxRenewalPeriod = $r[0]['renewal_period'];
            }
          } else {
            $this->tagBusinessLayer->create($tag['text'], $this->userId);
            $this->tagBusinessLayer->linkTagXItem($tag['text'], $this->userId, $item['id']);
          }
        }
      }
      if ($maxRenewalPeriod > 0 && ($item['expire_time'] == "" || $item['expire_time'] == "0")) {
        $item['expire_time'] = strtotime("+" . $maxRenewalPeriod . " days") * 1000;
      }
      $result['success'] = $this->ItemBusinessLayer->update($item);
      $this->revisionController->save($item['id'],json_encode($curItem));
;
      $remoteUrl = \OC::$server->getURLGenerator()->linkToRoute('passman.page.index').'#selectItem='. $item['id']; //\OCP\Util::linkToRoute().;
      $self = ($curItem['user_id'] == $this->userId) ? '_self' : '';
      if(!$skipNotifications){
        if(!$restoredRevision && !$isDeleted &&!$isRecovered){
          if($curItem['label'] == $item['label']) {
            $this->notification->add('item_edited' . $self, array($curItem['label'], $this->userId), '', array(), $remoteUrl, null, Activity::TYPE_ITEM_ACTION);
          } else {
            $this->notification->add('item_renamed' . $self, array($curItem['label'],$item['label'], $this->userId), '', array(), $remoteUrl, null, Activity::TYPE_ITEM_ACTION);
          }
        } else {
          if($restoredRevision) {
            $restoredRevision = \OC::$server->query('DateTimeFormatter')->formatDateTime($restoredRevision,'long', 'short');
            $this->notification->add('item_apply_revision'.$self, array($curItem['label'], $this->userId, $restoredRevision),'',array(),$remoteUrl,null, Activity::TYPE_ITEM_ACTION);
          }
          if($isDeleted){
            $this->notification->add('item_deleted'.$self,array($curItem['label'],$this->userId),'',array(),'', null, Activity::TYPE_ITEM_ACTION);
          }
          if($isRecovered){
            $this->notification->add('item_recovered'.$self,array($curItem['label'],$this->userId),'',array(),$remoteUrl,null, Activity::TYPE_ITEM_ACTION);
          }
        }
      }
    } else {
      $result['errors'] = $errors;
    }

    return new JSONResponse($result);
  }

  /**
   * @NoAdminRequired
   */
  public function search($q) {
    $deleted['deleted'] = $this->ItemBusinessLayer->search($q, $this->userId);
    return new JSONResponse($deleted['deleted']);
  }

  /**
   * @NoCSRFRequired
   * @NoAdminRequired
   */
  public function addtag($itemId,$tag) {


    $item = $this->ItemBusinessLayer->get($itemId, $this->userId);
    $tags = explode(',', $item->tags);
    if (!in_array($tag, $tags)) {
      $this->tagBusinessLayer->linkTagXItem($tag, $this->userId, $itemId);
    }
  }

  /**
   * @NoAdminRequired
   */
  public function delete($id) {
    $errors = array();
    $itemId = $id;
	  $userId = $this->userId;
    $findItem = $this->ItemBusinessLayer->get($itemId,$userId);
    if (empty($findItem)) {
      array_push($errors, 'Item not found');
    }
    if (empty($errors)) {
      $result['deleted'] = $this->ItemBusinessLayer->delete($itemId, $this->userId);
      $self = ($findItem['user_id'] == $this->userId) ? '_self' : '';
      $this->notification->add('item_destroyed'.$self,array($findItem['label'],$this->userId),'',array(),'', null, Activity::TYPE_ITEM_ACTION);
    } else {
      $result['errors'] = $errors;
    }
    return new JSONResponse($result['deleted']);
  }

  /**
   * @NoAdminRequired
   */
  public function deletefield($id) {
    $errors = array();
	$result = array();
    $findItem = $this->ItemBusinessLayer->deleteField($id, $this->userId);

    return new JSONResponse($result['deleted']);
  }

  /**
   * @NoAdminRequired
   */
  public function restore($id) {
    $errors = array();
    $itemId = $id;
	  $userId = $this->userId;
    $findItem = $this->ItemBusinessLayer->get($itemId,$userId);
    if (empty($findItem)) {
      array_push($errors, 'Item not found');
    }
    if (empty($errors)) {
      $result['restored'] = $this->ItemBusinessLayer->restore($itemId, $this->userId);

    } else {
      $result['errors'] = $errors;
    }
    return new JSONResponse($result);
  }


  /**
   * @TODO move the file functions to a seperate class
   *
   *
   * addFile
   * File has to be encrypted with the users key.
   * postData = {
   * item_id : itemId,
   * filename : file.name,
   * type : file.type,
   * mimetype : mimeType,
   * size : file.size,
   * content : encryptedFile
   * }
   * @NoAdminRequired
   */
  public function addfile($item_id,$filename,$type,$mimetype,$size,$content) {
    //echo $itemId;
    $errors = array();
    $file = array();
    $file['item_id'] = $item_id;
    $file['filename'] = $filename;
    $file['type'] = $type;
    $file['mimetype'] = $mimetype;
    $file['size'] = $size;
    $file['content'] = $content;
    $file['user_id'] = $this->userId;

    $checkId = $this->get($item_id);
    if (empty($checkId)) {
      array_push($errors, 'Item not found');
    }
    if (empty($errors)) {
      $result = $this->ItemBusinessLayer->addFileToItem($file);
    } else {
      $result['errors'] = $errors;
    }
    return new JSONResponse($result);
  }

  /**
   * GetFile get a single file and his content
   *
   * @NoAdminRequired
   */
  public function getfile($id) {
    return new JSONResponse($this->ItemBusinessLayer->getFile($id, $this->userId));
  }

  /**
   * GetFile get a single file and his content
   *
   * @NoAdminRequired
   */
  public function getfavicon($hash) {
    $url = base64_decode($hash);
    $favicon = $this->faviconFetcher->fetch($url);
    $response['favicon'] = $favicon;
    return new JSONResponse($response);
  }

  /**
   * @NoAdminRequired
   */
  public function deletefile($id) {
    return new JSONResponse($this->ItemBusinessLayer->deleteFile($id, $this->userId));
  }


}
