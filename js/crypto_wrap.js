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
            async.parallel([
                async.apply(function () {
                    this._genKeyPairCallback(KEYUTIL.generateKeypair("RSA", size));
                    callback();
                })
            ]);
            async.run();
        },
        _genKeyPairCallback: function (key) {
            this._private_key = key['prvKeyObj'];
            this._public_key = key['pubKeyObj'];
        }
    }
};
