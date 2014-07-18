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
	private $tagBusinessLayer;
	public $request; 
	
    public function __construct($appName, IRequest $request,  ItemBusinessLayer $ItemBusinessLayer,$userId,$tagBusinessLayer){
        parent::__construct($appName, $request);
        $this->userId = $userId;
		$this->ItemBusinessLayer = $ItemBusinessLayer;
		$this->tagBusinessLayer = $tagBusinessLayer;
		$this->request = $request;
    }


    /**
     * CAUTION: the @Stuff turn off security checks, for this page no admin is
     *          required and no CSRF check. If you don't know what CSRF is, read
     *          it up in the docs or you might create a security hole. This is
     *          basically the only required method to add this exemption, don't
     *          add it to any other method if you don't exactly know what it does
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
     * @NoAdminRequired
     */
	public function getdeleted() {
		$tags = $this->params('tags');
		$tags = (empty($tags)) ? false : $tags;
		$result['items'] = $this->ItemBusinessLayer->getByTag($tags,$this->userId,true); 
		return new JSONResponse($result);
	}
    
	 /**
	 * @NoAdminRequired
     */
     public function get($itemId) {
     	$itemId = $this->params('id');
		$result['item'] = $this->ItemBusinessLayer->get($itemId,$this->userId); 
		
		return new JSONResponse($result);
	}
	 /**
	 * @NoAdminRequired
     */
     public function getbytag($itemId) {
     	$itemId = $this->params('id');
     	$tags = $this->params('tags');
		$tags = (empty($tags)) ? false : $tags;
		$result['items'] = $this->ItemBusinessLayer->getByTag($tags,$this->userId,false); 
		
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
		$desc = $this->params('desc');
		$account = $this->params('account');
		$pass = $this->params('pw1');
		$email = $this->params('email');
		$url = $this->params('url');
		$customFields = $this->params('customFields');
		$tags = explode(',',$this->params('tags'));
    	$expiretime = 0;
		
		if(empty($label)){
			array_push($errors,'Label is mandatory');
		}
		
		
				
		if(empty($errors)){
			$result['itemid'] = $this->ItemBusinessLayer->create($userId,$label,$desc,$pass,$account,$email,$url,$expiretime);
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
			if(!empty($tags)){
				$this->tagBusinessLayer->removeTags($id);
				foreach($tags as $tag){
					if($this->tagBusinessLayer->search($tag,$userId,true)){
						$this ->tagBusinessLayer ->linkTagXItem($tag,$userId,$result['itemid']);
					}
					else {
						$this ->tagBusinessLayer ->create($tag,$userId);
						$this ->tagBusinessLayer ->linkTagXItem($tag,$userId,$result['itemid']);
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
		$id = (int) $this->params('item_id');
		$userId = $this->userId;
		$label = $this->params('label');
		$desc = $this->params('desc');
		$account = $this->params('account');
		$pass = $this->params('pw1');
		$email = $this->params('email');
		$url = $this->params('url');
		$customFields = $this->params('customFields');
		$tags = explode(',',$this->params('tags'));
		if(empty($label)){
			array_push($errors,'Label is mandatory');
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
			$expiretime = ($this->params('expire_time')) ? $this->params('expire_time') : 0;			
		}

		if(empty($errors)){
			$result['success'] = $this->ItemBusinessLayer->update($id,$userId,$label,$desc,$pass,$account,$email,$url,$expiretime);
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
			if(!empty($tags)){
				$this->tagBusinessLayer->removeTags($id);
				foreach($tags as $tag){
					if($this->tagBusinessLayer->search($tag,$userId,true)){
						$this ->tagBusinessLayer ->linkTagXItem($tag,$userId,$id);
					}
					else {
						$this ->tagBusinessLayer ->create($tag,$userId);
						$this ->tagBusinessLayer ->linkTagXItem($tag,$userId,$id);
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
	public function search($itemName) {
		$deleted['deleted']	=$this->ItemBusinessLayer->search($this->params('q'),$this->userId);
		return new JSONResponse($deleted['deleted']); 
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function delete($id) {
		$errors = array();
		$itemId = $this->params('id');
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
	 * @NoAdminRequired
	 */
	public function restore($id) {
		$errors = array();
		$itemId = $this->params('id');
		$findItem = $this->ItemBusinessLayer->get($itemId);
		if(empty($findItem)){
			array_push($errors,'Item not found');
		}
		if(empty($errors)){
			$result['restored']	=$this->ItemBusinessLayer->restore($itemId,$this->userId);
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
