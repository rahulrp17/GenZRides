import cloudinary from "../config/cloudinary.js";

/* ===========================================================
   UPLOAD IMAGE
=========================================================== */

export const uploadImage = (buffer, folder = "LetsGoCab") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            publicId: result.public_id,
            url: result.secure_url,
          });
        }
      )
      .end(buffer);
  });
};

/* ===========================================================
   UPLOAD DRIVER DOCUMENT
=========================================================== */

export const uploadDriverDocument = async (
  buffer,
  documentName
) => {
  return uploadImage(
    buffer,
    `LetsGoCab/Drivers/${documentName}`
  );
};

/* ===========================================================
   UPLOAD PROFILE IMAGE
=========================================================== */

export const uploadProfileImage = async (buffer) => {
  return uploadImage(
    buffer,
    "LetsGoCab/ProfileImages"
  );
};

/* ===========================================================
   UPLOAD VEHICLE IMAGE
=========================================================== */

export const uploadVehicleImage = async (buffer) => {
  return uploadImage(
    buffer,
    "LetsGoCab/Vehicles"
  );
};

/* ===========================================================
   DELETE IMAGE
=========================================================== */

export const deleteImage = async (publicId) => {
  if (!publicId) return;

  return await cloudinary.uploader.destroy(publicId);
};