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

namespace OCA\Passman\AppInfo;
\OCP\App::registerAdmin('passman', 'admin-settings');
\OCP\App::addNavigationEntry(array(
  // the string under which your app will be referenced in owncloud
  'id' => 'passman',

  // sorting weight for the navigation. The higher the number, the higher
  // will it be listed in the navigation
  'order' => 10,

  // the route that will be shown on startup
  'href' => \OCP\Util::linkToRoute('passman.page.index'),

  // the icon that will be shown in the navigation
  // this file needs to exist in img/
  'icon' => \OCP\Util::imagePath('passman', 'app.png'),

  // the title of your application. This will be used in the
  // navigation or on the settings page of your app
  'name' => \OCP\Util::getL10N('passman')->t('Passwords')
));

\OC::$server->getActivityManager()->registerExtension(function() {
  return new \OCA\Passman\Activity();
});