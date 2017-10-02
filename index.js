"use strict";

const ipAddress = require('ip-address');
const BigInteger = require('jsbn').BigInteger;

class IPCIDR {
  constructor(cidr) {
    let ipAddressType = cidr.match(":") ? ipAddress.Address6 : ipAddress.Address4;
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

    if (options.asBigInteger) {
      return address.bigInteger();
    }
    else if (options.asAddressObject) {
      return address;
    }

    return address.addressMinusSuffix;
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

    for (let i = info.from; i < info.to; i++) {
      let num = start.add(new BigInteger(i + ''));
      let ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);

      list.push(ip);
    }

    return list;
  }
  
  arrayAction(fn, options, results) {
    options = options || {};

    let promise = [];
    let start = this.addressStart.bigInteger();
    let end = this.addressEnd.bigInteger();
    let length = end.subtract(start).add(new BigInteger('1'));
    let info = this.getChunkInfo(length, options);

    if(results)  {
      Object.assign(results, info);
    }

    for (let i = info.from; i < info.to; i++) {
      let num = start.add(new BigInteger(i + ''));
      let ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);

      promise.push(fn(ip));
    }

    return Promise.all(promise);
  }

  getChunkInfo(length, options) {
    let from, limit, to;

    if(options.from !== undefined) {
      if(typeof options.from != 'object') {
        from = new BigInteger(options.from + '');
      }
    }
    else {
      from = new BigInteger('0');
    }

    if(options.limit !== undefined) {
      if(typeof options.limit != 'object') {
        limit = new BigInteger(options.limit + '');
      }
    }
    else {
      limit = length;
    }

    if(limit.compareTo(length) > 0) {
      limit = length.subtract(from);
    }

    to = from.add(limit);

    if(to.compareTo(length) > 0) {
      to = length; 
    }
    
    return {
      from: from,
      to: to,
      limit: limit,
      length: length
    }
  }
}

module.exports = IPCIDR;
