class ndXYPad extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.selector = args.selector || null;

    // this.tiltMapper = args.tiltMapper;
    // this.panMapper = args.panMapper;

      // pan schwenken
      // tilt neigen
      /*
      pan: new HiResParam([1, 2], {min: -270, max: 270}),
      tilt: new HiResParam([3, 4], {min: -115, max: 90}),
       */ 
      
    // this.tilt = 0;
    // this.pan = 0;
    // 
    this.x = 0;
    this.y = 0;
  }





  draw() {

    // var miniled = registry.select('#miniled');



    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined &&
        this.ndVisualization.ndMidi.inputElements[1337] !== undefined) {

      // Values changed
      if (this.x != this.ndVisualization.ndMidi.inputElements[1337].velocity ||
          this.y != this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity) {

        this.x = this.ndVisualization.ndMidi.inputElements[1337].velocity;
        this.y = this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;

        // Finger moved from the pad
        if ((this.x - 64) == 0 && this.y == 0) {
          this.x = 0;
          this.ndVisualization.ndMidi.inputElements[1337].velocity = 0;
        }

        this.selector.changePosition(
          this.x,
          this.y
        );

      } // / Values changed

      // miniled.tilt = this.tiltMapper(this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);
    } // / input element exists





    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[1337] !== undefined) {
      // miniled.pan = this.panMapper(this.ndVisualization.ndMidi.inputElements[1337].velocity);
    }

  } // / draw

} // / ndGiphyElement