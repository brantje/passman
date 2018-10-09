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
  private $TagBusinessLayer;

  public function __construct($ItemManager, $TagBusinessLayer) {
    $this->ItemManager = $ItemManager;
    $this->TagBusinessLayer = $TagBusinessLayer;
  }

  public function listItems($userId, $deleted = false) {
    return $this->ItemManager->listItems($userId);
  }

  public function get($itemId, $userId) {
    $result = $this->ItemManager->get($itemId, $userId);
    $tgs = ($result['tags'] != '') ? explode(',', $result['tags']) : null;
    $tags = array();
    foreach ($tgs as $curTag) {
      $tag = $this->TagBusinessLayer->search($curTag, $userId, true);
      $tags[] = $tag[0];
    }
    $result['tags'] = $tags;
    $result['files'] = $this->ItemManager->getFiles($itemId, $userId);
    $result['customFields'] = $this->ItemManager->getFields($itemId, $userId);
    return $result;
  }

  public function getByTag($tags, $userId, $deleteDate) {
    $tags = explode(',', $tags);
    $results = $this->ItemManager->getByTag($tags, $userId, $deleteDate);
    $return = array();
    foreach ($results as $r) {
      $result = $this->ItemManager->get($r['id'], $userId);
      $tgs = ($result['tags'] != '') ? explode(',', $result['tags']) : null;
      $tags = array();
      if(count($tgs) > 0) {
        foreach ($tgs as $curTag) {
          $tag = $this->TagBusinessLayer->search($curTag, $userId, true);
          $tags[] = $tag[0];
        }
      }
      $result['tags'] = $tags;
      $result['files'] = $this->ItemManager->getFiles($result['id'], $userId);
      $result['customFields'] = $this->ItemManager->getFields($result['id'], $userId);

      $return[] = $result;
    }
    return $return;
  }

  public function getItemFields($itemId, $userId) {
    return $this->ItemManager->getFiles($itemId, $userId);
  }

  public function create($item) {
    $item['created'] = time();
    return $this->ItemManager->insert($item);
  }

  public function update($item) {
    return $this->ItemManager->update($item);
  }

  public function search($itemName, $userId) {
    return $this->ItemManager->search($itemName, $userId);
  }

  public function delete($itemId, $userId) {
    return $this->ItemManager->delete($itemId, $userId);
  }


  public function restore($itemId, $userId) {
    return $this->ItemManager->restore($itemId, $userId);
  }

  /**
   * Delete all items in a folder
   */
  public function deleteByFolder($folderId, $userId) {
    return $this->ItemManager->deleteByFolder($folderId, $userId);
  }

  /**
   * Add a file to an item
   */
  public function addFileToItem($file) {
    return $this->ItemManager->addFile($file);
  }

  /**
   * Get the files from a item id.
   * Without the content
   */
  public function getFiles($itemId) {
    return $this->ItemManager->getFiles($itemId);
  }

  /**
   * Return a single file with encrypted content
   */
  public function getFile($fileId, $userId) {
    return $this->ItemManager->getFile($fileId, $userId);
  }

  /**
   * Remove a file
   */
  public function deleteFile($fileId, $userId) {
    return $this->ItemManager->deleteFile($fileId, $userId);
  }

  /**
   * Create a field for an item
   */
  public function createField($field, $userId, $itemId) {
    return $this->ItemManager->createItemField($field, $userId, $itemId);
  }

  /**
   * Update an field for an item
   */
  public function updateField($field, $userId, $itemId) {
    return $this->ItemManager->updateItemField($field, $userId, $itemId);
  }

  public function deleteField($itemId, $userId) {
    return $this->ItemManager->removeItemField($itemId, $userId);
  }
}

?>
