var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port

// RandomString package //
var randomString = require("randomstring");

// Random String function
function generateRandomString() {
var myRandomString = randomString.generate({
                      length: 6,
                      charset: 'alphanumeric'
});
return myRandomString;

}


// MIDDLE WARE //

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//------------//

// TELLS EXPRESS TO USE THE EJS TEMPLATING AGENT
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// GET NEW URLS HERE --------------------------------------------------//
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {

  var myRandomShortURL = generateRandomString();
  let getURL = req.body.longURL;

  // ADD TO OUR OBJECT

  urlDatabase[myRandomShortURL] = getURL;
  console.log(urlDatabase);
  var reDirectPath = "http://localhost:8080/urls/" + myRandomShortURL;
  console.log(reDirectPath);
  res.redirect(reDirectPath);


});

// ------- /urls Event Handler-------------------//
app.get("/urls", (req,res) => {
  let templateVars = { urls: urlDatabase};

  res.render("urls_index", templateVars);
});

//----------------------------------------------//

// FETCH LONG URL VIA SHORT URL AND FETCH AND REDIRECT TO IT
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  //res.redirect(longURL);
  let shortURL = req.params.shortURL;
  let longURL  = urlDatabase[shortURL];
  //let longURL = urlDatabase[req.params.id.shortURL];
  res.redirect(longURL);

});


// ------ Event handler for displaying a single URL and its shortened  //
app.get("/urls/:id", (req, res) => {
 let templateVars = { shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id] };


 res.render("urls_show", templateVars);
});
// --------------------------------------------------------------------//





// ---------------------------------------------------------------------//


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});