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
	public function __construct($ItemManager) {
		$this -> ItemManager = $ItemManager;
	}

	public function listItems($folderId, $userId) {
		return $this -> ItemManager -> listItems($folderId, $userId);
	}

	public function get($itemId, $userId) {
		$result = $this -> ItemManager -> get($itemId, $userId);
		$result['files'] = $this -> ItemManager -> getFiles($itemId, $userId);
		return $result;
	}

	public function create($folderId, $userId, $label, $desc, $pass, $account, $email, $url) {
		$item = array();
		$item['folder_id'] = $folderId;
		$item['user_id'] = $userId;
		$item['label'] = $label;
		$item['description'] = $desc;
		$item['password'] = $pass;
		$item['account'] = $account;
		$item['email'] = $email;
		$item['url'] = $url;
		return $this -> ItemManager -> insert($item);
	}

	public function update($id, $folderId, $userId, $label, $desc, $pass, $account, $email, $url) {
		$item = array();
		$item['id'] = $id;
		$item['folder_id'] = $folderId;
		$item['user_id'] = $userId;
		$item['label'] = $label;
		$item['description'] = $desc;
		$item['password'] = $pass;
		$item['account'] = $account;
		$item['email'] = $email;
		$item['url'] = $url;
		return $this -> ItemManager -> update($item);
	}

	public function search($itemName, $userId) {
		return $this -> ItemManager -> search($itemName, $userId);
	}

	public function delete($itemId, $userId) {
		return $this -> ItemManager -> delete($itemId, $userId);
	}
	
	public function deleteByFolder($folderId,$userId){
		return $this-> ItemManager -> deleteByFolder($folderId,$userId);
	}
	
	public function addFileToItem($file) {
		return $this -> ItemManager -> addFile($file);
	}
	/**
	 * Get the files from a item id.
	 * Without the content
	 */
	public function getFiles($itemId) {
		return $this -> ItemManager -> getFiles($itemId);
	}

	/**
	 * Return a single file with encrypted content
	 */
	public function getFile($fileId, $userId) {
		return $this -> ItemManager -> getFile($fileId, $userId);
	}
	public function deleteFile($fileId, $userId) {
		return $this -> ItemManager -> deleteFile($fileId, $userId);
	}

}
?>