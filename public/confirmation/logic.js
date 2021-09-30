window.addEventListener("load", async () => {
  //Collect sessionId from localstorage
  let sessionID = localStorage.getItem("session");
  let tempCartList = localStorage.getItem("cart");
  if (sessionID === null) {
    console.log('har ingen sessionID')
    return;
  }
  console.log('finns ID')
  await fetch("/verify",
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
