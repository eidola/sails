/**
 * Artist
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var md = require('markdown').markdown;

var fs = require('fs');
var im = require('imagemagick-native');
var mkdirp = require('mkdirp');
var path = require('path');
var assets = "/home/james/Projects/Eidola Records/WWW/sails/eidolarecords/assets/";
var sizes = {
    thumbnail: 200,
    main: 300
};

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
	images: {
	    type: 'ARRAY'
	},
	image_details: {
	    type: 'JSON'
	},
	slug: {
	    type: 'STRING'
	}
    },
    processImage: function(artist, callback) {
	
	Artist.findOne(artist.id).exec(function(err, artist) {
	    var src = artist.image_details.path;
	    var name = artist.image.originalFilename;
	    
	    fs.readFile(src, function (err, data) {
		var newPath = assets + 'images/' + artist.name + '/photos';
		mkdirp(newPath, function(err){
		    if(err) throw err;
		    var dest = newPath + '/' + name;
		    fs.writeFile(dest, data, { flags: "w"}, function (err) {
			if(err) throw err;
			var data = {
			    path: dest,
			    url: dest.replace(assets, '/').toLowerCase(),
			    name: name
			};
			artist.images.push(data);
			artist.save(callback)
			//resizeImage(artist, dest);
		    });
		});
	    });
	});
    },
    beforeCreate: function(artist, next) {
	
	artist.slug = artist.name.toLowerCase();
	if(artist.description !== null) {
	    artist.description_html = md.toHTML(artist.description);
	}
	artist.images = [];
	next(null, artist);
    },
    beforeUpdate: function(artist, next) {
	
	if(artist.description !== null) {
	    artist.description_html = md.toHTML(artist.description);
	}
	next(null, artist);
    }
    

};
