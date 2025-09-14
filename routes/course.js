const { Router } = require("express");
const { courseModel, purchaseModel } = require("../db");
const { userMiddleware } = require("../middileware/user");


const courseRouter = Router()

courseRouter.post("/purchase",userMiddleware,async (req,res) => {
    // add payment in future
    const userId = req.userId;
    const courseId = req.body.courseId;

    // check if user have purchase course or not
    await purchaseModel.create({
        userId,
        courseId
    });

    res.json({
        message: "you have successfully bought the course"
    });
});

courseRouter.get("/preview",async (req,res) => {
    
    const courses = await courseModel.find({});

    res.json({
        courses
    });
});

module.exports = {
    courseRouter: courseRouter
}