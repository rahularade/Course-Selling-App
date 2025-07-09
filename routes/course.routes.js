const { Router } = require("express");

const courseRouter = Router();

courseRouter.get("/preview", function(req, res) {
    res.json({
        message: "courses endpoint"
    })
})

courseRouter.post("/purchase", function(req, res) {
    res.json({
        message: "courses endpoint"
    })
})

module.exports = {
    courseRouter
}