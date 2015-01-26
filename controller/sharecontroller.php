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


use \OCA\Passman\BusinessLayer\ItemBusinessLayer;
use \OCP\IRequest;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;

class ShareController extends Controller {
  private $userId;
  private $ItemBusinessLayer;
  private $tagBusinessLayer;
  private $shareManager;
  private $userGroups;
  public $request;

  public function __construct($appName, IRequest $request, ItemBusinessLayer $ItemBusinessLayer, $userId, $tagBusinessLayer, $shareManager/*,$userGroups*/) {
    parent::__construct($appName, $request);
  /*  $this->userId = $userId;
    $this->ItemBusinessLayer = $ItemBusinessLayer;
    $this->tagBusinessLayer = $tagBusinessLayer;
    $this->request = $request;
    $this->shareManager = $shareManager;
    $this->userGroups = $userGroups;*/
  }

 /* public function search($k) {
    $keyword = $k;

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
  }*/
  public function share($item,$shareWith){
    $result['item'] = $item;
    $result['shareWith'] = $shareWith;
    return new JSONResponse($result);
  }
  //public function userSearch($name)

  /**
   *
   */
  public function generateServerShareKeys(){
    //DoGeneration();
    $result['result'] = 'done';
    return new JSONResponse($result);
  }

    public function generateServerKeys($bit_length){
        $dn = array(
            "countryName" => "UK",
            "stateOrProvinceName" => "CHANGEME",
            "localityName" => "CHANGEME",
            "organizationName" => "CHANGE ME",
            "organizationalUnitName" => "CHANGE ME",
            "commonName" => "Someone is Someone",
            "emailAddress" => "someone@somewhere.where"
        );
        $days = 365;

        echo "Generating server key<br>";
        $key_conf['private_key_bits'] = 2048;
        $server_key = openssl_pkey_new($key_conf);
        $server_public = openssl_csr_new($dn, $server_key);
        $server_public = openssl_csr_sign($server_public, null, $server_key, $days);
        echo "Server key generated: <br><p>";
        openssl_pkey_export($server_key, $out) and var_dump($out);
        echo "</p>Server public signed key generated: <p>";
        openssl_x509_export($server_public, $out) and var_dump($out);
    }

    public function getSignedCertificateFor($client){
        echo "</p>Generating private / public key<br>";
        $dn_c = array (
            "countryName" => "UK",
            "stateOrProvinceName" => "noone",
            "localityName" => "meh!",
            "organizationName" => "the wut?",
            "organizationalUnitName" => "...",
            "commonName" => "Noone is Someone",
            "emailAddress" => "noone@somewhere.where"
        );
        $client_key = openssl_pkey_new($key_conf);
        $client_public = openssl_csr_sign(openssl_csr_new($dn_c, $client_key), $server_public, $server_key, $days);
        echo "Client key generated: <br><p>";
        flush();

        openssl_pkey_export($server_key, $out) and var_dump($out);
        echo "</p>Client public signed certificate generated: <p>";
        openssl_x509_export($client_public, $out) and var_dump($out);

        echo "</p>rnd:<p>";
        var_dump(openssl_pkey_get_details(openssl_pkey_get_public($out)));


        echo "</p><br><br><p>";
        // Show any errors that occurred here
        while (($e = openssl_error_string()) !== false) {
            echo $e . "\n";
        }
        echo "</p>";
    }
}