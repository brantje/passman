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
	public function __construct(Db $db) {
		$this -> db = $db;

	}
	/**
	 * List items in a folder
	 */
	public function listItems($folderId,$userId) {
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
	 * Get A single item
	 */
	public function get($itemId,$userId) {
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
		$sql = 'INSERT INTO `*PREFIX*passman_items` (`user_id`,`folderid`,`label`,`description`,`password`,`account`,`email`,`url`)';
		$sql .= ' VALUES (?,?,?,?,?,?,?,?)'; 	
		$query = $this->db -> prepareQuery($sql);
		$query -> bindParam(1, $item['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $item['folder_id'], \PDO::PARAM_INT);
		$query -> bindParam(3, $item['label'], \PDO::PARAM_STR);
		$query -> bindParam(4, $item['description'], \PDO::PARAM_STR);
		$query -> bindParam(5, $item['password'], \PDO::PARAM_STR);
		$query -> bindParam(6, $item['account'], \PDO::PARAM_STR);
		$query -> bindParam(7, $item['email'], \PDO::PARAM_STR);
		$query -> bindParam(8, $item['url'], \PDO::PARAM_STR);
		$result = $query -> execute();
		return $this->db->getInsertId('`*PREFIX*passman_items`');
		
	}
	
	/**
	 * Update item
	 */
	public function update($item) {
		$sql = 'UPDATE `*PREFIX*passman_items` SET `user_id`=?,folderid=?,`label`=?,`description`=?,`password`=?,`account`=?,`email`=?,`url`=? WHERE id=?';
		$query = $this->db -> prepareQuery($sql);
		$query -> bindParam(1, $item['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $item['folder_id'], \PDO::PARAM_INT);
		$query -> bindParam(3, $item['label'], \PDO::PARAM_STR);
		$query -> bindParam(4, $item['description'], \PDO::PARAM_STR);
		$query -> bindParam(5, $item['password'], \PDO::PARAM_STR);
		$query -> bindParam(6, $item['account'], \PDO::PARAM_STR);
		$query -> bindParam(7, $item['email'], \PDO::PARAM_STR);
		$query -> bindParam(8, $item['url'], \PDO::PARAM_STR);
		$query -> bindParam(9, $item['id'], \PDO::PARAM_INT);
		$result = $query -> execute();
		return $item;
		
	}
	
	/**
	 * Delete item
	 */
	public function delete($itemId,$userId){
		$sql = 'DELETE FROM `*PREFIX*passman_items` WHERE `id`=? AND user_id=?';
		$query = $this->db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_INT);
		$result = $query -> execute();
	}

}
