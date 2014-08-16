/**
 * SessionController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var bcrypt = require('bcrypt');

module.exports = {
    
    "new": function(req, res) {
	
	res.view('session/new');
    },
    "create": function(req, res, next) {
	console.log(req.headers.referer);
	if(!(req.param('email') || req.param('password'))) {
	    res.redirect('/session/new');
	    return;
	}
	User.findOneByEmail(req.param('email')).exec(function(err, user) {
	    if(err) throw err;
	    if(!user) {
		console.log("User Not Found!");
		res.redirect('/session/new');
		return;
	    }
	    
	    bcrypt.compare(req.param('password'), user.password, function(err, valid) {
		if(err) throw err;
		if(!valid) {
		    console.log("Password and User Do Not Match!");
		    res.redirect('/session/new');
		    return;
		}
		req.session.authenticated = true;
		req.session.User = user;
		var now = new Date()
		req.session.cookie.expires = new Date().setTime(now.getTime() + (3600*1000));
		res.redirect('/user/' + user.id);// want to redirect this if possible to the page request that caused the new function to be hit so SessionController.new.req.headers.referer
	    });
	});
    },
    "destroy": function(req, res, next) {
	req.session.destory();
	req.redirect('/session/new');
    }
						     
  
};
