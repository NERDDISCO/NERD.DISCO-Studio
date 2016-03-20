class ndXYPad extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.tiltMapper = args.tiltMapper;
    this.panMapper = args.panMapper;

      // pan schwenken
      // tilt neigen
      /*
      pan: new HiResParam([1, 2], {min: -270, max: 270}),
      tilt: new HiResParam([3, 4], {min: -115, max: 90}),
       */ 
      
    this.tilt = 0;
    this.pan = 0;
  }





  draw() {

    var miniled = registry.select('#miniled');

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {
      miniled.tilt = this.tiltMapper(this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);
    } // / input element exists




    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[1337] !== undefined) {
      miniled.pan = this.panMapper(this.ndVisualization.ndMidi.inputElements[1337].velocity);
    }

  } // / draw

} // / ndGiphyElement