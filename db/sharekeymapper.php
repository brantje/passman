<?php
/**
 * ownCloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcos Zuriaga <wolfi@wolfi.es>
 * @copyright Marcos Zuriarga 2015
 */

namespace OCA\Passman\Db;

use OCP\AppFramework\Db\Mapper;

class ShareKeyMapper extends Mapper {
    const DB_NAME = 'passman';
    const TABLE_NAME = 'passman_share_key';
    
    public function __construct(\OCP\IDb $db) {
        parent::__construct($db, self::TABLE_NAME, '\OCA\Passman\Db\KeyItem');
    }
    
    public function saveKey(KeyItem $key){
        $this->insert($key);
    }
    
    public function getLatestUserKeyId($user){
        $q = "SELECT MAX(version) FROM *PREFIX*" . self::TABLE_NAME . " WHERE user_id = ?";
        $q = $this->db->prepareQuery($q);
        $q->bindParam(1, $user);
        $r = $q->execute();
        
        return $r->fetchOne(0);
    }
    
    public function getUserKeyDataVersion($user, $version){
        $q = "SELECT * FROM *PREFIX*" . self::TABLE_NAME . ' WHERE user_id = ? AND version = ?';
        return $this->findEntity($q, [$user, $version], 1);
    }
}

