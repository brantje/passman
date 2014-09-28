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

class TagController extends Controller {
    private $userId;
	private $tagBusinessLayer;
	
	
    public function __construct($appName, $request,  $tagBusinessLayer,$userId){
        parent::__construct($appName, $request);
        $this->userId = $userId;
		$this->tagBusinessLayer = $tagBusinessLayer;
    }
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function search() {
		$tag = $this->params('k');
		$response = $this->tagBusinessLayer->search($tag,$this->userId);
		return new JSONResponse($response); 
	}
	
	public function load(){
		$tag = $this->params('tag');
		if($this->tagBusinessLayer->search($tag,$this->userId,true)){
			$response['tag'] = $this->tagBusinessLayer->load($tag,$this->userId);
		}
		return new JSONResponse($response); 
	}
	public function update(){
		$tag = $this->params('tag');
		$response['tag'] = $this->tagBusinessLayer->update($tag,$this->userId);
		
		return new JSONResponse($response); 
	}
}