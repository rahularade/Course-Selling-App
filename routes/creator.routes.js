const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Creator, Course } = require("../db");
const { auth } = require("../middlewares/creator");

const creatorRouter = Router();

creatorRouter.post("/signup", async function (req, res) {
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
        res.status(400).json({
            message: parsedData.error.issues[0].message,
        });
        return;
    }

    const { firstName, lastName, email, password } = req.body;
    const existedUser = await Creator.findOne({ email });

    if (existedUser) {
        res.status(400).json({
            message: "Email already exists",
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 9);

    try {
        await Creator.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong",
        });
        return;
    }

    res.json({
        message: "Creator registered successfully",
    });
});

creatorRouter.post("/signin", async function (req, res) {
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

    const creator = await Creator.findOne({ email });

    if (!creator) {
        res.status(404).json({
            message: "Creator does not exist",
        });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, creator.password);

    if (!passwordMatch) {
        res.status(401).json({
            message: "Invalid credentials",
        });
        return;
    }

    const token = jwt.sign(
        {
            id: creator._id,
        },
        process.env.JWT_CREATOR_SECRET
    );

    const options = {
        httpOnly : true,
        secure: true
    }
    res
    .cookie("token", token, options)
    .json({
        message: "Creator signed in successfully"
    });
});

creatorRouter.post("/course", auth, async function (req, res) {
    const requireBody = z.object({
        title: z.string().trim().min(3).max(100),
        description: z.string().trim().min(3).max(100),
        price: z.number(),
        imageUrl: z.string().trim().min(3),
    });

    const parsedData = requireBody.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: parsedData.error.issues[0].message,
        });
        return;
    }

    const { title, description, price, imageUrl } = parsedData.data;

    try {
        await Course.create({
            title,
            description,
            price,
            imageUrl,
            creatorId: req.creatorId,
        });
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong",
        });
        return;
    }

    res.json({
        message: "Course created successfully",
    });
});

creatorRouter.delete("/course", auth, async function (req, res) {
    const courseId = req.body.courseId;

    try {       
        const course = await Course.findByIdAndDelete(courseId);
    } catch (e) {
        res.status(404).json({
            message: "Course not found",
        });
        return;
    }

    if (!course) {
        res.status(404).json({
            message: "Course not found",
        });
        return;
    }

    res.json({
        message: "Course deleted successfully",
    });
});

creatorRouter.put("/course", auth, async function (req, res) {
    const creatorId = req.creatorId;
    const requireBody = z.object({
        title: z.string().trim().min(3).max(100),
        description: z.string().trim().min(3).max(100),
        price: z.number(),
        imageUrl: z.string().trim().min(3),
        courseId: z.string().trim().min(1)
    });

    const parsedData = requireBody.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: parsedData.error.issues[0].message,
        });
        return;
    }

    const { title, description, price, imageUrl, courseId } = parsedData.data;

    try {
        await Course.updateOne({ _id: courseId, creatorId}, {
            title,
            description,
            price,
            imageUrl,
        });
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong",
        });
        return;
    }

    res.json({
        message: "Course updated successfully",
    });
});

creatorRouter.get("/course/bulk", auth, async function (req, res) {
    const creatorId = req.creatorId;

    const courses = await Course.find({ creatorId });

    if (courses.length === 0) {
        res.status(404).json({
            message: "Courses not found",
        });
    }
    res.json({
        courses,
    });
});

module.exports = {
    creatorRouter,
};
