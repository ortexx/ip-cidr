"use strict";

const assert = require('chai').assert;
const IPCIDR = require('../index');

let validCIDR = '5.5.5.8/29';
let validCIDRClear = '5.5.5.8';
let validCIDRStart = '5.5.5.8';
let validCIDREnd = '5.5.5.15';

let validRange = [
  '5.5.5.8',
  '5.5.5.9',
  '5.5.5.10',
  '5.5.5.11',
  '5.5.5.12',
  '5.5.5.13',
  '5.5.5.14',
  '5.5.5.15'
];

let invalidCIDR = 'invalid';

let validCIDRRefactor = '5.5.5.0/20';
let allowedRefactored = [8,16,24,32];
let validRefactored = [
  '5.5.0.0/24', // Note the .0.0, Is this a special case? Other IPs don't cause this.
  '5.5.1.0/24',
  '5.5.2.0/24',
  '5.5.3.0/24',
  '5.5.4.0/24',
  '5.5.5.0/24',
  '5.5.6.0/24',
  '5.5.7.0/24',
  '5.5.8.0/24',
  '5.5.9.0/24',
  '5.5.10.0/24',
  '5.5.11.0/24',
  '5.5.12.0/24',
  '5.5.13.0/24',
  '5.5.14.0/24',
  '5.5.15.0/24'
];

describe('IPCIDR:', function () {
  describe('check validity:', function () {
    it('should be valid', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.isOk(cidr.isValid());
    });

    it('should be invalid', function () {
      let cidr = new IPCIDR(invalidCIDR);

      assert.isNotOk(cidr.isValid());
    });
  });

  describe("#formatIP()", function () {
    it('check as string', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.equal(cidr.formatIP(cidr.address), validCIDRClear);
    });

    it('check as big integer', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.equal(JSON.stringify(cidr.address.bigInteger()), JSON.stringify(cidr.formatIP(cidr.address, { asBigInteger: true })));
    });

    it('check as object', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.strictEqual(cidr.address, cidr.formatIP(cidr.address, { asAddressObject: true }));
    });
  });

  describe("check methods", function () {
    it('#start()', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.equal(cidr.start(), validCIDRStart);
    });

    it('#end()', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.equal(cidr.end(), validCIDREnd);
    });

    it('#toString()', function () {
      let cidr = new IPCIDR(validCIDR);

      assert.equal(cidr.toString(), validCIDR);
    });

    it('#toRange()', function () {
      let cidr = new IPCIDR(validCIDR);
      let range = cidr.toRange();

      assert.equal(range[0], validCIDRStart);
      assert.equal(range[1], validCIDREnd);
    });

    it('#toObject()', function () {
      let cidr = new IPCIDR(validCIDR);
      let obj = cidr.toObject();

      assert.equal(obj.start, validCIDRStart);
      assert.equal(obj.end, validCIDREnd);
    });
  });

  describe("#toArray()", function () {
    it('should return the full array', function () {
      let cidr = new IPCIDR(validCIDR);
      let array = cidr.toArray();

      assert.equal(JSON.stringify(array), JSON.stringify(validRange));
    });

    it('should return a part of the range', function () {
      let cidr = new IPCIDR(validCIDR);
      let results = {};
      let options = {from: 3, limit: 10 };

      let array = cidr.toArray(options, results);

      assert.equal(results.from.intValue(), options.from);
      assert.equal(results.to.intValue(), results.length.intValue());
      assert.equal(array.length, 5);
    });
  });

  describe("#toRefactoredArray()", function () {
    it('should return the expanded array of smaller cidr', function () {
      let cidr = new IPCIDR(validCIDRRefactor);
      let array = cidr.toRefactoredArray(allowedRefactored, {});

      assert.equal(JSON.stringify(array), JSON.stringify(validRefactored));
    });
  });

  describe("#arrayAction()", function () {
    it('should read the full range', function () {
      let cidr = new IPCIDR(validCIDR);
      let counter = 0;

      return cidr.arrayAction((ip) => {
        assert.equal(validRange[counter], ip);
        counter++;
      }).then(function () {
        assert.equal(counter, validRange.length);
      })
    });

    it('should read a part of the range', function () {
      let cidr = new IPCIDR(validCIDR);
      let counter = 1;
      let results = {};
      let options = {from: counter, limit: 2 };

      return cidr.arrayAction((ip) => {
        assert.equal(validRange[counter], ip);
        counter++;
      }, options, results).then(function () {
        assert.equal(results.from.intValue(), options.from);
        assert.equal(results.limit.intValue(), options.limit);
        assert.equal(results.to.intValue(), options.from + options.limit);
        assert.equal(counter, options.from + options.limit);
      })
    });
  })
});

