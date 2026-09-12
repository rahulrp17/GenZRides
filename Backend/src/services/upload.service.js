import cloudinary from "../config/cloudinary.js";

export const uploadImage = (fileBuffer, folder = "cab-booking") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      )
      .end(fileBuffer);
  });
};