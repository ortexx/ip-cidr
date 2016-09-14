# Install 
`npm install ip-cidr`

# About
Module for work with CIDR (v4, v6)

# Example
```js
const CIDR = require("ip-cidr");

let cidr = new CIDR("50.165.190.0/23"); 

if(!cidr.isValid()) {
    // something 
}

cidr.start(); // get start ip as string
cidr.end({ asBigInteger: true }); // get end ip as big integer

let data = [];

let fn = (ip) => {
    // do something with each element of CIDR range    
    data.push(ip) // ip is "ip-address" module object, because of option asAddressObject is true 
}

cidr.arrayAction(fn, { asAddressObject: true });
cidr.toArray({ asBigInteger: true }); // get array of all ip in CIDR range as big integer;
cidr.toRange() // get array of start and end ip as string [startIpAsString, endIpAsString]

```

# FULL API
### .formatIP(address, options)
returns the "ip-address" module object ip address in the specified in options format
options are the same in all of the library functions and may include asBigInteger, asAddressObject or asString if options are empty

### .start(options)
get start ip

### .end(options)
get end ip

### .toString() {
get string cidr as "50.165.190.0/23"

### .toRange(options) {
get array of start and end ip [startIp, endIp]

### .toObject(options) {
get object of start and end ip {start: startIp, end: endIp}

### .toArray(options) {
get array of all ip in CIDR range
you can set maximum of array elements with options.limit
if the limit is reached, you will receive additional information in options.limitResult

### arrayAction(fn, options)
run fn for every element of CIDR range



