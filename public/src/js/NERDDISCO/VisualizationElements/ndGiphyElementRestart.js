class ndGiphyElementRestart extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    // Reference to ndGiphy
    this.ndGiphy = args.ndGiphy || null;

    this.video = args.video || null;
  }


  draw() {

      // The element on the MIDI input exists
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

        // The element is pressed
        if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn) {

          this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;

          // Get current video
          this.video = this.ndGiphy.gifs[this.ndGiphy.currentId].video;

          // Restart the video
          this.video.currentTime = 0;

        } // / element is pressed

      } // / input element exists

  } // / draw

} // / ndGiphyElementRestart