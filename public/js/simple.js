var socket = io();
var canvas = document.getElementById('nerddisco');
var ctx = canvas.getContext('2d');

var myImageData = ctx.createImageData(canvas.width, canvas.height);


var imageData_width = 64;
var imageData_height = 1;


function draw(offset, size, position) {


  for (var i = 0; i < imageData_height; i++) {
      for (var j = 0; j < imageData_width; j++) {
        ctx.fillStyle = [
          'rgba(',
          (Math.floor(Math.random() * 256)),
          ',',
          (Math.floor(Math.random() * 256)),
          ',',
          (Math.floor(Math.random() * 256)),
          ',',
          1,
          ')'
        ].join('');
        ctx.fillRect(j, i, size, size);
      }
    }
}


var animation = setInterval(function() {
  draw(1, 1, getRandomInt(0, 0));
  
  myImageData = ctx.getImageData(0, 0, imageData_width, imageData_height);
  // console.log(myImageData.data);

  socket.emit('ND.color', myImageData.data);

}, 50);

// Remove to start
//clearInterval(animation);



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}