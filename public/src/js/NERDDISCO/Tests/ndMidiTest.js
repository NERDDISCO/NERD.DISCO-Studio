class ndMidiTest {
  
  constructor(args) {
    // Reference to ndMidi
    this.ndMidi = args.ndMidi || null;
  }


  createMessage() {

    var _event = new MIDIMessageEvent();

    console.log(_event);

    // Call the ndMidi.inputMessage and send a fake message
    this.ndMidi.inputMessage({ shit : 'fuck', data : [1, 2, 3] });
  }




} // / ndMidiTest