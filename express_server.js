var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port

// TELLS EXPRESS TO USE THE EJS TEMPLATING AGENT
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

// ------- /urls Event Handler-------------------//
app.get("/urls", (req,res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});



//----------------------------------------------//


// ------ Event handler for displaying a single URL and its shortened  //
app.get("/urls/:id", (req, res) => {
 let templateVars = { shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id] };
 console.log(req.params);
 console.log(req.params.id);

 res.render("urls_show", templateVars);
});
// --------------------------------------------------------------------//




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});