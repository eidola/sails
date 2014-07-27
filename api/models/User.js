/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var bcrypt = require('bcrypt');

module.exports = {
    attributes: {
	name: {
	    type: 'string',
	    required: true
	},
	email: {
	    type: 'string',
	    email: true,
	    required: true,
	    unique: true

	},
	password: {
	    type: 'string'
	},
	toJSON: function() {
	    var obj = this.toObject();
	    delete obj.password;
	    delete obj._csrf;
	    return obj;
	}
    },

    beforeCreate: function(user, cb) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(user.password, salt, function(err, hash) {
		if (err) {
		    console.log(err);
		    cb(err);
		}else{
		    user.password = hash;
		    cb(null, user);
		}
	    });
	});
    }
};
