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
var uuid = require('node-uuid'),
path = require('path');

var releaseController = {
    new: function(req, res) {
	return res.view();
    },
    index: function(req, res) {
	Release.find(function(err, releases) {
	    if(err) throw err;
	    console.log(releases);
	    return res.view({ releases: releases });
	});
    },
    create: function(req, res) {

	var params = req.params.all();
	if(params.artists !== null) {
	    params.artists = params.artists.split(';');
	}

	var format;
	var formats = params.formats;
	for(format in formats) {
	    if(!params.formats[format]['released']) {
		delete params.formats[format];
	    }
	    
	}
	
	Release.create(params).exec(function(err, release) {
	    if(err) throw err;

	    streamOptions = {
		model: release,
		dirname: sails.config.appPath + "/assets/images/"+ release.title +"/",
		saveAs: function(file) {
		    var filename = file.filename,
                    newName = uuid.v4() + path.extname(filename);
		    return newName;
		},
		completed: function(fileData, model, next) {
		    fileData.url = fileData.path.replace(sails.config.appPath + "/assets", "");
		    model.images.original = fileData;
		    
		    model.save(function(err){
			if(err) throw err;
		    });
		    ImageService.resizeImage(
			fileData.path, 
			sails.config.appPath + "/assets/images/" + model.title + "/",
			model,
			"cover",
			{}
		    );
		}
            };
	    req.file('cover').upload(
		uploader.documentReceiverStream(streamOptions), 
		function(err, files) {
		    if(err) return res.serverError(err);
		});
	});
    },
    "slug": function(req, res, next) {
	var slug =  req.param('slug').toLowerCase();
	if(slug.match(/\..+$/)) return next();
	Release.findOneBySlug(slug).exec(function(err, release) {
	    if(err) throw err;
	    if(!release) return next();
	    res.view('release/show', release);
	});
    },

};

module.exports = releaseController;
