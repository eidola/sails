/**
 * ArtistController
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

var fs = require('fs');
var im = require('imagemagick-native');
var mkdirp = require('mkdirp');
var path = require('path');

var assets = "/home/james/Projects/Eidola Records/WWW/sails/eidolarecords/assets/";
var sizes = {
    thumbnail: 200,
    main: 300
};
function resizeImage(artist, fpath) {
    var ext = path.extname(fpath);
    var basename = path.basename(fpath);
    var buffer = fs.readFileSync(fpath);
    for(size in sizes) {
	if(sizes.hasOwnProperty(size)) {
	    var dim = sizes[size];
	    var image = im.convert({
		srcData: buffer,
		width: dim,
		height: dim,
		resizeStyle: "aspectfill",
		quality: 80
	    });
	    var dst = fpath.replace(basename, size+ext);
	    fs.writeFile(dst, image, function(err) {
		if(err) throw err;
	    });

	    if(!artist.image.hasOwnProperty(size)) {
		artist.image[size] = {};
	    }
	    artist.image[size] = {
		path: dst,
		url: dst.replace(assets, '/')
	    }
	}
    }
    artist.save(function(err){
	if(err) throw err;
	console.log("artist: %s - updated", artist.id);
    });
}
function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}
function processFiles(artist, files) {
    if(files.hasOwnProperty('image')) {
	var image = files.image;
	var src = image.path;
	var name = image.originalFilename;
	
	fs.readFile(src, function (err, data) {
	    var newPath = assets + 'images/' + artist.name + '/photos';
	    mkdirp(newPath, function(err){
		var dest = newPath + '/' + name;
		fs.writeFile(dest, data, function (err) {
		    if(err) throw err;
		    if(!artist.hasOwnProperty('image')) {
			artist.image = {};
		    }
		    artist.image.original = {
			path: dest,
			url: dest.replace(assets, '/')
		    };
		    resizeImage(artist, dest);
		});
	    });
	});
    }
}

module.exports = {
    "new": function(req, res) {
	res.view();
    },
    "create": function(req, res) {
	Artist.create(req.params.all(), function(err, artist) {
	    if(err) throw err;
	    processFiles(artist, req.files);
	    res.redirect('/artist/'+artist.slug);
	});
    },
    "edit": function(req, res) {
	Artist.findOne(req.params.id).done(function(err, artist) {
	    if(err) throw err;
	    res.view(artist);
	});
    },
    "index": function(req, res) {
	Artist.find(function(err, artists) {
	    if(err) throw err;
	    res.view({ artists: artists });
	});
    },
    "show": function(req, res) {
	Artist.findOne(req.params.id).done(function(err, artist) {
	    if(err) throw err;
	    res.view(artist);
	});
    },
    "slug": function(req, res, next) {
	var slug =  req.param('slug').toLowerCase();
	if(slug.match(/\..+$/) || slug === 'new') return next();
	Artist.findOneBySlug(slug).done(function(err, artist) {
	    if(err) throw err;
	    res.view(artist, 'artist/show');
	});
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ArtistController)
     */
    _config: {}

    
};
