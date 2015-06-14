'use strict';

class ndMidi {
  
  constructor(args) {

    // @see MIDIAccess
    this.access = args.access || null;

    // @see MIDIInputMap
    this.inputMap = args.inputMap || null;

    // @see MIDIOutputMap
    this.outputMap = args.outputMap || null;

    // Show debugging logs?
    this.debug = args.debug || false;

    // The active input elements
    this.inputElements = args.inputElements || [];

  } // / constructor





  /**
   * Connect to the MIDI devices. 
   * 
   */
  connect() {

    // Get permission to use connected MIDI devices
    navigator.permissions.query({ name: 'midi', sysex: true }).then(

      // Success
      function(permission) {

        if (this.debug) {
          console.log('"midi" permission:', permission.status);
        }

        // Permission is granted
        if (permission.status === 'granted') {
          // Request access to the MIDI devices
          navigator.requestMIDIAccess({ sysex: true }).then(function(access) {

            // Save a reference to MIDIAccess
            this.access = access;

            // Get the inputs for connected MIDI devices
            this.inputMap = this.access.inputs;

            if (this.debug) {
              console.log('MIDI input ports:', this.inputMap.size);
            }

            // Get the outputs for connected MIDI devices
            this.outputMap = this.access.outputs;


            if (this.debug) {
              console.log('MIDI output ports:', this.outputMap.size);
            }

            // Iterate over all input ports
            for (let input of this.inputMap.values()) {
              // Listen to MIDIMessageEvent for this input port
              input.onmidimessage = this.inputMessage.bind(this);
            }

            // TODO: Handle output messages

            // A new MIDI device was added or an existing MIDI device changes state
            this.access.onstatechange = function(MIDIConnectionEvent) {
              console.log('MIDIAccess state change:', MIDIConnectionEvent);
            }; // / this.access.onstatechange

         }.bind(this));

        // No permission
        } else {
          console.error('permission was not granted!');
        }

      }.bind(this), // / Success

      // Failure
      function(err) {
        console.error(err);
      } // / Failure

    ); // / navigator.permissions.query

  } // / ndMidi.connect





  /**
   * Handle MIDIMessageEvent's that are send from the MIDI device to the PC.
   * 
   * @param  {MIDIMessageEvent} message
   */
  inputMessage(message) {

    // Input
    var data = message.data;

    // The current MIDI command
    var midi_command = data[0].toString(16);

    // Note
    var note = data[1];

    // Velocity
    var velocity = data[2];

    // Channel
    // var channel = data[0] & 0xf;
    var channel = midi_command.charAt(1);

    // Command
    var channel_command = midi_command.charAt(0);

    // Type
    var type = data[0];



    // Do stuff based on the message type
    switch (channel_command) {

      // Note Off
      case '8':
        this.noteOff({ note : note, velocity : velocity, channel : channel });
        break;

      // Note On
      case '9':
        this.noteOn({ note : note, velocity : velocity, channel : channel });
        break;

      // Aftertouch
      case 'a':
        this.aftertouch({ note : note, velocity : velocity, channel : channel });
        break;

      // Continuous controller
      case 'b':
        this.continuousController({ note : note, velocity : velocity, channel : channel });
        break;

      // Patch change
      case 'c':
        this.patchChange({ note : note, velocity : velocity, channel : channel });
        break;

      // Channel Pressure
      case 'd':
        this.channelPressure({ note : note, velocity : velocity, channel : channel });
        break;

      // Pitch bend
      case 'e':
        this.pitchBend({ note : note, velocity : velocity, channel : channel });
        break;

      // (non-musical commands)
      case 'f':
        this.nonMusicalCommand({ note : note, velocity : velocity });
        break;

      default:
        console.log('UNKOWN VALUE', 'channel_command', channel_command, 'channel', channel, 'type', type, 'note', note, 'velocitiy', velocity, 'message', message);

    } // / switch(type)



    if (this.debug) {
      console.log(message.target.name, '|', 'channel_command', channel_command, 'channel', channel, 'type', type, 'note', note, 'velocitiy', velocity);
    }
    
  } // / ndMidi.inputMessage






  /**
   * Note (for example a button on a drumpad) on MIDI device was activated (for example pressed).
   * 
   */
  noteOn(args) {
    if (this.debug) {
      console.log('note on', args);
    }

    if (this.inputElements[args.note] === undefined) {
      this.inputElements[args.note] = {};
      this.inputElements[args.note].pressed = false;
    }

    this.inputElements[args.note] = args;
    this.inputElements[args.note].pressed = true;
  }




  /**
   * Note (for example a button on a drumpad) on MIDI device was activated (for example pressed).
   * 
   */
  noteOff(args) {
    if (this.debug) {
      console.log('note off', args);
    }

    this.inputElements[args.note] = args;
    this.inputElements[args.note].pressed = false;
  }




  pitchBend(args) {
    if (this.debug) {
      console.log('pitch bend', args);
    }
  }




  continuousController(args) {
    if (this.debug) {
      console.log('continuous controller', args);
    }
  }




  patchChange(args) {
    if (this.debug) {
      console.log('patch Change', args);
    }
  } // / ndMidi.patchChange





  aftertouch(args) {
    if (this.debug) {
      console.log('aftertouch', args);
    }
  } // / ndMidi.aftertouch





  channelPressure(args) {
    if (this.debug) {
      console.log('channel pressure', args);
    }
  } // / ndMidi.channelPressure





  nonMusicalCommand(args) {
    if (this.debug) {
      console.log('(non-musical commands)', args);
    }
  } // / ndMidi.nonMusicalCommands





} // / ndMidi