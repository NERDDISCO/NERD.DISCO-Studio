class ndGiphyElementSwitcher extends ndVisualizationElement {
  
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

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn) {
        
        this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;

        var _nextId = window.ndHelper.random(0, this.ndGiphy.gifs.length - 1);

        while (_nextId === this.ndGiphy.currentId) {
          _nextId = window.ndHelper.random(0, this.ndGiphy.gifs.length - 1);
        }

        // Change the current giphy ID
        this.ndGiphy.setCurrentId(_nextId);

        // console.log(this.ndGiphy.gifs[_nextId].id);
      } // / element is pressed

    } // / input element exists

  } // / draw

} // / ndGiphyElement