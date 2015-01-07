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

use \OCA\Passman\AppInfo\Application;
use \OCA\Passman\Service\CronService;
class RunCron extends \OC\BackgroundJob\TimedJob {
  public function __construct() {
    // Run once per day
    $this->setInterval(60 * 60 * 24);
  }

  protected function run($argument) {
    $app = new Application();
    $container = $app->getContainer();
    $container->query('CronService')->run();
  }

}