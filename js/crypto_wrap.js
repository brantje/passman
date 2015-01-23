/**
 * ownCloud - passman
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcos Zuriaga <wolfi@wolfi.es>
 * @copyright Marcos Zuriarga 2014
 */

var CRYPTO = {
    // Global variables of the object:
    _paranoia_level : null,

    // Sub object of this object

    /**
     * The private key object
     */
    RSA: {
        _ca_pub_key  : null,
        _private_key : null,
        _public_key  : null,


        //From now on, just methods

        /**
         * Generates the private and public random keys for a given key size
         * @param size
         * @param callback A function called after the generation its done
         */
        genKeyPair : function (size, callback) {
            setTimeout(function(){
                _cb(KEYUTIL.generateKeypair("RSA", size, null));
                callback();
            }, 200);
        },
        _genKeyPairCallback : function (key) {
            this._private_key = key['prvKeyObj'];
            this._public_key = key['pubKeyObj'];
        },

        /**
         * Returns a PKCS encoded string containing the private key
         * @returns string
         */
        getPrivKeyPKCS : function(){
            //if (_priv_key == null) Check if privkey its null before calling this method
            return KEYUTIL.getPEM(this._private_key, 'PKCS1PRV');
        },

        /**
         * Sets the object private key from the given PKCS8 PEM string
         * @param key (string)
         */
        setPrivKeyFromPKCS : function(key){
            this._private_key = KEYUTIL.getKeyFromPublicPKCS8PEM(key);
        },

        /**
         * Sets the server (CA) public key
         * @param pub_key
         */
        setServerPublicKey : function(pub_key){
            this._ca_pub_key = pub_key;
        },

        /**
         * Returns a PEM with the public key of the PRIVATE key
         * @returns {*}
         */
        getPublicPEM : function(){
            return KEYUTIL.getPEM(this._private_key);
        },
        /**
         * Sets the public key from a PEM
         * @param pubKey
         */
        setPublicPEM : function(pubKey){
            this._public_key = KEYUTIL.getPublicKeyFromCertPEM(pubKey);
        },

        /**
         * Deciphers data ciphered by the server private key
         * using the current setup public key
         * @param data
         * @returns {null}
         */
        decipherWithServer : function(data){
            var tmp = new JSEncrypt();
            tmp.getPublicKey(this._ca_pub_key);
            var dec = tmp.decrypt(data);

            return (dec == data) ? null : dec;
        },

        /**
         * Deciphers data cyphered with the public key
         *
         * @param data
         * @returns {null}
         */
        decipherWithPrivate : function (data){
            var tmp = new JSEncrypt();
            tmp.setPrivateKey(this._private_key);
            var dec = tmp.decrypt(data);

            return (dec == data) ? null : dec;
        },

        /**
         * Deciphers data with the given public key, returns null if the data was not successfully decrypted
         * @param data
         * @returns {null}
         */
        decipherWithPublic : function (data) {
            var tmp = new JSEncrypt();
            tmp.setPublicKey(this._public_key);
            var dec = tmp.decrypt(data);

            return (dec == data) ? null : dec;
        },

        /**
         * Checks whether the server public key it's valid or not.
         * When we already have a private key, the server key should be signed with our public key
         * Right now i do some simple SIMPLE checks, if we are under HTTPS and it's encrypted with our public key if we
         * already have one, and if it does not matches any of this checks; i assume it's not valid.
         * TODO: Find a way of improving this check?.
         *
         * @param pub_key
         * @returns boolean True if it's valid, false otherwise
         */
        checkServerPubKey : function(pub_key){
            var valid = false;
            if (window.location.protocol == 'https:') valid = true;
            if (this.decipherWithPrivate(pub_key) != null) valid = false;
            return valid;
        }
    },
    AES: {
        cypher: function(data, key){
            return sjcl.encrypt(key, data);
        },
        decipher: function(cryptogram, key){
                return sjcl.decrypt(key, cryptogram);
        }
    },
    PASSWORD : {
        getRandomPassword : function (length){
            return generatePassword(
                length,                 // Length of pw
                true,                   //Use UPPERCASE letters
                true,                   //Use lowercase letters
                true,                   //Use digits
                true,                   //Use special chars
                Math.round(length/4)    //Minimum amount of digits
            );
        },

        /**
         * Callback will be called once the password its generated, it should accept one parameter, and the parameter will be the key (
         *  CRYPTO.PASSWORD.generate(function(password){
         *      console.log("The generated password is: " + password);
         *      // Do more stuff here
         *  });
         * )
         * @param length    The minium length of the generated password (it generates in packs of 4 characters,
         * so it can end up being up to 3 characters longer)
         * @param callback  The function to be called after the password generation its done
         */
        generate : function (length, callback, start_string) {
            if (!sjcl.random.isReady(CRYPTO._paranoia_level)) {
                setTimeout (this.generate(length, callback, start_string), 500);
                return;
            }

            if (start_string == null) start_string = "";
            if (start_string.length < length) {
                start_string += CRYPTO.RANDOM.getRandomASCII();
            }
            else {
                callback(start_string);
                this.logRepeatedCharCount(start_string);
                return;
            }

            setTimeout(this.generate(length, callback, start_string), 0);
        },

        logRepeatedCharCount: function(str){
            var chars = {};

            for (i = 0; i < str.length; i++){
                chars[str.charAt(i)] = (chars[str.charAt(i)] == null) ? 0 : chars[str.charAt(i)]+1;
            }
            console.log(chars);
        },

        checkStrength : function (password, expected_strength){
            return zxcvbn(password);
        }
    },

    RANDOM : {
        /**
         * Returns a random string of 4 characters length
         * @param callback function that will be called when the generation it's done
         */
        getRandomASCII : function() {
            console.warn(CRYPTO._paranoia_level);

            var ret = "";
            while (ret.length < 4) {
                var int = sjcl.random.randomWords(1, CRYPTO._paranoia_level);
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
        _isASCII : function(data) {
            return  (data>32 && data<127) ? String.fromCharCode(data) : false;
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
        this._paranoia_level = (default_paranoia == null)  ? 10 : default_paranoia;

        sjcl.random.setDefaultParanoia(this._paranoia_level);
        sjcl.random.startCollectors();

        console.warn('Crypto stuff initialized');
    }
};
Window.onload = function (){CRYPTO.initEngines();};