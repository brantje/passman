<?php
/**
 * ownCloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcos Zuriaga <wolfi@wolfi.es>
 * @copyright Marcos Zuriarga 2014
 */

namespace OCA\Passman\Controller;

use \OCA\Passman\BusinessLayer\TagBusinessLayer;
use \OCA\Passman\BusinessLayer\ItemBusinessLayer;
use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;

class ShareController extends Controller {
  private $userId;
  private $ItemBusinessLayer;
  private $tagBusinessLayer;
  private $shareManager;
  public $request;

  public function __construct($appName, IRequest $request, ItemBusinessLayer $ItemBusinessLayer, $userId, $tagBusinessLayer, $shareManager) {
    parent::__construct($appName, $request);
    $this->userId = $userId;
    $this->ItemBusinessLayer = $ItemBusinessLayer;
    $this->tagBusinessLayer = $tagBusinessLayer;
    $this->request = $request;
    $this->shareManager = $shareManager;
  }

  public function search() {
    $keyword = $this->params('k');
    /* Setup some example results */
    $result[0]['text'] = 'User';
    $result[0]['type'] = 'user';
    $result[0]['id'] = 'user';
    $result[1]['text'] = 'group 1';
    $result[1]['type'] = 'group';
    $result[1]['id'] = 'group 1';
    $result[2]['text'] = 'User 2';
    $result[2]['type'] = 'user';
    $result[2]['id'] = 'user 2';
    $result[3]['text'] = 'group 2';
    $result[3]['type'] = 'group';
    $result[3]['id'] = 'group 2';
    $result[4]['text'] = 'User4';
    $result[4]['type'] = 'user';
    $result[4]['id'] = 'user 4';
    $result[5]['text'] = 'test';
    $result[5]['type'] = 'user';
    $result[5]['id'] = 'test';

    return new JSONResponse($result);
  }
}