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

module.exports = {
    "new": function(req, res) {
	res.view();
    },
    "create": function(req, res) {
	
	var params = _.extend({}, req.params.all());
	console.log(req.files);
	_.each(req.files, function(file) {
	    console.log(file);
	    file.upload(function(err, files) {
		if(err) throw err;
		console.log(files);
	    });
	});
	
	Artist.create(params, function(err, artist) {
	    if(err) throw err;
	    res.redirect('/artist/'+artist.slug);
	});
    },
    "edit": function(req, res) {
	Artist.findOne(req.params.id).exec(function(err, artist) {
	    if(err) throw err;
	    res.view(artist);
	});
    },
    "update": function(req,res) {
	Artist.update(req.params.id, req.params.all(), function(err, artist) {
	    if(err) throw err;
	    if(artist) {
		processFiles(artist, req.files);
	    }
	    res.redirect('/artist/'+artist.slug);
	});
    },
    "index": function(req, res) {
	Artist.find(function(err, artists) {
	    if(err) throw err;
	    console.log(artists);
	    res.view({ artists: artists });
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
	    console.log(artist);
	    Release.find({ artists:{ contains: slug} }).exec(function(err, releases) {
		if(err) throw err;
		res.view({artist: artist, releases:releases}, 'artist/show');
	    });
	});
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ArtistController)
     */
    _config: {}

    
};
