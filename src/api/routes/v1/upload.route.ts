export {};
const express = require('express');
import { NextFunction, Request, Response, Router } from 'express';
const router = express.Router();
const { authorize } = require('../../middlewares/auth');
const { UPLOAD_LIMIT } = require('config/vars');
const uuidv4 = require('uuid/v4');
var path = require('path');


const controller = require('../../controllers/upload.controller');

const multer = require('multer');
const storage = multer.diskStorage({
  destination(req: Request, file: any, cb: any) {
    cb(null, 'uploads/');
  },
  filename(req: Request, file: any, cb: any) {
    // fieldname, originaln ame, mimetype
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fieldSize: `${UPLOAD_LIMIT}MB` } });

router.route('/file').post(authorize(), upload.single('file'), controller.upload);



router.route('/file_2').post(authorize(), upload.single('file'), controller.upload2);

module.exports = router;
