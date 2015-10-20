class ndGiphyElementKnob extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    // Reference to ndGiphy
    this.ndGiphy = args.ndGiphy || null;

    // The ID of a specific Giphy
    this._id = args.id || null;
  }





  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

        // 127 = max velocity
        this.ndGiphy.opacity = 100 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity / 100;
        
    } // / input element exists

  } // / draw

} // / ndGiphyElement