
require("dotenv").config();
const dns = require('dns');
const connectDB = require("./config/db");
const app = require("./app");

// Prefer reliable public DNS for SRV lookups (helps when local DNS/VPN blocks SRV)
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});

