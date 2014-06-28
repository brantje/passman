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

use \OCA\Passman\Db\ItemManagerManager;
use \OCA\Passman\Utility\Config;


class ItemBusinessLayer {
	private $ItemManager;
	public function __construct($ItemManager){
		$this->ItemManager = $ItemManager;
	}
	
	public function listItems($folderId,$userId) {
		return $this->ItemManager->listItems($folderId,$userId);
	}
	public function get($itemId,$userId) {
		$result = $this->ItemManager->get($itemId,$userId);
		return $result;
	}
	
	public function create($folderId,$userId,$label,$desc,$pass,$account,$email,$url) {
		$folder =array();
		$folder['folder_id'] = $folderId;
		$folder['user_id'] = $userId;
		$folder['label'] = $label;
		$folder['description'] = $desc;
		$folder['password'] = $pass;
		$folder['account'] = $account;
		$folder['email'] = $email;
		$folder['url'] = $url;
		return $this->ItemManager->insert($folder);
	}
	
	public function update($id,$folderId,$userId,$label,$desc,$pass,$account,$email,$url) {
		$folder =array();
		$folder['id'] = $id;
		$folder['folder_id'] = $folderId;
		$folder['user_id'] = $userId;
		$folder['label'] = $label;
		$folder['description'] = $desc;
		$folder['password'] = $pass;
		$folder['account'] = $account;
		$folder['email'] = $email;
		$folder['url'] = $url;
		return $this->ItemManager->update($folder);
	}
	
	public function search($itemName,$userId){
		return $this->ItemManager->search($itemName,$userId);
	}
	public function delete($itemId,$userId){
		return $this->ItemManager->delete($itemId,$userId);
	}
}

?>