var express = require('express');
var router = express.Router();
var filessystem = require('pn/fs');
var middleware = require('./middleware');

router.post('/', middleware);

module.exports = router;
