var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http)
;



 var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };


// Enable static files
app.use(express.static('public'));

// Send the index.html to new clients
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

  console.log('NERD DISCO - Studio connection');

  socket.on('ND.color', function(data){
    pixels = data;
  });

});



var OPC = new require('./app/opc');
var client = new OPC('localhost', 7890);



function draw() {
    for (var pixel = 1; pixel < 65; pixel++) {
      color = getPixel(pixel);
      client.setPixel(pixel - 1, color.r, color.g, color.b);
    }

    // console.log(client.connected);

    // Connected to fadecandy server
    //if (client.connected) {
      client.writePixels();
    //}
}

/**
 * Extract the pixel data from the given position
 * 
 * @param  Interger position
 * 
 * @return Object pixel
 */
function getPixel(position) {
  var pixel = {};

  var _position = position * 3;

  // Pixel exists
  if (pixels !== null && pixels[_position - 1] !== undefined) {
    // // Alpha
    // pixel.a = pixels[_position - 1];

    // Blue
    pixel.b = pixels[_position - 1];

    // Green
    pixel.g = pixels[_position - 2];

    // Red
    pixel.r = pixels[_position - 3];
  } else {
    // Black
    pixel.a = pixel.r = pixel.g = pixel.b = 0;
    
  }

  return pixel;
}

setInterval(draw, 50);