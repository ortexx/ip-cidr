"use strict";

const ipAddress = require('ip-address');
const BigInteger = require('jsbn').BigInteger;

function createAddress(val) {
  val.match(/:.\./) && (val = val.split(':').pop());
  const ipAddressType = val.match(":")? ipAddress.Address6: ipAddress.Address4;
  return new ipAddressType(val);
}

class IPCIDR {
  constructor(cidr) {
    if(typeof cidr !== 'string') {
      this._isValid = false;
      return;
    }

    const address = createAddress(cidr);
    this._isValid = !!(address.isValid() && cidr.match('/'));

    if (!this._isValid) {
      return;
    }

    this.cidr = address.address;
    this.ipAddressType = address.constructor;
    this.address = address;
    this.addressStart = address.startAddress();    
    this.addressEnd = address.endAddress();
    this.addressStart.subnet = this.addressEnd.subnet = this.address.subnet;
    this.addressStart.subnetMask = this.addressEnd.subnetMask = this.address.subnetMask;
  }

  isValid() {
    return this._isValid;
  }

  formatIP(address, options) {
    options = options || {};

    if (options.type == "bigInteger") {
      return new BigInteger(address.bigInteger().toString());
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
    const list = [];
    const start = this.formatIP(this.addressStart, { type: 'bigInteger' });
    const end = this.formatIP(this.addressEnd, { type: 'bigInteger' });
    const length = end.subtract(start).add(new BigInteger('1'));
    const info = this.getChunkInfo(length, options);

    if(results)  {
      Object.assign(results, info);
    }

    this.loopInfo(info, (val) => {
      const num = start.add(val);
      const ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);
      list.push(ip);
    });

    return list;
  }
  
  loop(fn, options, results) {
    options = options || {};
    const promise = [];
    const start = this.formatIP(this.addressStart, { type: 'bigInteger' });
    const end = this.formatIP(this.addressEnd, { type: 'bigInteger' });
    const length = end.subtract(start).add(new BigInteger('1'));
    const info = this.getChunkInfo(length, options);
    
    if(results)  {
      Object.assign(results, info);
    }

    this.loopInfo(info, (val) => {
      const num = start.add(val);
      const ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);
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
    let limit = options.limit;
    let to = options.to;
    let maxLength;
    const addressBigInteger = this.formatIP(this.address, { type: 'bigInteger' });

    const getBigInteger = (val) => {
      if(typeof val == 'string' && val.match(/:|\./)) {
        return this.formatIP(createAddress(val), { type: 'bigInteger' }).subtract(addressBigInteger);
      }
      else if(typeof val != 'object') {
        return new BigInteger(val + '');
      }

      return val;
    }

    from = getBigInteger(from !== undefined? from: 0);

    if(to !== undefined) {
      to = getBigInteger(to);
      limit = to.subtract(from);
    }
    else {
      limit = limit !== undefined? getBigInteger(limit): length;
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
