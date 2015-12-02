/**
 * ownCloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcos Zuriaga <wolfi@wolfi.es>
 * @copyright Marcos Zuriarga 2015
 */
app.factory('cryptoSvc', [function (shareService) {
    // Global variables of the object:
    var paranoia_level = null;

        // Sub object of this object
    
    var WRAP = {
        RSA: {

            /***
             * 
             * @param {type} key_length
             * @returns 
             */
            generateKeyPair : function(key_length){
                return forge.pki.rsa.generateKeyPair(key_length);
            },

            generateKeyPairAsync : function(key_length, callback){
                throw { 
                    name : "Not implemented", 
                    message: "Method not yet implemented (FORGE async generation is buggy right now)", 
                    location: "RSA.generateKeyPairAsync()" 
                };
            },

            /***
             * Returns an object containing data, sha1, and the signed message 
             * {data, sha1, signedMessage}
             * 
             * All three fields of the object returned by this funciton are strings
             * @param string message                The message to be signed, it will be encoded in utf8
             * @param forgePrivateKey privateKey    The private key that will sign the message
             * @returns {data, sha1, signedMessage} 
             */
            signMessage : function (message, privateKey){
                var data = {
                    data: message,
                    sha1: "",
                    signedMessage: ""
                };

                var sha1 = forge.md.sha1.create();
                sha1.update(message, 'utf8');
                data.sha1 = sha1.digest().toHex();
                data.signedMessage = forge.util.encode64(privateKey.sign(sha1));
            },

            /***
             * Checks wether a signed message is valid, it takes the original message
             * makes a checksum, compares that checksum with the received checksum and 
             * this received checksum with the signed data
             * 
             * @param string message                    The original message
             * @param string messageSha1HexString       The recieved signed checksum
             * @param raw_unencoded signedCypherData    The recieved signed cyper data encoded in base 64
             * @param forgePublicKey publicKey          The public key that is meant to check it
             * @returns boolean                         True if is valid, false otherwhise
             */
            verifySHA1Message : function (message, messageSha1HexString, signedCypherData, publicKey, utf8) {
                var sha1 = forge.md.sha1.create();
                (utf8 === undefined) ? sha1.update(message) : sha1.update(message, 'utf8');
                if (sha1.digest().toHex().toString() !== messageSha1HexString.toString()) {
                    return false;
                }

                return publicKey.verify(forge.util.hexToBytes(messageSha1HexString), forge.util.decode64(signedCypherData));
            }
        },
        AES: {
            execution_time : 0,
            cypher : function (data, key) {
                this.execution_time = new Date().getTime();
                var cpr = sjcl.encrypt(key, data);
                this.execution_time = new Date().getTime() - this.execution_time;
                return cpr;
            },
            decipher: function (cryptogram, key) {
                this.execution_time = new Date().getTime();
                var cpr = sjcl.decrypt(key, cryptogram);
                this.execution_time = new Date().getTime() - this.execution_time;
                return cpr;
            }
        },
        PASSWORD : {
            /*getRandomPassword : function (length){
             return generatePassword(
             length,                 // Length of pw
             true,                   //Use UPPERCASE letters
             true,                   //Use lowercase letters
             true,                   //Use digits
             true,                   //Use special chars
             Math.round(length/4)    //Minimum amount of digits
             );
             },*/

            /**
             * Callback will be called once the password its generated, it should accept one parameter, and the parameter will be the key (
             *  CRYPTO.PASSWORD.generate(100, function(password){
             *      console.log("The generated password is: " + password);
             *      // Do more stuff here
             *  }, function (current_percentage){
             *      console.log("The current password generation progress it's: " + current_percentage + "%");
              *     // Do real stuff here, update a progressbar, etc.
             *  }
             *  );
             * )
             * @param length    The minium length of the generated password (it generates in packs of 4 characters,
             * so it can end up being up to 3 characters longer)
             * @param callback  The function to be called after the password generation its done
             * @param progress  The process of the generation, optional, called each 4 characters generated.
             */
            generate : function (length, callback, progress, start_string) {
                if (!sjcl.random.isReady(paranoia_level)) {
                    setTimeout(this.generate(length, callback, progress, start_string), 500);
                    return;
                }

                if (start_string == null) start_string = "";
                if (start_string.length < length) {
                    start_string += RANDOM.getRandomASCII();
                    if (progress != null) progress(start_string.length / length * 100);
                }
                else {
                    callback(start_string);
                    if (progress != null) progress(100);
                    return;
                }

                setTimeout(this.generate(length, callback, progress, start_string), 0);
            },

            logRepeatedCharCount: function (str) {
                var chars = [];

                for (i = 0; i < str.length; i++) {
                    chars[str.charAt(i)] = (chars[str.charAt(i)] == null) ? 0 : chars[str.charAt(i)] + 1;
                }
                return chars;
            },

            checkStrength : function (password, expected_strength) {
                return zxcvbn(password);
            }
        },
        
        RANDOM: {
            /**
             * Returns a random string of 4 characters length
             * @param callback function that will be called when the generation it's done
             */
            getRandomASCII : function () {
                console.warn(paranoia_level);

                var ret = "";
                while (ret.length < 4) {
                    var int = sjcl.random.randomWords(1, paranoia_level);
                    int = int[0];

                    var tmp = this._isASCII((int & 0xFF000000) >> 24);
                    if (tmp) ret += tmp;

                    tmp = this._isASCII((int & 0x00FF0000) >> 16);
                    if (tmp) ret += tmp;

                    tmp = this._isASCII((int & 0x0000FF00) >> 8);
                    if (tmp) ret += tmp;

                    tmp = this._isASCII(int & 0x000000FF);
                    if (tmp)  ret += tmp;
                }

                return ret;
            },

            /**
             * Checks whether the given data it's an ascii character, returning the corresponding character; returns false otherwise
             *
             * @param data
             * @returns {string}
             * @private
             */
            _isASCII : function (data) {
                return (data > 31 && data < 127) ? String.fromCharCode(data) : false;
            }
        },
        
        /**
        * Initializes the random and other cryptographic engines needed for this library to work
        * The default paranoia, in case no paranoia level it's provided, it's 10 (1024).
        * The higher paranoia level allowed by sjcl.
        *
        * PARANOIA_LEVELS:
        *  0 = 0
        *  1 = 48
        *  2 = 64
        *  3 = 96
        *  4 = 128
        *  5 = 192
        *  6 = 256
        *  7 = 384
        *  8 = 512
        *  9 = 768
        *  10 = 1024
        *
        * @param default_paranoia (0-10 integer)
        */
       initEngines : function (default_paranoia) {
           paranoia_level = default_paranoia || 10;

           sjcl.random.setDefaultParanoia(this._paranoia_level);
           sjcl.random.startCollectors();

           console.warn('Crypto stuff initialized');
       }
    };
    
    

    WRAP.initEngines();

    return {
        RSA : {
            genKeyPair : function (size, callback){
                callback(WRAP.RSA.generateKeyPair(size));
            },
            publicKeyToPEM : function (key){
                return forge.pki.publicKeyToPem(key);
            },
            privateKeyToPEM : function (key){
                return forge.pki.privateKeyToPem(key);
            }
        }
    }
}]);