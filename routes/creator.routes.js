const { Router } = require("express");

const creatorRouter = Router();

creatorRouter.post("/signup", function (req, res){
    res.json({
        message: "signup endpoint"
    })
})

creatorRouter.post("/signin", function (req, res){
    res.json({
        message: "signin endpoint"
    })
})

creatorRouter.post("/course", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

creatorRouter.delete("/course", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

creatorRouter.put("/course", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

creatorRouter.get("/course/bulk", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

module.exports = {
    creatorRouter
}