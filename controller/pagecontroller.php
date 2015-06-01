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
use OCP\AppFramework\Http\ContentSecurityPolicy;

class PageController extends Controller {

  private $userId;
  private $itemAPI;
  private $appStorage;

  public function __construct($appName, IRequest $request, $userId, $ItemAPI, $appStorage) {
    parent::__construct($appName, $request);
    $this->userId = $userId;
    $this->itemAPI = $ItemAPI;
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
    $params = array('user' => $this->userId);
    $conf = ($this->userId ==='test') ? 1 : $conf;
    if ($conf == 1) {
      \OCP\Util::addscript('passman', 'firstrun');
      $exampleItems = array();
      $exampleItems[0] = array(
        'label'=>'Item 1',
        'tags' => array(array('text'=>'Example tag'),array('text'=>'Example tag 2'))
      );
      $exampleItems[1] = array(
        'label'=>'Item 2',
        'tags' => array(array('text'=>'Example tag 2'),array('text'=>'Example tag 3'))
      );
      foreach($exampleItems as $key => $val){
        $this->itemAPI->create('','','','','',$val['label'],'','','','',$val['tags'],array());
      }
    }


    $response =  new TemplateResponse('passman', 'main', $params);
    $csp = new ContentSecurityPolicy();
    $csp->addAllowedObjectDomain('\'self\'');
    $csp->addAllowedImageDomain('data:');
    $response->setContentSecurityPolicy($csp);
    return $response;
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
  public function firstrun($url='',$title='') {
    $params = array('url' => $url, 'label' => $title);
    return new TemplateResponse('passman', 'firstrun', $params);
  }

  /**
   * @NoAdminRequired
   * @NoCSRFRequired
   */
  public function settings(){
    $default = json_encode(array('sharing'=>array('shareKeySize'=>1024),'useImageProxy'=>true));
    $result['settings'] = json_decode(\OCP\CONFIG::getUserValue(\OC::$server->getUserSession()->getUser()->getUID(), 'passman', 'settings',$default));
    return new JSONResponse($result);
  }

  /**
  * @NoAdminRequired
  * @NoCSRFRequired
  */
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
    $fileInfo = getimagesize($url);
    $imageType = $fileInfo['mime'];
    preg_match('/image\/(.*)/',$imageType,$match);

    $response = New Response();
    $response->setStatus(304);
    $response->cacheFor((60*60*24*90));
    if($match){
      $response->addHeader('Content-Type',$match[0]);
      $f = $this->getURL($url);
      if (extension_loaded('imagick') || class_exists("Imagick")) {
        $name = tempnam('/tmp', "imageProxy");
        file_put_contents($name, $f);
        try {
          $isIcon = (strpos($url, '.ico') !== false) ? 'ico:' : '';
          $image = new \Imagick($isIcon . $name);
          if ($image->valid()) {
            $image->setImageFormat('jpg');
          }
        } catch (exception $e) {
          $f = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
          $f .='<!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'>';
          $f .='<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="16px" width="16px" version="1.1" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 71 100">';
          $f .='<path d="m65.5 45v-15c0-16.542-13.458-30-30-30s-30 13.458-30 30v15h-5.5v55h71v-55h-5.5zm-52-15c0-12.131 9.869-22 22-22s22 9.869 22 22v15h-44v-15z"/>';
          $f .= '</svg>';
          echo $f;
        }

      } else{
        $f = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
        $f .='<!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'>';
        $f .='<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="16px" width="16px" version="1.1" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 71 100">';
        $f .='<path d="m65.5 45v-15c0-16.542-13.458-30-30-30s-30 13.458-30 30v15h-5.5v55h71v-55h-5.5zm-52-15c0-12.131 9.869-22 22-22s22 9.869 22 22v15h-44v-15z"/>';
        $f .= '</svg>';
      }
    } else {
      $f = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
      $f .='<!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'>';
      $f .='<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="16px" width="16px" version="1.1" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 71 100">';
      $f .='<path d="m65.5 45v-15c0-16.542-13.458-30-30-30s-30 13.458-30 30v15h-5.5v55h71v-55h-5.5zm-52-15c0-12.131 9.869-22 22-22s22 9.869 22 22v15h-44v-15z"/>';
      $f .= '</svg>';
    }
    echo $f;
    return $response;
    //

    //
    /*if (extension_loaded('imagick') || class_exists("Imagick")) {
      try {
        $isIcon = (strpos($url, '.ico') !== false) ? 'ico:' : '';
        $image = new \Imagick($isIcon . $name);
        if ($image->valid()) {
          $image->setImageFormat('jpg');
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

  }

  private function getURL($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,5);
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
