// Set options as a parameter, environment variable, or rc file.
require('dotenv').config()
require = require("esm")(module/*, options*/)
module.exports = require("./src/app.js")