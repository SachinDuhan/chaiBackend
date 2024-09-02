import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file had been uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);
    console.log(localFilePath);
    console.log(fs.existsSync(localFilePath)); // true
    fs.unlink(localFilePath, (err) => {
      if (err) throw err;
      console.log(String(localFilePath) + "was deleted");
    });
    console.log("eheh", fs.existsSync(localFilePath)); // false
    return response;
  } catch (error) {
    fs.unlink(localFilePath, (err) => {
      if (err) throw err;
      console.log(String(localFilePath) + "was deleted");
    }); // remove the locally saved temp file as the
    // upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (publicId, assetType) => {
  try {
    if (!publicId) console.log("public id is missing");

    const response = await cloudinary.uploader.destroy(publicId, {
      assetType,
      type: "upload",
      invalidate: true,
    });
    console.log(publicId);

    console.log(response);

    // await cloudinary.api.update(publicId, { invalidate: true });

    return response;
  } catch (error) {
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
