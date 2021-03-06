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
        //description: session,
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: carts,
      mode: "payment",
      success_url: "http://localhost:3001/confirmation?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3001/cancel",
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


//-------------------------HÄR ANNAT ALTERNATIVT SOM FUNGERAR LIKA SAMMA---------------------------

/* app.post("/verify", async (req, res) => {
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
); */


app.post("/verify/:sessionId", async (req, res) => {
  //const sessionId = req.body.sessionId;
  const sessionId = req.params.sessionId;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
//console.log("banan")
  if (session.payment_status == "paid") {
    let orderJson = fs.readFileSync("orders.json");
    let data = JSON.parse(orderJson);
    let orderItem = data.find(orderItem => orderItem.sessionId === sessionId)
    if (!orderItem) {
      orderItem = {
          sessionId: session.id,
          customerEmail: session.customer_details.email,
          totalPrice: session.amount_total / 100,
          currency: session.currency,
      };
      data.push(orderItem);
      fs.writeFileSync("orders.json", JSON.stringify(data));
      res.json(true);

    }
  } else {
    res.status(200).json({ paid: false });
  }

});

app.get("/purchases", async (req, res) => {
    
  let orderJson = fs.readFileSync("orders.json");
  let data = JSON.parse(orderJson);
  res.status(200).json(data);
});

app.use(express.static('public'))

app.listen(3001, () => console.log('Server is on LIVE'))