import crypto from 'crypto';
import Razorpay from 'razorpay';

const config = (req, res) =>
  res.send({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET
  });

const order = async (req, res, next) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Enhanced options with all payment methods enabled
    const options = {
      ...req.body,
      payment_capture: 1,
      notes: {
        ...req.body.notes
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
      }
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      res.statusCode = 500;
      throw new Error('Failed to create order');
    }

    // Send enhanced response with payment configuration
    res.status(201).json({
      ...order,
      config: {
        display: {
          blocks: {
            utpi: {
              name: 'UPI',
              instruments: [
                {
                  method: 'upi'
                }
              ]
            },
            cards: {
              name: 'Cards',
              instruments: [
                {
                  method: 'card'
                }
              ]
            },
            netbanking: {
              name: 'Net Banking',
              instruments: [
                {
                  method: 'netbanking'
                }
              ]
            },
            wallet: {
              name: 'Wallets',
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
      prefill: {
        name: req.body.prefill?.name || '',
        email: req.body.prefill?.email || '',
        contact: req.body.prefill?.contact || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

const validate = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({
        status: 'error',
        message: 'Payment verification failed'
      });
      return;
    }

    // Fetch payment details
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    res.status(201).json({
      id: razorpay_payment_id,
      status: 'success',
      message: 'Payment successful',
      payment_method: payment.method,
      payment_details: {
        method: payment.method,
        card: payment.card || null,
        bank: payment.bank || null,
        wallet: payment.wallet || null,
        vpa: payment.vpa || null
      },
      updateTime: new Date().toLocaleTimeString()
    });
  } catch (error) {
    next(error);
  }
};

// New function to fetch payment methods status
const getPaymentMethods = async (req, res, next) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const methods = await razorpay.payments.getPaymentMethods();
    res.status(200).json(methods);
  } catch (error) {
    next(error);
  }
};

export { config, order, validate, getPaymentMethods };
