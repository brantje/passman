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
	
	public function get($folderId,$userId){
		return $this->folderManager->get($folderId,$userId);
	}
	
	public function create($folderName, $userId, $parentId=0,$renewal_period=0,$min_pw_strength) {
		$folder =array();
		$folder['name'] = $folderName;
		$folder['user_id'] = $userId;
		$folder['parent_id'] = $parentId;
		$folder['renewal_period'] = $renewal_period;
		$folder['min_pw_strength'] = $min_pw_strength;
		return $this->folderManager->insert($folder);
	}
	public function update($folderId,$folderName, $userId, $parentId=0,$renewal_period=0,$min_pw_strength) {
		$folder =array();
		$folder['id'] = $folderId;
		$folder['name'] = $folderName;
		$folder['user_id'] = $userId;
		$folder['parent_id'] = $parentId;
		$folder['renewal_period'] = $renewal_period;
		$folder['min_pw_strength'] = $min_pw_strength;
		return $this->folderManager->update($folder);; 
	}
	
	public function delete($folderId,$userId){
		if(is_numeric($folderId)){
			return $this->folderManager->delete($folderId,$userId);
		}
	}
}

?>