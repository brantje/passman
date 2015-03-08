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

namespace OCA\Passman;

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
use \OCP\AppFramework\App;

use \OCA\Passman\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, array(

'routes' => array(
    array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),
    array('name' => 'page#disablefirstrun', 'url' => '/disablefirstrun', 'verb' => 'GET'),
    array('name' => 'page#firstrun', 'url' => '/firstrun', 'verb' => 'GET'),
    array('name' => 'page#popup', 'url' => '/add', 'verb' => 'GET'),

    array('name' => 'page#settings', 'url' => '/api/v1/settings', 'verb' => 'GET'),
    array('name' => 'page#savesettings', 'url' => '/api/v1/savesettings', 'verb' => 'POST'),

    array('name' => 'page#imageproxy', 'url' => '/imageproxy/{hash}', 'verb' => 'GET'),

    array('name' => 'notification#add', 'url' => '/api/v1/notification/add', 'verb' => 'POST'),

    array('name' => 'tag#search', 'url' => '/api/v1/tags/search', 'verb' => 'GET'),
    array('name' => 'tag#loadall', 'url' => '/api/v1/tags/list', 'verb' => 'GET'),
    array('name' => 'tag#load', 'url' => '/api/v1/tag/load', 'verb' => 'GET'),
    array('name' => 'tag#update', 'url' => '/api/v1/tag/update', 'verb' => 'PATCH'),

    array('name' => 'item_api#getbytag', 'url' => '/api/v1/getbytags', 'verb' => 'GET'),
    array('name' => 'item_api#getdeleted', 'url' => '/api/v1/items/getdeleted', 'verb' => 'GET'),
    array('name' => 'item_api#index', 'url' => '/api/v1/items', 'verb' => 'GET'),
    array('name' => 'item_api#get', 'url' => '/api/v1/item/{itemId}', 'verb' => 'GET'),
    array('name' => 'item_api#create', 'url' => '/api/v1/item', 'verb' => 'PUT'),
    array('name' => 'item_api#update', 'url' => '/api/v1/item/{itemId}', 'verb' => 'PATCH'),
    array('name' => 'item_api#delete', 'url' => '/api/v1/item/delete/{id}', 'verb' => 'DELETE'),
    array('name' => 'item_api#restore', 'url' => '/api/v1/item/restore/{id}', 'verb' => 'GET'),
    array('name' => 'item_api#search', 'url' => '/api/v1/item/search/{itemName}', 'verb' => 'GET'),
    array('name' => 'item_api#getfavicon', 'url' => '/api/v1/item/getfavicon/{hash}', 'verb' => 'GET'),

    array('name' => 'item_api#massupdate', 'url' => '/api/v1/updateallitemsandfiles', 'verb' => 'PATCH'),

    array('name' => 'item_api#addtag', 'url' => '/api/v1/tag/addtag', 'verb' => 'GET'),

    array('name' => 'item_api#deletefield', 'url' => '/api/v1/item/field/delete/{id}', 'verb' => 'DELETE'),

    array('name' => 'item_api#addfile', 'url' => '/api/v1/item/{itemId}/addfile', 'verb' => 'PUT'),
    array('name' => 'item_api#getfile', 'url' => '/api/v1/item/file/{id}', 'verb' => 'GET'),
    array('name' => 'item_api#deletefile', 'url' => '/api/v1/item/file/{id}', 'verb' => 'DELETE'),

    array('name' => 'revision#save', 'url' => '/api/v1/item/{id}/history', 'verb' => 'PUT'),
    array('name' => 'revision#getrevisions', 'url' => '/api/v1/item/{id}/history', 'verb' => 'GET'),

  array('name' => 'revision#getallrevisions', 'url' => '/api/v1/items/revisions', 'verb' => 'GET'),


    //array('name' => 'share#search', 'url' => '/api/v1/sharing/search', 'verb' => 'GET'),
    array('name' => 'share#share', 'url' => '/api/v1/sharing/share', 'verb' => 'PUT'),
    array('name' => 'share#generateServerShareKeys', 'url' => '/generatesharekeys', 'verb' => 'GET'),
)));