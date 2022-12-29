//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose=require("mongoose"); 
const encrypt=require("mongoose-encryption");


const app = express();

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

const secret=process.env.SECRET;
modelSchema.plugin(encrypt,{secret:secret,encryptedFields:['pwd']});

const User=mongoose.model("user",modelSchema);

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
 
app.get("/logout",function(req,res){
    res.redirect("/");
})
app.post("/register",function(req,res){
    let user=req.body.username;
    let pwd=req.body.password;
    let obj=new User({
        name:user,
        pwd:pwd
    });
    //see :user ki email unique enough hogi !!!
    User.find({name:user},function(err,result){
        if(err){
            console.log("Unsuccess !! "+err);
        }
        else{
            if(result.length==0){
                obj.save(function(err){
                    if(err){
                        res.redirect("/");
                    }
                    else{
                        res.render("secrets");
                    }
                });
            }
            else{
                if(result[0].pwd!=pwd){
                    res.redirect("/");
                }
                else{
                    res.redirect("/login");
                }
            }
        }
    })
    
});

app.post("/login",function(req,res){
    const user=req.body.username;
    const pwd=req.body.password;
    let obj2={
        name:user,
        pwd:pwd
    }

    //allow only if found !!
    User.find({name:user},function(err,result){
        if(err){
            res.render("login");
        }
        else{
            if(result.length==0){
                res.redirect("/");
            }
            else{   
                    if(pwd!=result[0].pwd){
                        console.log("Incorrect pwd ");
                        res.render("/");
                    }
                    else{
                        res.render("secrets");
                    }
            }
        }
    })

})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})


app.get("/",function(req,res){
    res.render("home");
})
 
 
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});