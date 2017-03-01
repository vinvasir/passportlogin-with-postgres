const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user.js');

// Home page - a dashboard that requires login
// it calls the ensureAuthenticated function
// as a middleware (so use the functiion as a second parameter)
router.get('/', ensureAuthenticated, (req, res, next) => {
	res.send('hello world!');
});

router.get('/register', (req, res, next) => {
	res.render('register');
});

router.get('/login', (req, res, next) => {
	res.render('login');
})

// Process logout
router.get('/logout', (req, res, next) => {
	req.logout();
	req.flash('success_msg', 'You are now logged out.');
	res.redirect('/login');
});

// Process registratoin

router.post('/register', (req, res, next) => {
	const name = req.body.name;
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Password confirmation is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors: errors
		});
	} else {
		const newUser = new User({
			name: name,
			username: username,
			email: email,
			password: password
		});
		newUser
		.save()
		.then(user => {
			console.log("Created user " + JSON.stringify(user.toJSON()).name);
			res.redirect('/login');
		})
		.catch(err => {
			console.error(err, err.stack);
			res.status(500).json({message: err})
		});		
	}
});

// Local Strategy

passport.use(new LocalStrategy((username, password, done) => {
	User
  .forge({username: username})
  .fetch()
  .then(usr => {
    if (!usr) {
      return done(null, false, {message: 'No user found'});
    }
    usr.validatePassword(password)
    .then(valid => {
      if (!valid) {
        return done(null, false, {message: 'Wrong Password'});
      }
      return done(null, usr);
    });
  })
  .catch(err => {
    return done(err)
  });
}));

// Serialize and deserialize users

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
 
passport.deserializeUser(function(user, done) {
  User
  .forge({id: user})
  .fetch()
  .then((usr) => {
    done(null, usr);
  })
  .catch((err) => {
    done(err);
  });
});

// Process login

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	})(req, res, next);
});

// Authentication / Access Control

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg', 'You are not authorized to view that page.');
		res.redirect('/login');
	}
}

module.exports = router;