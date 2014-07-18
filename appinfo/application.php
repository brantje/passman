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


use \OCP\AppFramework\App;


use \OCA\Passman\Controller\PageController;

use \OCA\Passman\Controller\TagController;
use \OCA\Passman\BusinessLayer\TagBusinessLayer;
use \OCA\Passman\Db\TagManager;

use \OCA\Passman\Controller\ItemApiController;
use \OCA\Passman\BusinessLayer\ItemBusinessLayer;
use \OCA\Passman\Db\ItemManager;

class Application extends App {


	public function __construct (array $urlParams=array()) {
		parent::__construct('passman', $urlParams);

		$container = $this->getContainer();

		/**
		 * Controllers
		 */
		$container->registerService('PageController', function($c) {
			return new PageController(
				$c->query('AppName'), 
				$c->query('Request'),
				$c->query('UserId'),
				$c->query('ItemBusinessLayer')
			);
		});

		$container->registerService('ItemApiController', function($c) {
			return new ItemApiController(
				$c->query('AppName'), 
				$c->query('Request'),
				$c->query('ItemBusinessLayer'),
				$c->query('UserId'),
				$c->query('TagBusinessLayer')
			);
		});
		
		$container->registerService('TagController', function($c) {
			return new TagController(
				$c->query('AppName'), 
				$c->query('Request'),
				$c->query('TagBusinessLayer'),
				$c->query('UserId')
			);
		});
		
		 
		/**
		* Business Layer
		*/
		
		$container->registerService('ItemBusinessLayer', function($c) {
			return new ItemBusinessLayer(
				$c->query('ItemManager')
			);
		});
		
		$container->registerService('TagBusinessLayer', function($c) {
			return new TagBusinessLayer(
				$c->query('TagManager')
			);
		});
		
		/**
		 * Mappers
		 */
		$container->registerService('ItemManager', function($c) {
			return new ItemManager(
				$c->query('ServerContainer')->getDb()
			);
		});
		$container->registerService('TagManager', function($c) {
			return new TagManager(
				$c->query('ServerContainer')->getDb()
			);
		});
		
		/**
		 * Core
		 */
		$container->registerService('UserId', function($c) {
			return \OCP\User::getUser();
		});		
		$container->registerService('Db', function() {
			return new Db();
		});
				
	}


}