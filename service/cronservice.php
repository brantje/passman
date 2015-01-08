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
namespace OCA\Passman\Service;

class CronService {
  private $db;
  private $notification;
  private $logger;

  public function __construct($db,$notifiction, $logger) {
    $this->db = $db;
    $this->notification = $notifiction;
    $this -> logger = $logger;

  }

  public function run(){
    $this -> logger -> info('Passman cron test',array('app'=>'passman'));
    $this->checkForExpiredPasswords();
  }

  private function checkForExpiredPasswords(){
    $sql = 'SELECT  * FROM `*PREFIX*passman_items` where expire_time < ? AND expire_time  > 0 ';
    $expire_time = time()*1000;
    $query = $this->db->prepareQuery($sql);
    $query->bindParam(1, $expire_time, \PDO::PARAM_INT);
    $result = $query->execute();
    while ($row = $result->fetchRow()) {
      $this -> logger -> info($row['label'].' is expired',array('app'=>'passman'));
      $remoteUrl = \OCP\Util::linkToRoute('passman.page.index').'#selectItem='. $row['id'];
      $url = 'http://localhost/core/index.php/apps/passman/#selectItem='. $row['id'];
      $this->notification->add('item_expired',array($row['label']),'',array(),$remoteUrl,$row['user_id']);
    }
  }
}

