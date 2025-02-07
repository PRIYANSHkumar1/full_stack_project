import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import Meta from '../components/Meta';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [selectedMethod, setSelectedMethod] = useState('card');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.auth);
  const { cartItems, totalPrice } = useSelector(state => state.cart);

  useEffect(() => {
    if (!shippingAddress) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  // Function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Function to initiate Razorpay payment
  const initiatePayment = async () => {
    try {
      const res = await loadRazorpayScript();

      if (!res) {
        alert('Razorpay SDK failed to load');
        return;
      }

      // Create order on your backend
      const orderResponse = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100), // Convert to paise
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            orderItems: cartItems.map(item => item.name).join(', '),
            shippingAddress: `${shippingAddress.address}, ${shippingAddress.city}`
          },
          prefill: {
            name: userInfo.name,
            email: userInfo.email,
            contact: shippingAddress.phoneNumber || ''
          }
        })
      });

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Your Store Name',
        description: 'Payment for your order',
        order_id: orderData.id,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: shippingAddress.phoneNumber || ''
        },
        config: {
          display: {
            blocks: {
              utpi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              },
              cards: {
                name: 'Pay using Cards',
                instruments: [
                  {
                    method: 'card'
                  }
                ]
              },
              netbanking: {
                name: 'Pay using Netbanking',
                instruments: [
                  {
                    method: 'netbanking'
                  }
                ]
              },
              wallet: {
                name: 'Pay using Wallet',
                instruments: [
                  {
                    method: 'wallet'
                  }
                ]
              }
            },
            sequence: ['block.utpi', 'block.cards', 'block.netbanking', 'block.wallet'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: function(response) {
          verifyPayment(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
          }
        },
        theme: {
          color: '#F6B716' // Match your theme color
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment initiation failed. Please try again.');
    }
  };

  // Function to verify payment
  const verifyPayment = async (response) => {
    try {
      const verifyResponse = await fetch('/api/payment/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const data = await verifyResponse.json();
      
      if (data.status === 'success') {
        dispatch(savePaymentMethod({
          provider: 'Razorpay',
          method: data.payment_method,
          paymentId: data.id
        }));
        navigate('/place-order');
      } else {
        alert('Payment verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('Payment verification failed. Please try again.');
    }
  };

  const submitHandler = e => {
    e.preventDefault();
    initiatePayment();
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <Meta title={'Payment Method'} />
      <h1>Payment Method</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Order Summary</Card.Title>
          <Card.Text>
            Total Amount: ₹{totalPrice.toFixed(2)}
          </Card.Text>
        </Card.Body>
      </Card>

      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as='legend'>Select Payment Method</Form.Label>
          <Col>
            <Form.Check
              className='my-2'
              type='radio'
              id='card'
              label='Credit/Debit Card'
              name='paymentMethod'
              value='card'
              checked={selectedMethod === 'card'}
              onChange={e => setSelectedMethod(e.target.value)}
            />
            <Form.Check
              className='my-2'
              type='radio'
              id='upi'
              label='UPI'
              name='paymentMethod'
              value='upi'
              checked={selectedMethod === 'upi'}
              onChange={e => setSelectedMethod(e.target.value)}
            />
            <Form.Check
              className='my-2'
              type='radio'
              id='netbanking'
              label='Net Banking'
              name='paymentMethod'
              value='netbanking'
              checked={selectedMethod === 'netbanking'}
              onChange={e => setSelectedMethod(e.target.value)}
            />
            <Form.Check
              className='my-2'
              type='radio'
              id='wallet'
              label='Wallet'
              name='paymentMethod'
              value='wallet'
              checked={selectedMethod === 'wallet'}
              onChange={e => setSelectedMethod(e.target.value)}
            />
          </Col>
        </Form.Group>

        <Button 
          className='mb-3 w-100' 
          variant='warning' 
          type='submit'
          disabled={!selectedMethod}
        >
          Proceed to Pay
        </Button>
      </Form>

      {/* Test Mode Information */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Test Mode Information</Card.Title>
          <Card.Text>
            <small>
              For testing, use these credentials:<br/>
              <strong>Card:</strong> 4111 1111 1111 1111<br/>
              <strong>Expiry:</strong> Any future date<br/>
              <strong>CVV:</strong> Any 3 digits<br/>
              <strong>UPI:</strong> success@razorpay<br/>
              <strong>Net Banking/Wallet:</strong> Select any option
            </small>
          </Card.Text>
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default Payment;
