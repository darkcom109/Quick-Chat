import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

console.log('Cloudinary:', {
  cloud: cloudinary.config().cloud_name,
  key: cloudinary.config().api_key,
  hasSecret: !!cloudinary.config().api_secret,
});


export default cloudinary