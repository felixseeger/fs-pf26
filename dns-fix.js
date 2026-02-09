// Force Node.js to use system DNS for .local domains
const dns = require('dns');
dns.setDefaultResultOrder('verbatim');
