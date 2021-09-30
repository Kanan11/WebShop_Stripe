const express = require('express')
require('dotenv').config('.env')
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express();

app.use('/', express.json())

// Endpoints
app.post('/api/checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    //console.log(cart)
    let carts = []
    cart.forEach((cart) => {
      let lineItem = {
        //description: '.',
        price_data: {
          currency: "sek",
          product_data: {
            name: cart.title,
            images: [cart.image],
          },
          unit_amount: cart.price * 100,
        },
        quantity: cart.amount,
      };
      carts.push(lineItem);
    });

    //console.log(carts)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: carts,
      mode: "payment",
      success_url: "http://localhost:3001/confirmation/?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3001/cancel/?session_id={CHECKOUT_SESSION_ID}",
    }

    );

    //----------------TEST------------------------
    /* if (carts === null) {
      return
    } else {
      const jsonString = JSON.stringify(carts, null, 2)
      fs.writeFile('./orders.json', jsonString, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log('Successfully wrote file')
        }
      })
    } */
    //----------------TEST------------------------

    res.status(201).json({ id: session.id })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
})

app.post('/verify-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.body.sessionId)
        console.log(session)
        console.log('banan')
        if (session) {
            res.send({ isVerified: true })
        } else {
            throw new Error('no session')
        }
    } catch (error) {
        console.error(error)
        res.send({ isVerified: false });
    }
});




app.post("/verify", async (req, res) => {
  const sessionID = req.body.sessionID;

  const completedOrder = await stripe.checkout.sessions.retrieve(sessionID);
  console.log('passed')
    
  async function verifyOrder(req, res){
  try {
    const existingOrdersRaw = await fs.readFileSync('./orders.json', "utf8")
    //1 läs in, 
    //2 kolla om det finns en array, annars skapa array och pusha order, 
    //3 finns det en array kolla om sessionID existerar pusha ifall den inte existerar
    
    let existingOrders = [];
    if (existingOrdersRaw.length) {
      existingOrders = JSON.parse(existingOrdersRaw)
      const foundOrder = existingOrders.find(order => order.sessionID == sessionID)
      if (foundOrder) {
        res.json({ verified: false })
        return;
      }
    }
    console.log('check')
    const session = await stripe.checkout.sessions.retrieve(sessionID)
    
    if (session.payment_status == "paid") {
      //const completedOrder = await stripe.checkout.sessions.listLineItems(session.id) //alternativt att hämta från stripe...
      completedOrder.sessionId = sessionID
      existingOrders.push(completedOrder)
      await fs.writeFileSync('./orders.json', JSON.stringify(existingOrders, null, 2))
      res.json({ verified: true })
    } else {
      res.json({ verified: false })
    }
  } catch (error) {
    console.log(error)
    res.json({ verified: false })
  }
}
verifyOrder();
}
);


app.use(express.static('public'))

app.listen(3001, () => console.log('Server is on LIVE'))