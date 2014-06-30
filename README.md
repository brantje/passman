# Passman
Place this app in **owncloud/apps/**

#What is this?
Passman is a password manager for owncloud.
It features client side password encryption with aes.

#Features
- Add items in a folder
- Folder tree
- Client side aes password encryption
- Option to remember the encryption key in the localstorage.
- Password generator with strength indicator
- Abillity to add files to an item (usefull for qr codes, serials, ssl keys etc).
- File uploading, files will be encrypted and then uploaded

#Screenshots
![Image](http://puu.sh/9NZUY/18d04fcb48.png)
![Image](http://puu.sh/9NZWv/a55c6e5da5.png)
![Image](http://puu.sh/9NZXr/3928a964a9.png)
![Image](http://puu.sh/9NZYh/f044d9f147.png)


#Contribute
If you want to help, git clone this repo, make your changes and send a PR.

#Todo (not in order of importance)
 - Bug fixes
 - Translations
 - Check in the backend if folderid exists
 - Firefox / chrome sync
 - Mobile sync??
 
#What works
- Adding / editing / deleting folders
- Adding / editing / deleting items
- Files

#What does not work
- Api
- Sync
## Running tests
After [Installing PHPUnit](http://phpunit.de/getting-started.html) run:

    phpunit tests/
