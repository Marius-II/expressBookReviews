const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
// Assuming the registration route is in this file, adjust the import to match your route setup
const authRoutes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Adjusted to mount auth routes under '/auth' instead of '/customer'
app.use("/auth", authRoutes);

// General routes remain the same
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
