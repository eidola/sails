var uuid = require('node-uuid')
, path = require('path')
, fs = require('fs')
, im = require('imagemagick-native')
, sizes = {
    thumbnail: 200,
    main: 300
};

module.exports = {
    resizeImage: function(src, dir, model, attr, options) {
	var defaultOptions = {};
	var opts = _.extend(defaultOptions, options);
	
	var size;
	for(size in sizes) {
	    if(sizes.hasOwnProperty(size)) {
		var dim = sizes[size];
		var name = newName = uuid.v4() + path.extname(src);
		var dst = dir + name;
		var buffer = fs.readFileSync(src);
		
		var image = im.convert({
		    srcData: buffer,
		    width: dim,
		    height: dim,
		    resizeStyle: "aspectfill",
		    quality: 80
		});
		model[attr][size] = {
		    path: dst,
		    url: dst.replace(sails.config.appPath + "/assets", "")
		};
		model.save(function(err) {
		    console.log(err);
		});
		fs.writeFile(dst, image, function(err) {
		    if(err) throw err;
		});
	    }
	}
	
    }
}
