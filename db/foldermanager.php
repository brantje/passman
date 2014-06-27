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
			$rows[] = $row;
		}
		return $rows;
	}

	public function find($id) {
		$sql = 'SELECT * FROM `*prefix*passman_folders` ' . 'WHERE `id` = ?';
		$query = $db -> prepareQuery($sql);
		$query -> bindParam(1, $id, \PDO::PARAM_INT);
		$result = $query -> execute();

		while ($row = $result -> fetchRow()) {
			return $row;
		}
	}

}
