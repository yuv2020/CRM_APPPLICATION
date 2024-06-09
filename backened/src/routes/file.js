const express = require('express');
const config = require('../config');
const path = require('path');
const passport = require('passport');
const services = require('../services/file');
const router = express.Router();

router.get('/download', (req, res) => {
  if (process.env.NODE_ENV == 'production') {
    services.downloadGCloud(req, res);
  } else {
    services.downloadLocal(req, res);
  }
});
