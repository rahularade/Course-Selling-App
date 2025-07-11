const { Router } = require("express");
const { Course, Purchase } = require("../db");
const { auth } = require("../middlewares/user");

const courseRouter = Router();

courseRouter.get("/preview", async function(req, res) {
    try{
        const courses = await Course.find({});
        if(courses.length === 0){
        res.status(404).json({
            message: "Courses not found"
        })
        return;
    }

    res.json({courses})
    } catch(e){
        res.status(500).json({
            message: "Something went wrong"
        })
        return;
    }

})

courseRouter.post("/purchase",auth, async function(req, res) {
    const userId = req.userId;
    const courseId = req.body.courseId;

    try {
        await Purchase.create({
            courseId,
            userId
        })
    } catch (e) {
        res.status(500).json({
            message:"Something went wrong"
        })
        return;
    }

    res.json({
        message:"You have successfully bought the course"
    })
})

module.exports = {
    courseRouter
}