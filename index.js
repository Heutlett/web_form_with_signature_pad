const express = require("express");
const app = express();
const port = 3000;

const path = require("path");

app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "boletas")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "HTML", "home.html"));
});

app.get("/pdf", (req, res, next) => {
  res.sendFile(path.join(__dirname, "HTML", "createPDF.html"));
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

//sudo kill -9 `sudo lsof -t -i:3000`