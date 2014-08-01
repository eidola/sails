/**
 * ReleaseController
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

function resizeImage(release, fpath) {
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

	    if(!release.cover.hasOwnProperty(size)) {
		release.cover[size] = {};
	    }
	    release.cover[size] = {
		path: dst,
		url: dst.replace(assets, '/')
	    }
	}
    }
    release.save(function(err){
	if(err) throw err;
	console.log("Release: %s - updated", release.id);
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

function processFiles(release, files) {
    if(files.hasOwnProperty('cover')) {
	var cover = files.cover;
	var src = cover.path;
	var name = cover.originalFilename;
	
	fs.readFile(src, function (err, data) {
	    var newPath = assets + 'images/' + release.id + '/covers';
	    mkdirp(newPath, function(err){
		var dest = newPath + '/' + name;
		fs.writeFile(dest, data, function (err) {
		    if(err) throw err;
		    release.cover.original = {
			path: dest,
			url: dest.replace(assets, '/')
		    };
		    resizeImage(release, dest);
		});
	    });
	});
    }
}
var releaseController = {
    new: function(req, res) {
	return res.view();
    },
    index: function(req, res) {
	Release.find(function(err, releases) {
	    if(err) throw err;
	    return res.view({ releases: releases });
	});
    },
    create: function(req, res) {

	var artists = req.body.artists || null;
	if(artists !== null) {
	    artists = artists.split(';');
	}

	var title = req.body.title || null;
	var formats = req.body.formats || null;
	var format;
	for(format in formats) {
	    if(!formats[format]['released']) {
		delete formats[format];
	    }
	    
	}
	
	Release.create({
	    title: title,
	    artists: artists,
	    cover:  {
		thumbnail: {},
		original: {},
		main: {}
	    },
	    formats: formats

	}).done(function(err, release) {
	    if(err) throw err;
	    processFiles(release, req.files);
	    res.json(release);
	});
    }
};

module.exports = releaseController;
