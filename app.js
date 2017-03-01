const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// Load the configuration & Initialize Bookshelf & Knex.
const config  = require('./knexfile.js');
const knex = require('knex')(config[process.env.NODE_ENV]);
exports.bookshelf = require('bookshelf')(knex);