// Dependencies---------------------------------------------
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
const app = express();
const users = require("./src/module/userModel");
const axios = require("axios");
const cheerio = require("cheerio");
const { use } = require("passport");
var postTitle = "";

mongoose.connect(
  "mongodb+srv://binarycoders:fuckyoubitch@cluster0.kimuxjy.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//Midleware
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  users.findById(id, function (err, user) {
    done(err, user);
  });
});

var currUser;

passport.use(
  new localStrategy(function (username, password, done) {
    users.findOne({ uid: username }, function (err, user) {
      currUser = username;
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect username." });

      bcrypt.compare(password, user.loginSchema.password, function (err, res) {
        if (err) return done(err);

        return done(null, user);
      });
    });
  })
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
}

var apiLink = "";
// users.findOne({ username: currUser }, (err, user) => {
//   console.log(user.platformHandles.codechef);
// })

app.get("/", isLoggedIn, (req, res) => {
  users.findOne({ username: currUser }, (err, user) => {
    getPostTitles().then((postTitle) =>
      res.render("profile", {
        user: user,
        score: postTitle,
      }),
      console.log(postTitle)
    );
  });
});



// Score function ~ Codechef
const getPostTitles = async () => {
  const { data } = await axios.get("https://www.codechef.com/users/ilakshaychawla");
  const $ = cheerio.load(data);

  $("div.rating-number").each((_idx, el) => {
    postTitle = $(el).text();
  });

  return postTitle;
};

// Get Routes


app.get("/login", isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error,
  };
  res.render("login", response);
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/error_page",
    successRedirect: "/",
  })
);

app.get("/error_page", function (req, res) {
  res.render("error_page");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// Student Sign up
app.get("/sign-up", isLoggedOut, (req, res) => {
  res.render("signup");
});

app.post("/sign-up", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      if (err) return next(err);

      const newUser = new users({
        username: req.body.username,
        category: req.body.category,
        loginSchema: {
          password: hash,
        },
        profile: {
          name: req.body.name,
          email: req.body.email,
        },
      });
      newUser.save();
    });
  });

  res.render("success_page");
});

// Modules
app.get("/certificate-registration", isLoggedIn, (req, res) => {
  users.findOne({ username: currUser }, (err, user) => {
    res.render("./registration_forms/certificate", {
      user: user,
    });
  });
});

app.post("/certificate-registration", (req, res) => {
  users.findOneAndUpdate(
    { username: currUser },
    {
      platformHandles: {
        codechef: "https://www.codechef.com/users/".concat(req.body.codechef),
        hackerrank: req.body.hackerrank,
      },
    },
    (error, success) => {
      if (error) {
        res.render("error_page");
      } else {
        res.render("success_page");
      }
    }
  );
});

// Establishing Port Connection
var port = process.env.PORT || "6969";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port ", port);
});
