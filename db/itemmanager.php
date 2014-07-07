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
namespace OCA\Passman\Db;

use \OCP\IDb;
use \OCP\DB\insertid;

class ItemManager {
	private $userid;
	private $db;
	public function __construct($db) {
		$this -> db = $db;

	}

	/**
	 * List items in a folder
	 */
	public function listItems($folderId, $userId) {
		$sql = 'SELECT id,label,folderid FROM `*PREFIX*passman_items` WHERE `folderid`= ? AND `user_id` = ?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $folderId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_INT);
		$result = $query -> execute();
		$rows = array();
		while ($row = $result -> fetchRow()) {
			$rows[$row['id']] = $row;
		}
		return $rows;
	}

	/**
	 * Move an item to another folder
	 */
	public function moveItem($itemId,$folderId,$userId){
		$sql = 'UPDATE `*PREFIX*passman_items` SET folderid=? where id=? and user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $folderId, \PDO::PARAM_INT);
		$query -> bindParam(2, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(3, $userId, \PDO::PARAM_STR);
		$result = $query -> execute();
		return array('success'=>'true');
	}
	/**
	 * List items in a folder
	 */
	public function search($itemName, $userId) {
		$sql = 'SELECT i.id,i.label,i.folderid,i.description,i.account,i.email,f.title as foldername FROM `oc_passman_items` as i inner join `oc_passman_folders` as f on i.folderid=f.id WHERE `label` LIKE ? AND `i`.`user_id` = ?;';
		$sql .= ' UNION '; 
		$sql .= 'SELECT id as folderid, title as label, null as description, null as account, null as email,null as id null as foldername FROM `*PREFIX*passman_folders` WHERE `title` LIKE ? AND `user_id` = ? ORDER BY folderid asc;';
		$result = $this -> db -> prepareQuery($sql) -> execute(array('%'.$itemName . '%', $userId,'%'.$itemName . '%', $userId));
		$rows = array(); 
		while ($row = $result -> fetchRow()) {
			$rows[] = $row;
		}
		return $rows;
	}

	/**
	 * Get A single item
	 */
	public function get($itemId, $userId) {
		$sql = 'SELECT * FROM `*PREFIX*passman_items` WHERE `id`= ? AND `user_id` = ?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_STR);
		$result = $query -> execute();
		return $result -> fetchRow();
	}

	/**
	 * Insert item
	 */
	public function insert($item) {
		$sql = 'INSERT INTO `*PREFIX*passman_items` (`user_id`,`folderid`,`label`,`description`,`password`,`account`,`email`,`url`,`expire_time`)';
		$sql .= ' VALUES (?,?,?,?,?,?,?,?,?)';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $item['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $item['folder_id'], \PDO::PARAM_INT);
		$query -> bindParam(3, $item['label'], \PDO::PARAM_STR);
		$query -> bindParam(4, $item['description'], \PDO::PARAM_STR);
		$query -> bindParam(5, $item['password'], \PDO::PARAM_STR);
		$query -> bindParam(6, $item['account'], \PDO::PARAM_STR);
		$query -> bindParam(7, $item['email'], \PDO::PARAM_STR);
		$query -> bindParam(8, $item['url'], \PDO::PARAM_STR);
		$query -> bindParam(9, $item['expire_time'], \PDO::PARAM_INT);
		$result = $query -> execute();
		return $this -> db -> getInsertId('`*PREFIX*passman_items`');

	}

	/**
	 * Update item
	 */
	public function update($item) {
		$sql = 'UPDATE `*PREFIX*passman_items` SET `user_id`=?,folderid=?,`label`=?,`description`=?,`password`=?,`account`=?,`email`=?,`url`=?,expire_time=? WHERE id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $item['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $item['folder_id'], \PDO::PARAM_INT);
		$query -> bindParam(3, $item['label'], \PDO::PARAM_STR);
		$query -> bindParam(4, $item['description'], \PDO::PARAM_STR);
		$query -> bindParam(5, $item['password'], \PDO::PARAM_STR);
		$query -> bindParam(6, $item['account'], \PDO::PARAM_STR);
		$query -> bindParam(7, $item['email'], \PDO::PARAM_STR);
		$query -> bindParam(8, $item['url'], \PDO::PARAM_STR);
		$query -> bindParam(9, $item['expire_time'], \PDO::PARAM_STR);
		$query -> bindParam(10, $item['id'], \PDO::PARAM_INT);
		$result = $query -> execute();
		return $item;

	}

	/**
	 * Delete item
	 */
	public function delete($itemId, $userId) {
		$sql = 'DELETE FROM `*PREFIX*passman_items` WHERE `id`=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_STR);
		$result = $query -> execute();
		return array('deleted' => $itemId);
	}
	/**
	 * Delete items by folder id
	 */
	public function deleteByFolder($folderId, $userId) {
		$sql = 'DELETE FROM `*PREFIX*passman_items` WHERE `folderid`=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $folderId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_STR);
		$result = $query -> execute();
		print_r($folderId);
		print_r($userId);
		return array('deleted' => 'success');
	}

	/**
	 * Add a to to an item
	 */
	public function addFile($file) {
		$sql = 'INSERT INTO `*PREFIX*passman_files` (`item_id`,`user_id`,`filename`,`type`,`mimetype`,`content`,`size`)';
		$sql .= ' VALUES (?,?,?,?,?,?,?)';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $file['item_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $file['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(3, $file['filename'], \PDO::PARAM_STR);
		$query -> bindParam(4, $file['type'], \PDO::PARAM_STR);
		$query -> bindParam(5, $file['mimetype'], \PDO::PARAM_STR);
		$query -> bindParam(6, $file['content'], \PDO::PARAM_STR);
		$query -> bindParam(7, $file['size'], \PDO::PARAM_STR);
		$result = $query -> execute();
		$file['id'] = $this -> db -> getInsertId('`*PREFIX*passman_files`');
		return $file;
	}

	/*
	 * Get the files that belongs to an item
	 * Without its content
	 */
	public function getFiles($itemId, $userId) {
		$sql = 'SELECT id,item_id,user_id,filename,type,mimetype,size from `*PREFIX*passman_files` WHERE `item_id`=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_INT);
		$result = $query -> execute();
		$files = array();
		while ($row = $result -> fetchRow()) {
			$files[] = $row;
		}
		return $files;
	}
	/** 
	 * Get a single with its content 
	 * @param $fileId
	 * @param $userId
	 */
	public function getFile($fileId, $userId) {
		$sql = 'SELECT * from `*PREFIX*passman_files` WHERE `id`=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $fileId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_STR);
		$result = $query -> execute();
		return $result -> fetchRow();
	}

	/**
	 * Delete a files
	 * @param $fileId
	 * @param $userId
	 */
	public function deleteFile($fileId, $userId) {
		$sql = 'DELETE FROM `*PREFIX*passman_files` WHERE `id`=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $fileId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_STR);
		$result = $query -> execute();
		return $fileId;
	}
	
	
	/**
	 * Insert a custom field to an item
	 */ 
	public function createItemField($field,$userId,$itemId){
		$sql = 'INSERT INTO `*PREFIX*passman_custom_fields` (`item_id`,`user_id`,`label`,`value`)';
		$sql .= ' VALUES (?,?,?,?)';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_INT);
		$query -> bindParam(3, $field['name'], \PDO::PARAM_STR);
		$query -> bindParam(4, $field['value'], \PDO::PARAM_STR);
		$result = $query -> execute();
		$field['id'] = $this -> db -> getInsertId('`*PREFIX*passman_custom_fields`');
		return $field;
	}
	
	/**
	 * Get the custom fields for an item
	 */
	public function getFields($itemId, $userId) {
		$sql = 'SELECT id, label,value from `*PREFIX*passman_custom_fields` WHERE `item_id`=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_INT);
		$result = $query -> execute();
		$fields = array();
		while ($row = $result -> fetchRow()) {
			$fields[] = $row;
		}
		return $fields;
	}
	/**
	 * Update an custom item field
	 */
	public function updateItemField($field,$userId,$itemId){
		$sql = 'UPDATE `*PREFIX*passman_custom_fields` SET `label`=?,value=? WHERE id=? AND user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $field['name'], \PDO::PARAM_STR);
		$query -> bindParam(2, $field['value'], \PDO::PARAM_STR);
		$query -> bindParam(3, $field['id'], \PDO::PARAM_INT);
		$query -> bindParam(4, $userId, \PDO::PARAM_INT);
		$result = $query -> execute();	
	}
	
	/**
	 * Remove a custom field
	 */
	 public function removeItemField($fieldId,$userId){
	 	
	 } 
}
