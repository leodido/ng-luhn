'use strict';

var expect = chai.expect;

describe('module', function() {
  beforeEach(function() {
    module('leodido.luhn');
    leodido.constant.Luhn.DEBUG = false;
  });

  describe('luhn service', function() {
    var luhn;
    beforeEach(inject(function(_luhn_) {
      luhn = _luhn_;
    }));

    describe('interface', function() {
      it('should be available', function() {
        expect(luhn).exists; // neither null or undefined
      });

      it('should be instance of the right class', function() {
        expect(luhn).to.be.instanceof(leodido.service.Luhn);
      });

      it('should have check method', function() {
        expect(luhn).to.have.property('check');
        expect(luhn).to.respondTo('check');
      });

      it('should return false for wrong inputs', function() {
        expect(luhn.check()).to.be.false;
        expect(luhn.check('')).to.be.false;
        expect(luhn.check('abc')).to.be.false;
        expect(luhn.check('1.0')).to.be.false;
        expect(luhn.check(1)).to.be.false;
        expect(luhn.check([])).to.be.false;
        expect(luhn.check({})).to.be.false;
      });
    });

    describe('algorithm', function() {
      var validOnes = [
            '4149685344157815',
            '4984421209470251',
            '49927398716',
            '1234567812345670'
          ],
          invalidOnes = [
            '49927398717',
            '1234567812345678'
          ];
      it('should recognize valid numbers', function() {
        for (var i in validOnes) {
          if (validOnes.hasOwnProperty(i)) {
            var result = luhn.check(validOnes[i]);
            expect(result).to.be.true;
          }
        }
      });
      it('should recognize invalid numbers', function() {
        for (var i in invalidOnes) {
          if (invalidOnes.hasOwnProperty(i)) {
            var result = luhn.check(invalidOnes[i]);
            expect(result).to.be.false;
          }
        }
      });
    });
  });
});
