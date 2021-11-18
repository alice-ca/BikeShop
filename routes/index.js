const express = require('express');
const router = express.Router();

const stripe = require('stripe')('sk_test_51JnIhKBItH9w3hQNLBWjY1hXEya0mhpl2CBcGTpnOHCBMW3S0d2yb662UhQKhqVUQ9AknHc80JgqLq9KWVx8WXjy00XaXZXaZU');

const dataBike = [
  { name: "BIK045", url: "/images/bike-1.jpg", price: 679 },
  { name: "ZOOK07", url: "/images/bike-2.jpg", price: 999 },
  { name: "TITANS", url: "/images/bike-3.jpg", price: 799 },
  { name: "CEWO", url: "/images/bike-4.jpg", price: 1300 },
  { name: "AMIG039", url: "/images/bike-5.jpg", price: 479 },
  { name: "LIK099", url: "/images/bike-6.jpg", price: 869 },
]

//HOME PAGE
router.get('/', function (req, res, next) {

  if (req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }

  res.render('index', { dataBike: dataBike });
});

//SHOP
router.get('/shop', function (req, res, next) {

  if (req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }

  let alreadyExist = false;

  for (let i = 0; i < req.session.dataCardBike.length; i++) {
    if (req.session.dataCardBike[i].name == req.query.bikeNameFromFront) {
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if (alreadyExist == false) {
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1
    })
  }

  res.render('shop', { dataCardBike: req.session.dataCardBike });
});

//DELETE
router.get('/delete-shop', function (req, res, next) {

  if (req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }

  req.session.dataCardBike.splice(req.query.position, 1)

  res.render('shop', { dataCardBike: req.session.dataCardBike })
})

//UPDATE
router.post('/update-shop', function (req, res, next) {

  if (req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }

  let position = req.body.position;
  let newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop', { dataCardBike: req.session.dataCardBike })
})

//CHECKOUT
router.post('/create-checkout-session', async (req, res) => {

  if (req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }

  let stripeItems = [];

  for (let i = 0; i < req.session.dataCardBike.length; i++) {
    stripeItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].name,
        },
        unit_amount: req.session.dataCardBike[i].price * 100,
      },
      quantity: req.session.dataCardBike[i].quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: stripeItems,
    mode: "payment",
    success_url: "http://localhost:3000/confirm",
    cancel_url: "http://localhost:3000/",
  });

  res.redirect(303, session.url);
});

router.get('/confirm', function (req, res, next) {
  res.render('confirm')
})

module.exports = router;
