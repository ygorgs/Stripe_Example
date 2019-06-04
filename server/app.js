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


getDbUser = (accessToken) => {
  const user = {
    email: 'user.test@email.com',
    source: '123'
  }
  return Promise.resolve(user);
}

updateDbUser = (stripeId) => {
  console.log('update user: ' + stripeId)
}

findOrCreateStripeCustomer = (dbUser, tokenId) => {
  if (!!dbUser.stripeCustomerId) {
    return stripe.customers
      .createSource(dbUser.stripeCustomerId, { source: tokenId }) // This Stripe service returns a source object
      .then(newSource => {
        return stripe.customers
          .update(dbUser.stripeCustomerId, { default_source: newSource.id })
      })
  } else { // First payment
    return stripe.customers.create({
      email: dbUser.email,
      source: tokenId
    })
  }
}

app.post('/api/doPayment', (req, res) => {
  return getDbUser(/*req.accessToken*/) // Some method to get a user from the database
    .then(dbUser => {
      findOrCreateStripeCustomer(dbUser, req.body.tokenId) // This Stripe service returns a customer object
        .then(stripeCustomer => {
          updateDbUser(stripeCustomer.id) // Save your Stripe customer ID for the next time
          return stripe.charges.create({
            amount: req.body.amount, // Unit: cents
            currency: 'eur',
            customer: stripeCustomer.id,
            source: stripeCustomer.default_source.id,
            description: 'Test payment',
          })
        })
    })
    .then(result => res.status(200).json(result))
});

app.listen(5000);