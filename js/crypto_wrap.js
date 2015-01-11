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
    /**
     * The private key object
     */
    RSA: {
        _private_key: null,
        _public_key: null,


        //From now on, just methods

        /**
         * Generates the private and public random keys for a given key size
         * @param size
         * @param callback A function called after the generation its done
         */
        genKeyPair: function (size, callback) {
            setTimeout(function(){
                _cb(KEYUTIL.generateKeypair("RSA", size, null));
                callback();
            }, 200);
        },
        _genKeyPairCallback: function (key) {
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
         * Returns a PEM with the public key of the PRIVATE key
         * @returns {*}
         */
        getPublicPEM : function(){
            return KEYUTIL.getPEM(this._private_key);
        },
        /**
         * Sets the publick key from a PEM
         * @param pubKey
         */
        setPublicPEM : function(pubKey){
            this._public_key = KEYUTIL.getPublicKeyFromCertPEM(pubKey);
        },

        decypherWithPrivate : function(data){

        }
    },
    AES: {
        cypher: function(data, key){
            return sjcl.encrypt(key, data);
        },
        decypher: function(cryptogram, key){
                return sjcl.decrypt(key, cryptogram);
        }
    }
};
