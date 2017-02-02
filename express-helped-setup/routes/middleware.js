var bodyParser = require('body-parser'),
    filessystem = require('fs'),
    regex = require('filename-regex'), 
    //used for old browser(eg IE8)
    im = require('imagemagick'),
    timestamp = require('timestamp'),
     dir = './exported_images/';

//creates the ExportedImages dir
var createDir = function() {
    if (!filessystem.existsSync(dir)) {
        filessystem.mkdirSync(dir);
    } else {
        console.log("Directory already exist");
    }
};

//parse the request parameters
var parseRequestParams = function(req, res) {

    var requestData = req.body;
    var stream = "";
    var streamType = "";
    var imageData = "";
    var parametersArray = [];
    var width = 0;
    var height = 0;
    var exportFileName = "";
    var exportFormat = "";
    var exportAction = "";

    createDir();

    if (requestData["stream"]) {
        stream = requestData["stream"];
    } else {
        raiseError("101");
    }

    if (requestData["stream_type"]) {
        streamType = requestData["stream_type"];
    } else {
        raiseError("101");
    }

    if (requestData["meta_width"] != "" && requestData["meta_height"] != "") {
        width = requestData["meta_width"];
        height = requestData["meta_height"];
    } else {
        raiseError("101");
    }

    if (requestData["parameters"] != "") {
        parametersArray = requestData["parameters"].split("|");
        exportFileName = parametersArray[0].split('=').pop();
        exportFormat = parametersArray[1].split('=').pop();
        exportAction = parametersArray[2].split('=').pop();
    } else {
        raiseError("100");
    }

    requestObject = {
        "stream": stream,
        "streamType": streamType,
        "width": width,
        "height": height,
        "exportFileName": exportFileName,
        "exportFormat": exportFormat,
        "exportAction": exportAction
    }
    stream_Type(requestObject, res);
};

//checks the stream_type present in the req parameters
var stream_Type = function(requestObject, res) {
    var send = function(image) {
            res.download(dir+image, function(err) {
                if (err) throw err;
                filessystem.unlink(dir+image);

            });
        };

    if (requestObject["streamType"] == 'svg') {
        var file = convertSvgToImage(requestObject, send);
    } 
    else if (requestObject["streamType"] == 'IMAGE-DATA') {
        var file = convertBase64ToImage(requestObject, send);
    } 
    else {
        console.log("data type not supported");
    }
};


//Convert the base64 data  into image
function convertBase64ToImage(requestObject, send) {
    var base64Str = requestObject["stream"];
    var filePath = dir;
    var type = requestObject["exportFormat"];

    var name = requestObject["exportFileName"].match(regex());
    var opFile = name[0] + '.' + type;

    var matches = base64Str.match(/^data:([A-Za-z-+.\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    filessystem.writeFile(filePath + opFile, response.data, function() {

        if (requestObject["exportAction"] === 'download') {
            var image = send(opFile);
            return image;
        } 
        else if (requestObject["exportAction"] === 'save') {
            var fileName = fileExist(filePath, name[0], type);
            filessystem.rename(filePath + opFile, filePath + fileName + '.' + type, function(err) {
                if (err) throw err;
            })
            console.log('File saved');
        } else {
            console.log('Action not supported');

        }

    });
}

//Convert the svg data  into image
function convertSvgToImage(requestObject, send, res) {
    var svg = requestObject["stream"];
    var filePath = dir;
    var name = requestObject["exportFileName"].match(regex());
    var type = requestObject["exportFormat"];

    var opFile = name[0] + '.' + type;

    filessystem.writeFile('FusionCharts.svg', svg, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
        im.convert(['FusionCharts.svg', dir+opFile], function(err, stdout) {
            if (err) throw err;

            if (requestObject["exportAction"] === 'download') {
                var image = send(opFile);
                return image;
            } else if (requestObject["exportAction"] === 'save') {
                var fileName = fileExist(filePath, name[0], type);
                filessystem.rename(dir+opFile, filePath + fileName + '.' + type, function(err) {
                    if (err) throw err;
                    filessystem.unlink('FusionCharts.svg');
                })
            } else {
                console.log('Action not supported');
            }

        });
    });
};

//get random name for the file when exportoption is set as save
var getRandomName = function(file) {
    var time = timestamp();
    var random = Math.floor(Math.random(0 - 9));
    var random_string = time + random; // string will be unique because timestamp never repeat itself
    return random_string;
};

//To check whether the file exist or not
var fileExist = function(path, file, type) {
    if (!filessystem.existsSync(path + file + '.' + type)) {
        var fileName = file;
        return fileName;
    } else {
        var fileName = getRandomName(file);
        return file + fileName;
    }
};

//function called when error occurs at the time of parsing of requested data
function raiseError(errorCode) {
    var error = {
        "100": " Insufficient data.",
        "101": " Width/height not provided.",
        "102": " Insufficient export parameters.",
        "400": " Bad request.",
        "401": " Unauthorized access.",
        "403": " Directory write access forbidden.",
        "404": " Export Resource not found."
    }
    return error[errorCode];
};

module.exports = parseRequestParams;