//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose=require("mongoose"); 
// const encrypt=require("mongoose-encryption");
const passport = require('passport')
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
const LocalStatergy=require("passport-local")

// to set up a session !!
// so each time : browser sends a request to the server : 
// it will start a session before doing any other tasks !!
// session is a middleware !!
app.use(session({
    secret:"Hello Desis !!",
    resave:false,
    saveUninitialized:false,
    cookie: {}
}));


// now as the session is setted up !! 
// now its time to : Initialize the session !!
// 1st method is used as a middleware to initialize the package !!
app.use(passport.initialize());
// this 2nd command is used to initialize a session using passport !!
app.use(passport.session());

mongoose.set("strictQuery", false);
const mongodb="mongodb://0.0.0.0:27017/User-db";

mongoose.connect(mongodb,(err)=>{
    if(err){
        console.log("Unsuccess !!"+err);
    }
    else{
        console.log("MongoDb is connected !!")
    }
})

const modelSchema=new mongoose.Schema({
    name:String,
    pwd:String
});
modelSchema.plugin(passportLocalMongoose, {
    usernameField: 'name'
  });
const User = mongoose.model('User', modelSchema );


// const secret=process.env.SECRET;
// modelSchema.plugin(encrypt,{secret:secret,encryptedFields:['pwd']});


// User.aunthenticate : sirf aur sirf isliye possible ho paya bcz : Hamne
// plugins install kar diye hai is schema ke saaath to jo bhi models is schema 
// based honge : those can use the extra methods / Powers provided by this plugin !!
passport.use(new LocalStatergy(User.authenticate()));

// WHAT IS LOCAL STATERGY ?? : IT IS THE WAY TO AUTHENTICATE THE USER 
// AND USING THE PASSPORT-LOCAL-MONGOOSE-PLUGIN
// WE ARE EASILY ABLE TO CONFIGURE THAT !!!

// use static serialize and deserialize of model for passport session support

// Serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  // Deserialize the user from the session
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


const user1=new User({
    name:"Admin-lakshay",
    pwd:"lakshay89"
});

// user1.save(user1,function(err){
//     if(err){
//         console.log("UnsuccessFull !!");
//     }
//     else{
//         console.log("Success !!!");
//     }
// })
 
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
 

    app.get('/logout', function(req,res){
        res.clearCookie('connect.sid');
        res.redirect('/');
    });


app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/register");
    }
})
app.post("/register",function(req,res){
    
    let user=req.body.username;
    let pwd=req.body.password;
    
    // User.register is a plugin 
    // of passport local mongoose !!
    // that just simply : insert wala mongoose 
    // ka kaam success par kar deta hai 
    // apne aap !!
    // yahan pe name isliye diya bcz : upar line 47 pe is plugin ko setup kiya tha 
    // to wahan par : usernameField me: name likha tha !!
    User.register({name:user},pwd, function(err, user) {
            if(err){
                console.log("UserName Already Registered !!");
                res.redirect("/");
            }
            else{
                // This callback will be triggered only if the 
                // authenticaiton is successfull !!
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                });
                
            }
      });
    
    
});


// app.post('/login', 
//     passport.authenticate('local', { failureRedirect: '/login' }),
//     function(req, res) {
//       res.redirect('/');
//     });

app.get("/login",function(req,res){
    res.render("login");
})

// This callback fnc will be triggered only and only if 
// the : authentication is passed !!
app.post("/login", passport.authenticate("local",{failureRedirect:'/'}), function(req, res){
    res.redirect("/secrets");
});


app.get("/register",function(req,res){
    res.render("register");
})



app.get("/",function(req,res){
    // Imp functionality that we see at many sites !!
    // ki agar aap signed in ho and still aunthenticated ho i.e bcz cookie 
    // ofc expire nahi hua hai bcz of that fact that: browsing session has not being 
    // terminated !!
    if(req.isAuthenticated()){
        res.redirect("/secrets");
    }
    else{
        res.render("home");
    }
})
 
 
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});