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

namespace OCA\Passman\Controller;

use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Http\Response;
use \OCP\AppFramework\Http\JSONResponse;
use \OCP\AppFramework\Controller;
use \OCP\CONFIG;

class PageController extends Controller {

  private $userId;
  private $itemBusinessLayer;
  private $appStorage;

  public function __construct($appName, IRequest $request, $userId, $ItemBusinessLayer, $appStorage) {
    parent::__construct($appName, $request);
    $this->userId = $userId;
    $this->itemBusinessLayer = $ItemBusinessLayer;
    $this->appStorage = $appStorage;
  }

  /**
   * CAUTION: the @Stuff turn off security checks, for this page no admin is
   *          required and no CSRF check. If you don't know what CSRF is, read
   *          it up in the docs or you might create a security hole. This is
   *          basically the only required method to add this exemption, don't
   *          add it to any other method if you don't exactly know what it does
   *
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function index() {
    $conf = \OCP\CONFIG::getUserValue(\OCP\User::getUser(), 'firstpassmanrun', 'show', 1);
    if ($conf == 1) {
      \OCP\Util::addscript('passman', 'firstrun');
    }
    $params = array('user' => $this->userId);
    return new TemplateResponse('passman', 'main', $params);
    // templates/main.php
  }

  /**
   * @NoAdminRequired
   */
  public function disablefirstrun() {
    \OCP\Config::setUserValue(\OCP\User::getUser(), 'firstpassmanrun', 'show', 0);
    echo "Succes!";
  }

  /**
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function popup($url='',$title='') {
    $params = array('url' => $url, 'label' => $title);
    return new TemplateResponse('passman', 'popup', $params);
  }
  /**
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function settings(){
    $default = json_encode(array('sharing'=>array('shareKeySize'=>1024)));
    $result['settings'] = json_decode(\OCP\CONFIG::getUserValue(\OC::$server->getUserSession()->getUser()->getUID(), 'passman', 'settings',$default));
    return new JSONResponse($result);
  }
  public function savesettings($settings){
    $result = \OCP\CONFIG::setUserValue(\OC::$server->getUserSession()->getUser()->getUID(), 'passman', 'settings',json_encode($settings));

    return new JSONResponse($settings);
  }
  /**
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function imageproxy($hash) {
    $url = base64_decode($hash);
    if (filter_var($url, FILTER_VALIDATE_URL) === false) {
      die('Not a valid URL');
    }
    $f = $this->getURL($url);
    $name = tempnam('/tmp', "imageProxy");
    file_put_contents($name, $f);
    /*if (extension_loaded('imagick') || class_exists("Imagick")) {
      try {
        $isIcon = (strpos($url, '.ico') !== false) ? 'ico:' : '';
        $image = new \Imagick($isIcon . $name);
        if ($image->valid()) {
          $image->setImageFormat('jpg');
          //echo $image;
          $response = New Response();
          $response->setStatus(304);
          $cache_expire_date = gmdate('D, d M Y H:i:s', time() + (60*60*24*90)) . ' GMT';
          $response->setHeaders(array(
            'Content-Type'=>'image/png',
            'Cache-Control'=> 'max-age=7776000, public',
            'User-Cache-Control'=> 'max-age=7776000',
            'Strict-Transport-Security'=> 'max-age=7776000',
            'Expires'=>  $cache_expire_date,
            'Pragma'=>  'cache',
          ));
          echo $image;
          return $response;
        }
      } catch (exception $e) {
        header("HTTP/1.1 200 OK");
        echo "test";
        die();
      }
      return die();
    } else {
      if ($f) {
        $image_mime = image_type_to_mime_type(exif_imagetype($f));
        if ($image_mime) {
          header("Content-Type:" . $image_mime);
          header('Cache-Control: max-age=86400, public');
          header('Cache-Control: max-age=86400, public');
          echo $f;
          return die();
        }
      }
    }*/
    $response = New Response();
    $response->setStatus(304);
    $cache_expire_date = gmdate('D, d M Y H:i:s', time() + (60*60*24*90)) . ' GMT';
    $response->setHeaders(array(
      'Content-Type'=>'image/png',
      'Cache-Control'=> 'max-age=7776000, public',
      'User-Cache-Control'=> 'max-age=7776000',
      'Strict-Transport-Security'=> 'max-age=7776000',
      'Expires'=>  $cache_expire_date,
      'Pragma'=>  'cache',
    ));
    echo $f;
    return $response;
  }

  private function getURL($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    $tmp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode == 404) {
      return false;
    } else {
      if ($tmp != false) {
        return $tmp;
      }
    }

  }





}
