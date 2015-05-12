'use strict';

goog.provide('leodido.service.Luhn');

goog.require('leodido.constant.Luhn');



/**
 * Luhn algorithm
 *
 * @constructor
 */
leodido.service.Luhn = function() {
  leodido.constant.Luhn.DEBUG && console.log('Luhn::ctor');
  // Privates
  var that = this,
      prods = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
      ];
  // Privileged
  /**
   * Verify the checksum digit of a number by means of the luhn algorithm.
   *
   * @param {!string} number The credit card number to verify
   * @return {!boolean}
   */
  that.check = function(number) {
    leodido.constant.Luhn.DEBUG && console.log('Luhn::check');
    if (!number) {
      return false;
    }
    var len = number.length,
        mul = 0,
        sum = 0;
    while (len--) {
      sum += prods[mul][parseInt(number.charAt(len), 10)]; // FIXME: number.charAt(len) >> 0 should be faster
      mul ^= 1;
    }
    return sum % 10 === 0 && sum > 0;
  };
};
