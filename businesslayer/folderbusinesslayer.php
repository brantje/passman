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
 
namespace OCA\Passman\BusinessLayer;

use \OCA\Passman\Db\FolderManager;
use \OCA\Passman\Utility\Config;


class FolderBusinessLayer {
	private $folderManager;
	public function __construct(FolderManager $folderManager){
		$this->folderManager = $folderManager;
	}
	
	public function getAll($userId) {
		return $this->folderManager->getAllFromUser($userId);
	}
	
	public function create($folderName, $userId, $parentId=0) {
	

		/*$folder = new Folder();
		$folder->setName($folderName);
		$folder->setUserId($userId);
		$folder->setParentId($parentId);
		$folder->setOpened(true);
		return $this->folderMapper->insert($folder);*/
	}
}

?>