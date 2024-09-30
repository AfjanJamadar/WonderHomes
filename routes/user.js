const express=require("express");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const router=express.Router();
const User=require("../models/user.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");

router.get("/signup",(req,res)=>{
    res.render("./listings/signup.ejs");

});

router.post("/signup", wrapAsync(async(req,res) => { 
    try{
        let {username,email,password}=req.body;
        let newUser= new User({username,email});
        let registeredUser=await User.register(newUser,password);
        req.flash("success","Welcome to WonderHomes!!!");
        res.redirect("/listings");
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
   
}));

router.get("/login",(req,res)=>{

    res.render("./listings/login.ejs");
});

router.post("/login", passport.authenticate("local",
    { failureRedirect: '/login', failureFlash: true}),async(req,res)=>{
        req.flash("success","Welcome to WonderHomes");
        res.redirect("/listings");
});

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        next(err);
    });
    req.flash("success","Logged out successfully");
    res.redirect("/listings");
});


module.exports=router;
