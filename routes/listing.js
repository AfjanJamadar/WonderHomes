const express=require("express");
const router=express.Router();
const methodOverride=require("method-override");
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const {isLoggedIn}=require("../middleware.js");


//server side validation for Listing model
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=> el.message.join(","));
        throw new ExpressError(404,errMsg);
    }
    else{
        next();
    }
}

//index Route 
router.get("/",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}));


//New Listing
router.get("/new",isLoggedIn,(req,res)=>{
   res.render("./listings/new.ejs");

});


//show (Read) OPeration

router.get("/:id",wrapAsync(async (req,res)=>{
   let {id}=req.params;
   const listing=await Listing.findById(id).populate("review");
   if(!listing){
      req.flash("error","Listing does not exists");
      res.redirect("/listings");
   }
   res.render("./listings/show.ejs",{listing});
}));

//Create listing
router.post("/",isLoggedIn,validateListing , wrapAsync(async (req,res,next)=>{
  
       const newListing=new Listing(req.body.listing);
       await newListing.save();
       req.flash("success","New Listing Created!");
       res.redirect("/listings");


}));

//edit listings
router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
   let {id}=req.params;
   const listing=await Listing.findById(id);
   if(!listing){
      req.flash("error","Listing does not exists");
      res.redirect("/listings")
   }
   res.render("./listings/edit.ejs",{listing});
}));

//Update route

router.put("/:id",isLoggedIn,validateListing,wrapAsync(async (req,res)=>{
   if(!req.body.listing){
       throw new ExpressError(400,"Send valid data for listings");
     }
   let {id}=req.params;
   //console.log({...req.body.listing});
   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   req.flash("success","Listing Updated!");
   res.redirect(`/listings/${id}`);
}));

//delete 
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
   let {id}=req.params;
   let deletelist=await Listing.findByIdAndDelete(id);
   console.log("deleted lis");
   req.flash("success","Listing Deleted!");
   res.redirect("/listings");
}));

module.exports=router;