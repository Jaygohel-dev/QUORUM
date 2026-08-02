import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

//cloudinary keys
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//to upload an image or 4 images
export const upload = multer ({ storage: multer.memoryStorage() });

// to upload image to cloudinary
export const uploadToCloudinary = (buffer) => 
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "Quorum" },
            (err, result ) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
    }); // <--- I added the missing closing parenthesis here

export default cloudinary;