# Passman
Place this app in **owncloud/apps/**

#What is this?
Passman is a password manager for owncloud.
It features client side password encryption with aes.

#Screenshots
![Image](http://puu.sh/9NZUY/18d04fcb48.png)
![Image](http://puu.sh/9NZWv/a55c6e5da5.png)
![Image](http://puu.sh/9NZXr/3928a964a9.png)
![Image](http://puu.sh/9NZYh/f044d9f147.png)
#Features
- Add items in a folder
- Folder tree
- Client side aes password encryption
- Option to remember the encryption key in the localstorage.
- Password generator with strength indicator
- Abillity to add files to an item (usefull for qr codes, serials, ssl keys etc).


#Contribute
If you want to help, git clone this repo, make your changes and send a PR.

#Todo
 - Bug fixes
 - Translations
 - Check in the backend if folderid exists
 - File uploading
 - Firefox / chrome sync
 - Mobile sync??
 
#Not working
- Adding / editing / creating folders (disappear on refresh)
- Adding / editing / creating items (Does not work at all)

## Running tests
After [Installing PHPUnit](http://phpunit.de/getting-started.html) run:

    phpunit tests/
