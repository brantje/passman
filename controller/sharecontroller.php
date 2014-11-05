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
    private $faviconFetcher;
    public $request; 
    
    public function __construct($appName, IRequest $request,  ItemBusinessLayer $ItemBusinessLayer,$userId,$tagBusinessLayer,$faviconFetcher){
        parent::__construct($appName, $request);
        $this->userId = $userId;
        $this->ItemBusinessLayer = $ItemBusinessLayer;
        $this->tagBusinessLayer = $tagBusinessLayer;
        $this->request = $request;
        $this->faviconFetcher = $faviconFetcher;
    }
}