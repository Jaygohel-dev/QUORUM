import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://goheljay105_db_user:Qfpw5crDgbiIjC5K@cluster0.runf0ye.mongodb.net/Quorum")
    .then(() => {
        console.log("MongoDB connected successfully");
    })
}