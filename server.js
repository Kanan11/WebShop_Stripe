const express = require('express')
require('dotenv').config('.env')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express();

app.use('/api', express.json())

// Endpoints
app.post('/api/checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
            {
                description: 'test',
                price_data: {
                currency: "sek",
                product_data: {
                    name: "test",
                },
                unit_amount: 10000,
                },
                quantity: 2,
            },
            ],
            mode: "payment",
            success_url: "http://localhost:3001/confirmation/?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3001",
        });
        res.json({ id: session.id })
        console.log(res.json)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
})

app.post('/api/verify-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.body.sessionId)
        console.log(session)
        if(session) {
            res.send({ isVerified: true })
        } else {
            throw new Error('no session')
        }
    } catch (error) {
        console.error(error)
        res.send({ isVerified: false });        
    }
});

app.use(express.static('public'))

app.listen(3001, () => console.log('Server is on LIVE'))