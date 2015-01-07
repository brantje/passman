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
namespace OCA\Passman\Cron;

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
  }
}

