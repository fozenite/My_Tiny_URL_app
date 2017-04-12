var express = require("express");



var cookieParser = require('cookie-parser')
var app = express()
app.use(cookieParser())
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
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});
// RESPOND TO A POST TO ADD TO OUR DATABASE
app.post("/urls", (req, res) => {

  // GET A RANDOM 6 CHAR LONG ALPHANUMERIC STRING USING OUR RANDOM STRING PACKAGE
  var myRandomShortURL = generateRandomString();
  // <INPUT> name =longURL </INPUT> From EJS URLS_NEW IS GIVING US THIS
  let getURL = req.body.longURL;

  // ADD New URL to OUR DATABASE

  urlDatabase[myRandomShortURL] = getURL;
 // console.log(urlDatabase);
  var reDirectPath = "http://localhost:8080/urls/" + myRandomShortURL;
  // console.log(reDirectPath);
  res.redirect(reDirectPath);


});
// RESPONDING TO OUR DELETE REQUEST
app.post("/urls/:id/delete", (req,res) => {
    // GETTING WHICH SHORT URL KEY TO DELETE FROM OBJECT
    let ObtainedShortURL_to_Delete = req.params.id;
    // DELTETING FROM OUT OBJECT DATABASE
    delete urlDatabase[ObtainedShortURL_to_Delete];
    res.redirect("http://localhost:8080/urls/");
});

// ------- /urls Event Handler-------------------//
app.get("/urls", (req,res) => {
  let templateVars = { urls: urlDatabase,
  username: req.cookies["username"]};

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

// Get OUR UPDATE REQUEST
app.post("/urls/:id", (req,res) =>{

  let shortURL = req.params.id;
  let longURL  = req.body.longURL;

  urlDatabase[shortURL] = longURL;


  res.redirect("http://localhost:8080/urls/");


});

// ------ Event handler for displaying a single URL and its shortened  //
app.get("/urls/:id", (req, res) => {
 let templateVars = { shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      username: req.cookies["username"] };


 res.render("urls_show", templateVars);
});
// --------------------------------------------------------------------//

app.post("/login", (req,res) => {
  let myCookie = req.body.username;
  //console.log(myCookie);
  res.cookie('username',myCookie);

  res.redirect("http://localhost:8080/urls/");

});
// ---------------------------------------------------------------------//
// LOGOUT
app.post("/logout", (req,res) => {
  let myCookie = req.cookies["username"];
  //console.log(myCookie);
  res.clearCookie('username', myCookie);

  res.redirect("http://localhost:8080/urls/");

});

// ----------------------------------------------------------------------//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});