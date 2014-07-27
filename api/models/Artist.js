/**
 * Artist
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var md = require('markdown').markdown;

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
	    type: 'JSON'
	},
	slug: {
	    type: 'STRING'
	}
    },
    beforeCreate: function(artist, next) {
	artist.slug = artist.name.toLowerCase();
	if(artist.description !== null) {
	    artist.description_html = md.toHTML(artist.description);
	}
	next(null, artist);
    },
    beforeUpdate: function(artist, next) {
	
	if(artist.description !== null) {
	    artist.description_html = md.toHTML(artist.description);
	}
	next(null, artist);
    }
    

};
