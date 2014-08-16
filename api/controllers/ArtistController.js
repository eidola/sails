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
var uuid = require('node-uuid'),
path = require('path');

module.exports = {
    "new": function(req, res) {
	res.view();
    },
    "create": function(req, res) {
	
	var params = req.params.all();
	Artist.create(params, function(err, artist) {
	    if(err) throw err;
	    
	    var results = [],
            streamOptions = {
		model: artist,
		dirname: sails.config.appPath + "/assets/images/"+ artist.name +"/",
		saveAs: function(file) {
		    var filename = file.filename,
                    newName = uuid.v4() + path.extname(filename);
		    return newName;
		},
		completed: function(fileData, model, next) {
		    console.log(fileData);
		    console.log(model);
		    fileData.url = fileData.path.replace(sails.config.appPath + "/assets", "");
		    model.images.original = fileData;
		    
		    model.save(function(err){
			if(err) throw err;
		    });
		    ImageService.resizeImage(
			fileData.path, 
			sails.config.appPath + "/assets/images/" + model.name + "/",
			model,
			"images",
			{}
		    );
		}
            };
	    req.file('image').upload(
		uploader.documentReceiverStream(streamOptions), 
		function(err, files) {
		    if(err) return res.serverError(err);
		    res.json({
			files:results
		    });
		});
	    
	    
	    res.redirect('/artist/'+artist.slug);
	});
    },
    "edit": function(req, res) {
	Artist.findOne(req.params.id).exec(function(err, artist) {
	    if(err) throw err;
	    console.log(artist);
	    res.view(artist);
	});
    },
    "update": function(req,res) {
	Artist.update(req.params.id, req.params.all(), function(err, artist) {
	    if(err) throw err;
	    res.redirect('/artist/' + artist.name);
	});
    },
    "index": function(req, res) {
	Artist.find(function(err, artists) {
	    if(err) throw err;
	    console.log(artists);
	    res.view({ artists: artists });
	});
    },
    "admin": function(req, res) {
	Artist.find(function(err, artists) {
	    if(err) throw err;
	    res.view({ artists: artists });
	});
    },
    "destroy": function(req, res) {
	Artist.destroy(req.params.id, function(err, status) {
	    if(err) throw err;
	    res.redirect('/artist/admin');
	});
	
    },
    "show": function(req, res) {

	Artist.findOne(req.params.id).exec(function(err, artist) {
	    if(err) throw err;
	    res.view(artist);
	});
    },
    "slug": function(req, res, next) {

	var slug =  req.param('slug').toLowerCase();
	if(slug.match(/\..+$/)) return next();
	Artist.findOneBySlug(slug).exec(function(err, artist) {
	    if(err) throw err;
	    if(!artist) return next();
	    Release.find({ artists:{ contains: slug} }).exec(function(err, releases) {
		if(err) throw err;
		res.view('artist/show', {artist: artist, releases:releases});
	    });
	});
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ArtistController)
     */
    _config: {}

    
};
