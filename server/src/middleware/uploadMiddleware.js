import multer from "multer";

const storage =
  multer.memoryStorage();

const fileFilter = (
  req,
  file,
  callback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only JPG, PNG and WEBP images are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter,
});

export default upload;