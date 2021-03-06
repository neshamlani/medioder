import React, { useEffect, useState } from "react";
import useStyles from './styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Spinner from '../Spinner';
import { connect } from 'react-redux';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from 'axios';
import {
  ElementsConsumer,
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe('pk_test_51HktAnAL8iTBehj4geteQl83gouuOhpPaCT4m8SQV5H8iYdG55JQphXOtYARXNQ4pz4i4zOUxMeyvobTKq9vJ9th00BKc2YVFo');

const Checkout = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <div>
            <Button
              variant='contained'
              color='primary'
              disabled={props.img ? props.mode ? false : true : true}
              onClick={() => setOpen(!open)}>Pay</Button>

            <Modal
              open={open}
              onClose={() => setOpen(!open)}>

              <Check
                stripe={stripe}
                elements={elements}
                email={props.email}
                history={props.history}
                address={props.address} />
            </Modal>
          </div>
        )
        }
      </ElementsConsumer>
    </Elements>
  )
};


const Check = (props) => {
  const [userCart, setUserCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (event) => {
    setIsLoading(true);
    event.preventDefault();
    const { stripe, elements } = props;
    if (!stripe || !elements) {
      return;
    }
    const card = elements.getElement(CardNumberElement, CardExpiryElement, CardCvcElement);
    const result = stripe.createToken(card);
    result
      .then(resp => {
        const { error, token } = resp;
        if (error) {
          alert(error.message);
          setIsLoading(false);
        }
        if (token) {
          //token
          axios.get(`https://medi-o-der.firebaseio.com/${props.email}/cart.json`)
            .then(resp => {
              const data = {
                ...resp.data,
                address: props.address
              }
              axios.put(`https://medi-o-der.firebaseio.com/orders/${props.email}.json`, data)
                .then(resp => {
                  alert('Order Sucessfull');
                  setIsLoading(false);
                  props.history.push('/');
                })
                .catch(err => {
                  alert(err.response.data.error.message);
                  setIsLoading(false);
                })
            })
            .catch(err => {
              alert(err.response.data.error.message);
              setIsLoading(false);
            })
        }
      })
  }
  const classes = useStyles();
  return (
    <div className={classes.modalwrapper}>
      <form onSubmit={handleSubmit}>
        <div className={classes.cardWrapper}>
          Enter Card Details
          <CardNumberElement className={classes.cardNumber} options={{ showIcon: true }} />
          <CardExpiryElement className={classes.cardNumber} />
          <CardCvcElement className={classes.cardNumber} />
          <Button
            variant='contained'
            color='primary'
            type='submit'
            className={classes.cardNumber}>Pay Now</Button>
          {
            isLoading
              ?
              <Spinner />
              :
              null
          }
        </div>
      </form>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    address: state.address
  }
}


export default connect(mapStateToProps)(Checkout);