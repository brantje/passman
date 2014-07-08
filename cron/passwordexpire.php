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
 
namespace OCA\Passman\Cron;

use \OCA\Activity\Data;
/**
 * Class PasswordExpire
 *
 * @package OCA\Passman\Cron
 */
class PasswordExpire {
	protected function run($argument) {
		$test = \OCA\Activity\Data::send('passman','Test',array(),'Longer test msg','','link','brantje','password_expired', 30);
		mail('brantje@gmail.com','test cron',time()); 
	}
} 

?>