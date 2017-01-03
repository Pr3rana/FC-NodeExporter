var express = require('express');
var router = express.Router();
var filessystem = require('pn/fs');
var middleware = require('./middleware');

var dir = 'ExportedImages/';

router.post('/', middleware);

module.exports = router;
