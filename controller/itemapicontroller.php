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

use \OCA\Passman\BusinessLayer\ItemBusinessLayer;
use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;

class ItemApiController extends Controller {
    private $userId;
	private $ItemBusinessLayer;
	private $FolderBusinessLayer;
	public $request; 
	
    public function __construct($appName, IRequest $request,  ItemBusinessLayer $ItemBusinessLayer,$userId,FolderBusinessLayer $FolderBusinessLayer){
        parent::__construct($appName, $request);
        $this->userId = $userId;
		$this->ItemBusinessLayer = $ItemBusinessLayer;
		$this->request = $request;
		$this->FolderBusinessLayer = $FolderBusinessLayer;
    }


    /**
     * CAUTION: the @Stuff turn off security checks, for this page no admin is
     *          required and no CSRF check. If you don't know what CSRF is, read
     *          it up in the docs or you might create a security hole. This is
     *          basically the only required method to add this exemption, don't
     *          add it to any other method if you don't exactly know what it does
     * @NoAdminRequired
     */
	public function index($folderId) {
		$result['items'] = $this->ItemBusinessLayer->listItems($folderId,$this->userId); 
		return new JSONResponse($result);
	}
     /**
	 * @NoAdminRequired
     */
     public function get($itemId) {
     	$itemId = (int) $itemId;
		$result['item'] = $this->ItemBusinessLayer->get($itemId,$this->userId); 
		
		return new JSONResponse($result);
	}

	/**
	 * Create item function
	 * @param Folder ID 
	 *
	 * @NoAdminRequired
	 */
	public function create() {
		$errors = array();
		$userId = $this->userId;
		$label = $this->params('label');
		$folderId = $this->params('folderid');
		$desc = $this->params('desc');
		$account = $this->params('account');
		$pass = $this->params('pw1');
		$email = $this->params('email');
		$url = $this->params('url');
		$customFields = $this->params('customFields');
		
		if(empty($label)){
			array_push($errors,'Label is mandatory');
		}
		if(!is_numeric($folderId)){
			array_push($errors,'Folder id is not numeric');
		}
		$folderCheckResult = $this->FolderBusinessLayer->get($folderId,$userId);
		if(empty($folderCheckResult)){
			array_push($errors,'Folder not found');
		}
		
		if($folderCheckResult['renewal_period'] > 0){
			 $expiretime = date("c",strtotime("+". $folderCheckResult['renewal_period'] ." days"));
		}
		else {
			 $expiretime = 0;
		}
		
		if(empty($errors)){
			$result['itemid'] = $this->ItemBusinessLayer->create($folderId,$userId,$label,$desc,$pass,$account,$email,$url,$expiretime);
			if(!empty($customFields)){
				foreach ($customFields as $key => $field) {
					if(empty($field['id'])){
							$field->id = $this->ItemBusinessLayer->createField($field,$userId,$result['itemid']);
					}
					else {
						$field->id = $this->ItemBusinessLayer->updateField($field,$userId,$result['itemid']);
					}
				}
			} 
		} else {
			$result['errors'] = $errors;
		}
		return new JSONResponse($result); 
	}
	/**
	 * Update to create and edit items 
	 * @param Folder ID 
	 *
	 * @NoAdminRequired
	 */
	public function update($itemId) {
		$errors = array();
		$id = (int) $itemId;
		$userId = $this->userId;
		$label = $this->params('label');
		$folderId = $this->params('folderid');
		$desc = $this->params('desc');
		$account = $this->params('account');
		$pass = $this->params('pw1');
		$email = $this->params('email');
		$url = $this->params('url');
		$customFields = $this->params('customFields');
		if(empty($label)){
			array_push($errors,'Label is mandatory');
		}
		if(!is_numeric($folderId)){
			array_push($errors,'Folder id is not numeric');
		}
		$folderCheckResult = $this->FolderBusinessLayer->get($folderId,$userId);
		if(empty($folderCheckResult)){
			array_push($errors,'Folder not found');
		}
		$curItem =  $this->ItemBusinessLayer->get($itemId,$this->userId);
		if(empty($curItem)){
			array_push($errors,'Item not found');
		}
		if($folderCheckResult['renewal_period'] > 0){
			if($this->params('changedPw')=="true"){
			 $expiretime = date("c",strtotime("+". $folderCheckResult['renewal_period'] ." days"));
			}
			else {
				$expiretime = $curItem['expire_time'];
			}
		}
		else {
			
			$expiretime = 0;
		}
		if(empty($errors)){
			$result['success'] = $this->ItemBusinessLayer->update($id,$folderId,$userId,$label,$desc,$pass,$account,$email,$url,$expiretime);
			if(!empty($customFields)){
				foreach ($customFields as $key => $field) {
					if(empty($field['id'])){
							$field->id = $this->ItemBusinessLayer->createField($field,$userId,$id);
					}
					else {
						$field->id = $this->ItemBusinessLayer->updateField($field,$userId,$result['itemid']);
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
	public function moveitem($itemId,$folderId){
		$errors = array();
		$curItem =  $this->ItemBusinessLayer->get($itemId,$this->userId);
		if(empty($curItem)){
			array_push($errors,'Item not found');
		}
		if(empty($errors)){
			$result = $this->ItemBusinessLayer->moveItem($itemId,$folderId,$this->userId);
		} else {
			$result['errors'] = $errors;
		}
		return new JSONResponse($result);
	}
	/**
	 * @NoAdminRequired
	 */
	public function search($itemName) {
		$deleted['deleted']	=$this->ItemBusinessLayer->search($itemName,$this->userId);
		return new JSONResponse($deleted['deleted']); 
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function delete($itemId) {
		$errors = array();
		$findItem = $this->ItemBusinessLayer->get($itemId);
		if(empty($findItem)){
			array_push($errors,'Item not found');
		}
		if(empty($errors)){
			$result['deleted']	=$this->ItemBusinessLayer->delete($itemId,$this->userId);
		}else {
			$result['errors'] = $errors;
		}
		return new JSONResponse($result['deleted']); 
	}

	/**
	 * 
	 * @NoAdminRequired
	 */
	public function deleteByFolderId($folderId){
		$errors = array();
		$checkFolder = $this->FolderBusinessLayer->get($folderId);
		if(empty($checkFolder)){
			array_push($errors,'Folder not found');
		}
		
		if(empty($errors)){
			$result['deleted']	=$this->ItemBusinessLayer->deleteByFolder($folderId,$this->userId);
		}else {
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
						item_id : itemId,
						filename : file.name,
						type : file.type,
						mimetype : mimeType,
						size : file.size,
						content : encryptedFile
					}
	 * @NoAdminRequired
	 */
	public function addfile($itemId){
		//echo $itemId;
		$errors = array();
		$file = array();
		$file['item_id'] = $this->params('item_id');
		$file['filename'] = $this->params('filename');
		$file['type'] = $this->params('type');
		$file['mimetype'] = $this->params('mimetype');
		$file['size'] = $this->params('size');
		$file['content'] = $this->params('content');
		$file['user_id'] = $this->userId;
		
		$checkId = $this->get($itemId);
		if(empty($checkId)){
			array_push($errors,'Item not found');
		}
		if(empty($errors)){
			$result = $this->ItemBusinessLayer->addFileToItem($file);	
		} else {
		 	$result['errors'] = $error;
		}
		return new JSONResponse($result);  
	}
	
	/**
	 * GetFile get a single file and his content
	 * @NoAdminRequired
	 */
	 public function getfile($fileId){
		return new JSONResponse($this->ItemBusinessLayer->getFile($fileId,$this->userId));  
	}
	 
	/**
	  * @NoAdminRequired
	 */ 
	public function deletefile($fileId){
		return new JSONResponse($this->ItemBusinessLayer->deleteFile($fileId,$this->userId));  
	}
	

}
