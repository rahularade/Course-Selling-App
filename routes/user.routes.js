const { Router }  = require("express");
const { User, Purchase, Course } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares/user");

const userRouter = Router();

userRouter.post("/signup", async function(req, res) {
    const requireBody = z.object({
        firstName: z.string().trim().min(3).max(30),
        lastName: z.string().trim().min(3).max(30),
        email: z.string().trim().email(),
        password: z.string().trim().min(8).max(30),
    })

    const parsedData = requireBody.safeParse(req.body);
    if(!parsedData.success){
        res.status(402).json({
            message: parsedData.error.issues[0].message
        })
        return;
    }

    const {firstName, lastName, email, password} = req.body;
    const existedUser = await User.findOne({ email })

    if(existedUser){
        res.status(400).json({
            message: "Email already exists"
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 9);

    try{
        await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
    } catch(e) {
        res.status(500).json({
            message: "Something went wrong"
        })
        return;
    }
    
    res.json({
        message: "User registered successfully"
    })
})

userRouter.post("/signin", async function(req, res) {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user) {
        res.status(404).json({
            message:"User does not exist"
        })
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if(!passwordMatch) {
        res.status(401).json({
            message: "Invalid credentials"
        })
        return;
    }

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_USER_SECRET)

    res.json({
        token
    })
})

userRouter.get("/purchases", auth, async function(req, res) {
    const userId = req.userId;

    const purchases = await Purchase.find({userId})

    if(purchases.length === 0){
        res.status(404).json({
            message: "Purchases not found"
        })
        return;
    }

    const courses = await Promise.all(
        purchases.map(purchase => Course.findById(purchase.courseId))
    );

    res.json({
        courses
    })
})

module.exports = {
    userRouter
}
