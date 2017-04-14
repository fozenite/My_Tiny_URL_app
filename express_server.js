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
function CheckEmailAndPassword(emailTest, passwordTest,res) {
          // CHECK IF EMAIL ALREADY EXISTS
let myReturnVal = 0;
    Object.keys(users).forEach(key => {
    if((emailTest == users[key].email)&&(passwordTest == users[key].password)) {
      res.cookie('user_id',key);
      myReturnVal = 1;;
      }
    });
return myReturnVal;
}


// LookUp LongURL via ShortURL input
function lookUpLongURL(shortURL) {

let myReturnVal = "";
    Object.keys(urlDatabase).forEach(key => {

      Object.keys(urlDatabase[key]).forEach(key2 => {

        if(shortURL == key2){
          console.log("I found you!!!");
          myReturnVal = urlDatabase[key][key2];
        }
      });
    // if(emailTest == users[key].email){
    //   myReturnVal = 1;;
    //   }
    });
return myReturnVal;
}


// Do my update
// Needs to find shortURL match and then replace it's value with
// new LongURL

function updateMyDatabase(shortURL,longURL) {

    Object.keys(urlDatabase).forEach(key => {

      Object.keys(urlDatabase[key]).forEach(key2 => {

        if(shortURL == key2){
          console.log("I found you!!!");
          urlDatabase[key][key2]=longURL;
        }
      });
    });
}

// MIDDLE WARE //

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//------------//

// TELLS EXPRESS TO USE THE EJS TEMPLATING AGENT
app.set("view engine", "ejs");

var urlDatabase = {

};

// LIST OF USERS
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// GET NEW URLS HERE --------------------------------------------------//
app.get("/urls/new", (req, res) => {
  let currentUserCookie = req.cookies['user_id'];
  let templateVars = {user: users[currentUserCookie]};
  if(currentUserCookie){
  res.render("urls_new", templateVars);
  } else {
  res.redirect("/");
  }
});
// RESPOND TO A POST TO ADD TO OUR DATABASE
app.post("/urls", (req, res) => {

  // GET A RANDOM 6 CHAR LONG ALPHANUMERIC STRING USING OUR RANDOM STRING PACKAGE
  var myRandomShortURL = generateRandomString();
  // <INPUT> name =longURL </INPUT> From EJS URLS_NEW IS GIVING US THIS
  let currentUserCookie = req.cookies['user_id'];
  let getURL = req.body.longURL;

  // ADD New URL to OUR DATABASE
  urlDatabase[currentUserCookie][myRandomShortURL] = getURL;

  console.log(urlDatabase);
 // console.log(urlDatabase);
  var reDirectPath = "http://localhost:8080/urls/" + myRandomShortURL;
  // console.log(reDirectPath);
  res.redirect(reDirectPath);


});
// RESPONDING TO OUR DELETE REQUEST
app.post("/urls/:id/delete", (req,res) => {
    // GETTING WHICH SHORT URL KEY TO DELETE FROM OBJECT
    let ObtainedShortURL_to_Delete = req.params.id;
    // DELETING FROM OUT OBJECT DATABASE
     Object.keys(urlDatabase).forEach(key => {

      Object.keys(urlDatabase[key]).forEach(key2 => {

        if(ObtainedShortURL_to_Delete == key2){
          console.log("I found you!!!");
          delete urlDatabase[key][key2];
        }
      });
    });

    res.redirect("http://localhost:8080/urls/");
});

// ------- /urls Event Handler-------------------//
app.get("/urls", (req,res) => {
  let currentUserCookie = req.cookies['user_id'];
  let templateVars = { urls: urlDatabase,
  user: users[currentUserCookie]};
  res.render("urls_index", templateVars);
});

//----------------------------------------------//

// FETCH LONG URL VIA SHORT URL AND FETCH AND REDIRECT TO IT
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  //res.redirect(longURL);
  let shortURL = req.params.shortURL;

  //do the lookup for the longURL



  //LOOKUP LONG URL
  let longURL  = lookUpLongURL(shortURL);
  console.log(longURL);

  if(longURL){
  res.redirect(longURL);
  } else{
    res.send("Invalid request please try again");
  }

});

// Get OUR UPDATE REQUEST
app.post("/urls/:id", (req,res) =>{

  let shortURL = req.params.id;
  let longURL  = req.body.longURL;

  //DO MY UPDATE
  updateMyDatabase(shortURL,longURL);
  //urlDatabase[shortURL] = longURL;


  res.redirect("http://localhost:8080/urls/");


});

// ------ Event handler for displaying a single URL and its shortened  //
app.get("/urls/:id", (req, res) => {
 let currentUserCookie = req.cookies['user_id'];
  let templateVars = { shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      user: users[currentUserCookie] };


 res.render("urls_show", templateVars);
});
// --------------------------------------------------------------------//





app.get("/login", (req, res) => {

  let templateVars = {user: null};
  res.render("login",templateVars);
});


app.post("/login", (req,res) => {
  let myUserEmail = req.body.email;
  let myUserPassword = req.body.password;

   let CheckEmail = checkEmailExists(myUserEmail);
   let CheckLoginWorked = CheckEmailAndPassword(myUserEmail,myUserPassword,res);

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

  let currentUserCookie = req.cookies['user_id'];
    //console.log(myCookie);
  res.clearCookie('user_id', currentUserCookie);

  res.redirect("/");

});


// REGISTER PAGE --------------------------------------------------//
app.get("/register", (req, res) => {

  let templateVars = {user: null};
  res.render("register",templateVars);
});

app.post("/register",(req,res) =>{
  // get random user id
    let user_id = generateRandomString();

    let templateVars = {email: req.body.email,
                      password: req.body.password};
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
        res.cookie('user_id',user_id);
        res.redirect("/");
  }

  });


app.get("/",(req,res) =>{
  let currentUserCookie = req.cookies['user_id'];
  let templateVars = {user: users[currentUserCookie] };
  res.render("home",templateVars);

});


// ----------------------------------------------------------------------//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});