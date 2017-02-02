var express = require('express');
var router = express.Router();
var filessystem = require('fs');
var middleware = require('./middleware');

router.post('/', middleware);

module.exports = router;
