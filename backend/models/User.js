import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    avatar: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
        maxlength: 160
    },
    bookmarks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Pool"
    }],
    following: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpiry: Date
}, { timestamps: true });

// to hash the password before saving the user document
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// to compare the user password with the saved passsword
userSchema.methods.matchPassword =  function(plain) {
    return bcrypt.compare(plain, this.password);
}

export default mongoose.model("user", userSchema);