# Install  
`npm install ip-cidr`

# About  
Module for working with CIDR (v4, v6). Based on [ip-address](https://github.com/beaugunderson/ip-address)

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

const fn = (ip) => {
    // do something with each element of CIDR range    
    data.push(ip) // ip is "ip-address" module object, because of option asAddressObject is true 
}

cidr.arrayAction(fn, { asAddressObject: true });
cidr.toArray({ asBigInteger: true }); // get array of all ip in CIDR range as big integer;
cidr.toRange(); // get array of start and end ip as string [startIpAsString, endIpAsString]
```

## Client side
Load __/dist/ip-cidr.js__ as script and get the library in __window.IPCIDR__

# API  
### .formatIP(address, [options])  
returns the "ip-address" module object in the necessary format  
options are the same in all of the library functions and might include asBigInteger, asAddressObject or asString (by default)

### .start([options])  
get start ip

### .end([options])  
get end ip

### .toString()   
get string cidr as "50.165.190.0/23"

### .toRange([options])  
get array of start and end ip [startIp, endIp]

### .toObject([options])   
get object of start and end ip {start: startIp, end: endIp}

### .toArray([options], [results])  
get an array of all ip in CIDR range  
you can get an information by chunks using options.from and options.limit  
this options might be an integer or a big integer("jsbn" instance)  
you can pass the second argument "results" (object) to get all chunk pagination information

### .arrayAction(fn, [options], [results])  
run fn for every element of CIDR range  
you can use the same chunk options as in .toArray



