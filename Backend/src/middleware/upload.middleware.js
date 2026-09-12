import multer from "multer";

/* ===========================================================
   MULTER STORAGE
=========================================================== */

const storage = multer.memoryStorage();

/* ===========================================================
   ALLOWED IMAGE TYPES
=========================================================== */

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/* ===========================================================
   FILE FILTER
=========================================================== */

const fileFilter = (req, file, cb) => {
  if (
    allowedMimeTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG and WEBP images are allowed."
    ),
    false
  );
};

/* ===========================================================
   MULTER CONFIG
=========================================================== */

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/* ===========================================================
   EXPORTS
=========================================================== */

export default upload;

export const uploadSingle = (field) =>
  upload.single(field);

export const uploadMultiple = (
  field,
  maxCount = 5
) => upload.array(field, maxCount);