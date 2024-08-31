const multer = require('multer')
const uuid = require('uuid')
const MIME_TYPES = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpeg"

}
const fileUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/images")
        },
        filename: (req, file, cb) => {
            const ex = MIME_TYPES[file.mimetype]

            cb(null, uuid.v4() + "." + ex)
        }
    })
})


module.exports = fileUpload