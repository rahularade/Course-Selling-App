const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Creator, Course } = require("../db");
const { auth } = require("../middlewares/creator");

const creatorRouter = Router();

creatorRouter.post("/signup", async function (req, res) {
    const requireBody = z.object({
        firstName: z.string().trim().min(3).max(30),
        lastName: z.string().trim().min(3).max(30),
        email: z.string().trim().email(),
        password: z.string().trim().min(8).max(30),
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
    const { email, password } = req.body;

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

    res.json({
        token,
    });
});

creatorRouter.post("/course", auth, async function (req, res) {
    const requireBody = z.object({
        title: z.string().trim().min(3).max(100),
        description: z.string().trim().min(3).max(100),
        price: z.number(),
        imageUrl: z.string().trim().min(3).max(100),
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

    const course = await Course.findByIdAndDelete(courseId);

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
        imageUrl: z.string().trim().min(3).max(100),
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
