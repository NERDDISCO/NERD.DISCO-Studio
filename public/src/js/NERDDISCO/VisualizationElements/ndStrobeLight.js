class ndStrobeLight extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.color = args.color || 0;

    // This element will in color and not in black / white
    this.inColor = args.inColor === undefined ? true : args.inColor;

    // The color will be generated randomly
    this.isRandom = args.isRandom === undefined ? false : args.isRandom;

    // The note (code) of the MIDI input element
    this.midiInputCode = args.midiInputCode || null;

    // State: on (activated), off (deactivated)
    this.state = args.state || 'on';

    // Redraw instantly
    this.instantReset = args.instantReset === undefined ? true : args.instantReset;

    // Time (ms) to wait until the element will be redrawn
    this.delay = args.delay || 0;

    // Change the delay based on Audio / MIDI input
    this.dynamicDelay = args.dynamicDelay === undefined ? false : args.dynamicDelay;

    // The timestamp of the last draw 
    this.lastDraw = null;

    // The timestamp of the current attemp to draw
    this.currentDraw = null;

    // The width of the element
    this.width = args.width || -1;

    // The height of the element
    this.height = args.height || -1;
  }

  




  /**
   * Draw ndStrobeLight on canvas.
   * 
   */
  draw() {

    // Save the current timestamp
    this.currentDraw = Date.now();

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      this._delay = this.delay * (127 / this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {

        // The delay is over
        if (this.lastDraw + this._delay <= this.currentDraw) {

          // Save currentDraw time into lastDraw
          this.lastDraw = this.currentDraw;

          // Resize the element
          this.resize();

          this.ctx.save();
          
          this.ctx.globalCompositeOperation = this.globalCompositionOperation;

          // Create a color based on the velocity of the MIDI element
          if (this.inColor) {

            // Create a random color
            if (this.isRandom) {
              this._color = this.color + (360 / 127 * getRandomInt(0, 127));

            // Create a color based on the velocity
            } else {
              this._color = this.color + (360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);
            }
            
            this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";

          // XEON light :D BOOOM! (6200 Kelvin)
          } else {
            this.ctx.fillStyle = "rgba(255, 249, 242, .85)";
          }

          // Redraw instantly
          if (this.instantReset) {

            // State is on
            if (this.state === 'on') {
              // Set state to off
              this.state = 'off';

            // State is off
            } else {
              this.ctx.fillStyle = "#000";
              // Set state to on
              this.state = 'on';
            }

          // Don't redraw instantly
          } else {
            this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .85)";
          }

          // Draw a rectangle on the whole canvas
          this.ctx.rect(this.x, this.y, this._width, this._height);

          this.ctx.fill();
          this.ctx.restore();

        } // / delay is over

      // The element is not pressed
      } else {
        // Reset the lastDraw
        this.lastDraw = 0;

        // Reset state
        this.state = 'on';
      }

    // Could not find element with that note
    } else {
      // Debug is enabled
      if (this.debug) {
        console.info(this.midiInputCode, 'is not mapped. Please try again :D');
      }
      
    }

  } // / ndStrobeLight.draw





  /**
   * Resize the element.
   *
   * @see ndVisualization#resize()
   */
  resize() {

    // Set the width / height automatically if no width / height got provided
    if (this.width === -1 || this.height === -1) {
      // The element should be as big as the canvas
      this._width = this.ndVisualization.canvas_element.width;
      this._height = this.ndVisualization.canvas_element.height;

    // The user specified the width / height
    } else {
      this._width = this.width;
      this._height = this.height;

      this.x = this.ndVisualization.canvas_element.width / 2 - this._width / 2;
      this.y = this.ndVisualization.canvas_element.height / 2 - this._height / 2;
    }

  } // / ndStrobeLight.resize



} // / ndStrobeLight