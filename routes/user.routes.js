const { Router }  = require("express");

const userRouter = Router();

userRouter.post("/signup", function(req, res) {
    res.json({
        message: "signup endpoint"
    })
})
userRouter.post("/signup", function(req, res) {
    res.json({
        message: "signin endpoint"
    })
})

userRouter.get("/purchases", auth, function(req, res) {
    res.json({
        message: "purchases endpoint"
    })
})

module.exports = {
    userRouter
}
