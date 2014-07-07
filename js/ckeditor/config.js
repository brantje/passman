/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	config.removePlugins = 'elementspath'; 
	config.resize_enabled = false;
	config.toolbar = [
		['Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat','-','BulletedList','NumberedList','Table' ]
	];
	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
};
