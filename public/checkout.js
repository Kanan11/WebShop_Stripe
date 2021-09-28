let stripe;
window.addEventListener('load', main)

function main() {
    
    const sessionId = localStorage.getItem("session"); //testat att spara i localStorage
    /* if(!sessionId){
        throw new Error("No session id to verify");
    }else{
        console.log(sessionId)
    } */

    //här vi lyssnar checkout knappen ("här borjar historiken")
   const checkoutButton = document.getElementById('btn')
   checkoutButton.addEventListener('click', proceedToCheckout)

   //det nycket vi fått från Stripe
   stripe = Stripe('pk_test_51JZsdSEUI9kk9AxtuDRxlKWT3RWFRuKcvNGU1P3LYhrMVRyExpLdYlBtlE25wD1eSPXzWS5ZI9sufngFnnbxMudo00iTiaLYfI')

   verifyCheckoutSession();
}


async function proceedToCheckout() {
    try {
        const response = await fetch('/api/checkout-session', {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({
                "product": {
                    "name": "iPhone 12", 
                    "description": "mobile telephone", 
                    "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-12-purple-select-2021?wid=470&hei=556&fmt=jpeg&qlt=95&.v=1617130317000", 
                    "amount": 1000,
                    "quantity": 1
                }})
            })
            const session = await response.json()

        // om status "OKaj" gå vidare
        if(response.status > 400) {
            console.error(session.error)
            return
        }

        // det ska öppna checkout sida av Stripe
        const result = await stripe.redirectToCheckout({ sessionId: session.id});

        //eller ta mot errors
        if(result.error) {
            alert(result.error.message)
        }

    } catch (error) {
        console.error(error) 
    }
}



async function verifyCheckoutSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if(sessionId) {
         // verifiera att sessionen är ok!
        console.log(sessionId);
        const response = await fetch('/api/verify-checkout-session', { 
            headers: { "Content-Type": "application/json" },
            method: 'POST',
            body: JSON.stringify({ sessionId })
        })
        const session = await response.json()
        console.log(session.isVerified)
        if(session.isVerified) {
            window.location.pathname = "confirmation"
        } else {
            alert('Beställningen misslyckades')
        }
    }
}