const express = require('express');
const app = express();
const bodyParser = require('body-parser');

require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const stripe = require('stripe')(process.env.SECRET_KEY);

app.get('/', (req, res) => {
  return res.status(200).json({ status: "ok" });
})

app.post('/api/doPayment/', (req, res) => {
  return stripe.charges
    .create({
      amount: req.body.amount, // Unit: cents
      currency: 'eur',
      source: req.body.tokenId,
      description: 'Test payment',
    })
    .then(result => res.status(200).json(result));
});

app.listen(5000);