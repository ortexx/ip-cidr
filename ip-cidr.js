"use strict";

const ipAddress = require('ip-address');
const BigInteger = require('jsbn').BigInteger;

class IPCIDR {
    constructor(cidr) {
        let ipAddressType = cidr.match(":")? ipAddress.Address6: ipAddress.Address4;
        let address = new ipAddressType(cidr); 
        
        this._isValid = address.isValid();
        
        if(this._isValid) {
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
        
        if(options.asBigInteger) {            
            return address.bigInteger();
        }
        else if(options.asAddressObject) {
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
    
    toArray(options) {
        let list = [];
        let start = this.addressStart.bigInteger();
        let end = this.addressEnd.bigInteger();
        let length = end.subtract(start);
        
        options = options || {};
                
        if(options.limit && length > options.limit) {            
            options.limitResult = {
                maxLength: options.limit,
                fullLength: parseInt(length)
            };
            
            length = options.limit;
        }     
        
        for (let i = 0; i <= length; i++) {
            let num = start.add(new BigInteger(i + ''));
            let ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);
            
            list.push(ip);
        }
        
        return list;    
    }
    
    arrayAction(fn, options) {
        let promise = [];
        let start = this.addressStart.bigInteger();
        let end = this.addressEnd.bigInteger();
        let length = end.subtract(start);
        
        for (let i = 0; i <= length; i++) {
            let num = start.add(new BigInteger(i + ''));
            let ip = this.formatIP(this.ipAddressType.fromBigInteger(num), options);
            
            promise.add(fn(ip));
        }
        
        return Promise.all(promise);
    }
} 

module.exports = IPCIDR;
