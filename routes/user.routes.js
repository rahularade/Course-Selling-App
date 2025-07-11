const { Router } = require("express");
const { User, Purchase, Course } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares/user");

const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
    const passwordSchema = z
        .string()
        .trim()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(30, { message: "Password must be at most 30 characters long" })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter",
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter",
        })
        .regex(/[0-9]/, { message: "Password must contain at least one digit" })
        .regex(/[^A-Za-z0-9]/, {
            message: "Password must contain at least one special character",
        });

    const requireBody = z.object({
        firstName: z
            .string()
            .trim()
            .min(3, "Firstname must contain at least 3 character(s)")
            .max(30, "Firstname must contain at most 30 character(s)"),
        lastName: z
            .string()
            .trim()
            .min(3, "Lastname must contain at least 3 character(s)")
            .max(30, "Lastname must contain at most 30 character(s)"),
        email: z.string().trim().email("Invalid email address"),
        password: passwordSchema,
    });

    const parsedData = requireBody.safeParse(req.body);
    if (!parsedData.success) {
        res.status(402).json({
            message: parsedData.error.issues[0].message,
        });
        return;
    }

    const { firstName, lastName, email, password } = req.body;
    const existedUser = await User.findOne({ email });

    if (existedUser) {
        res.status(400).json({
            message: "Email already exists",
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 9);

    try {
        await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong",
        });
        return;
    }

    res.json({
        message: "User registered successfully",
    });
});

userRouter.post("/signin", async function (req, res) {
    const requireBody = z.object({
        email: z.string().trim().email("Invalid email address"),
        password: z.string().trim().min(8, "Password must be at least 8 characters"),
    })
    
    const parsedData =  requireBody.safeParse(req.body);

    if(!parsedData.success){
        res.status(403).json({
            message: parsedData.error.issues[0].message
        })
        return;
    }

    const { email, password } = parsedData.data;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({
            message: "User does not exist",
        });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        res.status(401).json({
            message: "Invalid credentials",
        });
        return;
    }

    const token = jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_USER_SECRET
    );

    const options = {
        httpOnly : true,
        secure: true
    }

    res
    .cookie("token", token, options)
    .json({
        message: "User signed in successfully"
    });
});

userRouter.get("/purchases", auth, async function (req, res) {
    const userId = req.userId;

    const purchases = await Purchase.find({ userId });

    if (purchases.length === 0) {
        res.status(404).json({
            message: "Purchases not found",
        });
        return;
    }

    const courses = await Promise.all(
        purchases.map((purchase) => Course.findById(purchase.courseId))
    );

    res.json({
        courses,
    });
});

module.exports = {
    userRouter,
};
