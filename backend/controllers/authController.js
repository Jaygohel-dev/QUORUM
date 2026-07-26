import User from "../models/User";
import Pool from "../models/Pool";
import Comment from "../models/Comment";

// to reegster a user and send otp to emils...

try{
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) 
        return res.status(400).json({ message: "All fileds are required" });
    
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ 
        message: "User already exists" 
    });
    let avatar = "";
    if(req.file){

    }

    catch (error) {

    }
    
}