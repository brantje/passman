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


\OC_Util::checkAdminUser();


$tmpl = new OCP\Template('passman', 'admin');
$tmpl->assign('keyLengthServer', \OCP\Config::getAppValue('passman', 'keyLengthServer'));
$tmpl->assign('keyLengthClient',\OCP\Config::getAppValue('passman', 'keyLengthClient'));
$tmpl->assign('privateServerKey', \OCP\Config::getAppValue('passman', 'privateServerKey'));
$tmpl->assign('publicServerKey', \OCP\Config::getAppValue('passman', 'publicServerKey'));
$tmpl->assign('disableSharingNonHTTPS', \OCP\Config::getAppValue('passman', 'disableSharingNonHTTPS'));

return $tmpl->fetchPage();
