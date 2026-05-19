
require("dotenv").config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
// Railway containers have no IPv6 internet connectivity — patch dns.lookup globally
// so every net.createConnection (including nodemailer's) resolves to IPv4 only.
const _lookup = dns.lookup.bind(dns);
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') return _lookup(hostname, { family: 4 }, options);
  return _lookup(hostname, { ...(typeof options === 'object' ? options : {}), family: 4 }, callback);
};

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});

