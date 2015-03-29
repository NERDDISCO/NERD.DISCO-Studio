var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



 var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

app.get('/', function(req, res){
  res.sendFile('index.html', options);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


var color = { red : 0, green : 0, blue : 0 };
var pixels = null;
var element = 0;

io.on('connection', function(socket) {

  socket.on('ND.color', function(data){
    pixels = data;

    color.red = data['0'];
    color.green = data['1'];
    color.blue = data['2'];

    console.log(pixels);


    });

});



var OPC = new require('./app/opc');
var client = new OPC('localhost', 7890);

console.log(client.connected);

function draw() {
    var millis = new Date().getTime();

    for (var pixel = 1; pixel < 65; pixel++) {
        var t = pixel * 0.2 + millis * 0.002;

        // color.red = color.red;
        // color.green = color.green + t;
        // color.blue = color.blue + t;
        // 
        color = getPixel(pixel);

        // console.log(color);


        client.setPixel(pixel - 1, color.r, color.g, color.b);
    }
    client.writePixels();
}

function getPixel(position) {
  var pixel = {};

  var _position = position * 4;

  // Pixel exists
  if (pixels !== null && pixels[_position - 1] != undefined) {
    // Alpha
    pixel.a = pixels[_position - 1];

    // Blue
    pixel.b = pixels[_position - 2];

    // Green
    pixel.g = pixels[_position - 3];

    // Red
    pixel.r = pixels[_position - 4];
  } else {
    // Black
    pixel.a = pixel.r = pixel.g = pixel.b = 0;
    
  }

  return pixel;
}

setInterval(draw, 50);