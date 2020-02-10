"use strict";

const ipAddress = require('ip-address');
const BigInteger = require('jsbn').BigInteger;

class IPCIDR {
  constructor(cidr) {
    let ipAddressType = cidr.match(":")? ipAddress.Address6: ipAddress.Address4;
    let address = new ipAddressType(cidr);

    this._isValid = address.isValid();

    if (this._isValid) {
      this.cidr = cidr;
      this.ipAddressType = ipAddressType;
      this.address = address;
      this.addressStart = address.startAddress();
      this.addressEnd = address.endAddress();
    }
  }

  isValid() {
    return this._isValid;
  }

  formatIP(address, options) {
    options = options || {};

    if (options.type == "bigInteger") {
      return address.bigInteger();
    }
    else if (options.type == "addressObject") {
      return address;
    }

    return address.addressMinusSuffix;
  }

  contains(address) {
    if(!(address instanceof ipAddress.Address6) && !(address instanceof ipAddress.Address4)) {
      if(typeof address == 'object') {
        address = this.ipAddressType.fromBigInteger(address);
      }
      else {
        address = new this.ipAddressType(address);
      }
    }
    
    return address.isInSubnet(this.address)
  }

  start(options) {
    return this.formatIP(this.addressStart, options);
  }

  end(options) {
    return this.formatIP(this.addressEnd, options);
  }

  toString() {
    return this.cidr;
  }

  toRange(options) {
    return [this.formatIP(this.addressStart, options), this.formatIP(this.addressEnd, options)];
  }

  toObject(options) {
    return {
      start: this.formatIP(this.addressStart, options),
      end: this.formatIP(this.addressEnd, options)
    };
  }

  toArray(options, results) {
    options = options || {};
    let list = [];
    let start = this.addressStart.bigInteger();
    let end = this.addressEnd.bigInteger();
    let length = end.subtract(start).add(new BigInteger('1'));
    let info = this.getChunkInfo(length, options);

    if(results)  {
      Object.assign(results, info);
    }

    this.loopInfo(info, (val) => {
      let num = start.add(val);
      let ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);
      list.push(ip);
    });

    return list;
  }
  
  loop(fn, options, results) {
    options = options || {};

    let promise = [];
    let start = this.addressStart.bigInteger();
    let end = this.addressEnd.bigInteger();
    let length = end.subtract(start).add(new BigInteger('1'));
    let info = this.getChunkInfo(length, options);
    
    if(results)  {
      Object.assign(results, info);
    }

    this.loopInfo(info, (val) => {
      let num = start.add(val);
      let ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);
      promise.push(fn(ip));
    });

    return Promise.all(promise);
  }

  loopInfo(info, fn) {
    let i = info.from;

    while(i.compareTo(info.to) < 0) {
      fn(i);
      i = i.add(new BigInteger('1'));
    }
  }

  getChunkInfo(length, options) {
    let from = options.from;
    let limit = options.limit
    let to, maxLength;

    if(from !== undefined) {
      if(typeof from != 'object') {
        from = new BigInteger(from + '');
      }
    }
    else {
      from = new BigInteger('0');
    }

    if(limit !== undefined) {
      if(typeof limit != 'object') {
        limit = new BigInteger(limit + '');
      }
    }
    else {
      limit = length;
    }

    maxLength = length.subtract(from);
    
    if(limit.compareTo(maxLength) > 0) {
      limit = maxLength;
    }
    
    to = from.add(limit);

    return {
      from: from,
      to: to,
      limit: limit,
      length: length
    };
  }
}

module.exports = IPCIDR;
