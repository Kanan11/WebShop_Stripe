window.addEventListener("load", async () => {
  //Collect sessionId from localstorage
  let sessionID = localStorage.getItem("session");
  if (sessionID === null) {
    console.log('har ingen sessionID')
    return;
  }
  console.log('finnis ID')
  let verify = await fetch("/verify", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      sessionID,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      //Empties localstorage
      localStorage.removeItem("session");
    })
    .catch((err) => console.error(err));
});
