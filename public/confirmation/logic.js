/* window.addEventListener("load", async () => {
  const urlParams = new URLSearchParams(queryString);
  console.log(urlParams)

  const queryString = window.location.search;
  console.log(queryString)
  //Collect sessionId from localstorage
  let sessionID = localStorage.getItem("session");
  let tempCartList = localStorage.getItem("cart");
  if (sessionID === null) {
    console.log('har ingen sessionID')
    return;
  }
  console.log('finns ID')
  await fetch("/verify/" + "",
    {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({

        sessionID,
        tempCartList,
      }),
    })
    .then((response) => {
      return response.json();
    })
    .then((msg) => {
      console.log(msg);
      localStorage.removeItem("cart");
      localStorage.removeItem("session");
      console.log('Nu varukrug och ID är tomat')
    })
    .catch((err) => console.error(err));
});
 */





//------------Spara URL (sessionId) och skicka till server att jämföra för att inte gora dubbelt köp-------
const verify = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      throw new Error("No session Id can be verified")
    }

    const response = await fetch('/verify/' + sessionId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const { paid } = await response.json();
    return paid;
  } catch (err) {
    console.error(err)
    return false;
  }
}

async function main() {
  const isVerified = await verify()

}
main()
localStorage.removeItem("cart");
