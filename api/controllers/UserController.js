/**
 * UserController
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

module.exports = {
    "new": function(req, res) {
	res.view();
    },
    "create": function(req, res, next) {
	User.create(req.params.all(), function userCreated(err, user) {
	    if(err) return next(err);
	    res.json(user);
	});
    },
    "edit": function(req, res) {
	User.findOne(req.params.id).done(function(err, user) {
	    if(err) throw err;
	    res.view({user: user});
	});
    },
    "index": function(req, res) {
	User.find(function(err, users) {
	    if(err) throw err;
	    return res.view({ users: users });
	});
    },
    "destroy": function(req, res) {
	User.destroy(req.params.id, function(err, status) {
	    if(err) throw err;
	    res.redirect('/user');
	});
	
    },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
