var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fadecandyClient = require('./app/opc')
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
app.use(express.static('public/asset'));

// Send the index.html to new clients
app.get('/', function(req, res){
  res.sendFile('index.html', options);
});

http.listen(1337, function(){
  console.log('listening on *:1337');
});


var color = { red : 0, green : 0, blue : 0 };
var pixels = null;
var element = 0;

io.on('connection', function(socket) {

  console.log('NERD DISCO - Studio connection');

  socket.on('ND.color', function(data){
    pixels = data;

    draw();
  });

});



var client = new fadecandyClient('localhost', 7890);



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



function draw() {

    var amount = 64 * 5;

    for (var pixel = 0; pixel < amount; pixel++) {
      color = getPixel(pixel + 1);
      client.setPixel(pixel, color.r, color.g, color.b);
    }

    client.writePixels();
}

//setInterval(draw, 1000 / 60);













function test_draw() {
    var millis = new Date().getTime();

    var amount = 64 * 5;

    for (var pixel = 0; pixel < amount; pixel++)
    {

        var t = pixel * 2.1 + millis * 0.015;
        var red = (255 * Math.random()) * Math.sin(t + Math.random());
        var green = (255 * Math.random()) * Math.sin(t + Math.random());
        var blue = (255 * Math.random()) * Math.sin(t + Math.random());

        client.setPixel(pixel, red, green, blue);
    }
    client.writePixels();
}





//setInterval(test_draw, 1000 / 30);