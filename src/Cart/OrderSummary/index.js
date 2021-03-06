import React, { useState } from 'react';
import useStyles from './styles';
import Modal from '@material-ui/core/Modal';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkout from '../../Stripe';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import firebase from '../../Firebase';
import Spinner from '../../Spinner';

const OrderSummary = (props) => {
  const classes = useStyles();
  const [isImgUploaded, setIsImgUploaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  let totalPrice = 0;

  const changeHandler = (e) => {
    const image = e.target.files[0]
    const upload = firebase.storage().ref(`/${props.email}/prescription`).put(image);
    upload.on('state-changed',
      (snapShot) => {
        setIsLoading(true);
      },
      (err) => {
        alert(err.response.data.error.message)
        setIsLoading(false)
      },
      () => {
        firebase.storage().ref(props.email).child('prescription').getDownloadURL()
          .then(resp => {
            console.log('resp', resp)
            props.upload(resp)
            alert('Prescription Uploaded')
            setIsLoading(false)
            setIsImgUploaded(true)
          })
      }
    )
  }
  return (
    <Modal
      open={props.open}
      onClose={props.close}>
      <div className={classes.modalwrapper}>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Order Summary</div>
        <TableContainer className={classes.tableWrapper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price(In Rs.)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                props.meds.map(val => {
                  let mrp = String(val.price).match(/\d+/g)
                  mrp = Number(mrp[0])
                  mrp = mrp * val.quantity
                  totalPrice = totalPrice + mrp
                  return (
                    <TableRow key={val.id}>
                      <TableCell>{val.name}</TableCell>
                      <TableCell>{val.quantity}</TableCell>
                      <TableCell>{mrp}</TableCell>
                    </TableRow>
                  )
                })
              }
              {
                props.addPrice(totalPrice)
              }
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ marginTop: 10 }}>Upload your prescription in jpg or png format</div>
        <input style={{ marginTop: 10 }} type='file' onChange={changeHandler} accept='.png,.jpg' />
        <div style={{ marginTop: 10 }}>
          {
            isLoading
              ?
              <Spinner />
              :
              null
          }
        </div>
        <FormControl style={{ marginTop: 10 }}>
          <FormLabel>Delivery Option</FormLabel>
          <RadioGroup
            value={props.mode}
            className={classes.radioGroup}
            onChange={(e) => props.delivery(e.target.value)}>
            <FormControlLabel
              value='homeDelivery'
              label='Home Delivery'
              control={<Radio color='primary' />} />

            <FormControlLabel
              value='placeOrder'
              label='Place Order'
              control={<Radio color='primary' />} />
          </RadioGroup>
        </FormControl>
        <div className={classes.priceWrapper}>
          <div>Total Price: {totalPrice}</div>
          <div>
            <Checkout
              mode={props.mode}
              img={isImgUploaded}
              amt={totalPrice}
              email={props.email}
              history={props.history} />
          </div>
        </div>
      </div>
    </Modal >
  )
}

export default OrderSummary