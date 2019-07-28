# Install  
`npm install ip-cidr`

# About  
Module for working with CIDR (v4, v6). Based on [ip-address](https://github.com/beaugunderson/ip-address).

# Example  

```js
const IPCIDR = require("ip-cidr");
const cidr = new IPCIDR("50.165.190.0/23"); 

if(!cidr.isValid()) {
  throw new Error('CIDR is invalid');
}

// get start ip address as a string
cidr.start(); 

// get end ip address as a big integer
cidr.end({ type: "bigInteger" }); 

// do something with each element of the range  
cidr.loop(ip => console.log(ip), { type: "addressObject" });

// get an array of all ip addresses in the range as a big integer;
cidr.toArray({ type: "bigInteger" }); 

// get an array of start and end ip addresses as a string [startIpAsString, endIpAsString]
cidr.toRange(); 
```

## Client side
Load __/dist/ip-cidr.js__ as a script and you can get the library in __window.IPCIDR__

# API  
### .formatIP(address, [options])  
to return an "ip-address" module object in the necessary format 

### .contains(address)  
to check the address belongs to the range

### .start([options])  
to get the start ip adress

### .end([options])  
to get the end ip address

### .toString()   
to convert the cidr to a string like "50.165.190.0/23"

### .toRange([options])  
to convert the cidr to an array with start and end ip addresses [startIp, endIp]

### .toObject([options])   
to convert the cidr to an object with start and end ip addresses {start: startIp, end: endIp}

### .toArray([options], [results])  
to convert the cidr to an array with all ip addresses in the range  
you can get information by chunks using **options.from** and **options.limit**  
the options might be an integer or a big integer("jsbn" instance)  
you can pass the second argument "results" (object) to get all chunk pagination information

### .loop(fn, [options], [results])  
to run __fn__ for each element of the range  
you can use the same chunk options as in __.toArray()__



