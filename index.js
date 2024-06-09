"use strict";

import * as ipAddress from 'ip-address';

class IPCIDR {
  constructor(cidr) {
    if(typeof cidr !== 'string' || !cidr.match('/')) {
      throw new Error('Invalid CIDR address.');
    }

    const address = this.constructor.createAddress(cidr);
    this.cidr = address.address;
    this.ipAddressType = address.constructor;
    this.address = address;
    this.addressStart = address.startAddress();
    this.addressEnd = address.endAddress();
    this.addressStart.subnet = this.addressEnd.subnet = this.address.subnet;
    this.addressStart.subnetMask = this.addressEnd.subnetMask = this.address.subnetMask;
    const end = BigInt(this.addressEnd.bigInteger());
    const start = BigInt(this.addressStart.bigInteger());
    this.size = end - start + 1n;
  }

  contains(address) {
    try {
      if(!(address instanceof ipAddress.Address6) && !(address instanceof ipAddress.Address4)) {
        if(typeof address == 'bigint') {
          address = this.ipAddressType.fromBigInteger(address);
        }
        else {
          address = this.constructor.createAddress(address);
        }
      }

      return address.isInSubnet(this.address);
    }
    catch(err) {
      return false;
    }
  }

  start(options) {
    return this.constructor.formatIP(this.addressStart, options);
  }

  end(options) {
    return this.constructor.formatIP(this.addressEnd, options);
  }

  toString() {
    return this.cidr;
  }

  toRange(options) {
    return [this.constructor.formatIP(this.addressStart, options), this.constructor.formatIP(this.addressEnd, options)];
  }

  toObject(options) {
    return {
      start: this.constructor.formatIP(this.addressStart, options),
      end: this.constructor.formatIP(this.addressEnd, options)
    };
  }

  toArray(options, results) {
    options = options || {};
    const list = [];
    const start = this.constructor.formatIP(this.addressStart, { type: 'bigInteger' });
    const end = this.constructor.formatIP(this.addressEnd, { type: 'bigInteger' });
    const length = end - start + 1n;
    const info = this.getChunkInfo(length, options);

    if(results)  {
      Object.assign(results, info);
    }

    this.loopInfo(info, (val) => {
      const num = start + val;
      const ip = this.constructor.formatIP(this.ipAddressType.fromBigInteger(num), options);
      list.push(ip);
    });

    return list;
  }

  loop(fn, options, results) {
    options = options || {};
    const promise = [];
    const start = this.constructor.formatIP(this.addressStart, { type: 'bigInteger' });
    const end = this.constructor.formatIP(this.addressEnd, { type: 'bigInteger' });
    const length = end - start + 1n;
    const info = this.getChunkInfo(length, options);

    if(results)  {
      Object.assign(results, info);
    }

    this.loopInfo(info, (val) => {
      const num = start + val;
      const ip = this.constructor.formatIP(this.ipAddressType.fromBigInteger(num), options);
      promise.push(fn(ip));
    });

    return Promise.all(promise);
  }

  loopInfo(info, fn) {
    let i = info.from;

    while(i < info.to) {
      fn(i);
      i = i + 1n;
    }
  }

  getChunkInfo(length, options) {
    let from = options.from;
    let limit = options.limit;
    let to = options.to;
    let maxLength;
    const addressBigInteger = this.constructor.formatIP(this.address, { type: 'bigInteger' });

    const getBigInteger = (val) => {
      if(typeof val == 'string' && val.match(/:|\./)) {
        return this.constructor.formatIP(this.constructor.createAddress(val), { type: 'bigInteger' }) - addressBigInteger;
      }
      else if(typeof val != 'object') {
        return BigInt(val + '');
      }

      return val;
    }

    from = getBigInteger(from !== undefined? from: 0);

    if(to !== undefined) {
      to = getBigInteger(to);
      limit = to - from;
    }
    else {
      limit = limit !== undefined? getBigInteger(limit): length;
    }

    maxLength = length - from;

    if(limit > maxLength) {
      limit = maxLength;
    }

    to = from + limit;
    return {
      from: from,
      to: to,
      limit: limit,
      length: length
    };
  }
}

IPCIDR.formatIP = function(address, options) {
  options = options || {};

  if (options.type == "bigInteger") {
    return BigInt(address.bigInteger());
  }
  else if (options.type == "addressObject") {
    return address;
  }

  return address.addressMinusSuffix;
}

IPCIDR.createAddress = function (val) {
  if(typeof val !== 'string') {
    throw new Error('Invalid IP address.');
  }

  val.match(/:.\./) && (val = val.split(':').pop());
  const ipAddressType = val.match(":")? ipAddress.Address6: ipAddress.Address4;
  let ip = new ipAddressType(val);

  if(ip.v4 && val.match(":") && ip.address4) {
    ip = ip.address4;
  }

  if(ip.v4) {
    const parts = ip.addressMinusSuffix.split('.');

    for(let i = 0; i < parts.length; i++) {
      const part = parts[i].split('/')[0];

      if(part[0] == '0' && part.length > 1) {
        throw new Error('Invalid IPv4 address.');
      }
    }
  }

  return ip
}

IPCIDR.isValidAddress = function (address) {
  try {
    return !!this.createAddress(address);
  }
  catch(err) {
    return false;
  }
}

IPCIDR.isValidCIDR = function (address) {
  if(typeof address !== 'string' || !address.match('/')) {
    return false;
  }

  try {
    return !!this.createAddress(address);
  }
  catch(err) {
    return false;
  }
}

export default IPCIDR;
