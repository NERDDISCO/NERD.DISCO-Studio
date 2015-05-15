function ndVisualization(args) {
  
  // The canvas element
  this.canvas_element = args.canvas_element || null;
  
  // Is the mouse down on the canvas_element
  this.canvas_element_is_mouse_down = false;
  
  // The event that is fired when the mouse is down
  this.canvas_element_mouse_down_event = null;
  
  // The rendering context of the canvas_element
  this.canvas_context = null;
  
  // The background color for the canvas_context
  this.canvas_context_background_color = args.canvas_context_background_color || 'rgb(0, 0, 0)';
  
  // The parent element for the canvas_element
  this.parent_element = args.parent_element || document.body;



  /*
   * Elements 
   */
  // A queue of elements which can be rendered to the canvas
  this.element_queue = [];




  /*
   * ndAudio
   */
  this.ndAudio = args.ndAudio || null;



  /*
   * ndSelector
   */
  // Group of ndSelector
  this.selectors = args.selectors || null;
  
  

  /*
   * Drawing mode
   */
  // Is drawing activated?
  this.drawing_activated = args.drawing_activated || false;
  
  // The drawing should not be removed
  this.drawing_permanent = args.drawing_permanent || false;
  
  // Size of one square
  this.drawing_square_size = args.drawing_square_size || 60;

  

  /*
   * LED
   */
  // Amount of pixel that are used per LED (pixel_per_led * pixel_per_led)
  this.pixel_per_led = 10;

  // Amount of LED in every row
  this.led_row_amount = 8;

  // Amount of LED in every column
  this.led_column_amount = 8;


  // Initialize this instance of ndVisualization
  this.init();
  
} // / ndVisualization





/*
 * Functions for ndVisualization
 */
ndVisualization.prototype = {
  
  init : function() {
    
    // The canvas_element is not defined
    if (this.canvas_element === null) {
      // Create the canvas_element
      this.canvas_element = document.createElement('canvas');

      // Add the canvas_element to the parent_element
      this.parent_element.appendChild(this.canvas_element);
    }



    // Listen to "resize" events
    window.addEventListener('resize', function(event) {
      
      // Resize the canvas_element
      this.resize();
      
    }.bind(this), false); // / window.addEventListener('resize')
    
    

    // Listen to the mousedown event on the canvas_element
    this.parent_element.addEventListener('mousedown', function(event) {
      event.preventDefault();

      // Drawing is activated
      if (this.drawing_activated) {
        // Mouse is down
        this.canvas_element_is_mouse_down = true;

        // Reference to the event
        this.canvas_element_mouse_down_event = event;
      }

    }.bind(this), true); // / this.canvas_element.addEventListener('mousedown')
      


    // Listen to the mouseup event on the canvas_element
    this.parent_element.addEventListener('mouseup', function(event) {
      event.preventDefault();

      this.canvas_element_is_mouse_down = false;
      this.canvas_element_mouse_down_event = null;

    }.bind(this), true); // / this.canvas_element.addEventListener('mouseup')
    


    // Listen to the mousemove event on the canvas_element
    this.parent_element.addEventListener('mousemove', function(event) {
      // Drawing is activated
      if (this.drawing_activated && this.canvas_element_is_mouse_down) {
        event.preventDefault();
        
        // Update the mouse_down_event
        this.canvas_element_mouse_down_event = event;
      }
    }.bind(this), true); // / this.canvas_element.addEventListener('mousemove')
    
    
    
    // Set the canvas_context
    this.canvas_context = this.canvas_element.getContext('2d');
    
    // Resize the canvas_element
    this.resize();

    
    this.element_queue.push(
      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 4,
        y : this.canvas_element.height / 4,
        die_sooner : 0,
        frequency_range : 'sublow',
        min_frequency : 175
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.2,
        y : this.canvas_element.height / 2 * 1.2,
        die_sooner : 0,
        frequency_range : 'low',
        min_frequency : 175
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.2,
        y : this.canvas_element.height / 2 * 1.2,
        die_sooner : 10,
        frequency_range : 'low',
        min_frequency : 185
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'lowmid'
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'mid'
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'highmid',
        min_frequency : 175,
        size_multiplicator : 1.3
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'highmid',
        min_frequency : 180,
        size_multiplicator : 1.3
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 10,
        frequency_range : 'highmid',
        min_frequency : 180,
        size_multiplicator : 1.3
      }),


      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'high',
        min_frequency : 175,
        size_multiplicator : 1.5
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'high',
        min_frequency : 180,
        size_multiplicator : 1.5
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 10,
        frequency_range : 'high',
        min_frequency : 180,
        size_multiplicator : 1.5
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'superhigh',
        min_frequency : 165,
        size_multiplicator : 1.7
      }),

      new ndSquare({
        ndVisualization: this,
        ndAudio : this.ndAudio,
        x : this.canvas_element.width / 2 * 1.15,
        y : this.canvas_element.height / 2 * 1.15,
        die_sooner : 0,
        frequency_range : 'superhigh',
        min_frequency : 175,
        size_multiplicator : 1.7
      })
    );

    
  }, // / ndVisualization.prototype.init
  

  
  
  
  resize : function() {
    
    // Set the width of the canvas_element using the width of the parent_element
    this.canvas_element.width = this.parent_element.clientWidth;
    
    // Set the height of the canvas_element using the height of the parent_element
    this.canvas_element.height = this.parent_element.clientHeight;
    
    // Redraw the default canvas_context
    this.drawDefaultCanvasContext();
    
  }, // / ndVisualization.prototype.resize
  
  
  
  
  
  /**
   * Draw the default canvas_context:
   * - background color
   */
  drawDefaultCanvasContext : function() {

    // Clear the canvas_context
    this.canvas_context.clearRect(0, 0, this.canvas_element.width, this.canvas_element.height);
    
    // Set the background color of the canvas_context
    this.canvas_context.fillStyle = this.canvas_context_background_color;
    this.canvas_context.fillRect(0, 0, this.canvas_element.width, this.canvas_element.height);
    
  }, // / ndVisualization.prototype.drawDefaultCanvasContext
  
  
  
  
  
  draw : function() {
    // this.canvas_context.globalCompositeOperation = 'source-over';

    // Drawing is not permanent
    if (!this.drawing_permanent) {
      // Redraw the background
      this.canvas_context.fillStyle = "rgba(0, 0, 0, .35)";
      this.canvas_context.fillRect(0, 0, this.canvas_element.width, this.canvas_element.height);
    }
    
    if (this.drawing_activated && this.canvas_element_is_mouse_down) {
      // Draw a square at the (x, y) position of the event
      this.drawSquare(this.canvas_element_mouse_down_event);
    }


    // Iterate over all elements in the queue
    for (var i = 0; i < this.element_queue.length; i++) {
      this.element_queue[i].draw();
    }
    
  },
  
  
  /**
   * Draw a square onto the canvas_context test test
   */
  drawSquare : function(event) {
    this.canvas_context.fillStyle = "hsla(" + (360 / 255 * getRandomInt(0, 255)) + ", 100%, 60%,  .5)";
    this.canvas_context.fillRect(
      event.x - this.drawing_square_size / 2 + (10 * Math.random() / 2),
      event.y - this.drawing_square_size / 2 + (10 * Math.random() / 2),
      this.drawing_square_size,
      this.drawing_square_size
    );
  }, // / ndVisualization.prototype.drawSquare





  getLEDs : function() {
    var openPixelControl = [];

    // selectors is defined
    if (this.selectors !== null) {

      // The (x, y) position of the selector
      var selector_position;

      // The image_data represented by the position / size of the selector
      var image_data;

      // The list of RGB values
      var rgb_list;

      // The position of the current pixel
      var position;

      // The current led in the specific row
      var led_row;

      // The current led in the specific column
      var led_column;

      // The RGB values for every LED
      var leds;

      // The index of the current LED
      var current_led;



      // Iterate over all selectors
      this.selectors.forEach(function(selector) {

        // Reset
        position = 0;
        current_led = 0;
        led_row = 0;
        led_column = 0;
        leds = [];

        // Get current (x, y) position from the selector
        selector_position = selector.getPosition();

        // Get the image data from the canvas using the selector_position
        image_data = this.canvas_context.getImageData(
          selector_position.x,
          selector_position.y,
          this.pixel_per_led * this.led_row_amount,
          this.pixel_per_led * this.led_column_amount
        );

        // Get the data
        rgb_list = image_data.data;


        // For every row of pixels
        for (var row = 0; row < this.led_row_amount * this.pixel_per_led; row++) {

          // For every column pixels
          for (var column = 0; column < this.led_column_amount * this.pixel_per_led; column++) {

            // Set the LED for the current pixel
            current_led = led_row * this.led_row_amount + led_column;

            // Set the position of the current pixel
            // - current row: (row * (this.pixel_per_led * this.led_column_amount * 4)) 
            // - current column: (column * 4)
            position = (row * (this.pixel_per_led * this.led_column_amount * 4)) + (column * 4);

            // console.log(led_row, led_column, current_led, position);

            // The current_led is not defined inside leds
            if (typeof leds[current_led] === 'undefined') {
              // @TODO [TimPietrusky] jsperf about "insert array2 into array1 at position x"
              leds.splice(current_led, 0, []);

              // Initialize the 3 value array [red, green, blue] for the current_led
              leds[current_led][0] = 0;
              leds[current_led][1] = 0;
              leds[current_led][2] = 0;
            }

            // Sum up all red values
            leds[current_led][0] += rgb_list[position];

            // Sum up all green values
            leds[current_led][1] += rgb_list[position + 1];

            // Sum up all blue values
            leds[current_led][2] += rgb_list[position + 2];

            // Increase current led per column
            if ((column + 1) % this.pixel_per_led === 0) {
              ++led_column;
            }

          } // / for every column of LEDs

          // Reset led_column
          led_column = 0;

          // Increase current led per row
          if ((row + 1) % this.pixel_per_led === 0) {
            ++led_row;
          }

        } // / for every row of LEDs

        
        // Iterate over all leds
        for (var i = 0; i < leds.length; i++) {
          // Create a normalized value for red
          openPixelControl.push(Math.floor(leds[i][0] / (this.pixel_per_led * this.pixel_per_led)));
          // Create a normalized value for green
          openPixelControl.push(Math.floor(leds[i][1] / (this.pixel_per_led * this.pixel_per_led)));
          // Create a normalized value for blue
          openPixelControl.push(Math.floor(leds[i][2] / (this.pixel_per_led * this.pixel_per_led)));
        }

      }, this); // / this.selectors.forEach

    } // / selectors is defined


    return openPixelControl;
  }
  
}; // / ndVisualization.prototype


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}