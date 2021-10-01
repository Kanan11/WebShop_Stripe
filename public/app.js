var stripe = Stripe("pk_test_51JZsdSEUI9kk9AxtuDRxlKWT3RWFRuKcvNGU1P3LYhrMVRyExpLdYlBtlE25wD1eSPXzWS5ZI9sufngFnnbxMudo00iTiaLYfI");


const productDOM = document.querySelector(".product__center");
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart__centent");
const openCart = document.querySelector(".cart__icon");
const closeCart = document.querySelector(".close__cart");
const overlay = document.querySelector(".cart__overlay");
const cartTotal = document.querySelector(".cart__total");
const clearCartBtn = document.querySelector(".clear__cart");
const itemTotals = document.querySelector(".item__total");

let cart = [];

let buttonDOM = [];

class UI {
  displayProducts(products) {
    let results = "";
    products.forEach(({ title, price, image, id }) => {
      results += `<!-- Single Product -->
      <div class="product">
        <div class="image__container">
          <img src=${image} alt="" />
        </div>
        <div class="product__footer">
          <h1>${title}</h1>
          <div class="rating">
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-empty"></use>
              </svg>
            </span>
          </div>
          <div class="bottom">
            <div class="btn__group">
              <button class="btn addToCart" data-id= ${id} >Köp</button>
              <button class="btn view">Mer</button>
            </div>
            <div class="price">${price}</div>
          </div>
        </div>
      </div>
      <!-- End of Single Product -->`;
    });

    productDOM.innerHTML = results;
  }

  getButtons() {
    const buttons = [...document.querySelectorAll(".addToCart")];
    buttonDOM = buttons;
    buttons.forEach(button => {
      const id = button.dataset.id;
      const inCart = cart.find(item => item.id === parseInt(id, 10));

      if (inCart) {
        button.innerText = "Har tagit";
        button.disabled = true;
      }

      button.addEventListener("click", e => {
        e.preventDefault();
        e.target.innerHTML = "Har tagit";
        e.target.disabled = true;

        // Get product from products
        const cartItem = { ...Storage.getProduct(id), amount: 1 };

        // Add product to cart
        cart = [...cart, cartItem];

        // save the cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setItemValues(cart);
        // display the cart item
        this.addCartItem(cartItem);
        // show the cart
      });
    });
  }

  setItemValues(cart) {
    let tempTotal = 0;
    let itemTotal = 0;

    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    itemTotals.innerText = itemTotal;
  }

  addCartItem({ image, price, title, id }) {
    const div = document.createElement("div");
    div.classList.add("cart__item");

    div.innerHTML = `<img src=${image}>
          <div>
            <h3>${title}</h3>
            <h3 class="price">${price}</h3>
          </div>
          <div>
            <span class="increase" data-id=${id}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-angle-up"></use>
              </svg>
            </span>
            <p class="item__amount">1</p>
            <span class="decrease" data-id=${id}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-angle-down"></use>
              </svg>
            </span>
          </div>

            <span class="remove__item" data-id=${id}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-trash"></use>
              </svg>
            </span>

        </div>`;
    cartContent.appendChild(div);
  }

  show() {
    cartDOM.classList.add("show");
    overlay.classList.add("show");
  }

  hide() {
    cartDOM.classList.remove("show");
    overlay.classList.remove("show");
  }

  setAPP() {
    cart = Storage.getCart();
    this.setItemValues(cart);
    this.populate(cart);

    openCart.addEventListener("click", this.show);
    closeCart.addEventListener("click", this.hide);
  }

  populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  cartLogic() {
    // Clear Cart
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
      this.hide();
    });

    // Cart Functionality
    cartContent.addEventListener("click", e => {
      const target = e.target.closest("span");
      const targetElement = target.classList.contains("remove__item");
      if (!target) return;

      if (targetElement) {
        const id = parseInt(target.dataset.id);
        this.removeItem(id);
        cartContent.removeChild(target.parentElement);
      } else if (target.classList.contains("increase")) {
        const id = parseInt(target.dataset.id, 10);
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setItemValues(cart);
        target.nextElementSibling.innerText = tempItem.amount;
      } else if (target.classList.contains("decrease")) {
        const id = parseInt(target.dataset.id, 10);
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount--;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setItemValues(cart);
          target.previousElementSibling.innerText = tempItem.amount;
        } else {
          this.removeItem(id);
          cartContent.removeChild(target.parentElement.parentElement);
        }
      }
    });
  }

  clearCart() {
    const cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setItemValues(cart);
    Storage.saveCart(cart);

    let button = this.singleButton(id);
    button.disabled = false;
    button.innerText = "Köp";
  }

  singleButton(id) {
    return buttonDOM.find(button => parseInt(button.dataset.id) === id);
  }
}

class Products {
  async getProducts() {
    try {
      const result = await fetch('products.json');
      const data = await result.json();
      const products = data.items;
      console.log(data.items);
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

class Storage {
  static saveProduct(obj) {
    localStorage.setItem("products", JSON.stringify(obj));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log(cart);
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === parseFloat(id, 10));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = new Products();
  const ui = new UI();

  ui.setAPP();

  const products = await productList.getProducts();
  ui.displayProducts(products);
  Storage.saveProduct(products);
  ui.getButtons();
  ui.cartLogic();
});

/* verifyCheckoutSession();
async function verifyCheckoutSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  if (sessionId) {
    // verifiera att sessionen är ok!
    console.log(sessionId);
    const response = fetch('/verify', {
      headers: { "Content-Type": "application/json" },
      method: 'POST',
      body: JSON.stringify({ sessionId })
    })
    const session = await response.json()
    console.log(session);
    console.log(session.isVerified)
    if (session.isVerified) {
      window.location.pathname = "confirmation"
    } else {
      alert('Beställningen misslyckades')
    }
  }
} */
window.onload = function () {

  const button_pay = document.getElementById("button_pay")
  if (button_pay) {
    button_pay.addEventListener("click", async () => {


      try {
        if (Object.keys(cart).length == 0) {
          throw new Error("No products added");
        }
        console.log(cart)

        const response = await fetch("/api/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: Object.values(cart),
          }),
        });

        const { id } = await response.json();
        stripe.redirectToCheckout({ sessionId: id });
      } catch (err) {
        console.log(err);
      }

    })
  }
}