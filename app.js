//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose=require("mongoose"); 
const encrypt=require("mongoose-encryption");
// const md5=require("md5");
const bcrypt=require("bcrypt");


const saltRounds = 10;

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

// const secret=process.env.SECRET;
// modelSchema.plugin(encrypt,{secret:secret,encryptedFields:['pwd']});

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
    
    bcrypt.hash(pwd, saltRounds, function(err1, hash) {
        
        let obj=new User({
            name:user,
            pwd:hash
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
                bcrypt.compare(pwd,result[0].pwd, function(err, result) {
                    if(result==true){
                        res.redirect("/login");
                    }
                    else{
                        res.redirect("/");
                    }
                });
            }
        }
    })
    });

    
    
    
});

app.post("/login",function(req,res){
    const user=req.body.username;
    const pwd=(req.body.password);
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
                bcrypt.compare(pwd,result[0].pwd, function(err, result) {
                    if(result==true){
                        res.render("secrets");
                    }
                    else{
                        console.log("Incorrect pwd ");
                        res.redirect("/");
                    }
                });
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