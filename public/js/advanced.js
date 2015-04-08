/**
 * Handles everything
 */
function NERDDISCO_animation(args) {
  // Queue of elements
  this.queue = [];
  
  // There were n+1 elements removed
  this.deleted_elements = false;
  
  // Connect to audio
  this.audio = args.audioSource || null;
  
  // New dot counter
  this.new_dot_counter = 0;
  // The max amount of frames to wait until a new dot is added while audio is playing
  this.new_dot_counter_max_playing = 20;
  // The max amount of frames to wait until a new dot is added while audio is not playing
  this.new_dot_counter_max_not_playing = 180;
  
  // Add a new element right now
  this.instant = false;
  
  // Current frame count
  this.instant_counter = 0;
  // Wait n frames to reset instant_counter
  this.instant_counter_max = 2;
  
  // Low volume = slow animations
  this.slow = false;

  // Canvas rendering context 2D
  this.ctx = args.renderingContext;

  // Colors of 1 canvas pixel
  this.canvas_pixel = 4;

  // Size of 1 ndPixel (in canvas pixel)
  this.nd_pixel = 6;

  // Colors of 1 ndPixel
  this.nd_pixel_size = this.canvas_pixel * this.nd_pixel;

  // Amount of ndPixel colors for one row
  this.nd_pixel_row = this.nd_pixel_size * 8;

  // One side of a ndSquare (in ndPixel)
  this.nd_square_side = this.nd_pixel * 8;

  // Data from the canvas;
  this.ctx_image_data = null;
}



NERDDISCO_animation.prototype = {
  // Add new element to the queue
  add : function(args) {
    
    this.queue.push(
      new circle({
        x : args.x,
        y : args.y,
        radius : 1,
        speed : args.speed,
        audio : this.audio,
        opacity : args.opacity || 0.35
      })
    );
    
  },
  
  // Update all elements in the queue
  update : function(event) {
    // Initial state
    this.deleted_elements = false;
    
    // Add a new dot after 60 frames
    if ( (this.audio.volume > 0 && this.new_dot_counter > this.new_dot_counter_max_playing) ||
         (this.audio.volume === 0 && this.new_dot_counter > this.new_dot_counter_max_not_playing) ||
        (this.instant && this.instant_counter > this.instant_counter_max)
       ) {
      
      var random_point = Point.random();
      var speed = this.getRandom(10, 25);
      var opacity = 1;
      
      // Slow beat
      if (this.slow) {
        speed = 5;
        this.slow = false;
      }
      
      // Audio is playing
      if (this.audio.volume > 0) {
        opacity = Math.random();
        
      // No audio is playing
      } else {
        opacity = 0.1;
      }

      // Add circle
      this.add({
        x: paper.view.size.width * random_point.x,
        y: paper.view.size.height * random_point.y,
        speed: speed,
        opacity: opacity
      });
      
      // Reset
      this.new_dot_counter = 0;
      
      // Reset
      this.instant = false;
      
      // Reset
      this.instant_counter = 0;
      
    } else {
      this.new_dot_counter++;
    }

    // Iterate over all elements
    for (var i = 0; i < this.queue.length; i++) {
      // Update the current element
      // @return true = remove element
      // @return false = don't remove the element
      var remove = this.queue[i].update(event);
      
      // Remove the element
      if (remove) {
        // Delete the value of the current element inside the queue
        // but keep the position (so that the loop is not influenced)
        delete this.queue[i];
        
        // Element was deleted from queue
        this.deleted_elements = true;
      }
    }
    
    // There were deleted elements
    if (this.deleted_elements) {
      // Remove all "deleted elements" (no value, just position) from the queue
      this.queue = this.queue.filter(function(n) { return n !== undefined; });
    }
    
    if (this.audio.volume > 14050) {
      if (this.queue.length < 40) {
        this.instant = true;
        this.instant_counter++;
      }
    }
    
    if (this.audio.volume <= 14050) {
      this.slow = true;
    }

  },
  
  
  /**
   * Get a random number between min and max. 
   */
  getRandom : function(min, max) {
    return Math.random() * (max - min) + min;
  },


  getPixels : function(nd_square_x, nd_square_y) {
    // Get pixels in size of a ndSqare from the canvas
    // this.ctx_image_data = this.ctx.getImageData(paper.view.center._x, paper.view.center._y, this.nd_square_side, this.nd_square_side);
    // var pixel_data = this.ctx_image_data.data;
    var position = 0;
    var leds = [];

    var x = 0;
    var y = 0;

    // var rgb = {
    //   r : 0,
    //   g : 0,
    //   b : 0
    // };
    // 
    // 
    // 
    
    rgb = [];
    rgb[0] = 0;
    rgb[1] = 0;
    rgb[2] = 0;

    var ctx_image_data_length = 0;
    var count = 0;
    var i = 0;



      // rows (LED per row)
      for (var rows = 0; rows < 8; rows++) {

        // columns (LED per column)
        for (var columns = 0; columns < 8; columns++) {

          x = (columns * this.nd_pixel) + nd_square_x;
          y = (rows * this.nd_pixel) + nd_square_y;

          // All pixel for one LED
          this.ctx_image_data = this.ctx.getImageData(x, y, this.nd_pixel, this.nd_pixel);

          // Get actual color values
          this.ctx_image_data = this.ctx_image_data.data;

          // Amount of pixel per LED
          pixel_per_led = this.nd_pixel * this.nd_pixel;

          // For each pixel for one LED
          for (var pixels = 0; pixels < pixel_per_led; pixels++) {
            position = pixels * 4;

            // Red
            rgb[0] += this.ctx_image_data[position];

            // Green
            rgb[1] += this.ctx_image_data[position + 1];

            // Blue
            rgb[2] += this.ctx_image_data[position + 2];
          }

          // floor the average values to give correct rgb values
          rgb[0] = Math.floor(rgb[0] / pixel_per_led);
          rgb[1] = Math.floor(rgb[1] / pixel_per_led);
          rgb[2] = Math.floor(rgb[2] / pixel_per_led);

          // console.log(rgb);

          // Add color for one LED to the list of leds
          leds.push(rgb[0], rgb[1], rgb[2]);

          // Reset color
          rgb[0] = 0;
          rgb[1] = 0;
          rgb[2] = 0;
        }
    }


    return leds;
  }



};


function circle(args) {
  // Basic circle
  this.path = new Path.Circle({
    center: new Point(args.x, args.y),
    radius: args.radius,
    fillColor: this.getRandomColor(),
    opacity : args.opacity
  });
  
  // Initial radius of the circle
  this.radius = args.radius;
  
  // The amount that gets added to this.radius on every frame 
  this.speed = args.speed;
  
  // Connect to an audio source
  this.audio = args.audio;
}

circle.prototype = {
  update : function() {
    
    // Element is not bigger than the size of the view
    if (!(this.radius > paper.view.size.width + 50 && this.radius > paper.view.size.height + 50)) {
      // Scale the element
      this.path.scale((this.radius + this.speed) / this.radius);
      
      // Increase radius
      this.radius += this.speed;
      
      // Change the color
      this.path.fillColor.hue += (this.speed / 2);
      
      // Element stays another frame in the queue
      return false;
      
    } else {
      this.path.remove();
      
      // Remove element from queue
      return true;
    }
  },

  getRandomColor : function() {
    return randomColor({
      luminosity: 'bright',
      format: 'rgb'
    });
  }
};





// ---------------------------------------------------
//  Mouse/Touch Events
// ---------------------------------------------------
/*
var isMouseDown = false;
var onmousedown = function(e) {
  e.preventDefault();
  isMouseDown = true;
  
  NERDDISCO_animation_.add({
    x: e.x,
    y: e.y,
    speed: 5
  });

};

var onmouseup = function(e) {
  isMouseDown = false;
  e.preventDefault();
};

document.addEventListener("mousedown", onmousedown, true);
document.addEventListener("mouseup", onmouseup, true);

var ontouchstart  = function(e) {
  e.preventDefault();
  var touch = e.changedTouches[0];
  
  NERDDISCO_animation_.add({
    x: touch.clientX,
    y: touch.clientY,
    speed: 5
  });
};
var ontouchend = function(e) {
  e.preventDefault();
};

document.addEventListener("touchstart", ontouchstart, false);
document.addEventListener("touchend", ontouchend, false);
*/














var SoundCloudAudioSource = function(player) {
  var self = this;
  var analyser;
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  var source = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  var sampleAudioStream = function() {
    analyser.getByteFrequencyData(self.streamData);
    // calculate an overall volume value
    var total = 0;

    for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
        total += self.streamData[i];
    }

    self.volume = total;
  };

  setInterval(sampleAudioStream, 20);

  this.volume = 0;
  this.streamData = new Uint8Array(128);
  this.playStream = function(streamUrl) {
    // get the input stream from the audio element
    player.addEventListener('ended', function(){
        project.clear();
    });
    player.setAttribute('src', streamUrl);
    player.pause();
  };
};







/**
 * Makes a request to the Soundcloud API and returns the JSON data.
 */
var SoundcloudLoader = function(player) {
  var self = this;
  var client_id = "dce5652caa1b66331903493735ddd64d";
  this.sound = {};
  this.streamUrl = "";
  this.errorMessage = "";
  this.player = player;

  /**
   * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
   * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
   * @param track_url
   * @param callback
   */
  this.loadStream = function(track_url, successCallback, errorCallback) {
    SC.initialize({
        client_id: client_id
    });

    SC.get('/resolve', { url: track_url }, function(sound) {

      if (sound.errors) {
        self.errorMessage = "";
        for (var i = 0; i < sound.errors.length; i++) {
            self.errorMessage += sound.errors[i].error_message + '<br>';
        }
        self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
        errorCallback();
      } else {
        self.sound = sound;
        self.streamUrl = function(){ return sound.stream_url + '?client_id=' + client_id; };
        successCallback();
      }

    });

  };

};




















window.onload = function() {

  var player =  document.getElementById('soundcloud_player');
  var loader = new SoundcloudLoader(player);
  var audioSource = new SoundCloudAudioSource(player);

  var loadAndUpdate = function(trackUrl, autoplay) {
    loader.loadStream(trackUrl,
      // success
      function() {
        audioSource.playStream(loader.streamUrl());
    
        // Automatically start playback
        if (autoplay) {
          project.clear();
          player.play();
        }
    
        // Update the title
        meta__track.innerHTML = loader.sound.title;
        
      },
      // error
      function() {
          console.error(loader.errorMessage);
      }
    );
  };




  // Get canvas
  var canvas = document.getElementById("NERDDISCO-Studio-alpha_0_0_0_0_0_1");

  // Get 2D context from canvas
  var ctx = canvas.getContext("2d");

  paper.install(window);
  paper.setup(canvas);
    
  window.NERDDISCO_animation_ = new NERDDISCO_animation({ audioSource : audioSource, renderingContext : ctx });

  // Create image data
  var myImageData;

  var socket = io();
  var ndSquare = null;

  // Update the view
  paper.view.onFrame = function(event) {
    // Update everything
    NERDDISCO_animation_.update(event);


    // Get colors for LEDs
    ndSquare = NERDDISCO_animation_.getPixels(paper.view.center._x - 32, paper.view.center._y - 32);

    // Send pixel data to the server
    socket.emit('ND.color', ndSquare);


    
    
  };





  var soundcloud_url_input = document.getElementById('soundcloud_url');
  var soundcloud_load_url_button = document.getElementById('soundcloud_load_url');

  var meta__track = document.getElementById('meta__track');

  /**
   * Handle clicks on the SoundCloud "load url"-button. 
   */
  soundcloud_load_url_button.addEventListener('click', function(e) {
    e.preventDefault();
    
    // The URL of the track on SoundCloud
    var soundcloud_url = soundcloud_url_input.value;
    
    loadAndUpdate(soundcloud_url, true);
  }, false);




  // Load sound on page load
  if (soundcloud_url_input.value !== '') {
    loadAndUpdate(soundcloud_url_input.value, false);
  }

};