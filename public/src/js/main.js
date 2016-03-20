"use strict";


window.onload = function() {



  /*
   * Container for the NERD DISCO, you might say it's a party.
   */
  var container = document.getElementById('nerddisco');


// Create a new global helper
var NERDDISCO_helper = new ndHelper({});



var button_korg_nanoPAD2 = {
  // First block
  a : 37,
  b : 39,
  c : 41,
  d : 43,
  e : 36,
  f : 38,
  g : 40,
  h : 42,

  // Second block
  i : 45,
  j : 47,
  k : 49,
  l : 51,
  m : 44,
  n : 46,
  o : 48,
  p : 50
};

var button_korg_padKONTROL = {
  a : 61,
  b : 69,
  c : 65,
  d : 63,

  e : 60,
  f : 59,
  g : 57,
  h : 55,

  i : 49,
  j : 51,
  k : 68,
  l : 56,

  m : 48,
  n : 52,
  o : 54,
  p : 58,

  knob_a : 20,
  knob_b : 21,

  pad_y : 1
};


var button = button_korg_padKONTROL;




  var pixel_per_led = 20;


 
  /*
   * Selectors
   */
  var NERDDISCO_selector_front = new ndSelector({
    parent_element : container,
    selector_element_name : ' ',
    selector_element_x : 500,
    selector_element_width : pixel_per_led * 8 + 'px',
    selector_element_height : pixel_per_led * 8 + 'px'
  });

  // var NERDDISCO_selector_right = new ndSelector({
  //   parent_element : container,
  //   selector_element_name : 'RIGHT',
  //   selector_element_x : 500
  // });

  // var NERDDISCO_selector_left = new ndSelector({
  //   parent_element : container,
  //   selector_element_name : 'LEFT',
  //   selector_element_x : 500
  // });

  // var NERDDISCO_selector_top = new ndSelector({
  //   parent_element : container,
  //   selector_element_name : 'TOP',
  //   selector_element_x : 500
  // });

  // var NERDDISCO_selector_back = new ndSelector({
  //   parent_element : container,
  //   selector_element_name : 'BACK',
  //   selector_element_x : 500
  // });





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
    debug : true,
    mappingMode : false,
    inputMapping : button
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
    pixel_per_led : pixel_per_led,
    selectors : [
      NERDDISCO_selector_front,
      // NERDDISCO_selector_right,
      // NERDDISCO_selector_left,
      // NERDDISCO_selector_top,
      // NERDDISCO_selector_back
    ]
  });







/*
 * Giphy
 */
NERDDISCO_giphy = new ndGiphy({
  apiKey : 'dc6zaTOxFJmzC',
  apiURL : 'http://api.giphy.com/v1/gifs',
  playlist : [
    'LcGFscTzOn9xm',
    'NwcjVktO9w3CM',
    '13THeOXYzh24o0',
    'VeevaQ0W85jzy',
    '11OKI6CBKaEBr2',
    '3o85xHnzGXZIL0VKH6',
    '4Npgg5KTV0zAc',
    'lNXfBBMCvXRug',
    '9DfUujoR6pFok',
    'x0zayPYjR2lq0',
    '11Ou8NkBsR3aAE',
    '1NiRukZ0JAW8U',
    'PfqP2XHkF2YfK',
    'PrMDV9aUpsZTa',
    'kVo3H6tgrupYk',
    'gT8rZKoR5bzpe',
    '3zYt8xNZa5QU8',
    'cSRVRajOQynF6',
    '1JTjMMviVJ7pK',
    '11lvZGTAZIhAhW',
    's06V9SxnAcVR6',
    '10fmV6zxKSKq2I',
    'aPjiWa9dUtBC',
    'vozrWmW8jnKCs',
    'GdXxnTNXpxfAA',
    'M4zazQOlyv4c0',
    '4MIiLGFlKXm8g',
    '14bPSP6sM7Ynte',
    '8Jj9OcQjKJQFG',
    /*'EUINY8p7L6NO0',
    'rlZQe2eKN4gW4',
    'bSnLUTin6l7NK',
    'AaDszWb0lRbe8',
    'UqFOw7u9s60Du',
    'tmT9bLTQilMt2',
    'KDEsAVPoMHnIk',
    'EoX5mXCHBOsWA',
    '12HC1DnuanxgQ0',
    'H5ZOUo1GSJS4U',
    'vDUewEokED8Wc',
    'yLI0z7rq5MSdO',
    'g7lBcY908vcBi',
    'TlK63EqqwnZb0INdT20',
    'z9i3q1VE7zFdu',
    '12HHPMiNTyUSGY',
    'KbPwdPVRQ8lHy',
    'JuCwWpKObqq4',
    'JqWl3BasEi6yY',
    'eKegVxI6b4mXe',
    '3uvpnlKAXtvKo',
    'KA62FCJsdUBeU',
    'wPdMQTRipoGRO',
    'JCneX3KTKcdxK',
    'EZNGfYUIO5CVy',
    'LCVuISsGX54I0',
    'd45tGxkmDkViM',
    'TrBoMrr8M3JxC',
    'j1RmTlM16zkJy',
    'jgOjM1cNZZ0ju',
    'vyKWyMxjYWunC',
    '7H3WY55yh5IRi',
    'TShGnCEYfbt1S',
    '8NWqbYfNjyQH6'*/
  ]
});


NERDDISCO_giphy.request();






/*
 * GiphyElement
 */
  // The video itself loaded from Giphy
  NERDDISCO_visualization.addElement(new ndGiphyElement({
    id : 1,
    ndGiphy : NERDDISCO_giphy
  }));

  // Change the giphy
  NERDDISCO_visualization.addElement(new ndGiphyElementSwitcher({
    ndGiphy : NERDDISCO_giphy,
    midiInputCode : button.i
  }));

  // Restart the current giphy
  NERDDISCO_visualization.addElement(new ndGiphyElementRestart({
    ndGiphy : NERDDISCO_giphy,
    midiInputCode : button.j
  }));

  // Change the opacity of the current giphy
  NERDDISCO_visualization.addElement(new ndGiphyElementKnob({
    ndGiphy : NERDDISCO_giphy,
    midiInputCode : button.knob_a
  }));





  /*
   * Add elements to the visualization queue.
   */


  /*
   * Some squares on top of each other looking like a "blackhole star" and spinning around
   */
  
  // Group of circles
  var group_blackholeStar = new ndGroup({
    midiInputCode : button.a,
    isToggle : true
  });
  // Add group to element queue
  NERDDISCO_visualization.addElement(group_blackholeStar);

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -40,
    x : 0,
    y : 0,
    width : 300,
    height : 300,
    range : 'superhigh',
    trigger: 180
  }));

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -80,
    x : 0,
    y : 0,
    angle : 22.5,
    width : 300,
    height : 300,
    range : 'superhigh',
    trigger: 180
  }));

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -120,
    x : 0,
    y : 0,
    angle : 45,
    width : 300,
    height : 300,
    range : 'superhigh',
    trigger: 180
  }));

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -160,
    x : 0,
    y : 0,
    angle : 67.5,
    width : 300,
    height : 300,
    range : 'superhigh',
    trigger: 180
  }));







  /**
   * ndBar
   * 
   */
  var group_frequencyBar = new ndGroup({
    midiInputCode : button.b,
    isToggle : true
  });
  // Add group to element queue
  NERDDISCO_visualization.addElement(group_frequencyBar);

  group_frequencyBar.addChild(new ndBar({
    color: 50,
    x : NERDDISCO_visualization.canvas_element.width / 2,
    y : NERDDISCO_visualization.canvas_element.height / 2,
    range : 'mid',
    trigger: 200,
    factor : 1.25
  }));






  /**
   * ndCircle
   *
   * In the middle of the canvas
   * 
   */
  // Group of circles
  var group_circles = new ndGroup({
    midiInputCode : button.d,
    isToggle : true
  });
  // Add group to element queue
  NERDDISCO_visualization.addElement(group_circles);

  // Add childs to the group
  group_circles.addChild(new ndStrokeCircle({
    color: -120,
    x : -80 - (80 / 2),
    y : 0,
    r : 80,
    range : 'low',
    trigger: 254
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -240,
    x : 80 + (120 / 2),
    y : 0,
    r : 120,
    range : 'lowmid',
    trigger: 235
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -300,
    x : 0,
    y : -80 - (160 / 2),
    r : 160,
    range : 'mid',
    trigger: 200
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -120,
    x : 0,
    y : 80 + (150 / 2),
    r : 150,
    range : 'highmid',
    trigger: 190
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -240,
    x : 0,
    y : 80 + (150 / 2),
    r : 100,
    range : 'highmid',
    trigger: 200
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -360,
    x : 0,
    y : 80 + (150 / 2),
    r : 50,
    range : 'highmid',
    trigger: 210
  }));


  group_circles.addChild(new ndCircle({
    color: -40,
    x : 0,
    y : 0,
    r : 120,
    range : 'lowmid',
    trigger: 254
  }));

  group_circles.addChild(new ndCircle({
    color: -40,
    x : 0,
    y : 0,
    r : 100,
    range : 'low',
    trigger: 254
  }));

  group_circles.addChild(new ndCircle({
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
    midiInputCode : button.h,
    delay : 25,
    inColor : false,
    globalCompositionOperation : 'multiply'
  }));

  // Fast, black / white, instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 0,
    x : 0,
    y : 0,
    midiInputCode : button.e,
    delay : 10,
    inColor : false
  }));

  // Middle-fast, in color, instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 160,
    x : 0,
    y : 0,
    midiInputCode : button.f,
    instantReset : false,
    delay : 25
  }));

  // Middle-fast, in color, not instantly redrawn, dynamic delay
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 240,
    x : 0,
    y : 0,
    midiInputCode : button.g,
    instantReset : false,
    inColor : true,
    isRandom : true,
    dynamicDelay : true,
    delay : 50
  }));





  /**
   * 3 strobeLight squares with a defined size on top of each other in the middle.
   */
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -100,
    x : NERDDISCO_visualization.canvas_element.width / 2 - 300,
    y : NERDDISCO_visualization.canvas_element.height / 2 - 300,
    width : 200,
    height : 200,
    midiInputCode : button.m,
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
    midiInputCode : button.m,
    instantReset : false,
    delay : 50,
    isRandom : false
  }));

  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -300,
    x : NERDDISCO_visualization.canvas_element.width / 2 - 100,
    y : NERDDISCO_visualization.canvas_element.height / 2 - 100,
    width : 600,
    height : 600,
    midiInputCode : button.m,
    instantReset : false,
    delay : 75,
    isRandom : false
  }));









  /**
   * 5 different stars
   */
  NERDDISCO_visualization.addElement(new ndStar({
    color: -180,
    x : NERDDISCO_visualization.canvas_element.width / 2,
    y : NERDDISCO_visualization.canvas_element.height / 2,
    midiInputCode : button.c,
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
    midiInputCode : button.c,
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
    midiInputCode : button.c,
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
    midiInputCode : button.c,
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
    midiInputCode : button.c,
    range : 'mid',
    trigger: 200,
    spikes : 50,
    outerRadius : 250,
    innerRadius : 100,
    factor : 1.25
  }));






  NERDDISCO_visualization.addElement(new ndGlobalAlpha({
    midiInputCode : button.knob_b
  }));



if (window.rangeMapper != undefined) {
  var tiltMapper = rangeMapper(0, 127, -115, 90);
  var panMapper = rangeMapper(0, 127, -270, 270);

  NERDDISCO_visualization.addElement(new ndXYPad({
    midiInputCode : button.pad_y,
    tiltMapper : tiltMapper,
    panMapper : panMapper
  }));
}


























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
    // trackURL : 'https://soundcloud.com/majorlazer/blaze-up-the-fire-feat'
    // trackURL : 'https://soundcloud.com/itsbeargrillz/2-get-down'
    // trackURL : 'https://soundcloud.com/trapsounds/sirenz-night-ryda-down-like-that-trap-sounds-premiere'
    // trackURL : 'https://soundcloud.com/mind-vortex/friction-guest-mix'
    // trackURL : 'https://soundcloud.com/tungevaag/samsara-radio-edit'
    // trackURL : 'https://soundcloud.com/dubstep/skism-x-habstrakt-x-megalodon'
    // trackURL : 'https://soundcloud.com/otto-von-schirach/pepe-y-otto-cadillac-culo'
    // trackURL : 'https://soundcloud.com/buygore/focuspotion'
    // trackURL : 'https://soundcloud.com/worakls/worakls-live-act-2013'
    trackURL : 'https://soundcloud.com/cero39-remixes/toro-rojo-no-sentao-cero39'
    
  });

  NERDDISCO_soundcloud.loadTrack();
  
  
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Bassnectar_Generate.mp3');
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Bassnectar_Mixtape.mp3');
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Worakls - Live act 2013.mp3');
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Netsky - Detonate.mp3');



  /*
   * Connector
   */
  // var NERDDISCO_connector = new ndConnector({}); 



  // Get all tracks
  var tracks = document.querySelectorAll('.track');

  // Iterate over all tracks
  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];

    // Listen to the click event
    track.addEventListener('click', function(e) {

      // Update the media element with the new URL
      NERDDISCO_audio.updateMediaElement(this.getAttribute('data-url'));
    });
  };





  var selectors = document.querySelectorAll('.ndSelector');
  var selectorToggle = document.querySelector('.ndSelectorToggle');
  var isToggle = false;

  selectorToggle.addEventListener('click', function(e) {

    if (isToggle) {

      // Iterate over all tracks
      for (var i = 0; i < selectors.length; i++) {
        selectors[i].setAttribute('data-visible', 'true');
      };

    } else {

      // Iterate over all tracks
      for (var i = 0; i < selectors.length; i++) {
        selectors[i].setAttribute('data-visible', 'false');
      };

    }

    isToggle = !isToggle;
  });



  /**
   * Update everything:
   * - canvas
   * - LED
   * - audio data
   */
  var fps = 42;
  var audioData;
  var counter = 0;
  var data = "";


  function update() {
    // Update the audio data
    NERDDISCO_audio.updateData();

    // Draw on canvas
    NERDDISCO_visualization.draw();

    // Get data
    data = NERDDISCO_visualization.getLEDs();

    if (window.registry != undefined) {
      // registry.getAll().brightness = 1;
      
      for (var i = 0; i < registry.devices.length; i++) {
        var j = i * 3;
        registry.devices[i].color = 'rgb('+data[j]+','+data[j + 1]+','+data[j + 2]+')';
      };


    }


    // Get the RGB values for the specified selector areas and send them via WebSocket to the Node.js-Server
    // NERDDISCO_visualization.getLEDs();
    // NERDDISCO_connector.sendLEDs(data);


    setTimeout(function() {
      window.requestAnimationFrame(update);
    }, 1000 / fps);
    
  }

  update();


}.bind(this);