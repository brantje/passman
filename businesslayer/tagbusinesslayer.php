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

use \OCA\Passman\Db\FolderManager;
use \OCA\Passman\Utility\Config;


class TagBusinessLayer {
	private $tagManager;
	public function __construct($tagManager){
		$this->tagManager = $tagManager;
	}
	
	public function create($tag,$userId){
		return $this->tagManager->create($tag,$userId);
	}

	public function search($tag,$userId,$exactMatch=false) {
		return $this->tagManager->search($tag,$userId,$exactMatch);
	}
	
	public function linkTagXItem($tag,$userId,$itemId){
		$tagId = key($this->tagManager->search($tag,$userId,true));
		$this->tagManager->linkTagXItem($tagId,$itemId);
	}
	public function removeTags($itemId){
		$this->tagManager->removeTags($itemId);
	}
	public function loadAll($userId){
		return $this->tagManager->loadAll($userId);
	}
	public function load($tag,$userId){
		return $this->tagManager->load($tag,$userId);
	}
	public function update($tag,$userId){
		return $this->tagManager->update($tag,$userId);
	}
}

?>