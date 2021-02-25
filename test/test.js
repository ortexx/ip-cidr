"use strict";

const assert = require('chai').assert;
const IPCIDR = require('../index');
const BigInteger = require('jsbn').BigInteger;
const ipAddress = require('ip-address');

const validCIDR = '5.5.5.8/29';
const validCIDRMapped = '5.5.5.8/29';
const validCIDRClear = '5.5.5.8';
const validCIDRStart = '5.5.5.8';
const validCIDREnd = '5.5.5.15';

const validRange = [
  '5.5.5.8',
  '5.5.5.9',
  '5.5.5.10',
  '5.5.5.11',
  '5.5.5.12',
  '5.5.5.13',
  '5.5.5.14',
  '5.5.5.15'
];

describe('IPCIDR:', function () {
  describe('check validity:', function () {
    it('should be valid', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.isTrue(cidr.isValid());
    });

    it('should be valid v6', function () {
      const cidr = new IPCIDR('2001:db8::/120');
      assert.isTrue(cidr.isValid(), 'check the status');      
      assert.equal(cidr.addressStart.addressMinusSuffix, '2001:0db8:0000:0000:0000:0000:0000:0000', 'check the start');      
      assert.equal(cidr.addressEnd.addressMinusSuffix, '2001:0db8:0000:0000:0000:0000:0000:00ff', 'check the end');      
    });

    it('should be valid mapped cidr', function () {
      const cidr = new IPCIDR('::FFFF:' + validCIDRMapped);
      assert.isTrue(cidr.isValid(), 'check the status');      
      assert.equal(cidr.addressStart.addressMinusSuffix, validCIDRStart, 'check the start');      
      assert.equal(cidr.addressEnd.addressMinusSuffix, validCIDREnd, 'check the end');     

    });

    it('should be invalid', function () {
      const cidr = new IPCIDR('192.168.1.1');
      assert.isFalse(cidr.isValid());
    });
  });

  describe(".formatIP()", function () {
    it('check as string', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.equal(cidr.formatIP(cidr.address), validCIDRClear);
    });

    it('check as big integer', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.equal(JSON.stringify(cidr.formatIP(cidr.address, { type: 'bigInteger' })), JSON.stringify(cidr.formatIP(cidr.address, { type: "bigInteger" })));
    });

    it('check as object', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.strictEqual(cidr.address, cidr.formatIP(cidr.address, { type: "addressObject" }));
    });
  });

  describe(".contains()", function () {
    describe("check as string", function () {
      it('should be true', function () {
        const cidr = new IPCIDR(validCIDR);
        assert.isTrue(cidr.contains('5.5.5.15'));      
      });

      it('should be false', function () {
        const cidr = new IPCIDR(validCIDR);
        assert.isFalse(cidr.contains('5.5.5.16'));      
      });
    });

    describe("check as big integer", function () {
      it('should be true', function () {
        const cidr = new IPCIDR(validCIDR);
        assert.isTrue(cidr.contains(new BigInteger('84215055')));      
      });

      it('should be false', function () {
        const cidr = new IPCIDR(validCIDR);
        assert.isFalse(cidr.contains(new BigInteger('84215056')));      
      });
    });

    describe("check as object", function () {
      it('should be true', function () {
        const cidr = new IPCIDR(validCIDR);
        assert.isTrue(cidr.contains(new ipAddress.Address4('5.5.5.15')));      
      });

      it('should be false', function () {
        const cidr = new IPCIDR(validCIDR);
        assert.isFalse(cidr.contains(new ipAddress.Address4('5.5.5.16')));      
      });
    });
  });

  describe("check methods", function () {
    it('.start()', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.equal(cidr.start(), validCIDRStart);
    });

    it('.end()', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.equal(cidr.end(), validCIDREnd);
    });

    it('.toString()', function () {
      const cidr = new IPCIDR(validCIDR);
      assert.equal(cidr.toString(), validCIDR);
    });

    it('.toRange()', function () {
      const cidr = new IPCIDR(validCIDR);
      const range = cidr.toRange();
      assert.equal(range[0], validCIDRStart);
      assert.equal(range[1], validCIDREnd);
    });

    it('.toObject()', function () {
      const cidr = new IPCIDR(validCIDR);
      const obj = cidr.toObject();
      assert.equal(obj.start, validCIDRStart);
      assert.equal(obj.end, validCIDREnd);
    });
  });

  describe(".toArray()", function () {
    it('should return the full array', function () {
      const cidr = new IPCIDR(validCIDR);
      const array = cidr.toArray();
      assert.equal(JSON.stringify(array), JSON.stringify(validRange));
    });

    it('should return an empty array with from/limit', function () {
      const cidr = new IPCIDR(validCIDR);
      const array = cidr.toArray({ from: 0, limit: -1 }); 
      assert.lengthOf(array, 0);
    });

    it('should return an empty array with from/to', function () {
      const cidr = new IPCIDR(validCIDR);
      const array = cidr.toArray({ from: 5, to: 3 }); 
      assert.lengthOf(array, 0);
    });

    it('should return a part of the range with from/limit with numbers', function () {
      const cidr = new IPCIDR(validCIDR);
      const results = {};
      const options = { from: 3, limit: 10 };
      const array = cidr.toArray(options, results);      
      assert.equal(results.from.intValue(), options.from);
      assert.equal(results.to.intValue(), results.length.intValue());
      assert.lengthOf(array, validRange.length - options.from);
    });
    
    it('should return a part of the range with from/limit with numbers', function () {
      const cidr = new IPCIDR(validCIDR);
      const results = {};
      const options = { from: new BigInteger('3'), limit: new BigInteger('2') };
      const array = cidr.toArray(options, results);      
      assert.equal(results.from.intValue(), +options.from.toString());
      assert.equal(results.limit.intValue(), +options.limit.toString());
      assert.lengthOf(array, +options.limit.toString());
    });
    
    it('should return a part of the range with from/to and numbers', function () {
      const cidr = new IPCIDR(validCIDR);
      const results = {};
      const options = { from: 3, to: 5 };
      const array = cidr.toArray(options, results);
      assert.equal(results.from.intValue(), options.from);
      assert.equal(results.to.intValue(), options.to);
      assert.equal(array[0], validRange[options.from]);
      assert.equal(array[1], validRange[options.to - 1]);
      assert.lengthOf(array, 2);
    });

    it('should return a part of the range with from/to and strings', function () {
      const cidr = new IPCIDR(validCIDR);
      const results = {};
      const from = 3;
      const to = 5;
      const options = { from: validRange[from], to: validRange[to] };
      const array = cidr.toArray(options, results);
      assert.equal(results.from.intValue(), from);
      assert.equal(results.to.intValue(), to);
      assert.equal(array[0], validRange[from]);
      assert.equal(array[1], validRange[to - 1]);
      assert.lengthOf(array, 2);
    });
  });

  describe(".loop()", function () {
    it('should read the full range', function () {
      const cidr = new IPCIDR(validCIDR);
      let counter = 0;

      return cidr.loop((ip) => {
        assert.equal(validRange[counter], ip);
        counter++;
      }).then(function () {
        assert.equal(counter, validRange.length);
      })
    });

    it('should read a part of the range', function () {
      const cidr = new IPCIDR(validCIDR);
      let counter = 1;
      const results = {};
      const options = { from: counter, limit: 2 };

      return cidr.loop((ip) => {
        assert.equal(validRange[counter], ip);
        counter++;
      }, options, results).then(function () {
        assert.equal(results.from.intValue(), options.from);
        assert.equal(results.limit.intValue(), options.limit);
        assert.equal(results.to.intValue(), options.from + options.limit);
        assert.equal(counter, options.from + options.limit);
      })
    });
  });
});

