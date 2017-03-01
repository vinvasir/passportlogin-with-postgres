const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const logger = require('morgan');

const port = 3000;

// Load the configuration & Initialize Bookshelf & Knex.
const config  = require('./knexfile.js');
const knex = require('knex')(config[process.env.NODE_ENV]);
exports.bookshelf = require('bookshelf')(knex);

// Route files
const index = require('./routes/index');
const users = require('./routes/users');

// Init app
const app = express();

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body Parser Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Express Session
app.use(session({
  secret: 'fjei;awhg;hewro',
  resave: false,
  saveUninitialized: true
}));

// Init passport
app.use(passport.initialize());
app.use(passport.session());

// Express messages
app.use(logger('combined'));
app.use(require('connect-flash')());
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      const namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Mount routers
app.use('/', index);
app.use('/users', users);

app.listen(port, () => {
	console.log('Server started on port ', + port);
});