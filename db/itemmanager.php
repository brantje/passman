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
//use \OCP\DB\insertid;

class ItemManager {
  private $userid;
  private $db;

  public function __construct($db) {
    $this->db = $db;

  }

  /**
   * List items in a folder
   */
  public function listItems($userId) {
    $sql = 'SELECT id,label FROM `*PREFIX*passman_items` WHERE `user_id` = ?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $userId, \PDO::PARAM_INT);
    $result = $query->execute();
    $rows = array();
    while ($row = $result->fetchRow()) {
      $rows[$row['id']] = $row;
    }
    return $rows;
  }

  /**
   * List items in a folder
   */
  public function search($itemName, $userId) {
    $sql = 'SELECT  * FROM `*PREFIX*passman_items`';
    $sql .= 'WHERE label COLLATE UTF8_GENERAL_CI LIKE  ? and user_id=? AND delete_date=0';
    $result = $this->db->prepareQuery($sql)->execute(array('%' . $itemName . '%', $userId));
    $rows = array();
    while ($row = $result->fetchRow()) {
      $rows[] = $row;
    }
    return $rows;
  }

  /**
   * Get A single item
   */
  public function get($itemId, $userId) {
    $sql = 'SELECT  item.*, GROUP_CONCAT(distinct tags.tag_label) AS tags FROM `*PREFIX*passman_items` AS item ';
    $sql .= 'LEFT JOIN `*PREFIX*passman_items_tags_xref` AS xref ON xref.item_id = item.id ';
    $sql .= 'LEFT JOIN `*PREFIX*passman_tags` AS tags ON tags.tag_id = xref.tag_id ';
    $sql .= 'WHERE item.id = ? and item.user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_STR);
    $result = $query->execute();
    return $result->fetchRow();

  }

  /**
   * Get items by tag
   */
  public function getByTag($tags, $userId, $deleted) {
    $userId = array($userId);
    $isparam = ($deleted == false) ? '=' : '!=';
    $sql = 'SELECT  item.id, LOWER(GROUP_CONCAT(distinct tags.tag_label)) AS tagForSearch ,GROUP_CONCAT(distinct tags.tag_label) AS tags FROM `*PREFIX*passman_items` AS item ';
    $sql .= 'LEFT JOIN `*PREFIX*passman_items_tags_xref` AS xref ON xref.item_id = item.id ';
    $sql .= 'LEFT JOIN `*PREFIX*passman_tags` AS tags ON tags.tag_id = xref.tag_id ';
    $sql .= 'WHERE item.user_id=? AND delete_date ' . $isparam . '0';
    $sql .= ' GROUP BY item.id ';
    if (count($tags) > 0 && $tags[0] != '') {
      $sql .= 'HAVING ';
      foreach ($tags as $i => $tag) {
        $and = ($i == 0) ? '' : 'AND ';
        $sql .= $and . ' tagForSearch like ?';
        $tags[$i] = '%' . strtolower($tag) . '%';
      }
    } else {
      $tags = array();
    }
    $sql .= ' ORDER BY UPPER(item.label) ASC, tags.tag_label ASC';
    //echo $sql;
    $query = $this->db->prepareQuery($sql);
    $params = array_merge($userId, $tags);
    $results = $query->execute($params)->fetchAll();
    return $results;
  }

  /**
   * Insert item
   */
  public function insert($item) {
    $sql = 'INSERT INTO `*PREFIX*passman_items` (`user_id`,`label`,`description`,`password`,`account`,`email`,`url`,`expire_time`,`favicon`,`created`,`otpsecret`)';
    $sql .= ' VALUES (?,?,?,?,?,?,?,?,?,?,?)';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $item['user_id'], \PDO::PARAM_INT);
    $query->bindParam(2, $item['label'], \PDO::PARAM_STR);
    $query->bindParam(3, $item['description'], \PDO::PARAM_STR);
    $query->bindParam(4, $item['password'], \PDO::PARAM_STR);
    $query->bindParam(5, $item['account'], \PDO::PARAM_STR);
    $query->bindParam(6, $item['email'], \PDO::PARAM_STR);
    $query->bindParam(7, $item['url'], \PDO::PARAM_STR);
    $query->bindParam(8, $item['expire_time'], \PDO::PARAM_INT);
    $query->bindParam(9, $item['favicon'], \PDO::PARAM_STR);
    $query->bindParam(10, $item['created'], \PDO::PARAM_STR);
    $query->bindParam(11, $item['otpsecret'], \PDO::PARAM_STR);
    $result = $query->execute();
    return $this->db->getInsertId('`*PREFIX*passman_items`');

  }

  /**
   * Update item
   */
  public function update($item) {
    $item['changed'] = time();
    $sql = 'UPDATE `*PREFIX*passman_items` SET `label`=?,`description`=?,`password`=?,`account`=?,`email`=?,`url`=?,expire_time=?,favicon=?,delete_date=?,otpsecret=?,changed=? WHERE id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $item['label'], \PDO::PARAM_STR);
    $query->bindParam(2, $item['description'], \PDO::PARAM_STR);
    $query->bindParam(3, $item['password'], \PDO::PARAM_STR);
    $query->bindParam(4, $item['account'], \PDO::PARAM_STR);
    $query->bindParam(5, $item['email'], \PDO::PARAM_STR);
    $query->bindParam(6, $item['url'], \PDO::PARAM_STR);
    $query->bindParam(7, $item['expire_time'], \PDO::PARAM_STR);
    $query->bindParam(8, $item['favicon'], \PDO::PARAM_STR);
    $query->bindParam(9, $item['delete_date'], \PDO::PARAM_STR);
    $query->bindParam(10, $item['otpsecret'], \PDO::PARAM_STR);
    $query->bindParam(11, $item['changed'], \PDO::PARAM_STR);
    $query->bindParam(12, $item['id'], \PDO::PARAM_INT);
    $result = $query->execute();
    return $item;
  }

  /**
   * Delete item
   */
  public function delete($itemId, $userId) {
    $sql = 'DELETE FROM `*PREFIX*passman_items` WHERE `id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_STR);
    $result = $query->execute();
    return array('deleted' => $itemId);
  }

  /**
   * Restore item
   */
  public function restore($itemId, $userId) {
    $sql = 'UPDATE `*PREFIX*passman_items` set `delete_date`= 0 WHERE `id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_STR);
    $result = $query->execute();
    return array($itemId);
  }

  /**
   * Add a to to an item
   */
  public function addFile($file) {
    $sql = 'INSERT INTO `*PREFIX*passman_files` (`item_id`,`user_id`,`filename`,`type`,`mimetype`,`content`,`size`)';
    $sql .= ' VALUES (?,?,?,?,?,?,?)';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $file['item_id'], \PDO::PARAM_INT);
    $query->bindParam(2, $file['user_id'], \PDO::PARAM_INT);
    $query->bindParam(3, $file['filename'], \PDO::PARAM_STR);
    $query->bindParam(4, $file['type'], \PDO::PARAM_STR);
    $query->bindParam(5, $file['mimetype'], \PDO::PARAM_STR);
    $query->bindParam(6, $file['content'], \PDO::PARAM_STR);
    $query->bindParam(7, $file['size'], \PDO::PARAM_STR);
    $result = $query->execute();
    $file['id'] = $this->db->getInsertId('`*PREFIX*passman_files`');
    return $file;
  }

  /*
   * Get the files that belongs to an item
   * Without its content
   */
  public function getFiles($itemId, $userId) {
    $sql = 'SELECT id,item_id,user_id,filename,type,mimetype,size from `*PREFIX*passman_files` WHERE `item_id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_INT);
    $result = $query->execute();
    $files = array();
    while ($row = $result->fetchRow()) {
      $files[] = $row;
    }
    return $files;
  }

  /**
   * Get a single with its content
   *
   * @param $fileId
   * @param $userId
   */
  public function getFile($fileId, $userId) {
    $sql = 'SELECT * from `*PREFIX*passman_files` WHERE `id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $fileId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_STR);
    $result = $query->execute();
    return $result->fetchRow();
  }

  /**
   * Delete a files
   *
   * @param $fileId
   * @param $userId
   */
  public function deleteFile($fileId, $userId) {
    $sql = 'DELETE FROM `*PREFIX*passman_files` WHERE `id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $fileId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_STR);
    $result = $query->execute();
    return $fileId;
  }


  /**
   * Insert a custom field to an item
   */
  public function createItemField($field, $userId, $itemId) {
    $sql = 'INSERT INTO `*PREFIX*passman_custom_fields` (`item_id`,`user_id`,`label`,`value`,`clicktoshow`)';
    $sql .= ' VALUES (?,?,?,?,?)';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_INT);
    $query->bindParam(3, $field['label'], \PDO::PARAM_STR);
    $query->bindParam(4, $field['value'], \PDO::PARAM_STR);
    $query->bindParam(5, $field['clicktoshow'], \PDO::PARAM_STR);
    $result = $query->execute();
    $field['id'] = $this->db->getInsertId('`*PREFIX*passman_custom_fields`');
    return $field;
  }

  /**
   * Get the custom fields for an item
   */
  public function getFields($itemId, $userId) {
    $sql = 'SELECT * from `*PREFIX*passman_custom_fields` WHERE `item_id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $itemId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_INT);
    $result = $query->execute();
    $fields = array();
    while ($row = $result->fetchRow()) {
      $fields[] = $row;
    }
    return $fields;
  }

  /**
   * Update an custom item field
   */
  public function updateItemField($field, $userId, $itemId) {
    $sql = 'UPDATE `*PREFIX*passman_custom_fields` SET `label`=?,value=?,`clicktoshow`=? WHERE id=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $field['label'], \PDO::PARAM_STR);
    $query->bindParam(2, $field['value'], \PDO::PARAM_STR);
    $query->bindParam(3, $field['clicktoshow'], \PDO::PARAM_STR);
    $query->bindParam(4, $field['id'], \PDO::PARAM_INT);
    $query->bindParam(5, $userId, \PDO::PARAM_INT);
    $result = $query->execute();
  }

  /**
   * Remove a custom field
   */
  public function removeItemField($fieldId, $userId) {
    $sql = 'DELETE FROM `*PREFIX*passman_custom_fields` WHERE `id`=? AND user_id=?';
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $fieldId, \PDO::PARAM_INT);
    $query->bindParam(2, $userId, \PDO::PARAM_INT);
    $result = $query->execute();
  }
}
