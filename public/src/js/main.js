"use strict";


// window.onload = function() {



  /*
   * Container for the NERD DISCO, you might say it's a party.
   */
  var container = document.getElementById('nerddisco');

  /*
   * Selectors
   */
  var NERDDISCO_selector_front = new ndSelector({
    parent_element : container,
    selector_element_name : 'FRONT'
  });

  var NERDDISCO_selector_right = new ndSelector({
    parent_element : container,
    selector_element_name : 'RIGHT'
  });

  var NERDDISCO_selector_left = new ndSelector({
    parent_element : container,
    selector_element_name : 'LEFT'
  });

  var NERDDISCO_selector_top = new ndSelector({
    parent_element : container,
    selector_element_name : 'TOP'
  });

  var NERDDISCO_selector_back = new ndSelector({
    parent_element : container,
    selector_element_name : 'BACK'
  });





  /*
   * Audio
   */
  var NERDDISCO_audio = new ndAudio({
    mediaElement : document.getElementById('soundcloud__player'),
    fftSize : 512
  });



  /**
   * MIDI
   */
  var NERDDISCO_midi = new ndMidi({
    debug : false
  });

  // Connect to the Web MIDI API and the attached MIDI devices
  NERDDISCO_midi.connect();





  /*
   * Visualization
   */
  /*var NERDDISCO_visualization = new ndVisualization({
    ndAudio : NERDDISCO_audio,
    parent_element : container,
    drawing_activated : true,
    drawing_permanent : false,
    drawing_square_size : 200,
    selectors : [
      NERDDISCO_selector_front,
      NERDDISCO_selector_right,
      NERDDISCO_selector_left,
      NERDDISCO_selector_top,
      NERDDISCO_selector_back
    ]
  });
  */
 
  var NERDDISCO_visualization = new ndVisualization({
    ndAudio : NERDDISCO_audio,
    ndMidi : NERDDISCO_midi,
    parent_element : container,
    drawing_activated : false,
    drawing_permanent : false,
    drawing_square_size : 200,
    selectors : [
      NERDDISCO_selector_front,
      NERDDISCO_selector_right,
      NERDDISCO_selector_left,
      NERDDISCO_selector_top,
      NERDDISCO_selector_back
    ]
  });










  /*
   * Add elements to the visualization queue.
   */

  NERDDISCO_visualization.addElement(new ndUltraSquare({
    color: -40,
    x : 0,
    y : 0,
    width : 300,
    height : 300,
    midiInputCode : 49,
    range : 'high',
    trigger: 180
  }));

  NERDDISCO_visualization.addElement(new ndUltraSquare({
    color: -40,
    x : 0,
    y : 0,
    angle : 22.5,
    width : 300,
    height : 300,
    midiInputCode : 49,
    range : 'high',
    trigger: 180
  }));

  NERDDISCO_visualization.addElement(new ndUltraSquare({
    color: -40,
    x : 0,
    y : 0,
    angle : 45,
    width : 300,
    height : 300,
    midiInputCode : 49,
    range : 'high',
    trigger: 180
  }));

  NERDDISCO_visualization.addElement(new ndUltraSquare({
    color: -40,
    x : 0,
    y : 0,
    angle : 67.5,
    width : 300,
    height : 300,
    midiInputCode : 49,
    range : 'high',
    trigger: 180
  }));









  NERDDISCO_visualization.addElement(new ndStrokeCircle({
    color: -120,
    x : -80 - (80 / 2),
    y : 0,
    r : 80,
    range : 'low',
    trigger: 254
  }));

  NERDDISCO_visualization.addElement(new ndStrokeCircle({
    color: -240,
    x : 80 + (120 / 2),
    y : 0,
    r : 120,
    range : 'lowmid',
    trigger: 235
  }));

  NERDDISCO_visualization.addElement(new ndStrokeCircle({
    color: -300,
    x : 0,
    y : -80 - (160 / 2),
    r : 160,
    range : 'mid',
    trigger: 200
  }));









  NERDDISCO_visualization.addElement(new ndStrokeCircle({
    color: -120,
    x : 0,
    y : 80 + (150 / 2),
    r : 150,
    range : 'highmid',
    trigger: 190
  }));

  NERDDISCO_visualization.addElement(new ndStrokeCircle({
    color: -240,
    x : 0,
    y : 80 + (150 / 2),
    r : 100,
    range : 'highmid',
    trigger: 200
  }));

  NERDDISCO_visualization.addElement(new ndStrokeCircle({
    color: -360,
    x : 0,
    y : 80 + (150 / 2),
    r : 50,
    range : 'highmid',
    trigger: 210
  }));






  /**
   * ndBar
   * 
   */
  NERDDISCO_visualization.addElement(new ndBar({
    color: 50,
    x : NERDDISCO_visualization.canvas_element.width / 2,
    y : NERDDISCO_visualization.canvas_element.height / 2,
    midiInputCode : 57,
    range : 'high',
    trigger: 200,
    factor : 1.25
  }));






  /**
   * ndCircle
   * 
   */
  
  // Middle of the canvas
  NERDDISCO_visualization.addElement(new ndCircle({
    color: -40,
    x : 0,
    y : 0,
    r : 120,
    range : 'lowmid',
    trigger: 254
  }));

  // Middle of the canvas
  NERDDISCO_visualization.addElement(new ndCircle({
    color: -40,
    x : 0,
    y : 0,
    r : 100,
    range : 'low',
    trigger: 254
  }));

  // Middle of the canvas
  NERDDISCO_visualization.addElement(new ndCircle({
    color: -40,
    x : 0,
    y : 0,
    r : 80,
    range : 'sublow',
    trigger: 254
  }));






  /**
   * 4 different ndStrobeLights, each one mapped to a different MIDI button. 
   *
   */
  
  // Multiply filter
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 0,
    x : 0,
    y : 0,
    midiInputCode : 61,
    delay : 25,
    inColor : false,
    globalCompositionOperation : 'multiply'
  }));

  // Fast, black / white, instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 0,
    x : 0,
    y : 0,
    midiInputCode : 69,
    delay : 10,
    inColor : false
  }));

  // Middle-fast, in color, not instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 160,
    x : 0,
    y : 0,
    midiInputCode : 65,
    instantReset : false,
    delay : 10
  }));

  // Middle-fast, in color, not instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 240,
    x : 0,
    y : 0,
    midiInputCode : 63,
    instantReset : false,
    inColor : true,
    isRandom : true,
    dynamicDelay : true,
    delay : 50
  }));





  /**
   * 3 strobeLight with a defined size on top of each other in the middle.
   * 
   */
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -100,
    x : NERDDISCO_visualization.canvas_element.width / 2 - 300,
    y : NERDDISCO_visualization.canvas_element.height / 2 - 300,
    width : 600,
    height : 600,
    midiInputCode : 60,
    instantReset : false,
    delay : 25,
    isRandom : false
  }));

  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -200,
    x : NERDDISCO_visualization.canvas_element.width / 2 - 200,
    y : NERDDISCO_visualization.canvas_element.height / 2 - 200,
    width : 400,
    height : 400,
    midiInputCode : 60,
    instantReset : false,
    delay : 50,
    isRandom : false
  }));

  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -300,
    x : NERDDISCO_visualization.canvas_element.width / 2 - 100,
    y : NERDDISCO_visualization.canvas_element.height / 2 - 100,
    width : 200,
    height : 200,
    midiInputCode : 60,
    instantReset : false,
    delay : 75,
    isRandom : false
  }));









  NERDDISCO_visualization.addElement(new ndStar({
    color: -180,
    x : NERDDISCO_visualization.canvas_element.width / 2,
    y : NERDDISCO_visualization.canvas_element.height / 2,
    midiInputCode : 59,
    range : 'low',
    trigger: 200,
    spikes : 25,
    outerRadius : 60,
    innerRadius : 15
  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -220,
    x : NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y : NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode : 59,
    range : 'sublow',
    trigger: 200,
    spikes : 5,
    outerRadius : 65,
    innerRadius : 15,
    factor : 1.5

  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -260,
    x : NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y : NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode : 59,
    range : 'mid',
    trigger: 200,
    spikes : 5,
    outerRadius : 125,
    innerRadius : 15,
    factor : 2.5

  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -300,
    x : NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y : NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode : 59,
    range : 'highmid',
    trigger: 200,
    spikes : 5,
    outerRadius : 65,
    innerRadius : 15,
    factor : 3.5

  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -340,
    x : NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y : NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode : 59,
    range : 'mid',
    trigger: 200,
    spikes : 50,
    outerRadius : 250,
    innerRadius : 100,
    factor : 1.25
  }));





















  /*
   * SoundCloud
   */
  var NERDDISCO_soundcloud = new ndSoundcloud({
    ndAudio : NERDDISCO_audio,
    clientID : 'dce5652caa1b66331903493735ddd64d',
    // trackURL : 'https://soundcloud.com/blaize323/spongebob-bounce-pants-blaize-remix-edit'
    // trackURL : 'https://soundcloud.com/dimitrivegasandlikemike/dimitri-vegas-like-mike-vs-ummet-ozcan-the-hum-out-2004-on-beatport'
    // trackURL : 'https://soundcloud.com/bassnectar/08-noise-ft-donnis'
    // trackURL : 'https://soundcloud.com/steveaoki/steve-aoki-born-to-get-wild-feat-will-i-am-club-edition'
    // trackURL : 'https://soundcloud.com/die-antwoord-official/dis-is-y'
    // trackURL : 'https://soundcloud.com/damienromei/miss-morgan',
    // trackURL : 'https://soundcloud.com/foxsky/foxsky-rattlesnake-original-mix-out-now'
    trackURL : 'https://soundcloud.com/majorlazer/blaze-up-the-fire-feat'
    // trackURL : 'https://soundcloud.com/itsbeargrillz/2-get-down'
    // trackURL : 'https://soundcloud.com/trapsounds/sirenz-night-ryda-down-like-that-trap-sounds-premiere'
    // trackURL : 'https://soundcloud.com/mind-vortex/friction-guest-mix'
    // trackURL : 'https://soundcloud.com/tungevaag/samsara-radio-edit'
    // trackURL : 'https://soundcloud.com/dubstep/skism-x-habstrakt-x-megalodon'
    // trackURL : 'https://soundcloud.com/otto-von-schirach/pepe-y-otto-cadillac-culo'
  });

  NERDDISCO_soundcloud.loadTrack();
  // 
  // 
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/6495972_The_Hum_Original_Mix.mp3');





  /*
   * Connector
   */
  var NERDDISCO_connector = new ndConnector({});










  /**
   * Update everything:
   * - canvas
   * - LED
   * - audio data
   */
  var fps = 60;
  var audioData;

  function update() {
    // Update the audio data
    NERDDISCO_audio.updateData();

    // Draw on canvas
    NERDDISCO_visualization.draw();

    // Get the RGB values for the specified selector areas and send them via WebSocket to the Node.js-Server
    NERDDISCO_connector.sendLEDs(NERDDISCO_visualization.getLEDs());

    setTimeout(function() {
      window.requestAnimationFrame(update);
    }, 1000 / fps);
    
  }

  update();



  // var NERDDISCO_midiTest = new ndMidiTest({
  //   ndMidi : NERDDISCO_midi
  // });

  // setTimeout(function() {
  //   onMIDIMessage({ data : [0, 0, 0] });
  // }.bind(this), 5000);


// }.bind(this);