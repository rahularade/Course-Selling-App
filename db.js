const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
})

const creatorSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
})

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId : {
        type: ObjectId,
        ref: "Creator"
    }
})

const purchaseSchema = new Schema({
    courseId : {
        type: ObjectId,
        ref: "Course"
    },
    userId : {
        type: ObjectId,
        ref: "User"
    }
})

const User = mongoose.model("User", userSchema);
const Creator = mongoose.model("Creator", creatorSchema);
const Course = mongoose.model("Course", courseSchema);
const Purchase = mongoose.model("Purchase", purchaseSchema);


module.exports = {
    User,
    Creator,
    Course,
    Purchase
}