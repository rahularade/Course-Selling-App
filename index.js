const express = require("express");
const { userRouter } = require("./routes/user.routes");
const { courseRouter } = require("./routes/course.routes");
const { creatorRouter } = require("./routes/creator.routes");

const app = express();
app.use(express.json())


app.use("/api/v1/user", userRouter);
app.use("/api/v1/creator", creatorRouter);
app.use("api/v1/course", courseRouter);

app.listen(3000);
