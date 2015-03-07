#Passman V2.0 Alpha
Version 2.0 has a complete rewritten frontend in Angular.   
Place this app in **owncloud/apps/**   
   
#Bountysource
[![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=3291427)](https://www.bountysource.com/trackers/3291427-brantje-passman?utm_source=3291427&utm_medium=shield&utm_campaign=TRACKER_BADGE)   
Passman on  [bountysource](https://www.bountysource.com/trackers/3291427-brantje-passman)
   
#Repos   
master = development, stable enough (imo) for daily use   
stable7 = Stable for ownCloud 7   
sharing = Testing / unstable not for daily use
   
#What is this?
Passman is a password manager for owncloud.   
It features client side password encryption with aes.   

#Issues
Report issue's using the template: https://github.com/brantje/passman/blob/master/issue_template.md   
   
#Features   
- Add tags to an item   
- Tag cloud   
- Client side aes password encryption   
- Option to remember the encryption key in the localstorage.   
- Password generator with strength indicator   
- Ability to add files to an item (usefull for qr codes, serials, ssl keys etc).   
- File uploading, files will be encrypted and then uploaded   
- Different vaults (just use another master pw)
   
#Screenshots
Coming soon   


#Contribute
If you want to help, git clone this repo, make your changes and send a PR.

#Todo (not in order of importance)
 - Bug fixes
 - Firefox / chrome sync
 - Mobile sync??
 
#What works
- Adding / editing / deleting tags
- Adding / editing / deleting items
- Files
- Expiring items
- Require a minimal password strength for a tag

#What does not work
- Api
- Sync   
