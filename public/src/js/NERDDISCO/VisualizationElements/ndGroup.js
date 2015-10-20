class ndGroup extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.isToggle = args.isToggle || false;
    this.toggle = args.toggle || false;

    this.childs = args.childs || [];


    this.velocity = 0;
  }

  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      // This is a toggle button
      if (this.isToggle) {
        // Toggle: On
        if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn && !this.toggle) {
          this.toggle = true;
          this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;

          // Get velocity value
          this.velocity = this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;

          // Iterate over all childs to update them
          for (var i = 0; i < this.childs.length; i++) {
            // Update velocity
            this.childs[i].velocity = this.velocity;
          }
        }

        // Toggle: Off
        if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn && this.toggle) {
          this.toggle = false;
          this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;
        }
      }


      

      // Toggle is actived
      if (this.toggle) {
        // Iterate over all elements in the queue
        for (var i = 0; i < this.childs.length; i++) {
          // Draw the specific element
          this.childs[i].draw();
        }
      }

    } // / The element on the MIDI input exists

  } // / draw



  // getVelocity() {
  //   return this.velocity;
  // }




  addChild(child) {

    // Reference to ndVisualization
    child.ndVisualization = this.ndVisualization;

    // Set the context
    child.context = this.ndVisualization.canvas_context;
    
    // Set the canvas
    child.canvas = this.ndVisualization.canvas_element;
    
    // Set audio
    child.ndAudio = this.ndVisualization.ndAudio;

    // Add child to list of childs
    this.childs.push(child);

  } // / addChild

} // / ndGroup