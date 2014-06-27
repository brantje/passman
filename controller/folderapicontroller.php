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

use \OCA\Passman\BusinessLayer\FolderBusinessLayer;
use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;

class FolderApiController extends Controller {
    private $userId;
	private $folderBusinessLayer;
	
	
    public function __construct($appName, IRequest $request,  FolderBusinessLayer $folderBusinessLayer,$userId){
        parent::__construct($appName, $request);
        $this->userId = $userId;
		$this->folderBusinessLayer = $folderBusinessLayer;
    }


    /**
     * CAUTION: the @Stuff turn off security checks, for this page no admin is
     *          required and no CSRF check. If you don't know what CSRF is, read
     *          it up in the docs or you might create a security hole. This is
     *          basically the only required method to add this exemption, don't
     *          add it to any other method if you don't exactly know what it does
     * @NoAdminRequired
     * @NoCSRFRequired
     */
	public function index() {
		$result['folders'] = $this->folderBusinessLayer->getAll($this->userId); 
		
		return new JSONResponse($result);
	}

	/**
	 * Update to create and edit items 
	 * @param Folder ID 
	 *
	 * @NoAdminRequired
	 */
	public function update($id) {
		$folderId = $this->params('folderId');
		$folderTitle = $this->params('title');
		$folderparent = (int) $this->params('parent');
		$renewal_period = (int) $this->params('renewal_period');
		$min_pw_strength = (int) $this->params('min_pw_strength');
		$response = array($folderId,$folderTitle,$folderparent);
		if(is_numeric($folderId)){
			$result['success'] = $this->folderBusinessLayer->update($folderId,$folderTitle,$this->userId,$folderparent,$renewal_period,$min_pw_strength);
		}
		else {
			$result['folderid'] = $this->folderBusinessLayer->create($folderTitle,$this->userId,$folderparent,$renewal_period,$min_pw_strength); 
		}
		return new JSONResponse($result); 
	}

	/**
	 * @NoAdminRequired
	 */
	public function delete($folderId) {
		
	return new JSONResponse($this->folderBusinessLayer->delete($folderId,$this->userId)); 
	}
}