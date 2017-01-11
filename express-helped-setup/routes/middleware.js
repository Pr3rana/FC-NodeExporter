var express = require('express');
var bodyParser  = require('body-parser');
var filessystem = require('fs');
var base64ToImage = require('base64-to-image');
var im = require('imagemagick');
var timestamp = require('timestamp');

var dir = 'D:/Code/Node/tutorial1/express-helped-setup/ExportedImages/';

var createDir = function (req, res) {

    if (!filessystem.existsSync(dir)){
        filessystem.mkdirSync(dir);
        console.log(dir,"dir");
    }else
    {
        console.log("Directory already exist");
    }
};

var parseRequestParams= function(req, res){
    var requestData = req.body;
    var stream = "";
    var streamType="";
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

    if(requestData["meta_width"]!="" && requestData["meta_height"] !=""){
      width = requestData["meta_width"];
      height = requestData["meta_height"];
    }
    else{
      raiseError("101");
    }

    if(requestData["parameters"] != ""){
      parametersArray = requestData["parameters"].split("|");
      exportFileName = parametersArray[0].split('=').pop();
      exportFormat = parametersArray[1].split('=').pop();
      exportAction = parametersArray[2].split('=').pop();
    }
  else{
    raiseError("100");  
  }

  requestObject = {
      "stream":stream,
      "streamType":streamType,
      "width":width,
      "height":height, 
      "exportFileName":exportFileName, 
      "exportFormat":exportFormat, 
      "exportAction":exportAction
    }
     stream_Type(requestObject,res);
};

var stream_Type = function(requestObject,res){

  if(requestObject["streamType"]=='svg'){
      var file = convertSvgToImage(requestObject,function(image){ 
        res.download(image,function(err){
          if (err) throw err;
          filessystem.unlink(image);
        });
      });
    }
      
    else if(requestObject["streamType"]=='IMAGE-DATA'){
      var file = convertBase64ToImage(requestObject,function(path,fileName){ 
        console.log("send");
        res.download(path+fileName, function(err){
          if(err) throw err;
          filessystem.unlink(path+fileName);

        });
      },res);
    }
    else{
      console.log("data type not supported");
    }
};

function convertBase64ToImage(requestObject, send, res){
  var base64Str = requestObject["stream"];
  var filePath = 'D:/Code/Node/tutorial1/express-helped-setup/ExportedImages/';
  var type =requestObject["exportFormat"];

  var name = requestObject["exportFileName"];
  var opFile= name+"."+type;

  var matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

  filessystem.writeFile(filePath+opFile, response.data, function() {
   
    if(requestObject["exportAction"]=='download'){
      var image = send(filePath,opFile);
      return image;
    }
    else if(requestObject["exportAction"]=='save'){
      var fileName = fileExist(filePath,name, type);
      console.log(fileName, 'inside convertBase64ToImage', 'fileName');
      filessystem.rename(filePath+opFile, filePath+fileName+'.'+type, function(err){
        if (err) throw err;
      })
        console.log('File saved');
    }
    else{
      console.log('Action not supported');
            
      }

  });
}

function convertSvgToImage(requestObject, send,res){
  var svg = requestObject["stream"];
  var filePath = "D:/Code/Node/tutorial1/express-helped-setup/ExportedImages/"; 
  var name = requestObject["exportFileName"];
  var type = requestObject["exportFormat"];

  var opFile = filePath+name+'.'+type;

      filessystem.writeFile('FusionCharts.svg', svg, (err) => {
        if (err) throw err;

        im.convert(['FusionCharts.svg',opFile], function(err, stdout){
          if (err) throw err;

          if (requestObject["exportAction"]=='download') {
            var image = send(opFile);
            return image; 
          }
         else if(requestObject["exportAction"]=='save'){  
              var fileName = fileExist(filePath, name, type);
              filessystem.rename(opFile, filePath+fileName+'.'+type, function(err){
                if (err) throw err;
                filessystem.unlink('FusionCharts.svg');
                console.log("file saved");
              })
          }
          else{
            console.log('Action not supported');
          }

      });
    });  
};

var getRandomName = function(file) {
  var time = timestamp();
  var random =  Math.floor(Math.random(0-9));
  var random_string = time+random; 
  return random_string;
};

var fileExist = function(path,file,type){
  if (!filessystem.existsSync(path+file+'.'+type)){
      var fileName = file;
      return fileName;
    }
    else{
      var fileName = getRandomName(file);
      return file+fileName;
    }
};

function raiseError(errorCode){
  var error = {
        "100":" Insufficient data.", 
        "101":" Width/height not provided.", 
        "102":" Insufficient export parameters.", 
        "400":" Bad request.", 
        "401":" Unauthorized access.", 
        "403":" Directory write access forbidden.", 
        "404":" Export Resource not found."
      }
    return error[errorCode];
};

module.exports = parseRequestParams;