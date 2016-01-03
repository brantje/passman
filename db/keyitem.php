<?php
/**
 * ownCloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcos Zuriaga <wolfi@wolfi.es>
 * @copyright Marcos Zuriarga 2015
 */

namespace OCA\Passman\Db;

use OCP\AppFramework\Db\Entity;

class KeyItem extends Entity implements \JsonSerializable {
    protected 
        $userId        = null,
        $publicKey     = null,
        $privateKey    = null,
        $version       = null;

    public function __construct() {
        $this->addType('version', 'integer');
    }

    public function jsonSerialize() {
        return [
            'userId'        => $this->userId,
            'publicKey'     => $this->publicKey,
            'privateKey'    => $this->privateKey,
            'version'       => $this->version
        ];
    }

}