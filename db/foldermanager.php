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

class FolderManager {
	private $userid;
	private $db;
	public function __construct(Db $db) {
		$this -> db = $db;

	}

	public function getAllFromUser($id) {
		$sql = 'SELECT * FROM `*PREFIX*passman_folders` ' . 'WHERE `user_id` = ?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $id, \PDO::PARAM_INT);
		$result = $query -> execute();
		$rows = array();
		while ($row = $result -> fetchRow()) {
			$rows[$row['id']] = $row;
		}
		return $rows;
	}

	public function insert($folder) {
		$sql = 'INSERT INTO `*PREFIX*passman_folders` (`user_id`,`title`,`parent_id`,`renewal_period`,`min_pw_strength`)';
		$sql .= ' VALUES (?,?,?,?,?)'; 	
		$query = $this->db -> prepareQuery($sql);
		$query -> bindParam(1, $folder['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $folder['name'], \PDO::PARAM_STR);
		$query -> bindParam(3, $folder['parent_id'], \PDO::PARAM_INT);
		$query -> bindParam(4, $folder['renewal_period'], \PDO::PARAM_INT);
		$query -> bindParam(5, $folder['min_pw_strength'], \PDO::PARAM_INT);
		$result = $query -> execute();
		return $this->db->getInsertId('`*PREFIX*passman_folders`');
		
	}
	public function update($folder) {
		$sql = 'UPDATE `*PREFIX*passman_folders` SET `user_id`=?,`title`=?,`parent_id`=?,`renewal_period`=?,`min_pw_strength`=? WHERE id=?';
		$query = $this->db -> prepareQuery($sql);
		$query -> bindParam(1, $folder['user_id'], \PDO::PARAM_INT);
		$query -> bindParam(2, $folder['name'], \PDO::PARAM_STR);
		$query -> bindParam(3, $folder['parent_id'], \PDO::PARAM_INT);
		$query -> bindParam(4, $folder['renewal_period'], \PDO::PARAM_INT);
		$query -> bindParam(5, $folder['min_pw_strength'], \PDO::PARAM_INT);
		$query -> bindParam(6, $folder['id'], \PDO::PARAM_INT);
		$result = $query -> execute();
		return $folder;
		
	}
	
	public function delete($folderId,$userId){
		$sql = 'DELETE FROM `*PREFIX*passman_folders` WHERE `id`=? AND user_id=?';
		$query = $this->db -> prepareQuery($sql);
		$query -> bindParam(1, $folderId, \PDO::PARAM_INT);
		$query -> bindParam(2, $userId, \PDO::PARAM_INT);
		$result = $query -> execute();
	}

}
