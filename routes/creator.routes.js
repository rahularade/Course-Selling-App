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

creatorRouter.post("/", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

creatorRouter.delete("/", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

creatorRouter.put("/", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

creatorRouter.get("//bulk", function (req, res){
    res.json({
        message: "course endpoint"
    })
})

module.exports = {
    creatorRouter
}