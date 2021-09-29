const express = require('express')
require('dotenv').config('.env')
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
        });

        res.status(201).json({ id: session.id })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
})

/* app.post('/api/verify-checkout-session', async (req, res) => {
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
}); */

app.post("/verify", async (req, res) => {
    //Session id is sent in req.body
    const sessionID = req.body.sessionID;
  
    //We collect info about the session from stripe
    const paymentInfo = await stripe.checkout.sessions.retrieve(sessionID);
  console.log('passed')
    //Check if order is paid
    if (paymentInfo.payment_status === "paid") {
      //Create an object containing order info to save in json-file
      let order = {
        orderId: paymentInfo.id,
        totalPrice: paymentInfo.amount_total,
        orderdProducts: paymentInfo.metadata,
      };
        

      let extractedJson = fs.readFileSync("checkUp.json");
      let orderList = JSON.parse(extractedJson);

      
      if (alreadyExist) {
        //Don't run code if alreadyExists is true
        res.json("Har redan bestält");
        return;
      }
      //Save new order in json-file
      orderList.push(order);
      fs.writeFileSync("checkUp.json", JSON.stringify(orderList));
  
      res.json(true);
    }
    res.json(false);

  });

app.use(express.static('public'))

app.listen(3001, () => console.log('Server is on LIVE'))