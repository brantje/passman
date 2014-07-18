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

class TagManager {
	private $userid;
	private $db;
	public function __construct($db) {
		$this -> db = $db;
	}

	/**
	 * List items in a folder
	 */
	public function search($tag,$userId,$exactMatch) {
		$sql = 'SELECT tag_id as id, tag_label as label,renewal_period,min_pw_strength FROM `*PREFIX*passman_tags` WHERE `user_id` = ? AND tag_label COLLATE UTF8_GENERAL_CI LIKE ?';
		$tag = (!$exactMatch) ? '%'. $tag . '%' : $tag;
		$result = $this -> db -> prepareQuery($sql) -> execute(array($userId,$tag));
		$rows = array();
		while ($row = $result -> fetchRow()) {
			$rows[$row['id']] = array('label'=>$row['label'],'renewal_period'=>$row['renewal_period'],'min_pw_strength'=>$row['min_pw_strength']);
		}
		return $rows;
	}
	
	public function create($tag,$userId){
		$sql = "INSERT INTO `*PREFIX*passman_tags` (user_id,tag_label) VALUES(?,?)";
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $userId, \PDO::PARAM_INT);
		$query -> bindParam(2, $tag, \PDO::PARAM_STR);
		$result = $query -> execute();
		return $this -> db -> getInsertId('`*PREFIX*passman_tags`');
	}
	public function linkTagXItem($tagId,$itemId){
		$sql = "INSERT INTO `*PREFIX*passman_items_tags_xref` (tag_id,item_id) VALUES(?,?) ";
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $tagId, \PDO::PARAM_INT);
		$query -> bindParam(2, $itemId, \PDO::PARAM_INT);
		$result = $query -> execute();
		return $this -> db -> getInsertId('`*PREFIX*passman_items_tags_xref`');
	}
	
	public function removeTags($itemId)
	{
		$sql = 'DELETE FROM `*PREFIX*passman_items_tags_xref` where item_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $itemId, \PDO::PARAM_INT);
		$result = $query -> execute();
	}
	public function load($tag,$userId){
		$sql = 'SELECT * from `*PREFIX*passman_tags` where tag_label=? and user_id=?';
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $tag, \PDO::PARAM_STR);
		$query -> bindParam(2, $userId, \PDO::PARAM_STR);
		return $result = $query -> execute()->fetchRow();
	} 
	public function update($tag,$userId){
		
		$sql = "UPDATE `*PREFIX*passman_tags` SET tag_label=?, min_pw_strength=?, renewal_period=? WHERE tag_id=? and user_id=?";
		$query = $this -> db -> prepareQuery($sql);
		$query -> bindParam(1, $tag['tag_label'], \PDO::PARAM_STR);
		$query -> bindParam(2, $tag['min_pw_strength'], \PDO::PARAM_INT);
		$query -> bindParam(3, $tag['renewal_period'], \PDO::PARAM_INT);
		$query -> bindParam(4, $tag['tag_id'], \PDO::PARAM_STR);
		$query -> bindParam(5, $userId, \PDO::PARAM_STR);
		$query -> execute();
		$tag['update'] = 'success';
		return $tag;
		
	}
}
