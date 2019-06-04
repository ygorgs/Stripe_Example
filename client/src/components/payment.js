import React, { Component } from 'react';
import { View, Button } from 'react-native';
import stripe from 'tipsi-stripe';
import Config from 'react-native-config';

import { doPayment } from '../Api/api';

stripe.setOptions({
  publishableKey: Config.STRIPE_PUBLISHABLE_KEY,
});

export default class Payment extends Component {
  state = {
    isPaymentPending: false,
  }

  requestPayment = () => {
    this.setState({ isPaymentPending: true });
    return stripe
      .paymentRequestWithCardForm()
      .then(stripeTokenInfo => {
        return doPayment(100, stripeTokenInfo.tokenId);
      })
      .then(() => {
        console.warn('Payment succeeded!');
      })
      .catch(error => {
        console.warn('Payment failed', { error });
      })
      .finally(() => {
        this.setState({ isPaymentPending: false });
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Make a payment"
          onPress={this.requestPayment}
          disabled={this.state.isPaymentPending}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};