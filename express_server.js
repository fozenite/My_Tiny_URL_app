var express = require("express");


var cookieSession = require('cookie-session');  // COOKIE SESSION LIBRARY
//var cookieParser = require('cookie-parser')
var app = express()
// app.use(cookieParser()) //
var PORT = process.env.PORT || 8080; // default port

// RandomString package //
var randomString = require("randomstring");

// BECRYPT INITIALIZE FOR OUR PASSWORD
const bcrypt = require('bcrypt');


// Random String function
function generateRandomString() {
var myRandomString = randomString.generate({
                      length: 6,
                      charset: 'alphanumeric'
});
return myRandomString;

}

// Check if email exists function
function checkEmailExists(emailTest) {
          // CHECK IF EMAIL ALREADY EXISTS
let myReturnVal = 0;
  Object.keys(users).forEach(key => {
  if(emailTest == users[key].email){
    myReturnVal = 1;;
    }
  });
  return myReturnVal;
}

// Check if email and password match
function CheckEmailAndPassword(emailTest, passwordTest,res,req) {
// CHECK IF EMAIL ALREADY EXISTS
let myReturnVal = 0;
    Object.keys(users).forEach(key => {
    if((emailTest == users[key].email)&&( bcrypt.compareSync(passwordTest, users[key].password))) {
      req.session.user_id = key; // WRITE A VALUE TO COOKIE
      myReturnVal = 1;;
      }
    });
  return myReturnVal;
}

// LookUp LongURL via ShortURL input
function lookUpLongURL(shortURL,req, reqType) {
  let currentUserCookie = req.session.user_id;
  let myReturnVal = "";
    Object.keys(urlDatabase).forEach(key => {
      Object.keys(urlDatabase[key]).forEach(key2 => {
        if(shortURL == key2){
          if((key == currentUserCookie)||(reqType == "lookup")){
          myReturnVal = urlDatabase[key][key2];
          } else {
          myReturnVal = "NotMine";
          }
        }
      });
    });
    return myReturnVal;
}


// Do my update
// Needs to find shortURL match and then replace it's value with
// new LongURL

function updateMyDatabase(shortURL, longURL,userCookie) {
  let found = 0;
    Object.keys(urlDatabase).forEach(key => {

      Object.keys(urlDatabase[key]).forEach(key2 => {

        if(shortURL == key2){
          found = 1;
          urlDatabase[key][key2]=longURL;
        }
      });
    });
  return found;
}


// MIDDLE WARE //

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['TinyKey','keyWarrior'],
  // Cookie Options
}));

// TELLS EXPRESS TO USE THE EJS TEMPLATING AGENT
app.set("view engine", "ejs");

var urlDatabase = { }; // Start with empty database

// LIST OF USERS
const users = { }; // STart with empty users Object

// GET NEW URLS HERE --------------------------------------------------//
app.get("/urls/new", (req, res) => {
  let currentUserCookie = req.session.user_id;
  let templateVars = {user: users[currentUserCookie]};

  if(currentUserCookie){
  res.status(200).render("urls_new", templateVars);
  } else {
  res.status(401).redirect("/urls");
  }
});
// RESPOND TO A POST TO ADD TO OUR DATABASE
app.post("/urls", (req, res) => {

  // GET A RANDOM 6 CHAR LONG ALPHANUMERIC STRING USING OUR RANDOM STRING PACKAGE
  var myRandomShortURL = generateRandomString();
  // <INPUT> name =longURL </INPUT> From EJS URLS_NEW IS GIVING US THIS
  let currentUserCookie = req.session.user_id;
  let getURL = req.body.longURL;
  if(currentUserCookie){
  // ADD New URL to OUR DATABASE
  urlDatabase[currentUserCookie][myRandomShortURL] = getURL;
  var reDirectPath = "http://localhost:8080/urls/" + myRandomShortURL;

  res.redirect(reDirectPath);
  } else {
    res.status(401).redirect("/urls");
  }

});
// RESPONDING TO OUR DELETE REQUEST
app.post("/urls/:id/delete", (req,res) => {
  // GETTING WHICH SHORT URL KEY TO DELETE FROM OBJECT
  let ObtainedShortURL_to_Delete = req.params.id;
  // DELETING FROM OUT OBJECT DATABASE
  Object.keys(urlDatabase).forEach(key => {
    Object.keys(urlDatabase[key]).forEach(key2 => {
      if(ObtainedShortURL_to_Delete == key2){
        delete urlDatabase[key][key2];
      }
    });
  });
  res.redirect("http://localhost:8080/urls/");
});

// ------- /urls Event Handler-------------------//
app.get("/urls", (req,res) => {
  let currentUserCookie = req.session.user_id;
  let templateVars = { urls: urlDatabase,
  user: users[currentUserCookie]};
  if(currentUserCookie){
    res.status(200).render("urls_index", templateVars);
  } else {
    res.status(401).render("urls_index", templateVars);  }
});

//----------------------------------------------//

// FETCH LONG URL VIA SHORT URL AND FETCH AND REDIRECT TO IT
app.get("/u/:shortURL", (req, res) => {

  let shortURL = req.params.shortURL;
  //do the lookup for the longURL
  //LOOKUP LONG URL
  let longURL  = lookUpLongURL(shortURL, req, "lookup");
  if(longURL){
  res.redirect(longURL);
  } else{
    res.status(404).send("Invalid request please press back on your browser and try again");
  }
});

// Get OUR UPDATE REQUEST
app.post("/urls/:id", (req,res) =>{
  let currentUserCookie = req.session.user_id;
  let shortURL = req.params.id;
  let longURL  = req.body.longURL;
  //DO MY UPDATE
  let found = updateMyDatabase(shortURL,longURL);
  if(!found){
    res.status(404).send("Invalid request please press back on your browser and try again");
  } else if(!currentUserCookie) {
    res.status(401).redirect("/urls");
  } else

  res.redirect("/");
});

// ------ Event handler for displaying a single URL and its shortened  //
app.get("/urls/:id", (req, res) => {
  let currentUserCookie = req.session.user_id;
  let longURLf  = lookUpLongURL(req.params.id, req, "update");
  let templateVars = { shortURL: req.params.id,
                      longURL: longURLf,
                      user: users[currentUserCookie] };

  if(!longURLf){
    if(!currentUserCookie){
      res.status(401).redirect("/urls");
    } else {
      res.status(403).send("Not a valid URL. Press back on your browser and try again");
    }
  } else if(longURLf == "NotMine") {
    res.status(403).send("Error: You don't have update access to this URL");
  } else {
    res.status(200).render("urls_show", templateVars);
  }
});
// --------------------------------------------------------------------//
// LOGIN
app.get("/login", (req, res) => {
  let currentUserCookie = req.session.user_id;
    if(currentUserCookie){
      res.redirect("/")
    } else{
      let templateVars = {user: null};
      res.status(200).render("login",templateVars);
    }
});

app.post("/login", (req,res) => {
  let myUserEmail = req.body.email;
  let myUserPassword = req.body.password;
  let CheckEmail = checkEmailExists(myUserEmail);
  let CheckLoginWorked = CheckEmailAndPassword(myUserEmail,myUserPassword,res, req);

   if(!CheckEmail){
    res.status(403).send("Email address doesn't exist. Please try again or register");
   } else if (!CheckLoginWorked) {
    res.status(403).send("Incorrect password. Please try again or register");
   } else {
      res.redirect("/");
   }

});
// ---------------------------------------------------------------------//
// LOGOUT
app.post("/logout", (req,res) => {
  req.session = null
  res.redirect("/");
});


// REGISTER PAGE --------------------------------------------------//
app.get("/register", (req, res) => {
  if(req.session.user_id){
    res.redirect("/");
  } else{
  let templateVars = {user: null};
  res.status(200).render("register",templateVars);
  }
});

app.post("/register",(req,res) =>{
  // get random user id
  let user_id = generateRandomString();
  let hashed_password = bcrypt.hashSync(req.body.password, 10);

  let templateVars = {email: req.body.email,
                    password: hashed_password};
  let CheckEmail = checkEmailExists(templateVars.email);
    //CHECK IF EMAIL OR PASSWORD NOT FILLED IN
    if (!templateVars.email || !templateVars.password){
      res.status(404).send("You haven't filled in the email or password. Please try again");
    } else if(CheckEmail){
      res.status(404).send("We have your email on file, you have already registered. Please login");
    } else {
      // Storing User data from register
         users[user_id] = {
          id: user_id,
          email: templateVars.email,
          password: templateVars.password
         };
      // SETUP AN EMPTY OBJECT FOR THE NEW USER
      urlDatabase[user_id] = {};
      req.session.user_id = user_id; // WRITE A VALUE TO COOKIE
      res.redirect("/");
    }
});

// ROOT PATH GET REQUEST
app.get("/",(req,res) =>{
  let currentUserCookie = req.session.user_id;
  if(currentUserCookie){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/home",(req,res) =>{
  let currentUserCookie = req.session.user_id;
  let templateVars = {user: users[currentUserCookie] };
  res.render("home",templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});