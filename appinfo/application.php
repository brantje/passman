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

use \OCA\Passman\Controller\FolderApiController;
use \OCA\Passman\BusinessLayer\FolderBusinessLayer;
use \OCA\Passman\Db\FolderManager;

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
				$c->query('UserId')
			);
		});

		$container->registerService('FolderApiController', function($c) {
			return new FolderApiController(
				$c->query('AppName'), 
				$c->query('Request'),
				$c->query('FolderBusinessLayer'),
				$c->query('UserId')
			);
		});
		$container->registerService('ItemApiController', function($c) {
			return new ItemApiController(
				$c->query('AppName'), 
				$c->query('Request'),
				$c->query('ItemBusinessLayer'),
				$c->query('UserId'),
				$c->query('FolderBusinessLayer')
			);
		});
		
		 
		/**
		* Business Layer
		*/
		$container->registerService('FolderBusinessLayer', function($c) {
			return new FolderBusinessLayer(
				$c->query('FolderManager')
			);
		});
		
		$container->registerService('ItemBusinessLayer', function($c) {
			return new ItemBusinessLayer(
				$c->query('ItemManager')
			);
		});
		
		/**
		 * Mappers
		 */
		$container->registerService('FolderManager', function($c) {
			return new FolderManager(
				$c->query('ServerContainer')->getDb()
			);
		});
		$container->registerService('ItemManager', function($c) {
			return new ItemManager(
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