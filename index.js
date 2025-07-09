const express = require("express");
const dotenv = require("dotenv");
const { userRouter } = require("./routes/user.routes");
const { courseRouter } = require("./routes/course.routes");
const { creatorRouter } = require("./routes/creator.routes");

dotenv.config();
const app = express();
app.use(express.json())

app.use("/api/v1/user", userRouter);
app.use("/api/v1/creator", creatorRouter);
app.use("api/v1/course", courseRouter);

app.listen(process.env.PORT || 3000);
