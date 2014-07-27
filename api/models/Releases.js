/**
 * Releases
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var Release = {
    attributes: {
	title: {
	    type: 'STRING',
	    required: true
	},
	artists: {
	    type: 'ARRAY',
	    required: true
	},
	description: {
	    type: 'STRING'
	},
	description_html: {
	    type: 'STRING'
	},
	cover: {
	    type: 'JSON',
	    required: true
	},
	tracks: {
	    type: 'ARRAY'
	},
	formats: {
	    type: 'JSON'
	},
	slug: {
	    type: 'STRING'
	}
	
    },
    beforeCreate: function(release, next) {
	release.slug = release.title.toLowerCase();
	if(release.description !== null) {
	    release.description_html = md.toHTML(release.description);
	}
	next(null, release);
    },

};

module.exports = Release;
