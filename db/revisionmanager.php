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

class RevisionManager {
  private $userid;
  private $db;

  public function __construct($db) {
    $this->db = $db;
  }

  public function save($itemId,$userId,$data){
    $sql = "INSERT INTO `*PREFIX*passman_revisions` (item_id,user_id,data,revision_date) VALUES(?,?,?,?)";
    $query = $this->db->prepareQuery($sql);
    $time = time();
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_INT);
    $query->bindParam(3, $data, \PDO::PARAM_INT);
    $query->bindParam(4, $time, \PDO::PARAM_STR);
    $result = $query->execute();
    return $this->db->getInsertId('`*PREFIX*passman_revisions`');
  }

  public function getRevisions($itemId,$userId){
    $sql = 'SELECT * from `*PREFIX*passman_revisions` WHERE item_id=? ORDER BY `revision_date` DESC';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $result = $query->execute();

    $rows = array();
    while ($row = $result->fetchRow()) {
        $row['data'] = json_decode($row['data']);
        array_push($rows,$row);
    }
    return $rows;
  }
  public function getAllRevisions($userId){
    $sql = 'SELECT * from `*PREFIX*passman_revisions` WHERE user_id=? ORDER BY `revision_date` DESC';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $userId, \PDO::PARAM_INT);
    $result = $query->execute();

    $rows = array();
    while ($row = $result->fetchRow()) {
        $row['data'] = json_decode($row['data']);
        array_push($rows,$row);
    }
    return $rows;
  }

  public function update($revision){
    $revision['data'] = json_encode($revision['data']);
    $sql = 'UPDATE `*PREFIX*passman_revisions` SET `data`= ? WHERE item_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $revision['data'], \PDO::PARAM_STR);
    $query->bindParam(2, $revision['item_id'], \PDO::PARAM_INT);
    $result = $query->execute();
    return $result;
  }
}

