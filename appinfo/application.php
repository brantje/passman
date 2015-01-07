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

namespace OCA\Passman\AppInfo;


use OCA\Passman\Controller\NotificationController;
use \OCP\AppFramework\App;


use \OCA\Passman\Controller\PageController;

use \OCA\Passman\Controller\TagController;
use \OCA\Passman\Controller\RevisionController;
use \OCA\Passman\BusinessLayer\TagBusinessLayer;
use \OCA\Passman\Db\TagManager;

use \OCA\Passman\Controller\ItemApiController;
use \OCA\Passman\BusinessLayer\ItemBusinessLayer;
use \OCA\Passman\Db\ItemManager;

use \OCA\Passman\Controller\ShareController;
use \OCA\Passman\Db\ShareManager;
use \OCA\Passman\Db\RevisionManager;

use \OCA\PassMan\Utility\SimplePieAPIFactory;
use \OCA\PassMan\Utility\FaviconFetcher;
use \OCA\Passman\Service\Cronservice;

if (!class_exists('\SimplePie')) {
  require_once __DIR__ . '/../3rdparty/simplepie/autoloader.php';
}

\OC::$server->getActivityManager()->registerExtension(function() {
  return new \OCA\Passman\Activity();
});

class Application extends App {


  public function __construct(array $urlParams = array()) {
    parent::__construct('passman', $urlParams);

    $container = $this->getContainer();

    /**
     * Controllers
     */
    $container->registerService('PageController', function ($c) {
      return new PageController(
        $c->query('AppName'),
        $c->query('Request'),
        $c->query('UserId'),
        $c->query('ItemBusinessLayer'),
        $c->query('AppStorage')
      );
    });

    $container->registerService('ItemApiController', function ($c) {
      return new ItemApiController(
        $c->query('AppName'),
        $c->query('Request'),
        $c->query('ItemBusinessLayer'),
        $c->query('UserId'),
        $c->query('TagBusinessLayer'),
        $c->query('FaviconFetcher'),
        $c->query('RevisionController'),
        $c->query('NotificationController')
      );
    });

    $container->registerService('TagController', function ($c) {
      return new TagController(
        $c->query('AppName'),
        $c->query('Request'),
        $c->query('TagBusinessLayer'),
        $c->query('UserId')
      );
    });

    $container->registerService('ShareController', function ($c) {
      return new ShareController(
        $c->query('AppName'),
        $c->query('Request'),
        $c->query('ItemBusinessLayer'),
        $c->query('UserId'),
        $c->query('TagBusinessLayer'),
        $c->query('ShareManager')
      );
    });

    $container->registerService('RevisionController', function ($c) {
        return new RevisionController(
          $c->query('AppName'),
          $c->query('Request'),
          $c->query('UserId'),
          $c->query('RevisionManager')
        );
    });

    $container->registerService('NotificationController', function ($c) {
      return new NotificationController(
        $c->query('AppName'),
        $c->query('Request'),
        $c->query('UserId')
      );
    });


    /**
     * Business Layer
     */

    $container->registerService('ItemBusinessLayer', function ($c) {
      return new ItemBusinessLayer(
        $c->query('ItemManager'),
        $c->query('TagBusinessLayer')
      );
    });

    $container->registerService('TagBusinessLayer', function ($c) {
      return new TagBusinessLayer(
        $c->query('TagManager')
      );
    });

    /**
     * Mappers
     */
    $container->registerService('ItemManager', function ($c) {
      return new ItemManager(
        $c->query('ServerContainer')->getDb()
      );
    });
    $container->registerService('TagManager', function ($c) {
      return new TagManager(
        $c->query('ServerContainer')->getDb()
      );
    });

    $container->registerService('ShareManager', function ($c) {
      return new ShareManager(
        $c->query('ServerContainer')->getDb()
      );
    });

    $container->registerService('RevisionManager', function ($c) {
      return new RevisionManager(
        $c->query('ServerContainer')->getDb()
      );
    });

    $container->registerService('SimplePieAPIFactory', function () {
      return new SimplePieAPIFactory();
    });

    $container->registerService('FaviconFetcher', function ($c) {
      return new FaviconFetcher(
        $c->query('SimplePieAPIFactory')
      );
    });

    /** Cron  **/
    $container->registerService('CronService', function ($c) {
      return new CronService(
        $c->query('Db'),
        $c->query('NotificationController'),
        $c->query('Logger')
      );
    });

    /**
     * Core
     */
    $container->registerService('UserId', function ($c) {
      return \OCP\User::getUser();
    });

    $container->registerService('Db', function () {
      return new Db();
    });

    $container->registerService('AppStorage', function ($c) {
      return $c->query('ServerContainer')->getAppFolder();
    });
    $container->registerService('Logger', function($c) {
      return $c->query('ServerContainer')->getLogger();
    });
  }


}