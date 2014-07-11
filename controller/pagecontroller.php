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

use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;
use \OCP\CONFIG;
class PageController extends Controller {

    private $userId;
	private $itemBusinessLayer;
	private $folderBusinessLayer;

    public function __construct($appName, IRequest $request, $userId,$FolderBusinessLayer,$ItemBusinessLayer){
        parent::__construct($appName, $request);
        $this->userId = $userId;
		$this->folderBusinessLayer = $FolderBusinessLayer;
		$this->itemBusinessLayer = $ItemBusinessLayer;
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
    public function index() {
    	$conf= \OCP\CONFIG::getUserValue( \OCP\User::getUser() , 'firstpassmanrun' , 'show' , 1 );
		if($conf==1){
			\OCP\Util::addscript('passman', 'firstrun');
		}
        $params = array('user' => $this->userId);
        return new TemplateResponse('passman', 'main', $params);  // templates/main.php
    }
	/**
	 * @NoAdminRequired
	 */
	public function disablefirstrun() {
        \OCP\Config::setUserValue( \OCP\User::getUser(), 'firstpassmanrun', 'show', 0 );
		echo "Succes!";
    }
	
	/**
	 * @NoAdminRequired
     * @NoCSRFRequired
     */
	public function popup(){
		$folders = $this->folderBusinessLayer->getAll($this->userId);
		$foldersHierarchical = $this->buildHierarchicalOptionMenu($folders);
		$url = ($this->params('url')) ? $this->params('url') : '';
		$label = ($this->params('title')) ? $this->params('title') : '';
		$params = array('folders'=>json_encode($foldersHierarchical),'foldersPlain'=>json_encode($folders),'url'=>$url,'label'=>$label,'f');
		return new TemplateResponse('passman', 'popup', $params); 
	}
	
	private function buildHierarchicalOptionMenu($elements, $parentId = 0,$level=-1){
		$branch = array();
		$level++;
   		foreach ($elements as $element) {
			$element['level'] = $level;
        	if ($element['parent_id'] == $parentId) {
	            $children = $this->buildHierarchicalOptionMenu($elements, $element['id'],$level);
	            if ($children) {
	                $element['children'] = $children;
	            }
	            $branch[] = $element;
        	}
    	}
	 return $branch;		
	}
}