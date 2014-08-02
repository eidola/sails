/**
 * OrderController
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
var paypal = require('paypal-rest-sdk');
var payment = {
    "intent": "sale",
    "payer": {
	"payment_method": "paypal"
    },
    "redirect_urls": {
	"return_url": "http://www.eidolarecords.co.uk/execute",
	"cancel_url": "http://www.eidolarecords.co.uk/cancel"
    },
    "transactions": [{ 

	"item_list": {
            "items": [{
                "name": "It Never Entered My Mind",
                "sku": "item",
                "price": "15.00",
                "currency": "GBP",
                "quantity": 1
            }]
	},
        
	"amount": {
	    "total": "20.00",
	    "currency": "GBP",
	    "details": {
		"subtotal": "15.00",
		"shipping": "5.00"
	    }
	},
	"description": "It Never Entered My Mind"
	
    }]
};


module.exports = {
    "pay": function(req, res) {
	paypal.configure(sails.config.paypal.api);
	paypal.payment.create(payment, function(err, payment) {
	    if(err) throw err;
	    req.session.paymentId = payment.id;
	    var redirect = _.findWhere(payment.links, { 'method': 'REDIRECT'});
	    if(redirect) {
		console.log(redirect);
		redirectUrl = redirect.href;
		res.redirect(redirectUrl);
	    }
	});
    },
    "add": function(req, res) {
	var basket;
	
	if(!req.session.hasOwnProperty('basket')) {
	    req.session.basket = {};
	    var now = new Date()
	    req.session.cookie.expires = new Date().setTime(now.getTime() + (3600*1000));
		
	}
	basket = req.session.basket;

	var releaseId = req.param('id');
	var quantity = req.param('quantity') || 1;
	var format = req.param('format');
	if(!(releaseId || format)) {
	    return 400;
	}
	if(!basket.hasOwnProperty(releaseId)) {
	    basket[releaseId] = {
		"format": format,
		"quantity": 0
	    };
	}
	basket[releaseId].quantity += quantity;
	
	Release.findOne(releaseId).done(function(err, release) {
	    if(err) throw err;
	    basket = req.session.basket;
	    var rf = release.formats[basket[release.id].format];
	    if(rf.released === 'on') {
		var item = basket[release.id];
		item.price = rf.price;
		item.title = release.title;
		item.cover = release.cover.thumbnail.url;
		item.subtotal = item.price * item.quantity; 
		res.json(basket);
	    }
	    
	}); 
    },
    "basket": function(req,res) {
	
	var basket = req.session.basket;
	
	res.view({basket: basket}, 'order/basket');
    },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrderController)
   */
  _config: {}

  
};
