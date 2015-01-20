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
        /**
         * Callback will be called once the password its generated, it should accept one parameter, and the parameter will be the key (
         *  CRYPTO.PASSWORD.generate(function(password){
         *      console.log("The generated password is: " + password);
         *      // Do more stuff here
         *  });
         * )
         * @param callback
         */
        generate : function (callback) {
            if (!sjcl.random.isReady(this._paranoia_level)) {
                setTimeout (this.generate, 500);
                return;
            }

        },

        checkStrength : function (password, expected_strength) {
        }
    },
    RANDOM : {
        /**
         * Returns an string of 4 characters length
         */
        getRandomASCII : function (){
            sjcl.random.randomWords(1, this._paranoia_level);
            console.log(this._paranoia_level);
            return "test";
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
        if (default_paranoia == null) default_paranoia = 10;
        this._paranoia_level = default_paranoia;
        sjcl.random.setDefaultParanoia(default_paranoia);
        sjcl.random.startCollectors();
    }
};