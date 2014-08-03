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

var order = {
    "intent": "sale",
    "payer": {
	"payment_method": "paypal"
    },
    "transactions": [],
    "redirect_urls": {
	"return_url": "http://www.eidolarecords.co.uk/order/execute",
	"cancel_url": "http://www.eidolarecords.co.uk/order/cancel"
    }
  
}
module.exports = {
    "checkout": function(req, res) {
	var items = [];
	
	var subtotal = 0;
	var shipping = 0;
	var total = 0;

	_.each(req.session.basket, function(item) {
	    items.push({
		"name": item.title,
                "sku": "item",
                "price": item.price.toString(),
                "currency": "GBP",
                "quantity": item.quantity
	    });
	    subtotal += item.subtotal;
	    shipping += item.quantity * 3;
	});
	total = subtotal + shipping;
	
	order.transactions.push({
	    "item_list": {
		"items": items
	    },
	    "amount": {
		"total": total.toString(),
		"currency": "GBP",
		"details": {
		    "subtotal": subtotal.toString(),
		    "shipping": shipping.toString()
		}
	    },
	    "description": "Eidola Records Order"
	});
	console.log(JSON.stringify(order));
	paypal.configure(sails.config.paypal.api);
	paypal.payment.create(order, function(err, payment) {
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
	    req.session.basket = [];
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

	var item = _.findWhere(basket, { "id": releaseId, "format": format });
	if(item) {
	    item.quantity += quantity;
	}
	else {
	    basket.push({ "id": releaseId, "format": format, "quantity": quantity });
	}
	Release.findOne(releaseId).done(function(err, release) {
	    if(err) throw err;
	    basket = req.session.basket;
	    var items = _.where(basket, {"id": release.id });
	    
	    _.each(items, function(item) {
		console.log(item);
		var rf = release.formats[item.format];
		console.log(rf);
		if(rf.released === 'on') {
		    item.price = rf.price;
		    item.title = release.title;
		    item.cover = release.cover.thumbnail.url;
		    item.subtotal = item.price * item.quantity;
		    
		    
		}
	    });
	    res.json(basket);
	}); 
    },
    "remove": function(req, res) {
	var id = req.param('id');
	var quantity = req.param('quantity') || 1
	var format = req.param('format');
	
    },
    "basket": function(req,res) {
	
	var basket = req.session.basket;
	
	res.view({basket: basket}, 'order/basket');
    },
    "empty": function(req, res){
	req.session.basket = [];
	res.json(req.session.basket);
    },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrderController)
   */
  _config: {}

  
};
