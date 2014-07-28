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
use \OCP\AppFramework\Controller;
use \OCP\CONFIG;
class PageController extends Controller {

	private $userId;
	private $itemBusinessLayer;
	private $appStorage;
	public function __construct($appName, IRequest $request, $userId, $ItemBusinessLayer, $appStorage) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this -> itemBusinessLayer = $ItemBusinessLayer;
		$this -> appStorage = $appStorage;
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
		$params = array('user' => $this -> userId);
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
	public function popup() {
		$folders = array();
		$foldersHierarchical = array();
		$url = ($this -> params('url')) ? $this -> params('url') : '';
		$label = ($this -> params('title')) ? $this -> params('title') : '';
		$params = array('folders' => json_encode($foldersHierarchical), 'foldersPlain' => json_encode($folders), 'url' => $url, 'label' => $label, 'f');
		return new TemplateResponse('passman', 'popup', $params);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function imageproxy() {
		$url = $this -> params('url');
		if (filter_var($url, FILTER_VALIDATE_URL) === FALSE) {
			die('Not a valid URL');
		}
		$md5Url = md5($url);
		if ($this->getFavIcon($md5Url)) {
			echo 'get file';
			//echo $this->getFavIcon($md5Url);
		} else {
			$f = $this -> getURL($url);
			$name = tempnam('/tmp', "imageProxy");
			file_put_contents($name, $f);
			if( extension_loaded('imagick') || class_exists("Imagick") ){
				try {
					$isIcon = (strpos($url, '.ico') !== false) ? 'ico:' : '';
					$image = new \Imagick($isIcon . $name);
					if ($image -> valid()) {
						$image->setImageFormat('png');
						header("Content-Type: image/png");
						header('Cache-Control: max-age=86400, public');
						
						//$this->writeFavIcon($md5url, '123456789');
						echo $image;
	
					}
				} catch(exception $e) {
					header("HTTP/1.1 200 OK");
					die();
				}
				return die();
			}
			else {
				$image_mime = image_type_to_mime_type(exif_imagetype($file));
				if($image_mime){
					header("Content-Type:". $image_mime);
					header('Cache-Control: max-age=86400, public');
					echo $f;
					return die();
				}
			}
		}
	}

	private function getURL($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		$tmp = curl_exec($ch);
		curl_close($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		if ($httpCode == 404) {
			return false;
		} else {
			if ($tmp != false) {
				return $tmp;
			}
		}

	}

	private function writeFavIcon($content) {
		// check if file exists and write to it if possible
		try {
			try {
				$file = $this -> appStorage -> get('/myfile.txt');
			} catch(\OCP\Files\NotFoundException $e) {
				$this -> appStorage -> touch('data/myfile.txt'); 
				$file = $this -> appStorage -> get('/myfile.txt');
			}

			// the id can be accessed by $file->getId();
			$file -> putContent($content);
			//return true;

		} catch(\OCP\Files\NotPermittedException $e) {
			// you have to create this exception by yourself ;)
			die('Cant write to file');
			//return false;
		}
	}

	private function getFavIcon($file) {
		try {
			$file = $this -> appStorage -> get('/myfile.txt');
		} catch(\OCP\Files\NotFoundException $e) {
			return false;
		}
	}

}
