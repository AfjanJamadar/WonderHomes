const express=require("express");
const router=express.Router({mergeParams :true});
const {reviewSchema}=require("../schema.js");
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");


//server side validation for Review model
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=> el.message.join(","));
        throw new ExpressError(404,errMsg);
    }
    else{
        next();
    }
}

//reviews post show
router.post("/",validateReview,wrapAsync(async (req,res) => {
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.review.push(newReview);

    await listing.save();
    await newReview.save();
    req.flash("success"," New Review created!");
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{review: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;
