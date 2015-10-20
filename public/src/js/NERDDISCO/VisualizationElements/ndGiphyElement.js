class ndGiphyElement extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    // Reference to ndGiphy
    this.ndGiphy = args.ndGiphy || null;

    // The ID of a specific Giphy
    this._id = args.id || null;

    // this.ndGiphy.currentId = this._id;

    this.loaded = false;

    this.video = null;

    this.isToggle = args.isToggle || false;

    this.toggle = args.toggle || false;
  }





  draw() {

    // if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      // Toggle button
      // if (this.isToggle) {
      //   // Toggle: On
      //   if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn && !this.toggle) {
      //     this.toggle = true;
      //     this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;
      //   }

      //   // Toggle: Off
      //   if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn && this.toggle) {
      //     this.toggle = false;
      //     this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;
      //   }
      // }


      // The id of current video was changed
      if (this._id !== this.ndGiphy.currentId && this.video !== null) {
        // Load the "new" video
        this.loaded = false;

        // Element with the given ID already exists in the DOM
        // if (document.getElementById(this.ndGiphy.gifs[this._id].id) !== undefined) {
        this.video.pause();
        this.video.currentTime = 0;
        // }

        this._id = this.ndGiphy.currentId;
      }

      // No response from giphy yet
      if (!this.loaded) {

        // The giphy with the specified id was loaded
        if (this.ndGiphy.gifs[this.ndGiphy.currentId] !== undefined) {

          // Giphy was loaded from the Giphy API
          this.loaded = true;

          // Update the active video element
          this.video = this.ndGiphy.gifs[this.ndGiphy.currentId].video;

          // Start the video playback
          this.video.play();
        }

      // Video is loaded
      } else {

          // if (this.isToggle) {

          //   if (this.toggle) {
          //     this.ctx.save();
          //     this.ctx.globalAlpha = this.ndGiphy.opacity;
          //     this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
          //     this.ctx.restore();
          //   }

          // } else {

            // The element is pressed
            // if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {
              this.ctx.save();
              this.ctx.globalAlpha = this.ndGiphy.opacity;
              this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
              this.ctx.restore();

            // } // / element is pressed

          // }

      } // / video is loaded

    // } // / MIDI input exists

  } // / draw

} // / ndGiphyElement