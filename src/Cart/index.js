import React, { useEffect, useState, Fragment } from 'react'
import useStyles from './styles'
import Grid from '@material-ui/core/Grid'
import CartCard from './CartCard'
import { connect } from 'react-redux'
import axios from 'axios'
import Spinner from '../Spinner'
import OrderSummary from './OrderSummary'
import Button from '@material-ui/core/Button'
import { withRouter } from 'react-router-dom';


const Cart = (props) => {
  const classes = useStyles()
  const [fetchedMeds, setFetchedMeds] = useState([])
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState('')

  useEffect(() => {
    setLoading(true)
    let email = props.email
    email = email.split('@')
    setEmails(email[0])
    axios.get(`https://medi-o-der.firebaseio.com/${email[0]}/cart.json`)
      .then(resp => {
        let fetched = []
        for (let i in resp.data) {
          if (resp.data[i] === null) {
            continue
          }
          if (i === 'url') {
            continue
          }
          if (i === 'price') {
            continue
          }
          if (i === 'deliveryMode') {
            continue
          }
          fetched.push({
            ...resp.data[i]
          })
        }
        setFetchedMeds(fetched)
        setLoading(false)
      })
      .catch(err => {
        alert(err.response.data.error.message)
        setLoading(false)
      })
  }, [])

  const removeFromCart = (val) => {
    axios.delete(`https://medi-o-der.firebaseio.com/${emails}/cart/${val.id}.json`)
      .then(resp => {
        let updated = fetchedMeds.filter(vals => vals.id != val.id)
        setFetchedMeds(updated)
      })
      .catch(err => alert(err.response.data.error.message))
  }

  const increment = (val) => {
    axios.patch(`https://medi-o-der.firebaseio.com/${emails}/cart/${val.id}.json`, {
      quantity: val.quantity + 1
    })
      .then(resp => {
        let updates = fetchedMeds.filter(vals => {
          if (vals.id === val.id) {
            vals.quantity = val.quantity + 1
            return vals
          } else {
            return vals
          }
        })
        setFetchedMeds(updates)
      })
      .catch(err => alert(err.response.data.error.message))
  }

  const decrement = (val) => {
    axios.patch(`https://medi-o-der.firebaseio.com/${emails}/cart/${val.id}.json`, {
      quantity: val.quantity > 1 ? val.quantity - 1 : 1
    })
      .then(resp => {
        let updates = fetchedMeds.filter(vals => {
          if (vals.id === val.id) {
            vals.quantity = vals.quantity > 1 ? val.quantity - 1 : 1
            return vals
          } else {
            return vals
          }
        })
        setFetchedMeds(updates)
      })
      .catch(err => alert(err.response.data.error.message))
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setDeliveryMode('');
  }

  const deliveryHandler = (option) => {
    axios.patch(`https://medi-o-der.firebaseio.com/${emails}/cart.json`, {
      deliveryMode: option
    })
      .then()
      .catch(err => alert(err.response.data.error.message))
    setDeliveryMode(option)
  }

  const patchPrescription = (url) => {
    axios.patch(`https://medi-o-der.firebaseio.com/${emails}/cart.json`, {
      url: url
    })
      .then()
      .catch(err => alert(err.response.data.error.message))
  }

  const addPrice = (price) => {
    axios.patch(`https://medi-o-der.firebaseio.com/${emails}/cart.json`, {
      price: price
    })
      .then()
      .catch(err => alert(err.response.data.error.message))
  }

  return (
    <div className={classes.mainWrapper}>
      <div align='right'>
        {
          fetchedMeds.length > 0
            ?
            <Button
              onClick={toggleModal}
              variant='contained'
              color='primary'>Buy Now</Button>
            :
            null
        }

        <OrderSummary
          open={isModalOpen}
          close={() => toggleModal()}
          meds={fetchedMeds}
          email={props.email}
          delivery={deliveryHandler}
          mode={deliveryMode}
          email={emails}
          upload={patchPrescription}
          addPrice={addPrice}
          history={props.history} />

      </div>
      <Grid container spacing={4}>
        {
          loading ?
            <Spinner />
            :
            fetchedMeds.length > 0 ?
              fetchedMeds.map(val =>
                <Fragment key={val.id}>
                  <CartCard
                    photo={val.photo}
                    name={val.name}
                    price={val.price}
                    vendor={val.vendor}
                    address={val.address}
                    medType={val.medType}
                    quantity={val.quantity}
                    remove={() => removeFromCart(val)}
                    increment={() => increment(val)}
                    decrement={() => decrement(val)}
                  />
                </Fragment>
              )
              : <h1>Add Products To Cart</h1>
        }
      </Grid>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    email: state.userDetails
  }
}

export default connect(mapStateToProps)(withRouter(Cart))