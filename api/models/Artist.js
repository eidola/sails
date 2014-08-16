/**
 * Artist
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var marked = require('marked');


module.exports = {

    attributes: {
	name: {
	    type: 'STRING',
	    required: true,
	    unique: true
	},
	description: {
	    type: 'STRING'
	},
	description_html: {
	    type: 'STRING'
	},
	image: {
	    type: 'OBJECT'
	},
	images: {
	    type: 'JSON'
	},
	image_details: {
	    type: 'JSON'
	},
	slug: {
	    type: 'STRING'
	}
    },
    
    beforeCreate: function(artist, next) {
	
	artist.slug = artist.name.toLowerCase();
	if(artist.description !== null) {
	    artist.description_html = marked(artist.description);
	}
	
	artist.images = {};
	next(null, artist);
    },
    beforeUpdate: function(artist, next) {
	if(artist.description !== null) {
	    artist.description_html = marked(artist.description);
	}
	console.log(artist);
	next(null, artist);
    }
    

};
