var multer = require('multer');
var path = require('path');

function MyModelClass() {

    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        console.log('EEEEEEEEe',req.body)
        cb(null, JSON.parse(req.body.image_validation).image_path)
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      }
    })

    this.uploadFile = multer({
      storage: this.storage,
      limits: { fileSize: 1000000 },
      fileFilter: function (req, file, cb) {
          // if (req.filTypeIs && req.filTypeIs == 'all') {
          //     cb(null, true);
          // } else {
              if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg)$/)) {
                  //return cb(new Error('Only image files are allowed!'));

                  cb('Only image files are allowed!', false);
              } else {
                  cb(null, true);
              }
          // }
      }
    }).any();
}

module.exports = new MyModelClass();