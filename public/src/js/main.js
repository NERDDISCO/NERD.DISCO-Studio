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





/*
 * Visualization
 */
var NERDDISCO_visualization = new ndVisualization({
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





/*
 * SoundCloud
 */
var NERDDISCO_soundcloud = new ndSoundcloud({
  ndAudio : NERDDISCO_audio,
  clientID : 'dce5652caa1b66331903493735ddd64d',
  //trackURL : 'https://soundcloud.com/blaize323/spongebob-bounce-pants-blaize-remix-edit',
  // trackURL : 'https://soundcloud.com/dimitrivegasandlikemike/dimitri-vegas-like-mike-vs-ummet-ozcan-the-hum-out-2004-on-beatport'
  // trackURL : 'https://soundcloud.com/bassnectar/08-noise-ft-donnis'
  trackURL : 'https://soundcloud.com/steveaoki/steve-aoki-born-to-get-wild-feat-will-i-am-club-edition'
});

NERDDISCO_soundcloud.loadTrack();





/*
 * Connector
 */
var NERDDISCO_connector = new ndConnector({

});





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