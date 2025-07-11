const express = require("express");
const dotenv = require("dotenv");
const { userRouter } = require("./routes/user.routes");
const { courseRouter } = require("./routes/course.routes");
const { creatorRouter } = require("./routes/creator.routes");
const mongoose = require("mongoose");
const { apiLimiter } = require("./middlewares/ratelimiter");

dotenv.config();
const app = express();
app.use(express.json())
app.use(apiLimiter)

app.use("/api/v1/user", userRouter);
app.use("/api/v1/creator", creatorRouter);
app.use("/api/v1/course", courseRouter);


async function main() {
    await mongoose.connect((process.env.MONGODB_URL + process.env.DATABASE))
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    });
}

main();
