if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}
function ndAudio(args) {

  // Set AudioContext
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // Create new AudioContext
  this.audioContext = new AudioContext();

  // Create analyzer
  this.audioAnalyser = this.audioContext.createAnalyser();

  // Set FFT size
  // @see http://en.wikipedia.org/wiki/Fast_Fourier_transform
  this.audioAnalyser.fftSize = args.fftSize || 256;

  // Create an Uint8Array to store the frequency data from the audioAnalyzer
  this.audioFrequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);

  // Grouped frequency data (lows, mids, highs)
  this.audioGroupedFrequencyData = null;

  // The Hz of one bin (sampleRate / fftSize)
  this.audioBinHz = null;

  // Set the media element (e.g. <audio>)
  this.mediaElement = args.mediaElement || null;

  // Enable crossOrigin requests
  // @see https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes
  this.mediaElement.crossOrigin = 'anonymous';

  // The source for the mediaElement
  this.mediaElement_src = args.mediaElement_src || null;

  // The volume of the mediaElement
  this.mediaElement_volume = args.mediaElement_volume || 1.0;

  // Set the source for the audio processing to the mediaElement
  this.audioSource = this.audioContext.createMediaElementSource(this.mediaElement);

  // Connect the audioSource with the audioAnalyzer
  this.audioSource.connect(this.audioAnalyser);

  // Connect the audioAnalyzer with the audioContext's destination (e.g. speaker)
  this.audioAnalyser.connect(this.audioContext.destination);
} // / ndAudio

/**
 * ndAudio - functions
 */
ndAudio.prototype = {

  /**
   * Update the src of the mediaElement using the streamUrl
   * and prevent auto-playback. 
   */
  updateMediaElement: function (mediaElement_src) {

    // Update the mediaElement's source
    this.mediaElement_src = mediaElement_src;

    // Update the src attribute of the mediaElement
    this.mediaElement.setAttribute('src', this.mediaElement_src);

    // Set the volume of the mediaElement
    this.mediaElement.volume = this.mediaElement_volume;

    // Pause playback
    this.mediaElement.pause();

    // Update the audioBinHz
    this.audioBinHz = this.audioContext.sampleRate / this.audioAnalyser.fftSize;
  },

  updateData: function () {
    // Get byte frequency data from the audioAnalyser
    this.audioAnalyser.getByteFrequencyData(this.audioFrequencyData);

    /*
     * Create the grouped frequency data based on these ranges:
     *
     *  1. Sub Lows 20-100
     *  2. Lows 100-250
     *  3. Low Mids 250 - 500
     *  4. Mids 500 - 1k
     *  5. High Mids 1k - 5k
     *  6. Highs 5k-10k
     *  7. Super Highs 10k-20k and above
     */
    // Initialize new array
    this.audioGroupedFrequencyData = {
      'sublow': { value: 0, count: 0 },
      'low': { value: 0, count: 0 },
      'lowmid': { value: 0, count: 0 },
      'mid': { value: 0, count: 0 },
      'highmid': { value: 0, count: 0 },
      'high': { value: 0, count: 0 },
      'superhigh': { value: 0, count: 0 }
    };

    // Helper to save the current bins Hz
    var currentBinHz = 0;

    // The audioBinHz is defined
    if (this.audioBinHz !== null) {

      // Iterate over every bin
      for (var i = 0; i < this.audioFrequencyData.length; i++) {

        // Calculate the current bins Hz
        currentBinHz = this.audioBinHz * (i + 1);

        if (currentBinHz < 100) {
          this.audioGroupedFrequencyData['sublow'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['sublow'].count++;
          }
        } else if (currentBinHz < 250) {
          this.audioGroupedFrequencyData['low'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['low'].count++;
          }
        } else if (currentBinHz < 500) {
          this.audioGroupedFrequencyData['lowmid'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['lowmid'].count++;
          }
        } else if (currentBinHz < 1000) {
          this.audioGroupedFrequencyData['mid'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['mid'].count++;
          }
        } else if (currentBinHz < 5000) {
          this.audioGroupedFrequencyData['highmid'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['highmid'].count++;
          }
        } else if (currentBinHz < 10000) {
          this.audioGroupedFrequencyData['high'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['high'].count++;
          }
        } else if (currentBinHz < 20000) {
          this.audioGroupedFrequencyData['superhigh'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['superhigh'].count++;
          }
        }
      } // / for this.audioFrequencyData.length

      /**
       * Calculate the middle value of every frequency range
       */
      if (this.audioGroupedFrequencyData['sublow'].count > 0) {
        this.audioGroupedFrequencyData['sublow'].value = Math.round(this.audioGroupedFrequencyData['sublow'].value / this.audioGroupedFrequencyData['sublow'].count);
      }

      if (this.audioGroupedFrequencyData['low'].count > 0) {
        this.audioGroupedFrequencyData['low'].value = Math.round(this.audioGroupedFrequencyData['low'].value / this.audioGroupedFrequencyData['low'].count);
      }

      if (this.audioGroupedFrequencyData['lowmid'].count > 0) {
        this.audioGroupedFrequencyData['lowmid'].value = Math.round(this.audioGroupedFrequencyData['lowmid'].value / this.audioGroupedFrequencyData['lowmid'].count);
      }

      if (this.audioGroupedFrequencyData['mid'].count > 0) {
        this.audioGroupedFrequencyData['mid'].value = Math.round(this.audioGroupedFrequencyData['mid'].value / this.audioGroupedFrequencyData['mid'].count);
      }

      if (this.audioGroupedFrequencyData['highmid'].count > 0) {
        this.audioGroupedFrequencyData['highmid'].value = Math.round(this.audioGroupedFrequencyData['highmid'].value / this.audioGroupedFrequencyData['highmid'].count);
      }

      if (this.audioGroupedFrequencyData['high'].count > 0) {
        this.audioGroupedFrequencyData['high'].value = Math.round(this.audioGroupedFrequencyData['high'].value / this.audioGroupedFrequencyData['high'].count);
      }

      if (this.audioGroupedFrequencyData['superhigh'].count > 0) {
        this.audioGroupedFrequencyData['superhigh'].value = Math.round(this.audioGroupedFrequencyData['superhigh'].value / this.audioGroupedFrequencyData['superhigh'].count);
      }
    } // / audioBinHz is defined
  }, // / ndAudio.prototype.updateData

  /**
   * Get the frequency data from the audioAnalyzer
   */
  getFrequencyData: function () {
    // Return the raw frequency data
    return this.audioFrequencyData;
  }, // / ndAudio.prototype.getFrequencyData

  /**
   *
   */
  getGroupedFrequencyData: function () {
    return this.audioGroupedFrequencyData;
  } // / ndAudio.prototype.getGroupedFrequencyData

}; // / ndAudio.prototype
function ndConnector(args) {

  this.url = args.url || 'http://nerddisco.master:1337';

  // The socket namespace
  this.namespace = args.namespace || 'NERDDISCO-Studio';

  this.webSocket = null;

  // Initialize ndConnector
  this.init();
} // / ndConnector

ndConnector.prototype = {

  init: function () {

    // Create a new Web Socket client using the socket.io-client
    this.webSocket = io(this.url + '/' + this.namespace);
  }, // / ndConnector.prototype.init

  sendLEDs: function (leds) {

    this.webSocket.emit('NERDDISCO.input', leds);
  } // / ndConnector.prototype.sendLEDs

}; // / ndConnector.prototype
/* interact.js v1.2.4 | https://raw.github.com/taye/interact.js/master/LICENSE */
!function(t){"use strict";function e(){}function i(t){if(!t||"object"!=typeof t)return!1;var e=b(t)||ue;return/object|function/.test(typeof e.Element)?t instanceof e.Element:1===t.nodeType&&"string"==typeof t.nodeName}function r(t){return!(!t||!t.Window)&&t instanceof t.Window}function s(t){return!!t&&t instanceof ve}function n(t){return o(t)&&void 0!==typeof t.length&&a(t.splice)}function o(t){return!!t&&"object"==typeof t}function a(t){return"function"==typeof t}function h(t){return"number"==typeof t}function p(t){return"boolean"==typeof t}function l(t){return"string"==typeof t}function c(t){return l(t)?(ge.querySelector(t),!0):!1}function d(t,e){for(var i in e)t[i]=e[i];return t}function u(t,e){t.page=t.page||{},t.page.x=e.page.x,t.page.y=e.page.y,t.client=t.client||{},t.client.x=e.client.x,t.client.y=e.client.y,t.timeStamp=e.timeStamp}function g(t,e,i){e||(e=i.pointerIds.length>1?z(i.pointers):i.pointers[0]),f(e,be,i),t.page.x=be.x,t.page.y=be.y,y(e,be,i),t.client.x=be.x,t.client.y=be.y,t.timeStamp=(new Date).getTime()}function v(t,e,i){t.page.x=i.page.x-e.page.x,t.page.y=i.page.y-e.page.y,t.client.x=i.client.x-e.client.x,t.client.y=i.client.y-e.client.y,t.timeStamp=(new Date).getTime()-e.timeStamp;var r=Math.max(t.timeStamp/1e3,.001);t.page.speed=Se(t.page.x,t.page.y)/r,t.page.vx=t.page.x/r,t.page.vy=t.page.y/r,t.client.speed=Se(t.client.x,t.page.y)/r,t.client.vx=t.client.x/r,t.client.vy=t.client.y/r}function m(t,e,i){return i=i||{},t=t||"page",i.x=e[t+"X"],i.y=e[t+"Y"],i}function f(t,e,i){return e=e||{},t instanceof B?/inertiastart/.test(t.type)?(i=i||t.interaction,d(e,i.inertiaStatus.upCoords.page),e.x+=i.inertiaStatus.sx,e.y+=i.inertiaStatus.sy):(e.x=t.pageX,e.y=t.pageY):He?(m("screen",t,e),e.x+=ue.scrollX,e.y+=ue.scrollY):m("page",t,e),e}function y(t,e,i){return e=e||{},t instanceof B?/inertiastart/.test(t.type)?(d(e,i.inertiaStatus.upCoords.client),e.x+=i.inertiaStatus.sx,e.y+=i.inertiaStatus.sy):(e.x=t.clientX,e.y=t.clientY):m(He?"screen":"client",t,e),e}function x(t){return t=t||ue,{x:t.scrollX||t.document.documentElement.scrollLeft,y:t.scrollY||t.document.documentElement.scrollTop}}function E(t){return h(t.pointerId)?t.pointerId:t.identifier}function S(t){return t instanceof ye?t.correspondingUseElement:t}function b(t){if(r(t))return t;var e=t.ownerDocument||t;return e.defaultView||e.parentWindow||ue}function w(t){var e=We?{x:0,y:0}:x(b(t)),i=t instanceof me?t.getBoundingClientRect():t.getClientRects()[0];return i&&{left:i.left+e.x,right:i.right+e.x,top:i.top+e.y,bottom:i.bottom+e.y,width:i.width||i.right-i.left,height:i.heigh||i.bottom-i.top}}function D(t){var e=[];return n(t)?(e[0]=t[0],e[1]=t[1]):"touchend"===t.type?1===t.touches.length?(e[0]=t.touches[0],e[1]=t.changedTouches[0]):0===t.touches.length&&(e[0]=t.changedTouches[0],e[1]=t.changedTouches[1]):(e[0]=t.touches[0],e[1]=t.touches[1]),e}function z(t){var e=D(t);return{pageX:(e[0].pageX+e[1].pageX)/2,pageY:(e[0].pageY+e[1].pageY)/2,clientX:(e[0].clientX+e[1].clientX)/2,clientY:(e[0].clientY+e[1].clientY)/2}}function T(t){if(t.length||t.touches&&t.touches.length>1){var e=D(t),i=Math.min(e[0].pageX,e[1].pageX),r=Math.min(e[0].pageY,e[1].pageY),s=Math.max(e[0].pageX,e[1].pageX),n=Math.max(e[0].pageY,e[1].pageY);return{x:i,y:r,left:i,top:r,width:s-i,height:n-r}}}function C(t,e){e=e||Me.deltaSource;var i=e+"X",r=e+"Y",s=D(t),n=s[0][i]-s[1][i],o=s[0][r]-s[1][r];return Se(n,o)}function M(t,e,i){i=i||Me.deltaSource;var r=i+"X",s=i+"Y",n=D(t),o=n[0][r]-n[1][r],a=n[0][s]-n[1][s],p=180*Math.atan(a/o)/Math.PI;if(h(e)){var l=p-e,c=l%360;c>315?p-=360+p/360|0:c>135?p-=180+p/360|0:-315>c?p+=360+p/360|0:-135>c&&(p+=180+p/360|0)}return p}function P(t,e){var r=t?t.options.origin:Me.origin;return"parent"===r?r=k(e):"self"===r?r=t.getRect(e):c(r)&&(r=Y(e,r)||{x:0,y:0}),a(r)&&(r=r(t&&e)),i(r)&&(r=w(r)),r.x="x"in r?r.x:r.left,r.y="y"in r?r.y:r.top,r}function O(t,e,i,r){var s=1-t;return s*s*e+2*s*t*i+t*t*r}function _(t,e,i,r,s,n,o){return{x:O(o,t,i,s),y:O(o,e,r,n)}}function A(t,e,i,r){return t/=r,-i*t*(t-2)+e}function X(t,e){for(;e;){if(e===t)return!0;e=e.parentNode}return!1}function Y(t,e){for(var r=k(t);i(r);){if(pe(r,e))return r;r=k(r)}return null}function k(t){var e=t.parentNode;if(s(e)){for(;(e=e.host)&&s(e););return e}return e}function I(t,e){return t._context===e.ownerDocument||X(t._context,e)}function R(t,e,r){var s=t.options.ignoreFrom;return s&&i(r)?l(s)?le(r,s,e):i(s)?X(s,r):!1:!1}function F(t,e,r){var s=t.options.allowFrom;return s?i(r)?l(s)?le(r,s,e):i(s)?X(s,r):!1:!1:!0}function q(t,e){if(!e)return!1;var i=e.options.drag.axis;return"xy"===t||"xy"===i||i===t}function N(t,e){var i=t.options;return/^resize/.test(e)&&(e="resize"),i[e].snap&&i[e].snap.enabled}function H(t,e){var i=t.options;return/^resize/.test(e)&&(e="resize"),i[e].restrict&&i[e].restrict.enabled}function W(t,e){var i=t.options;return/^resize/.test(e)&&(e="resize"),i[e].autoScroll&&i[e].autoScroll.enabled}function U(t,e,i){for(var r=t.options,s=r[i.name].max,n=r[i.name].maxPerElement,o=0,a=0,h=0,p=0,l=ze.length;l>p;p++){var c=ze[p],d=c.prepared.name,u=c.interacting();if(u){if(o++,o>=ke)return!1;if(c.target===t){if(a+=d===i.name|0,a>=s)return!1;if(c.element===e&&(h++,d!==i.name||h>=n))return!1}}}return ke>0}function V(t){var e,i,r,s,n,o=t[0],a=o?0:-1,h=[],p=[];for(s=1;s<t.length;s++)if(e=t[s],e&&e!==o)if(o){if(e.parentNode!==e.ownerDocument)if(o.parentNode!==e.ownerDocument){if(!h.length)for(i=o;i.parentNode&&i.parentNode!==i.ownerDocument;)h.unshift(i),i=i.parentNode;if(o instanceof xe&&e instanceof me&&!(e instanceof fe)){if(e===o.parentNode)continue;i=e.ownerSVGElement}else i=e;for(p=[];i.parentNode!==i.ownerDocument;)p.unshift(i),i=i.parentNode;for(n=0;p[n]&&p[n]===h[n];)n++;var l=[p[n-1],p[n],h[n]];for(r=l[0].lastChild;r;){if(r===l[1]){o=e,a=s,h=[];break}if(r===l[2])break;r=r.previousSibling}}else o=e,a=s}else o=e,a=s;return a}function $(){if(this.target=null,this.element=null,this.dropTarget=null,this.dropElement=null,this.prevDropTarget=null,this.prevDropElement=null,this.prepared={name:null,axis:null,edges:null},this.matches=[],this.matchElements=[],this.inertiaStatus={active:!1,smoothEnd:!1,startEvent:null,upCoords:{},xe:0,ye:0,sx:0,sy:0,t0:0,vx0:0,vys:0,duration:0,resumeDx:0,resumeDy:0,lambda_v0:0,one_ve_v0:0,i:null},a(Function.prototype.bind))this.boundInertiaFrame=this.inertiaFrame.bind(this),this.boundSmoothEndFrame=this.smoothEndFrame.bind(this);else{var t=this;this.boundInertiaFrame=function(){return t.inertiaFrame()},this.boundSmoothEndFrame=function(){return t.smoothEndFrame()}}this.activeDrops={dropzones:[],elements:[],rects:[]},this.pointers=[],this.pointerIds=[],this.downTargets=[],this.downTimes=[],this.holdTimers=[],this.prevCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0},this.curCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0},this.startCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0},this.pointerDelta={page:{x:0,y:0,vx:0,vy:0,speed:0},client:{x:0,y:0,vx:0,vy:0,speed:0},timeStamp:0},this.downEvent=null,this.downPointer={},this._eventTarget=null,this._curEventTarget=null,this.prevEvent=null,this.tapTime=0,this.prevTap=null,this.startOffset={left:0,right:0,top:0,bottom:0},this.restrictOffset={left:0,right:0,top:0,bottom:0},this.snapOffsets=[],this.gesture={start:{x:0,y:0},startDistance:0,prevDistance:0,distance:0,scale:1,startAngle:0,prevAngle:0},this.snapStatus={x:0,y:0,dx:0,dy:0,realX:0,realY:0,snappedX:0,snappedY:0,targets:[],locked:!1,changed:!1},this.restrictStatus={dx:0,dy:0,restrictedX:0,restrictedY:0,snap:null,restricted:!1,changed:!1},this.restrictStatus.snap=this.snapStatus,this.pointerIsDown=!1,this.pointerWasMoved=!1,this.gesturing=!1,this.dragging=!1,this.resizing=!1,this.resizeAxes="xy",this.mouse=!1,ze.push(this)}function G(t,e,i){var r,s=0,n=ze.length,o=/mouse/i.test(t.pointerType||e)||4===t.pointerType,a=E(t);if(/down|start/i.test(e))for(s=0;n>s;s++){r=ze[s];var h=i;if(r.inertiaStatus.active&&r.target.options[r.prepared.name].inertia.allowResume&&r.mouse===o)for(;h;){if(h===r.element)return r.pointers[0]&&r.removePointer(r.pointers[0]),r.addPointer(t),r;h=k(h)}}if(o||!Oe&&!_e){for(s=0;n>s;s++)if(ze[s].mouse&&!ze[s].inertiaStatus.active)return ze[s];for(s=0;n>s;s++)if(ze[s].mouse&&(!/down/.test(e)||!ze[s].inertiaStatus.active))return r;return r=new $,r.mouse=!0,r}for(s=0;n>s;s++)if(he(ze[s].pointerIds,a))return ze[s];if(/up|end|out/i.test(e))return null;for(s=0;n>s;s++)if(r=ze[s],!(r.prepared.name&&!r.target.options.gesture.enabled||r.interacting()||!o&&r.mouse))return r.addPointer(t),r;return new $}function L(t){return function(e){var i,r,s=S(e.path?e.path[0]:e.target),n=S(e.currentTarget);if(Oe&&/touch/.test(e.type))for(Ye=(new Date).getTime(),r=0;r<e.changedTouches.length;r++){var o=e.changedTouches[r];i=G(o,e.type,s),i&&(i._updateEventTargets(s,n),i[t](o,e,s,n))}else{if(!_e&&/mouse/.test(e.type)){for(r=0;r<ze.length;r++)if(!ze[r].mouse&&ze[r].pointerIsDown)return;if((new Date).getTime()-Ye<500)return}if(i=G(e,e.type,s),!i)return;i._updateEventTargets(s,n),i[t](e,e,s,n)}}}function B(t,e,i,r,s,n){var o,a,h=t.target,p=t.snapStatus,l=t.restrictStatus,c=t.pointers,u=(h&&h.options||Me).deltaSource,g=u+"X",v=u+"Y",m=h?h.options:Me,f=P(h,s),y="start"===r,x="end"===r,E=y?t.startCoords:t.curCoords;s=s||t.element,a=d({},E.page),o=d({},E.client),a.x-=f.x,a.y-=f.y,o.x-=f.x,o.y-=f.y;var S=m[i].snap&&m[i].snap.relativePoints;!N(h,i)||y&&S&&S.length||(this.snap={range:p.range,locked:p.locked,x:p.snappedX,y:p.snappedY,realX:p.realX,realY:p.realY,dx:p.dx,dy:p.dy},p.locked&&(a.x+=p.dx,a.y+=p.dy,o.x+=p.dx,o.y+=p.dy)),!H(h,i)||y&&m[i].restrict.elementRect||!l.restricted||(a.x+=l.dx,a.y+=l.dy,o.x+=l.dx,o.y+=l.dy,this.restrict={dx:l.dx,dy:l.dy}),this.pageX=a.x,this.pageY=a.y,this.clientX=o.x,this.clientY=o.y,this.x0=t.startCoords.page.x,this.y0=t.startCoords.page.y,this.clientX0=t.startCoords.client.x,this.clientY0=t.startCoords.client.y,this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.button=e.button,this.target=s,this.t0=t.downTimes[0],this.type=i+(r||""),this.interaction=t,this.interactable=h;var b=t.inertiaStatus;if(b.active&&(this.detail="inertia"),n&&(this.relatedTarget=n),x?"client"===u?(this.dx=o.x-t.startCoords.client.x,this.dy=o.y-t.startCoords.client.y):(this.dx=a.x-t.startCoords.page.x,this.dy=a.y-t.startCoords.page.y):y?(this.dx=0,this.dy=0):"inertiastart"===r?(this.dx=t.prevEvent.dx,this.dy=t.prevEvent.dy):"client"===u?(this.dx=o.x-t.prevEvent.clientX,this.dy=o.y-t.prevEvent.clientY):(this.dx=a.x-t.prevEvent.pageX,this.dy=a.y-t.prevEvent.pageY),t.prevEvent&&"inertia"===t.prevEvent.detail&&!b.active&&m[i].inertia&&m[i].inertia.zeroResumeDelta&&(b.resumeDx+=this.dx,b.resumeDy+=this.dy,this.dx=this.dy=0),"resize"===i&&t.resizeAxes?m.resize.square?("y"===t.resizeAxes?this.dx=this.dy:this.dy=this.dx,this.axes="xy"):(this.axes=t.resizeAxes,"x"===t.resizeAxes?this.dy=0:"y"===t.resizeAxes&&(this.dx=0)):"gesture"===i&&(this.touches=[c[0],c[1]],y?(this.distance=C(c,u),this.box=T(c),this.scale=1,this.ds=0,this.angle=M(c,void 0,u),this.da=0):x||e instanceof B?(this.distance=t.prevEvent.distance,this.box=t.prevEvent.box,this.scale=t.prevEvent.scale,this.ds=this.scale-1,this.angle=t.prevEvent.angle,this.da=this.angle-t.gesture.startAngle):(this.distance=C(c,u),this.box=T(c),this.scale=this.distance/t.gesture.startDistance,this.angle=M(c,t.gesture.prevAngle,u),this.ds=this.scale-t.gesture.prevScale,this.da=this.angle-t.gesture.prevAngle)),y)this.timeStamp=t.downTimes[0],this.dt=0,this.duration=0,this.speed=0,this.velocityX=0,this.velocityY=0;else if("inertiastart"===r)this.timeStamp=t.prevEvent.timeStamp,this.dt=t.prevEvent.dt,this.duration=t.prevEvent.duration,this.speed=t.prevEvent.speed,this.velocityX=t.prevEvent.velocityX,this.velocityY=t.prevEvent.velocityY;else if(this.timeStamp=(new Date).getTime(),this.dt=this.timeStamp-t.prevEvent.timeStamp,this.duration=this.timeStamp-t.downTimes[0],e instanceof B){var w=this[g]-t.prevEvent[g],D=this[v]-t.prevEvent[v],z=this.dt/1e3;this.speed=Se(w,D)/z,this.velocityX=w/z,this.velocityY=D/z}else this.speed=t.pointerDelta[u].speed,this.velocityX=t.pointerDelta[u].vx,this.velocityY=t.pointerDelta[u].vy;if((x||"inertiastart"===r)&&t.prevEvent.speed>600&&this.timeStamp-t.prevEvent.timeStamp<150){var O=180*Math.atan2(t.prevEvent.velocityY,t.prevEvent.velocityX)/Math.PI,_=22.5;0>O&&(O+=360);var A=O>=135-_&&225+_>O,X=O>=225-_&&315+_>O,Y=!A&&(O>=315-_||45+_>O),k=!X&&O>=45-_&&135+_>O;this.swipe={up:X,down:k,left:A,right:Y,angle:O,speed:t.prevEvent.speed,velocity:{x:t.prevEvent.velocityX,y:t.prevEvent.velocityY}}}}function K(){this.originalEvent.preventDefault()}function j(t){var e="";if("drag"===t.name&&(e=Ie.drag),"resize"===t.name)if(t.axis)e=Ie[t.name+t.axis];else if(t.edges){for(var i="resize",r=["top","bottom","left","right"],s=0;4>s;s++)t.edges[r[s]]&&(i+=r[s]);e=Ie[i]}return e}function J(t,e,r,s,n,o){if(!e)return!1;if(e===!0){var a=h(o.width)?o.width:o.right-o.left,p=h(o.height)?o.height:o.bottom-o.top;if(0>a&&("left"===t?t="right":"right"===t&&(t="left")),0>p&&("top"===t?t="bottom":"bottom"===t&&(t="top")),"left"===t)return r.x<(a>=0?o.left:o.right)+Ae;if("top"===t)return r.y<(p>=0?o.top:o.bottom)+Ae;if("right"===t)return r.x>(a>=0?o.right:o.left)-Ae;if("bottom"===t)return r.y>(p>=0?o.bottom:o.top)-Ae}return i(s)?i(e)?e===s:le(s,e,n):!1}function Q(t,e,i){var r,s=this.getRect(i),n=!1,a=null,h=null,p=d({},e.curCoords.page),l=this.options;if(!s)return null;if(Re.resize&&l.resize.enabled){var c=l.resize;if(r={left:!1,right:!1,top:!1,bottom:!1},o(c.edges)){for(var u in r)r[u]=J(u,c.edges[u],p,e._eventTarget,i,s);r.left=r.left&&!r.right,r.top=r.top&&!r.bottom,n=r.left||r.right||r.top||r.bottom}else{var g="y"!==l.resize.axis&&p.x>s.right-Ae,v="x"!==l.resize.axis&&p.y>s.bottom-Ae;n=g||v,h=(g?"x":"")+(v?"y":"")}}return a=n?"resize":Re.drag&&l.drag.enabled?"drag":null,Re.gesture&&e.pointerIds.length>=2&&!e.dragging&&!e.resizing&&(a="gesture"),a?{name:a,axis:h,edges:r}:null}function Z(t,e){if(!o(t))return null;var i=t.name,r=e.options;return("resize"===i&&r.resize.enabled||"drag"===i&&r.drag.enabled||"gesture"===i&&r.gesture.enabled)&&Re[i]?(("resize"===i||"resizeyx"===i)&&(i="resizexy"),t):null}function te(t,e){var r={},s=Ce[t.type],n=S(t.path?t.path[0]:t.target),o=n;e=e?!0:!1;for(var a in t)r[a]=t[a];for(r.originalEvent=t,r.preventDefault=K;i(o);){for(var h=0;h<s.selectors.length;h++){var p=s.selectors[h],l=s.contexts[h];if(pe(o,p)&&X(l,n)&&X(l,o)){var c=s.listeners[h];r.currentTarget=o;for(var d=0;d<c.length;d++)c[d][1]===e&&c[d][0](r)}}o=k(o)}}function ee(t){return te.call(this,t,!0)}function ie(t,e){return De.get(t,e)||new re(t,e)}function re(t,e){this._element=t,this._iEvents=this._iEvents||{};var r;if(c(t)){this.selector=t;var s=e&&e.context;r=s?b(s):ue,s&&(r.Node?s instanceof r.Node:i(s)||s===r.document)&&(this._context=s)}else r=b(t),i(t,r)&&(Ee?(Ge.add(this._element,ce.down,Le.pointerDown),Ge.add(this._element,ce.move,Le.pointerHover)):(Ge.add(this._element,"mousedown",Le.pointerDown),Ge.add(this._element,"mousemove",Le.pointerHover),Ge.add(this._element,"touchstart",Le.pointerDown),Ge.add(this._element,"touchmove",Le.pointerHover)));this._doc=r.document,he(we,this._doc)||oe(this._doc),De.push(this),this.set(e)}function se(t,e){var i=!1;return function(){return i||(ue.console.warn(e),i=!0),t.apply(this,arguments)}}function ne(t){for(var e=0;e<ze.length;e++)ze[e].pointerEnd(t,t)}function oe(t){if(!he(we,t)){var e=t.defaultView||t.parentWindow;for(var i in Ce)Ge.add(t,i,te),Ge.add(t,i,ee,!0);Ee?(ce=Ee===e.MSPointerEvent?{up:"MSPointerUp",down:"MSPointerDown",over:"mouseover",out:"mouseout",move:"MSPointerMove",cancel:"MSPointerCancel"}:{up:"pointerup",down:"pointerdown",over:"pointerover",out:"pointerout",move:"pointermove",cancel:"pointercancel"},Ge.add(t,ce.down,Le.selectorDown),Ge.add(t,ce.move,Le.pointerMove),Ge.add(t,ce.over,Le.pointerOver),Ge.add(t,ce.out,Le.pointerOut),Ge.add(t,ce.up,Le.pointerUp),Ge.add(t,ce.cancel,Le.pointerCancel),Ge.add(t,ce.move,Pe.edgeMove)):(Ge.add(t,"mousedown",Le.selectorDown),Ge.add(t,"mousemove",Le.pointerMove),Ge.add(t,"mouseup",Le.pointerUp),Ge.add(t,"mouseover",Le.pointerOver),Ge.add(t,"mouseout",Le.pointerOut),Ge.add(t,"touchstart",Le.selectorDown),Ge.add(t,"touchmove",Le.pointerMove),Ge.add(t,"touchend",Le.pointerUp),Ge.add(t,"touchcancel",Le.pointerCancel),Ge.add(t,"mousemove",Pe.edgeMove),Ge.add(t,"touchmove",Pe.edgeMove)),Ge.add(e,"blur",ne);try{if(e.frameElement){var r=e.frameElement.ownerDocument,s=r.defaultView;Ge.add(r,"mouseup",Le.pointerEnd),Ge.add(r,"touchend",Le.pointerEnd),Ge.add(r,"touchcancel",Le.pointerEnd),Ge.add(r,"pointerup",Le.pointerEnd),Ge.add(r,"MSPointerUp",Le.pointerEnd),Ge.add(s,"blur",ne)}}catch(n){ie.windowParentError=n}Ge.useAttachEvent&&(Ge.add(t,"selectstart",function(t){var e=ze[0];e.currentAction()&&e.checkAndPreventDefault(t)}),Ge.add(t,"dblclick",L("ie8Dblclick"))),we.push(t)}}function ae(t,e){for(var i=0,r=t.length;r>i;i++)if(t[i]===e)return i;return-1}function he(t,e){return-1!==ae(t,e)}function pe(e,i,r){return de?de(e,i,r):(ue!==t&&(i=i.replace(/\/deep\//g," ")),e[Ue](i))}function le(t,e,r){for(;i(t);){if(pe(t,e))return!0;if(t=k(t),t===r)return pe(t,e)}return!1}var ce,de,ue=function(){var e=t.document.createTextNode("");return e.ownerDocument!==t.document&&"function"==typeof t.wrap&&t.wrap(e)===e?t.wrap(t):t}(),ge=ue.document,ve=ue.DocumentFragment||e,me=ue.SVGElement||e,fe=ue.SVGSVGElement||e,ye=ue.SVGElementInstance||e,xe=ue.HTMLElement||ue.Element,Ee=ue.PointerEvent||ue.MSPointerEvent,Se=Math.hypot||function(t,e){return Math.sqrt(t*t+e*e)},be={},we=[],De=[],ze=[],Te=!1,Ce={},Me={base:{accept:null,actionChecker:null,styleCursor:!0,preventDefault:"auto",origin:{x:0,y:0},deltaSource:"page",allowFrom:null,ignoreFrom:null,_context:ge,dropChecker:null},drag:{enabled:!1,manualStart:!0,max:1/0,maxPerElement:1,snap:null,restrict:null,inertia:null,autoScroll:null,axis:"xy"},drop:{enabled:!1,accept:null,overlap:"pointer"},resize:{enabled:!1,manualStart:!1,max:1/0,maxPerElement:1,snap:null,restrict:null,inertia:null,autoScroll:null,square:!1,axis:"xy",edges:null,invert:"none"},gesture:{manualStart:!1,enabled:!1,max:1/0,maxPerElement:1,restrict:null},perAction:{manualStart:!1,max:1/0,maxPerElement:1,snap:{enabled:!1,endOnly:!1,range:1/0,targets:null,offsets:null,relativePoints:null},restrict:{enabled:!1,endOnly:!1},autoScroll:{enabled:!1,container:null,margin:60,speed:300},inertia:{enabled:!1,resistance:10,minSpeed:100,endSpeed:10,allowResume:!0,zeroResumeDelta:!0,smoothEndDuration:300}},_holdDuration:600},Pe={interaction:null,i:null,x:0,y:0,scroll:function(){var t=Pe.interaction.target.options[Pe.interaction.prepared.name].autoScroll,e=t.container||b(Pe.interaction.element),i=(new Date).getTime(),s=(i-Pe.prevTime)/1e3,n=t.speed*s;n>=1&&(r(e)?e.scrollBy(Pe.x*n,Pe.y*n):e&&(e.scrollLeft+=Pe.x*n,e.scrollTop+=Pe.y*n),Pe.prevTime=i),Pe.isScrolling&&($e(Pe.i),Pe.i=Ve(Pe.scroll))},edgeMove:function(t){for(var e,i,s=!1,n=0;n<ze.length;n++)if(e=ze[n],e.interacting()&&W(e.target,e.prepared.name)){i=e.target,s=!0;break}if(s){var o,a,h,p,l=i.options[e.prepared.name].autoScroll,c=l.container||b(e.element);if(r(c))p=t.clientX<Pe.margin,o=t.clientY<Pe.margin,a=t.clientX>c.innerWidth-Pe.margin,h=t.clientY>c.innerHeight-Pe.margin;else{var d=w(c);p=t.clientX<d.left+Pe.margin,o=t.clientY<d.top+Pe.margin,a=t.clientX>d.right-Pe.margin,h=t.clientY>d.bottom-Pe.margin}Pe.x=a?1:p?-1:0,Pe.y=h?1:o?-1:0,Pe.isScrolling||(Pe.margin=l.margin,Pe.speed=l.speed,Pe.start(e))}},isScrolling:!1,prevTime:0,start:function(t){Pe.isScrolling=!0,$e(Pe.i),Pe.interaction=t,Pe.prevTime=(new Date).getTime(),Pe.i=Ve(Pe.scroll)},stop:function(){Pe.isScrolling=!1,$e(Pe.i)}},Oe="ontouchstart"in ue||ue.DocumentTouch&&ge instanceof ue.DocumentTouch,_e=!!Ee,Ae=Oe||_e?20:10,Xe=1,Ye=0,ke=1/0,Ie=ge.all&&!ue.atob?{drag:"move",resizex:"e-resize",resizey:"s-resize",resizexy:"se-resize",resizetop:"n-resize",resizeleft:"w-resize",resizebottom:"s-resize",resizeright:"e-resize",resizetopleft:"se-resize",resizebottomright:"se-resize",resizetopright:"ne-resize",resizebottomleft:"ne-resize",gesture:""}:{drag:"move",resizex:"ew-resize",resizey:"ns-resize",resizexy:"nwse-resize",resizetop:"ns-resize",resizeleft:"ew-resize",resizebottom:"ns-resize",resizeright:"ew-resize",resizetopleft:"nwse-resize",resizebottomright:"nwse-resize",resizetopright:"nesw-resize",resizebottomleft:"nesw-resize",gesture:""},Re={drag:!0,resize:!0,gesture:!0},Fe="onmousewheel"in ge?"mousewheel":"wheel",qe=["dragstart","dragmove","draginertiastart","dragend","dragenter","dragleave","dropactivate","dropdeactivate","dropmove","drop","resizestart","resizemove","resizeinertiastart","resizeend","gesturestart","gesturemove","gestureinertiastart","gestureend","down","move","up","cancel","tap","doubletap","hold"],Ne={},He="Opera"==navigator.appName&&Oe&&navigator.userAgent.match("Presto"),We=/iP(hone|od|ad)/.test(navigator.platform)&&/OS [1-7][^\d]/.test(navigator.appVersion),Ue="matches"in Element.prototype?"matches":"webkitMatchesSelector"in Element.prototype?"webkitMatchesSelector":"mozMatchesSelector"in Element.prototype?"mozMatchesSelector":"oMatchesSelector"in Element.prototype?"oMatchesSelector":"msMatchesSelector",Ve=t.requestAnimationFrame,$e=t.cancelAnimationFrame,Ge=function(){function t(t,e,a,d){var u=ae(p,t),g=l[u];if(g||(g={events:{},typeCount:0},u=p.push(t)-1,l.push(g),c.push(n?{supplied:[],wrapped:[],useCount:[]}:null)),g.events[e]||(g.events[e]=[],g.typeCount++),!he(g.events[e],a)){var v;if(n){var m=c[u],f=ae(m.supplied,a),y=m.wrapped[f]||function(e){e.immediatePropagationStopped||(e.target=e.srcElement,e.currentTarget=t,e.preventDefault=e.preventDefault||i,e.stopPropagation=e.stopPropagation||r,e.stopImmediatePropagation=e.stopImmediatePropagation||s,/mouse|click/.test(e.type)&&(e.pageX=e.clientX+b(t).document.documentElement.scrollLeft,e.pageY=e.clientY+b(t).document.documentElement.scrollTop),a(e))};v=t[o](h+e,y,Boolean(d)),-1===f?(m.supplied.push(a),m.wrapped.push(y),m.useCount.push(1)):m.useCount[f]++}else v=t[o](e,a,d||!1);return g.events[e].push(a),v}}function e(t,i,r,s){var o,d,u,g=ae(p,t),v=l[g],m=r;if(v&&v.events)if(n&&(d=c[g],u=ae(d.supplied,r),m=d.wrapped[u]),"all"!==i){if(v.events[i]){var f=v.events[i].length;if("all"===r)for(o=0;f>o;o++)e(t,i,v.events[i][o],Boolean(s));else for(o=0;f>o;o++)if(v.events[i][o]===r){t[a](h+i,m,s||!1),v.events[i].splice(o,1),n&&d&&(d.useCount[u]--,0===d.useCount[u]&&(d.supplied.splice(u,1),d.wrapped.splice(u,1),d.useCount.splice(u,1)));break}v.events[i]&&0===v.events[i].length&&(v.events[i]=null,v.typeCount--)}v.typeCount||(l.splice(g),p.splice(g),c.splice(g))}else for(i in v.events)v.events.hasOwnProperty(i)&&e(t,i,"all")}function i(){this.returnValue=!1}function r(){this.cancelBubble=!0}function s(){this.cancelBubble=!0,this.immediatePropagationStopped=!0}var n="attachEvent"in ue&&!("addEventListener"in ue),o=n?"attachEvent":"addEventListener",a=n?"detachEvent":"removeEventListener",h=n?"on":"",p=[],l=[],c=[];return{add:t,remove:e,useAttachEvent:n,_elements:p,_targets:l,_attachedListeners:c}}();$.prototype={getPageXY:function(t,e){return f(t,e,this)},getClientXY:function(t,e){return y(t,e,this)},setEventXY:function(t,e){return g(t,e,this)},pointerOver:function(t,e,i){function r(t,e){t&&I(t,i)&&!R(t,i,i)&&F(t,i,i)&&pe(i,e)&&(s.push(t),n.push(i))}if(!this.prepared.name&&this.mouse){var s=[],n=[],o=this.element;this.addPointer(t),!this.target||!R(this.target,this.element,i)&&F(this.target,this.element,i)||(this.target=null,this.element=null,this.matches=[],this.matchElements=[]);var a=De.get(i),h=a&&!R(a,i,i)&&F(a,i,i)&&Z(a.getAction(t,this,i),a);h&&!U(a,i,h)&&(h=null),h?(this.target=a,this.element=i,this.matches=[],this.matchElements=[]):(De.forEachSelector(r),this.validateSelector(t,s,n)?(this.matches=s,this.matchElements=n,this.pointerHover(t,e,this.matches,this.matchElements),Ge.add(i,Ee?ce.move:"mousemove",Le.pointerHover)):this.target&&(X(o,i)?(this.pointerHover(t,e,this.matches,this.matchElements),Ge.add(this.element,Ee?ce.move:"mousemove",Le.pointerHover)):(this.target=null,this.element=null,this.matches=[],this.matchElements=[])))}},pointerHover:function(t,e,i,r,s,n){var o=this.target;if(!this.prepared.name&&this.mouse){var a;this.setEventXY(this.curCoords,t),s?a=this.validateSelector(t,s,n):o&&(a=Z(o.getAction(this.pointers[0],this,this.element),this.target)),o&&o.options.styleCursor&&(o._doc.documentElement.style.cursor=a?j(a):"")}else this.prepared.name&&this.checkAndPreventDefault(e,o,this.element)},pointerOut:function(t,e,i){this.prepared.name||(De.get(i)||Ge.remove(i,Ee?ce.move:"mousemove",Le.pointerHover),this.target&&this.target.options.styleCursor&&!this.interacting()&&(this.target._doc.documentElement.style.cursor=""))},selectorDown:function(t,e,r,s){function n(t,e,i){var s=de?i.querySelectorAll(e):void 0;I(t,p)&&!R(t,p,r)&&F(t,p,r)&&pe(p,e,s)&&(a.matches.push(t),a.matchElements.push(p))}var o,a=this,h=Ge.useAttachEvent?d({},e):e,p=r,l=this.addPointer(t);if(this.holdTimers[l]=setTimeout(function(){a.pointerHold(Ge.useAttachEvent?h:t,h,r,s)},Me._holdDuration),this.pointerIsDown=!0,this.inertiaStatus.active&&this.target.selector)for(;i(p);){if(p===this.element&&Z(this.target.getAction(t,this,this.element),this.target).name===this.prepared.name)return $e(this.inertiaStatus.i),this.inertiaStatus.active=!1,void this.collectEventTargets(t,e,r,"down");p=k(p)}if(this.interacting())return void this.collectEventTargets(t,e,r,"down");for(this.setEventXY(this.curCoords,t);i(p)&&!o;)this.matches=[],this.matchElements=[],De.forEachSelector(n),o=this.validateSelector(t,this.matches,this.matchElements),p=k(p);return o?(this.prepared.name=o.name,this.prepared.axis=o.axis,this.prepared.edges=o.edges,this.collectEventTargets(t,e,r,"down"),this.pointerDown(t,e,r,s,o)):(this.downTimes[l]=(new Date).getTime(),this.downTargets[l]=r,this.downEvent=e,d(this.downPointer,t),u(this.prevCoords,this.curCoords),this.pointerWasMoved=!1,void this.collectEventTargets(t,e,r,"down"))},pointerDown:function(t,e,i,r,s){if(!s&&!this.inertiaStatus.active&&this.pointerWasMoved&&this.prepared.name)return void this.checkAndPreventDefault(e,this.target,this.element);this.pointerIsDown=!0;var n,o=this.addPointer(t);if(this.pointerIds.length<2&&!this.target||!this.prepared.name){var a=De.get(r);a&&!R(a,r,i)&&F(a,r,i)&&(n=Z(s||a.getAction(t,this,r),a,i))&&U(a,r,n)&&(this.target=a,this.element=r)}var h=this.target,p=h&&h.options;if(h&&!this.interacting()){if(n=n||Z(s||h.getAction(t,this,r),h,this.element),this.setEventXY(this.startCoords),!n)return;p.styleCursor&&(h._doc.documentElement.style.cursor=j(n)),this.resizeAxes="resize"===n.name?n.axis:null,"gesture"===n&&this.pointerIds.length<2&&(n=null),this.prepared.name=n.name,this.prepared.axis=n.axis,this.prepared.edges=n.edges,this.snapStatus.snappedX=this.snapStatus.snappedY=this.restrictStatus.restrictedX=this.restrictStatus.restrictedY=0/0,this.downTimes[o]=(new Date).getTime(),this.downTargets[o]=i,this.downEvent=e,d(this.downPointer,t),this.setEventXY(this.prevCoords),this.pointerWasMoved=!1,this.checkAndPreventDefault(e,h,this.element)}else this.inertiaStatus.active&&r===this.element&&Z(h.getAction(t,this,this.element),h).name===this.prepared.name&&($e(this.inertiaStatus.i),this.inertiaStatus.active=!1,this.checkAndPreventDefault(e,h,this.element))},setModifications:function(t,e){var i=this.target,r=!0,s=N(i,this.prepared.name)&&(!i.options[this.prepared.name].snap.endOnly||e),n=H(i,this.prepared.name)&&(!i.options[this.prepared.name].restrict.endOnly||e);return s?this.setSnapping(t):this.snapStatus.locked=!1,n?this.setRestriction(t):this.restrictStatus.restricted=!1,s&&this.snapStatus.locked&&!this.snapStatus.changed?r=n&&this.restrictStatus.restricted&&this.restrictStatus.changed:n&&this.restrictStatus.restricted&&!this.restrictStatus.changed&&(r=!1),r},setStartOffsets:function(t,e,i){var r,s,n=e.getRect(i),o=P(e,i),a=e.options[this.prepared.name].snap,h=e.options[this.prepared.name].restrict;n?(this.startOffset.left=this.startCoords.page.x-n.left,this.startOffset.top=this.startCoords.page.y-n.top,this.startOffset.right=n.right-this.startCoords.page.x,this.startOffset.bottom=n.bottom-this.startCoords.page.y,r="width"in n?n.width:n.right-n.left,s="height"in n?n.height:n.bottom-n.top):this.startOffset.left=this.startOffset.top=this.startOffset.right=this.startOffset.bottom=0,this.snapOffsets.splice(0);var p=a&&"startCoords"===a.offset?{x:this.startCoords.page.x-o.x,y:this.startCoords.page.y-o.y}:a&&a.offset||{x:0,y:0};if(n&&a&&a.relativePoints&&a.relativePoints.length)for(var l=0;l<a.relativePoints.length;l++)this.snapOffsets.push({x:this.startOffset.left-r*a.relativePoints[l].x+p.x,y:this.startOffset.top-s*a.relativePoints[l].y+p.y});else this.snapOffsets.push(p);n&&h.elementRect?(this.restrictOffset.left=this.startOffset.left-r*h.elementRect.left,this.restrictOffset.top=this.startOffset.top-s*h.elementRect.top,this.restrictOffset.right=this.startOffset.right-r*(1-h.elementRect.right),this.restrictOffset.bottom=this.startOffset.bottom-s*(1-h.elementRect.bottom)):this.restrictOffset.left=this.restrictOffset.top=this.restrictOffset.right=this.restrictOffset.bottom=0},start:function(t,e,i){this.interacting()||!this.pointerIsDown||this.pointerIds.length<("gesture"===t.name?2:1)||(-1===ae(ze,this)&&ze.push(this),this.prepared.name=t.name,this.prepared.axis=t.axis,this.prepared.edges=t.edges,this.target=e,this.element=i,this.setStartOffsets(t.name,e,i),this.setModifications(this.startCoords.page),this.prevEvent=this[this.prepared.name+"Start"](this.downEvent))},pointerMove:function(t,e,r,s,n){this.recordPointer(t),this.setEventXY(this.curCoords,t instanceof B?this.inertiaStatus.startEvent:void 0);var o,a,h=this.curCoords.page.x===this.prevCoords.page.x&&this.curCoords.page.y===this.prevCoords.page.y&&this.curCoords.client.x===this.prevCoords.client.x&&this.curCoords.client.y===this.prevCoords.client.y,p=this.mouse?0:ae(this.pointerIds,E(t));if(this.pointerIsDown&&!this.pointerWasMoved&&(o=this.curCoords.client.x-this.startCoords.client.x,a=this.curCoords.client.y-this.startCoords.client.y,this.pointerWasMoved=Se(o,a)>Xe),h||this.pointerIsDown&&!this.pointerWasMoved||(this.pointerIsDown&&clearTimeout(this.holdTimers[p]),this.collectEventTargets(t,e,r,"move")),this.pointerIsDown){if(h&&this.pointerWasMoved&&!n)return void this.checkAndPreventDefault(e,this.target,this.element);if(v(this.pointerDelta,this.prevCoords,this.curCoords),this.prepared.name){if(this.pointerWasMoved&&(!this.inertiaStatus.active||t instanceof B&&/inertiastart/.test(t.type))){if(!this.interacting()&&(v(this.pointerDelta,this.prevCoords,this.curCoords),"drag"===this.prepared.name)){var l=Math.abs(o),c=Math.abs(a),d=this.target.options.drag.axis,g=l>c?"x":c>l?"y":"xy";if("xy"!==g&&"xy"!==d&&d!==g){this.prepared.name=null;for(var m=r;i(m);){var f=De.get(m);if(f&&f!==this.target&&!f.options.drag.manualStart&&"drag"===f.getAction(this.downPointer,this,m).name&&q(g,f)){this.prepared.name="drag",this.target=f,this.element=m;break}m=k(m)}if(!this.prepared.name){var y=function(t,e,i){var s=de?i.querySelectorAll(e):void 0;if(t!==this.target)return I(t,r)&&!t.options.drag.manualStart&&!R(t,m,r)&&F(t,m,r)&&pe(m,e,s)&&"drag"===t.getAction(this.downPointer,this,m).name&&q(g,t)&&U(t,m,"drag")?t:void 0};for(m=r;i(m);){var x=De.forEachSelector(y);if(x){this.prepared.name="drag",this.target=x,this.element=m;break}m=k(m)}}}}var S=!!this.prepared.name&&!this.interacting();if(S&&(this.target.options[this.prepared.name].manualStart||!U(this.target,this.element,this.prepared)))return void this.stop();if(this.prepared.name&&this.target){S&&this.start(this.prepared,this.target,this.element);var b=this.setModifications(this.curCoords.page,n);(b||S)&&(this.prevEvent=this[this.prepared.name+"Move"](e)),this.checkAndPreventDefault(e,this.target,this.element)}}u(this.prevCoords,this.curCoords),(this.dragging||this.resizing)&&Pe.edgeMove(e)}}},dragStart:function(t){var e=new B(this,t,"drag","start",this.element);
this.dragging=!0,this.target.fire(e),this.activeDrops.dropzones=[],this.activeDrops.elements=[],this.activeDrops.rects=[],this.dynamicDrop||this.setActiveDrops(this.element);var i=this.getDropEvents(t,e);return i.activate&&this.fireActiveDrops(i.activate),e},dragMove:function(t){var e=this.target,i=new B(this,t,"drag","move",this.element),r=this.element,s=this.getDrop(i,r);this.dropTarget=s.dropzone,this.dropElement=s.element;var n=this.getDropEvents(t,i);return e.fire(i),n.leave&&this.prevDropTarget.fire(n.leave),n.enter&&this.dropTarget.fire(n.enter),n.move&&this.dropTarget.fire(n.move),this.prevDropTarget=this.dropTarget,this.prevDropElement=this.dropElement,i},resizeStart:function(t){var e=new B(this,t,"resize","start",this.element);if(this.prepared.edges){var i=this.target.getRect(this.element);if(this.target.options.resize.square){var r=d({},this.prepared.edges);r.top=r.top||r.left&&!r.bottom,r.left=r.left||r.top&&!r.right,r.bottom=r.bottom||r.right&&!r.top,r.right=r.right||r.bottom&&!r.left,this.prepared._squareEdges=r}else this.prepared._squareEdges=null;this.resizeRects={start:i,current:d({},i),restricted:d({},i),previous:d({},i),delta:{left:0,right:0,width:0,top:0,bottom:0,height:0}},e.rect=this.resizeRects.restricted,e.deltaRect=this.resizeRects.delta}return this.target.fire(e),this.resizing=!0,e},resizeMove:function(t){var e=new B(this,t,"resize","move",this.element),i=this.prepared.edges,r=this.target.options.resize.invert,s="reposition"===r||"negate"===r;if(i){var n=e.dx,o=e.dy,a=this.resizeRects.start,h=this.resizeRects.current,p=this.resizeRects.restricted,l=this.resizeRects.delta,c=d(this.resizeRects.previous,p);if(this.target.options.resize.square){var u=i;i=this.prepared._squareEdges,u.left&&u.bottom||u.right&&u.top?o=-n:u.left||u.right?o=n:(u.top||u.bottom)&&(n=o)}if(i.top&&(h.top+=o),i.bottom&&(h.bottom+=o),i.left&&(h.left+=n),i.right&&(h.right+=n),s){if(d(p,h),"reposition"===r){var g;p.top>p.bottom&&(g=p.top,p.top=p.bottom,p.bottom=g),p.left>p.right&&(g=p.left,p.left=p.right,p.right=g)}}else p.top=Math.min(h.top,a.bottom),p.bottom=Math.max(h.bottom,a.top),p.left=Math.min(h.left,a.right),p.right=Math.max(h.right,a.left);p.width=p.right-p.left,p.height=p.bottom-p.top;for(var v in p)l[v]=p[v]-c[v];e.edges=this.prepared.edges,e.rect=p,e.deltaRect=l}return this.target.fire(e),e},gestureStart:function(t){var e=new B(this,t,"gesture","start",this.element);return e.ds=0,this.gesture.startDistance=this.gesture.prevDistance=e.distance,this.gesture.startAngle=this.gesture.prevAngle=e.angle,this.gesture.scale=1,this.gesturing=!0,this.target.fire(e),e},gestureMove:function(t){if(!this.pointerIds.length)return this.prevEvent;var e;return e=new B(this,t,"gesture","move",this.element),e.ds=e.scale-this.gesture.scale,this.target.fire(e),this.gesture.prevAngle=e.angle,this.gesture.prevDistance=e.distance,1/0===e.scale||null===e.scale||void 0===e.scale||isNaN(e.scale)||(this.gesture.scale=e.scale),e},pointerHold:function(t,e,i){this.collectEventTargets(t,e,i,"hold")},pointerUp:function(t,e,i,r){var s=this.mouse?0:ae(this.pointerIds,E(t));clearTimeout(this.holdTimers[s]),this.collectEventTargets(t,e,i,"up"),this.collectEventTargets(t,e,i,"tap"),this.pointerEnd(t,e,i,r),this.removePointer(t)},pointerCancel:function(t,e,i,r){var s=this.mouse?0:ae(this.pointerIds,E(t));clearTimeout(this.holdTimers[s]),this.collectEventTargets(t,e,i,"cancel"),this.pointerEnd(t,e,i,r),this.removePointer(t)},ie8Dblclick:function(t,e,i){this.prevTap&&e.clientX===this.prevTap.clientX&&e.clientY===this.prevTap.clientY&&i===this.prevTap.target&&(this.downTargets[0]=i,this.downTimes[0]=(new Date).getTime(),this.collectEventTargets(t,e,i,"tap"))},pointerEnd:function(t,e,i,r){var s,n=this.target,o=n&&n.options,a=o&&this.prepared.name&&o[this.prepared.name].inertia,h=this.inertiaStatus;if(this.interacting()){if(h.active)return;var p,l,c=(new Date).getTime(),g=!1,v=!1,m=!1,f=N(n,this.prepared.name)&&o[this.prepared.name].snap.endOnly,y=H(n,this.prepared.name)&&o[this.prepared.name].restrict.endOnly,x=0,E=0;if(p=this.dragging?"x"===o.drag.axis?Math.abs(this.pointerDelta.client.vx):"y"===o.drag.axis?Math.abs(this.pointerDelta.client.vy):this.pointerDelta.client.speed:this.pointerDelta.client.speed,g=a&&a.enabled&&"gesture"!==this.prepared.name&&e!==h.startEvent,v=g&&c-this.curCoords.timeStamp<50&&p>a.minSpeed&&p>a.endSpeed,g&&!v&&(f||y)){var S={};S.snap=S.restrict=S,f&&(this.setSnapping(this.curCoords.page,S),S.locked&&(x+=S.dx,E+=S.dy)),y&&(this.setRestriction(this.curCoords.page,S),S.restricted&&(x+=S.dx,E+=S.dy)),(x||E)&&(m=!0)}if(v||m){if(u(h.upCoords,this.curCoords),this.pointers[0]=h.startEvent=l=new B(this,e,this.prepared.name,"inertiastart",this.element),h.t0=c,n.fire(h.startEvent),v){h.vx0=this.pointerDelta.client.vx,h.vy0=this.pointerDelta.client.vy,h.v0=p,this.calcInertia(h);var b,w=d({},this.curCoords.page),D=P(n,this.element);if(w.x=w.x+h.xe-D.x,w.y=w.y+h.ye-D.y,b={useStatusXY:!0,x:w.x,y:w.y,dx:0,dy:0,snap:null},b.snap=b,x=E=0,f){var z=this.setSnapping(this.curCoords.page,b);z.locked&&(x+=z.dx,E+=z.dy)}if(y){var T=this.setRestriction(this.curCoords.page,b);T.restricted&&(x+=T.dx,E+=T.dy)}h.modifiedXe+=x,h.modifiedYe+=E,h.i=Ve(this.boundInertiaFrame)}else h.smoothEnd=!0,h.xe=x,h.ye=E,h.sx=h.sy=0,h.i=Ve(this.boundSmoothEndFrame);return void(h.active=!0)}(f||y)&&this.pointerMove(t,e,i,r,!0)}if(this.dragging){s=new B(this,e,"drag","end",this.element);var C=this.element,M=this.getDrop(s,C);this.dropTarget=M.dropzone,this.dropElement=M.element;var O=this.getDropEvents(e,s);O.leave&&this.prevDropTarget.fire(O.leave),O.enter&&this.dropTarget.fire(O.enter),O.drop&&this.dropTarget.fire(O.drop),O.deactivate&&this.fireActiveDrops(O.deactivate),n.fire(s)}else this.resizing?(s=new B(this,e,"resize","end",this.element),n.fire(s)):this.gesturing&&(s=new B(this,e,"gesture","end",this.element),n.fire(s));this.stop(e)},collectDrops:function(t){var e,r=[],s=[];for(t=t||this.element,e=0;e<De.length;e++)if(De[e].options.drop.enabled){var n=De[e],o=n.options.drop.accept;if(!(i(o)&&o!==t||l(o)&&!pe(t,o)))for(var a=n.selector?n._context.querySelectorAll(n.selector):[n._element],h=0,p=a.length;p>h;h++){var c=a[h];c!==t&&(r.push(n),s.push(c))}}return{dropzones:r,elements:s}},fireActiveDrops:function(t){var e,i,r,s;for(e=0;e<this.activeDrops.dropzones.length;e++)i=this.activeDrops.dropzones[e],r=this.activeDrops.elements[e],r!==s&&(t.target=r,i.fire(t)),s=r},setActiveDrops:function(t){var e=this.collectDrops(t,!0);this.activeDrops.dropzones=e.dropzones,this.activeDrops.elements=e.elements,this.activeDrops.rects=[];for(var i=0;i<this.activeDrops.dropzones.length;i++)this.activeDrops.rects[i]=this.activeDrops.dropzones[i].getRect(this.activeDrops.elements[i])},getDrop:function(t,e){var i=[];Te&&this.setActiveDrops(e);for(var r=0;r<this.activeDrops.dropzones.length;r++){var s=this.activeDrops.dropzones[r],n=this.activeDrops.elements[r],o=this.activeDrops.rects[r];i.push(s.dropCheck(this.pointers[0],this.target,e,n,o)?n:null)}var a=V(i),h=this.activeDrops.dropzones[a]||null,p=this.activeDrops.elements[a]||null;return{dropzone:h,element:p}},getDropEvents:function(t,e){var i={enter:null,leave:null,activate:null,deactivate:null,move:null,drop:null};return this.dropElement!==this.prevDropElement&&(this.prevDropTarget&&(i.leave={target:this.prevDropElement,dropzone:this.prevDropTarget,relatedTarget:e.target,draggable:e.interactable,dragEvent:e,interaction:this,timeStamp:e.timeStamp,type:"dragleave"},e.dragLeave=this.prevDropElement,e.prevDropzone=this.prevDropTarget),this.dropTarget&&(i.enter={target:this.dropElement,dropzone:this.dropTarget,relatedTarget:e.target,draggable:e.interactable,dragEvent:e,interaction:this,timeStamp:e.timeStamp,type:"dragenter"},e.dragEnter=this.dropElement,e.dropzone=this.dropTarget)),"dragend"===e.type&&this.dropTarget&&(i.drop={target:this.dropElement,dropzone:this.dropTarget,relatedTarget:e.target,draggable:e.interactable,dragEvent:e,interaction:this,timeStamp:e.timeStamp,type:"drop"}),"dragstart"===e.type&&(i.activate={target:null,dropzone:null,relatedTarget:e.target,draggable:e.interactable,dragEvent:e,interaction:this,timeStamp:e.timeStamp,type:"dropactivate"}),"dragend"===e.type&&(i.deactivate={target:null,dropzone:null,relatedTarget:e.target,draggable:e.interactable,dragEvent:e,interaction:this,timeStamp:e.timeStamp,type:"dropdeactivate"}),"dragmove"===e.type&&this.dropTarget&&(i.move={target:this.dropElement,dropzone:this.dropTarget,relatedTarget:e.target,draggable:e.interactable,dragEvent:e,interaction:this,dragmove:e,timeStamp:e.timeStamp,type:"dropmove"},e.dropzone=this.dropTarget),i},currentAction:function(){return this.dragging&&"drag"||this.resizing&&"resize"||this.gesturing&&"gesture"||null},interacting:function(){return this.dragging||this.resizing||this.gesturing},clearTargets:function(){this.target&&!this.target.selector&&(this.target=this.element=null),this.dropTarget=this.dropElement=this.prevDropTarget=this.prevDropElement=null},stop:function(t){if(this.interacting()){Pe.stop(),this.matches=[],this.matchElements=[];var e=this.target;e.options.styleCursor&&(e._doc.documentElement.style.cursor=""),t&&a(t.preventDefault)&&this.checkAndPreventDefault(t,e,this.element),this.dragging&&(this.activeDrops.dropzones=this.activeDrops.elements=this.activeDrops.rects=null),this.clearTargets()}this.pointerIsDown=this.snapStatus.locked=this.dragging=this.resizing=this.gesturing=!1,this.prepared.name=this.prevEvent=null,this.inertiaStatus.resumeDx=this.inertiaStatus.resumeDy=0;for(var i=0;i<this.pointers.length;i++)-1===ae(this.pointerIds,E(this.pointers[i]))&&this.pointers.splice(i,1);ze.length>1&&ze.splice(ae(ze,this),1)},inertiaFrame:function(){var t=this.inertiaStatus,e=this.target.options[this.prepared.name].inertia,i=e.resistance,r=(new Date).getTime()/1e3-t.t0;if(r<t.te){var s=1-(Math.exp(-i*r)-t.lambda_v0)/t.one_ve_v0;if(t.modifiedXe===t.xe&&t.modifiedYe===t.ye)t.sx=t.xe*s,t.sy=t.ye*s;else{var n=_(0,0,t.xe,t.ye,t.modifiedXe,t.modifiedYe,s);t.sx=n.x,t.sy=n.y}this.pointerMove(t.startEvent,t.startEvent),t.i=Ve(this.boundInertiaFrame)}else t.sx=t.modifiedXe,t.sy=t.modifiedYe,this.pointerMove(t.startEvent,t.startEvent),t.active=!1,this.pointerEnd(t.startEvent,t.startEvent)},smoothEndFrame:function(){var t=this.inertiaStatus,e=(new Date).getTime()-t.t0,i=this.target.options[this.prepared.name].inertia.smoothEndDuration;i>e?(t.sx=A(e,0,t.xe,i),t.sy=A(e,0,t.ye,i),this.pointerMove(t.startEvent,t.startEvent),t.i=Ve(this.boundSmoothEndFrame)):(t.sx=t.xe,t.sy=t.ye,this.pointerMove(t.startEvent,t.startEvent),t.active=!1,t.smoothEnd=!1,this.pointerEnd(t.startEvent,t.startEvent))},addPointer:function(t){var e=E(t),i=this.mouse?0:ae(this.pointerIds,e);return-1===i&&(i=this.pointerIds.length),this.pointerIds[i]=e,this.pointers[i]=t,i},removePointer:function(t){var e=E(t),i=this.mouse?0:ae(this.pointerIds,e);-1!==i&&(this.interacting()||this.pointers.splice(i,1),this.pointerIds.splice(i,1),this.downTargets.splice(i,1),this.downTimes.splice(i,1),this.holdTimers.splice(i,1))},recordPointer:function(t){if(!this.inertiaStatus.active){var e=this.mouse?0:ae(this.pointerIds,E(t));-1!==e&&(this.pointers[e]=t)}},collectEventTargets:function(t,e,r,s){function n(t,e,n){var o=de?n.querySelectorAll(e):void 0;t._iEvents[s]&&i(p)&&I(t,p)&&!R(t,p,r)&&F(t,p,r)&&pe(p,e,o)&&(a.push(t),h.push(p))}var o=this.mouse?0:ae(this.pointerIds,E(t));if("tap"!==s||!this.pointerWasMoved&&this.downTargets[o]&&this.downTargets[o]===r){for(var a=[],h=[],p=r;p;)ie.isSet(p)&&ie(p)._iEvents[s]&&(a.push(ie(p)),h.push(p)),De.forEachSelector(n),p=k(p);(a.length||"tap"===s)&&this.firePointers(t,e,r,a,h,s)}},firePointers:function(t,e,i,r,s,n){var o,a,h,p=this.mouse?0:ae(E(t)),c={};for("doubletap"===n?c=t:(d(c,e),e!==t&&d(c,t),c.preventDefault=K,c.stopPropagation=B.prototype.stopPropagation,c.stopImmediatePropagation=B.prototype.stopImmediatePropagation,c.interaction=this,c.timeStamp=(new Date).getTime(),c.originalEvent=e,c.type=n,c.pointerId=E(t),c.pointerType=this.mouse?"mouse":_e?l(t.pointerType)?t.pointerType:[,,"touch","pen","mouse"][t.pointerType]:"touch"),"tap"===n&&(c.dt=c.timeStamp-this.downTimes[p],a=c.timeStamp-this.tapTime,h=!!(this.prevTap&&"doubletap"!==this.prevTap.type&&this.prevTap.target===c.target&&500>a),c.double=h,this.tapTime=c.timeStamp),o=0;o<r.length&&(c.currentTarget=s[o],c.interactable=r[o],r[o].fire(c),!(c.immediatePropagationStopped||c.propagationStopped&&s[o+1]!==c.currentTarget));o++);if(h){var u={};d(u,c),u.dt=a,u.type="doubletap",this.collectEventTargets(u,e,i,"doubletap"),this.prevTap=u}else"tap"===n&&(this.prevTap=c)},validateSelector:function(t,e,i){for(var r=0,s=e.length;s>r;r++){var n=e[r],o=i[r],a=Z(n.getAction(t,this,o),n);if(a&&U(n,o,a))return this.target=n,this.element=o,a}},setSnapping:function(t,e){var i,r,s,n=this.target.options[this.prepared.name].snap,o=[];if(e=e||this.snapStatus,e.useStatusXY)r={x:e.x,y:e.y};else{var p=P(this.target,this.element);r=d({},t),r.x-=p.x,r.y-=p.y}e.realX=r.x,e.realY=r.y,r.x=r.x-this.inertiaStatus.resumeDx,r.y=r.y-this.inertiaStatus.resumeDy;for(var l=n.targets?n.targets.length:0,c=0;c<this.snapOffsets.length;c++){var u={x:r.x-this.snapOffsets[c].x,y:r.y-this.snapOffsets[c].y};for(s=0;l>s;s++)i=a(n.targets[s])?n.targets[s](u.x,u.y,this):n.targets[s],i&&o.push({x:h(i.x)?i.x+this.snapOffsets[c].x:u.x,y:h(i.y)?i.y+this.snapOffsets[c].y:u.y,range:h(i.range)?i.range:n.range})}var g={target:null,inRange:!1,distance:0,range:0,dx:0,dy:0};for(s=0,l=o.length;l>s;s++){i=o[s];var v=i.range,m=i.x-r.x,f=i.y-r.y,y=Se(m,f),x=v>=y;1/0===v&&g.inRange&&1/0!==g.range&&(x=!1),(!g.target||(x?g.inRange&&1/0!==v?y/v<g.distance/g.range:1/0===v&&1/0!==g.range||y<g.distance:!g.inRange&&y<g.distance))&&(1/0===v&&(x=!0),g.target=i,g.distance=y,g.range=v,g.inRange=x,g.dx=m,g.dy=f,e.range=v)}var E;return g.target?(E=e.snappedX!==g.target.x||e.snappedY!==g.target.y,e.snappedX=g.target.x,e.snappedY=g.target.y):(E=!0,e.snappedX=0/0,e.snappedY=0/0),e.dx=g.dx,e.dy=g.dy,e.changed=E||g.inRange&&!e.locked,e.locked=g.inRange,e},setRestriction:function(t,e){var r,s=this.target,n=s&&s.options[this.prepared.name].restrict,o=n&&n.restriction;if(!o)return e;e=e||this.restrictStatus,r=r=e.useStatusXY?{x:e.x,y:e.y}:d({},t),e.snap&&e.snap.locked&&(r.x+=e.snap.dx||0,r.y+=e.snap.dy||0),r.x-=this.inertiaStatus.resumeDx,r.y-=this.inertiaStatus.resumeDy,e.dx=0,e.dy=0,e.restricted=!1;var h,p,c;return l(o)&&(o="parent"===o?k(this.element):"self"===o?s.getRect(this.element):Y(this.element,o),!o)?e:(a(o)&&(o=o(r.x,r.y,this.element)),i(o)&&(o=w(o)),h=o,o?"x"in o&&"y"in o?(p=Math.max(Math.min(h.x+h.width-this.restrictOffset.right,r.x),h.x+this.restrictOffset.left),c=Math.max(Math.min(h.y+h.height-this.restrictOffset.bottom,r.y),h.y+this.restrictOffset.top)):(p=Math.max(Math.min(h.right-this.restrictOffset.right,r.x),h.left+this.restrictOffset.left),c=Math.max(Math.min(h.bottom-this.restrictOffset.bottom,r.y),h.top+this.restrictOffset.top)):(p=r.x,c=r.y),e.dx=p-r.x,e.dy=c-r.y,e.changed=e.restrictedX!==p||e.restrictedY!==c,e.restricted=!(!e.dx&&!e.dy),e.restrictedX=p,e.restrictedY=c,e)},checkAndPreventDefault:function(t,e,i){if(e=e||this.target){var r=e.options,s=r.preventDefault;if("auto"===s&&i&&!/^input$|^textarea$/i.test(i.nodeName)){if(/down|start/i.test(t.type)&&"drag"===this.prepared.name&&"xy"!==r.drag.axis)return;if(r[this.prepared.name]&&r[this.prepared.name].manualStart&&!this.interacting())return;return void t.preventDefault()}return"always"===s?void t.preventDefault():void 0}},calcInertia:function(t){var e=this.target.options[this.prepared.name].inertia,i=e.resistance,r=-Math.log(e.endSpeed/t.v0)/i;t.x0=this.prevEvent.pageX,t.y0=this.prevEvent.pageY,t.t0=t.startEvent.timeStamp/1e3,t.sx=t.sy=0,t.modifiedXe=t.xe=(t.vx0-r)/i,t.modifiedYe=t.ye=(t.vy0-r)/i,t.te=r,t.lambda_v0=i/t.v0,t.one_ve_v0=1-e.endSpeed/t.v0},_updateEventTargets:function(t,e){this._eventTarget=t,this._curEventTarget=e}},B.prototype={preventDefault:e,stopImmediatePropagation:function(){this.immediatePropagationStopped=this.propagationStopped=!0},stopPropagation:function(){this.propagationStopped=!0}};for(var Le={},Be=["dragStart","dragMove","resizeStart","resizeMove","gestureStart","gestureMove","pointerOver","pointerOut","pointerHover","selectorDown","pointerDown","pointerMove","pointerUp","pointerCancel","pointerEnd","addPointer","removePointer","recordPointer"],Ke=0,je=Be.length;je>Ke;Ke++){var Je=Be[Ke];Le[Je]=L(Je)}De.indexOfElement=function(t,e){e=e||ge;for(var i=0;i<this.length;i++){var r=this[i];if(r.selector===t&&r._context===e||!r.selector&&r._element===t)return i}return-1},De.get=function(t,e){return this[this.indexOfElement(t,e&&e.context)]},De.forEachSelector=function(t){for(var e=0;e<this.length;e++){var i=this[e];if(i.selector){var r=t(i,i.selector,i._context,e,this);if(void 0!==r)return r}}},re.prototype={setOnEvents:function(t,e){return"drop"===t?(a(e.ondrop)&&(this.ondrop=e.ondrop),a(e.ondropactivate)&&(this.ondropactivate=e.ondropactivate),a(e.ondropdeactivate)&&(this.ondropdeactivate=e.ondropdeactivate),a(e.ondragenter)&&(this.ondragenter=e.ondragenter),a(e.ondragleave)&&(this.ondragleave=e.ondragleave),a(e.ondropmove)&&(this.ondropmove=e.ondropmove)):(t="on"+t,a(e.onstart)&&(this[t+"start"]=e.onstart),a(e.onmove)&&(this[t+"move"]=e.onmove),a(e.onend)&&(this[t+"end"]=e.onend),a(e.oninertiastart)&&(this[t+"inertiastart"]=e.oninertiastart)),this},draggable:function(t){return o(t)?(this.options.drag.enabled=t.enabled===!1?!1:!0,this.setPerAction("drag",t),this.setOnEvents("drag",t),/^x$|^y$|^xy$/.test(t.axis)?this.options.drag.axis=t.axis:null===t.axis&&delete this.options.drag.axis,this):p(t)?(this.options.drag.enabled=t,this):this.options.drag},setPerAction:function(t,e){for(var i in e)i in Me[t]&&(o(e[i])?(this.options[t][i]=d(this.options[t][i]||{},e[i]),o(Me.perAction[i])&&"enabled"in Me.perAction[i]&&(this.options[t][i].enabled=e[i].enabled===!1?!1:!0)):p(e[i])&&o(Me.perAction[i])?this.options[t][i].enabled=e[i]:void 0!==e[i]&&(this.options[t][i]=e[i]))},dropzone:function(t){return o(t)?(this.options.drop.enabled=t.enabled===!1?!1:!0,this.setOnEvents("drop",t),this.accept(t.accept),/^(pointer|center)$/.test(t.overlap)?this.options.drop.overlap=t.overlap:h(t.overlap)&&(this.options.drop.overlap=Math.max(Math.min(1,t.overlap),0)),this):p(t)?(this.options.drop.enabled=t,this):this.options.drop},dropCheck:function(t,e,i,r,s){var n=!1;if(!(s=s||this.getRect(r)))return this.options.dropChecker?this.options.dropChecker(t,n,this,r,e,i):!1;var o=this.options.drop.overlap;if("pointer"===o){var a,p,l=f(t),c=P(e,i);l.x+=c.x,l.y+=c.y,a=l.x>s.left&&l.x<s.right,p=l.y>s.top&&l.y<s.bottom,n=a&&p}var d=e.getRect(i);if("center"===o){var u=d.left+d.width/2,g=d.top+d.height/2;n=u>=s.left&&u<=s.right&&g>=s.top&&g<=s.bottom}if(h(o)){var v=Math.max(0,Math.min(s.right,d.right)-Math.max(s.left,d.left))*Math.max(0,Math.min(s.bottom,d.bottom)-Math.max(s.top,d.top)),m=v/(d.width*d.height);n=m>=o}return this.options.dropChecker&&(n=this.options.dropChecker(t,n,this,r,e,i)),n},dropChecker:function(t){return a(t)?(this.options.dropChecker=t,this):null===t?(delete this.options.getRect,this):this.options.dropChecker},accept:function(t){return i(t)?(this.options.drop.accept=t,this):c(t)?(this.options.drop.accept=t,this):null===t?(delete this.options.drop.accept,this):this.options.drop.accept},resizable:function(t){return o(t)?(this.options.resize.enabled=t.enabled===!1?!1:!0,this.setPerAction("resize",t),this.setOnEvents("resize",t),/^x$|^y$|^xy$/.test(t.axis)?this.options.resize.axis=t.axis:null===t.axis&&(this.options.resize.axis=Me.resize.axis),p(t.square)&&(this.options.resize.square=t.square),this):p(t)?(this.options.resize.enabled=t,this):this.options.resize},squareResize:function(t){return p(t)?(this.options.resize.square=t,this):null===t?(delete this.options.resize.square,this):this.options.resize.square},gesturable:function(t){return o(t)?(this.options.gesture.enabled=t.enabled===!1?!1:!0,this.setPerAction("gesture",t),this.setOnEvents("gesture",t),this):p(t)?(this.options.gesture.enabled=t,this):this.options.gesture},autoScroll:function(t){return o(t)?t=d({actions:["drag","resize"]},t):p(t)&&(t={actions:["drag","resize"],enabled:t}),this.setOptions("autoScroll",t)},snap:function(t){var e=this.setOptions("snap",t);return e===this?this:e.drag},setOptions:function(t,e){var i,r=e&&n(e.actions)?e.actions:["drag"];if(o(e)||p(e)){for(i=0;i<r.length;i++){var s=/resize/.test(r[i])?"resize":r[i];if(o(this.options[s])){var a=this.options[s][t];o(e)?(d(a,e),a.enabled=e.enabled===!1?!1:!0,"snap"===t&&("grid"===a.mode?a.targets=[ie.createSnapGrid(d({offset:a.gridOffset||{x:0,y:0}},a.grid||{}))]:"anchor"===a.mode?a.targets=a.anchors:"path"===a.mode&&(a.targets=a.paths),"elementOrigin"in e&&(a.relativePoints=[e.elementOrigin]))):p(e)&&(a.enabled=e)}}return this}var h={},l=["drag","resize","gesture"];for(i=0;i<l.length;i++)t in Me[l[i]]&&(h[l[i]]=this.options[l[i]][t]);return h},inertia:function(t){var e=this.setOptions("inertia",t);return e===this?this:e.drag},getAction:function(t,e,i){var r=this.defaultActionChecker(t,e,i);return this.options.actionChecker?this.options.actionChecker(t,r,this,i,e):r},defaultActionChecker:Q,actionChecker:function(t){return a(t)?(this.options.actionChecker=t,this):null===t?(delete this.options.actionChecker,this):this.options.actionChecker},getRect:function(t){return t=t||this._element,this.selector&&!i(t)&&(t=this._context.querySelector(this.selector)),w(t)},rectChecker:function(t){return a(t)?(this.getRect=t,this):null===t?(delete this.options.getRect,this):this.getRect},styleCursor:function(t){return p(t)?(this.options.styleCursor=t,this):null===t?(delete this.options.styleCursor,this):this.options.styleCursor},preventDefault:function(t){return/^(always|never|auto)$/.test(t)?(this.options.preventDefault=t,this):p(t)?(this.options.preventDefault=t?"always":"never",this):this.options.preventDefault},origin:function(t){return c(t)?(this.options.origin=t,this):o(t)?(this.options.origin=t,this):this.options.origin},deltaSource:function(t){return"page"===t||"client"===t?(this.options.deltaSource=t,this):this.options.deltaSource},restrict:function(t){if(!o(t))return this.setOptions("restrict",t);for(var e,i=["drag","resize","gesture"],r=0;r<i.length;r++){var s=i[r];if(s in t){var n=d({actions:[s],restriction:t[s]},t);e=this.setOptions("restrict",n)}}return e},context:function(){return this._context},_context:ge,ignoreFrom:function(t){return c(t)?(this.options.ignoreFrom=t,this):i(t)?(this.options.ignoreFrom=t,this):this.options.ignoreFrom},allowFrom:function(t){return c(t)?(this.options.allowFrom=t,this):i(t)?(this.options.allowFrom=t,this):this.options.allowFrom},element:function(){return this._element},fire:function(t){if(!t||!t.type||!he(qe,t.type))return this;var e,i,r,s="on"+t.type,n="";if(t.type in this._iEvents)for(e=this._iEvents[t.type],i=0,r=e.length;r>i&&!t.immediatePropagationStopped;i++)n=e[i].name,e[i](t);if(a(this[s])&&(n=this[s].name,this[s](t)),t.type in Ne&&(e=Ne[t.type]))for(i=0,r=e.length;r>i&&!t.immediatePropagationStopped;i++)n=e[i].name,e[i](t);return this},on:function(t,e,i){var r;if(l(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),n(t)){for(r=0;r<t.length;r++)this.on(t[r],e,i);return this}if(o(t)){for(var s in t)this.on(s,t[s],e);return this}if("wheel"===t&&(t=Fe),i=i?!0:!1,he(qe,t))t in this._iEvents?this._iEvents[t].push(e):this._iEvents[t]=[e];else if(this.selector){if(!Ce[t])for(Ce[t]={selectors:[],contexts:[],listeners:[]},r=0;r<we.length;r++)Ge.add(we[r],t,te),Ge.add(we[r],t,ee,!0);var a,h=Ce[t];for(a=h.selectors.length-1;a>=0&&(h.selectors[a]!==this.selector||h.contexts[a]!==this._context);a--);-1===a&&(a=h.selectors.length,h.selectors.push(this.selector),h.contexts.push(this._context),h.listeners.push([])),h.listeners[a].push([e,i])}else Ge.add(this._element,t,e,i);return this},off:function(t,e,i){var r;if(l(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),n(t)){for(r=0;r<t.length;r++)this.off(t[r],e,i);return this}if(o(t)){for(var s in t)this.off(s,t[s],e);return this}var a,h=-1;if(i=i?!0:!1,"wheel"===t&&(t=Fe),he(qe,t))a=this._iEvents[t],a&&-1!==(h=ae(a,e))&&this._iEvents[t].splice(h,1);else if(this.selector){var p=Ce[t],c=!1;if(!p)return this;for(h=p.selectors.length-1;h>=0;h--)if(p.selectors[h]===this.selector&&p.contexts[h]===this._context){var d=p.listeners[h];for(r=d.length-1;r>=0;r--){var u=d[r][0],g=d[r][1];if(u===e&&g===i){d.splice(r,1),d.length||(p.selectors.splice(h,1),p.contexts.splice(h,1),p.listeners.splice(h,1),Ge.remove(this._context,t,te),Ge.remove(this._context,t,ee,!0),p.selectors.length||(Ce[t]=null)),c=!0;break}}if(c)break}}else Ge.remove(this._element,t,e,i);return this},set:function(t){o(t)||(t={}),this.options=d({},Me.base);var e,i=["drag","drop","resize","gesture"],r=["draggable","dropzone","resizable","gesturable"],s=d(d({},Me.perAction),t[n]||{});for(e=0;e<i.length;e++){var n=i[e];this.options[n]=d({},Me[n]),this.setPerAction(n,s),this[r[e]](t[n])}var a=["accept","actionChecker","allowFrom","deltaSource","dropChecker","ignoreFrom","origin","preventDefault","rectChecker"];for(e=0,je=a.length;je>e;e++){var h=a[e];this.options[h]=Me.base[h],h in t&&this[h](t[h])}return this},unset:function(){if(Ge.remove(this,"all"),l(this.selector))for(var t in Ce)for(var e=Ce[t],i=0;i<e.selectors.length;i++){e.selectors[i]===this.selector&&e.contexts[i]===this._context&&(e.selectors.splice(i,1),e.contexts.splice(i,1),e.listeners.splice(i,1),e.selectors.length||(Ce[t]=null)),Ge.remove(this._context,t,te),Ge.remove(this._context,t,ee,!0);break}else Ge.remove(this,"all"),this.options.styleCursor&&(this._element.style.cursor="");return this.dropzone(!1),De.splice(ae(De,this),1),ie}},re.prototype.snap=se(re.prototype.snap,"Interactable#snap is deprecated. See the new documentation for snapping at http://interactjs.io/docs/snapping"),re.prototype.restrict=se(re.prototype.restrict,"Interactable#restrict is deprecated. See the new documentation for resticting at http://interactjs.io/docs/restriction"),re.prototype.inertia=se(re.prototype.inertia,"Interactable#inertia is deprecated. See the new documentation for inertia at http://interactjs.io/docs/inertia"),re.prototype.autoScroll=se(re.prototype.autoScroll,"Interactable#autoScroll is deprecated. See the new documentation for autoScroll at http://interactjs.io/docs/#autoscroll"),ie.isSet=function(t,e){return-1!==De.indexOfElement(t,e&&e.context)},ie.on=function(t,e,i){if(l(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),n(t)){for(var r=0;r<t.length;r++)ie.on(t[r],e,i);return ie}if(o(t)){for(var s in t)ie.on(s,t[s],e);return ie}return he(qe,t)?Ne[t]?Ne[t].push(e):Ne[t]=[e]:Ge.add(ge,t,e,i),ie},ie.off=function(t,e,i){if(l(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),n(t)){for(var r=0;r<t.length;r++)ie.off(t[r],e,i);return ie}if(o(t)){for(var s in t)ie.off(s,t[s],e);return ie}if(he(qe,t)){var a;t in Ne&&-1!==(a=ae(Ne[t],e))&&Ne[t].splice(a,1)}else Ge.remove(ge,t,e,i);return ie},ie.enableDragging=se(function(t){return null!==t&&void 0!==t?(Re.drag=t,ie):Re.drag},"interact.enableDragging is deprecated and will soon be removed."),ie.enableResizing=se(function(t){return null!==t&&void 0!==t?(Re.resize=t,ie):Re.resize},"interact.enableResizing is deprecated and will soon be removed."),ie.enableGesturing=se(function(t){return null!==t&&void 0!==t?(Re.gesture=t,ie):Re.gesture},"interact.enableGesturing is deprecated and will soon be removed."),ie.eventTypes=qe,ie.debug=function(){var t=ze[0]||new $;return{interactions:ze,target:t.target,dragging:t.dragging,resizing:t.resizing,gesturing:t.gesturing,prepared:t.prepared,matches:t.matches,matchElements:t.matchElements,prevCoords:t.prevCoords,startCoords:t.startCoords,pointerIds:t.pointerIds,pointers:t.pointers,addPointer:Le.addPointer,removePointer:Le.removePointer,recordPointer:Le.recordPointer,snap:t.snapStatus,restrict:t.restrictStatus,inertia:t.inertiaStatus,downTime:t.downTimes[0],downEvent:t.downEvent,downPointer:t.downPointer,prevEvent:t.prevEvent,Interactable:re,interactables:De,pointerIsDown:t.pointerIsDown,defaultOptions:Me,defaultActionChecker:Q,actionCursors:Ie,dragMove:Le.dragMove,resizeMove:Le.resizeMove,gestureMove:Le.gestureMove,pointerUp:Le.pointerUp,pointerDown:Le.pointerDown,pointerMove:Le.pointerMove,pointerHover:Le.pointerHover,events:Ge,globalEvents:Ne,delegatedEvents:Ce}},ie.getTouchAverage=z,ie.getTouchBBox=T,ie.getTouchDistance=C,ie.getTouchAngle=M,ie.getElementRect=w,ie.matchesSelector=pe,ie.closest=Y,ie.margin=function(t){return h(t)?(Ae=t,ie):Ae},ie.supportsTouch=function(){return Oe},ie.supportsPointerEvent=function(){return _e},ie.stop=function(t){for(var e=ze.length-1;e>0;e--)ze[e].stop(t);return ie},ie.dynamicDrop=function(t){return p(t)?(Te=t,ie):Te},ie.pointerMoveTolerance=function(t){return h(t)?(Xe=t,this):Xe},ie.maxInteractions=function(t){return h(t)?(ke=t,this):ke},ie.createSnapGrid=function(t){return function(e,i){var r=0,s=0;o(t.offset)&&(r=t.offset.x,s=t.offset.y);var n=Math.round((e-r)/t.x),a=Math.round((i-s)/t.y),h=n*t.x+r,p=a*t.y+s;return{x:h,y:p,range:t.range}}},oe(ge),Ue in Element.prototype&&a(Element.prototype[Ue])||(de=function(t,e,i){i=i||t.parentNode.querySelectorAll(e);for(var r=0,s=i.length;s>r;r++)if(i[r]===t)return!0;return!1}),function(){for(var e=0,i=["ms","moz","webkit","o"],r=0;r<i.length&&!t.requestAnimationFrame;++r)Ve=t[i[r]+"RequestAnimationFrame"],$e=t[i[r]+"CancelAnimationFrame"]||t[i[r]+"CancelRequestAnimationFrame"];Ve||(Ve=function(t){var i=(new Date).getTime(),r=Math.max(0,16-(i-e)),s=setTimeout(function(){t(i+r)},r);return e=i+r,s}),$e||($e=function(t){clearTimeout(t)})}(),"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=ie),exports.interact=ie):"function"==typeof define&&define.amd?define("interact",function(){return ie}):t.interact=ie}(window);
'use strict';

class ndGiphy {

  constructor(args) {

    // Key to access the API
    this.apiKey = args.apiKey || null;

    // URL to all the API
    this.apiURL = args.apiURL || null;

    // Reference to XMLHttpRequest
    this.ajax = new XMLHttpRequest();

    // All loaded gifs
    this.gifs = args.gifs || [];

    // ID of the currently active giphy
    this.currentId = null;

    // ID of the last active giphy
    this.lastId = null;

    this.opacity = args.opacity || 1;

    // List of Giphy IDs
    this.playlist = args.playlist || [];
  } // / constructor

  /*
   * Change the currently active ID
   */
  setCurrentId(id) {

    // Save the current ID as the last one
    this.lastId = this.currentId;

    // Overwrite the current ID with the new ID
    this.currentId = id;
  } // / setCurrentId

  /**
   * Create & make a request to the Giphy API. 
   */
  request() {
    var q = "landscape,cats,city"; // search query

    // Initialize an async GET request
    // this.ajax.open('GET', this.apiURL + '/search?api_key='+this.apiKey+'&limit=75&q='+q, true);

    // this.ajax.open('GET', this.apiURL + '/trending?api_key='+this.apiKey+'&limit=75', true);

    this.ajax.open('GET', this.apiURL + '?api_key=' + this.apiKey + '&limit=75&ids=' + this.playlist.join(','), true);

    // We got a result from Giphy
    this.ajax.onload = function () {

      // Request was successful
      if (this.ajax.status >= 200 && this.ajax.status < 400) {

        // Parse the response data and get the content of the "data" attribute
        var data = JSON.parse(this.ajax.responseText).data;

        // Iterate over all images
        for (var i = 0; i < data.length; i++) {
          var _giphy = data[i];

          // Create an object with a reduced amount of data
          _giphy = {
            id: _giphy.id,
            mp4: _giphy.images.original.mp4,
            height: _giphy.images.original.height,
            width: _giphy.images.original.width,
            frames: _giphy.images.original.frames
          };

          // Create the video element
          _giphy.video = this.createVideo(_giphy);

          // Save important data into a new Object
          this.gifs.push(_giphy);
        } // Iterate over all images

        // Use the first video as the default
        this.setCurrentId(0);

        // Request was not successful
      } else {
          console.log('reached giphy, but API returned an error');
        }
    }.bind(this); // / onload

    // There was an error
    this.ajax.onerror = function (e) {
      console.log('connection error', e);
    }; // / onerror

    // Start the request
    this.ajax.send();
  } // / ndGiphy._request

  createVideo(_giphy) {
    // Create video element
    var _video = document.createElement('video');
    _video.setAttribute('id', _giphy.id);
    _video.setAttribute('crossOrigin', 'anonymous');
    _video.setAttribute('src', _giphy.mp4);
    _video.setAttribute('preload', '');
    _video.setAttribute('loop', true);
    // _video.setAttribute('autoplay', true);

    document.body.appendChild(_video);

    return document.getElementById(_giphy.id);
  }

  search() {} // / ndGiphy.search

} // / ndGiphy
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.io=e()}}(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(_dereq_,module,exports){module.exports=_dereq_("./lib/")},{"./lib/":2}],2:[function(_dereq_,module,exports){var url=_dereq_("./url");var parser=_dereq_("socket.io-parser");var Manager=_dereq_("./manager");var debug=_dereq_("debug")("socket.io-client");module.exports=exports=lookup;var cache=exports.managers={};function lookup(uri,opts){if(typeof uri=="object"){opts=uri;uri=undefined}opts=opts||{};var parsed=url(uri);var source=parsed.source;var id=parsed.id;var io;if(opts.forceNew||opts["force new connection"]||false===opts.multiplex){debug("ignoring socket cache for %s",source);io=Manager(source,opts)}else{if(!cache[id]){debug("new io instance for %s",source);cache[id]=Manager(source,opts)}io=cache[id]}return io.socket(parsed.path)}exports.protocol=parser.protocol;exports.connect=lookup;exports.Manager=_dereq_("./manager");exports.Socket=_dereq_("./socket")},{"./manager":3,"./socket":5,"./url":6,debug:9,"socket.io-parser":40}],3:[function(_dereq_,module,exports){var url=_dereq_("./url");var eio=_dereq_("engine.io-client");var Socket=_dereq_("./socket");var Emitter=_dereq_("component-emitter");var parser=_dereq_("socket.io-parser");var on=_dereq_("./on");var bind=_dereq_("component-bind");var object=_dereq_("object-component");var debug=_dereq_("debug")("socket.io-client:manager");var indexOf=_dereq_("indexof");module.exports=Manager;function Manager(uri,opts){if(!(this instanceof Manager))return new Manager(uri,opts);if(uri&&"object"==typeof uri){opts=uri;uri=undefined}opts=opts||{};opts.path=opts.path||"/socket.io";this.nsps={};this.subs=[];this.opts=opts;this.reconnection(opts.reconnection!==false);this.reconnectionAttempts(opts.reconnectionAttempts||Infinity);this.reconnectionDelay(opts.reconnectionDelay||1e3);this.reconnectionDelayMax(opts.reconnectionDelayMax||5e3);this.timeout(null==opts.timeout?2e4:opts.timeout);this.readyState="closed";this.uri=uri;this.connected=[];this.attempts=0;this.encoding=false;this.packetBuffer=[];this.encoder=new parser.Encoder;this.decoder=new parser.Decoder;this.autoConnect=opts.autoConnect!==false;if(this.autoConnect)this.open()}Manager.prototype.emitAll=function(){this.emit.apply(this,arguments);for(var nsp in this.nsps){this.nsps[nsp].emit.apply(this.nsps[nsp],arguments)}};Emitter(Manager.prototype);Manager.prototype.reconnection=function(v){if(!arguments.length)return this._reconnection;this._reconnection=!!v;return this};Manager.prototype.reconnectionAttempts=function(v){if(!arguments.length)return this._reconnectionAttempts;this._reconnectionAttempts=v;return this};Manager.prototype.reconnectionDelay=function(v){if(!arguments.length)return this._reconnectionDelay;this._reconnectionDelay=v;return this};Manager.prototype.reconnectionDelayMax=function(v){if(!arguments.length)return this._reconnectionDelayMax;this._reconnectionDelayMax=v;return this};Manager.prototype.timeout=function(v){if(!arguments.length)return this._timeout;this._timeout=v;return this};Manager.prototype.maybeReconnectOnOpen=function(){if(!this.openReconnect&&!this.reconnecting&&this._reconnection&&this.attempts===0){this.openReconnect=true;this.reconnect()}};Manager.prototype.open=Manager.prototype.connect=function(fn){debug("readyState %s",this.readyState);if(~this.readyState.indexOf("open"))return this;debug("opening %s",this.uri);this.engine=eio(this.uri,this.opts);var socket=this.engine;var self=this;this.readyState="opening";this.skipReconnect=false;var openSub=on(socket,"open",function(){self.onopen();fn&&fn()});var errorSub=on(socket,"error",function(data){debug("connect_error");self.cleanup();self.readyState="closed";self.emitAll("connect_error",data);if(fn){var err=new Error("Connection error");err.data=data;fn(err)}self.maybeReconnectOnOpen()});if(false!==this._timeout){var timeout=this._timeout;debug("connect attempt will timeout after %d",timeout);var timer=setTimeout(function(){debug("connect attempt timed out after %d",timeout);openSub.destroy();socket.close();socket.emit("error","timeout");self.emitAll("connect_timeout",timeout)},timeout);this.subs.push({destroy:function(){clearTimeout(timer)}})}this.subs.push(openSub);this.subs.push(errorSub);return this};Manager.prototype.onopen=function(){debug("open");this.cleanup();this.readyState="open";this.emit("open");var socket=this.engine;this.subs.push(on(socket,"data",bind(this,"ondata")));this.subs.push(on(this.decoder,"decoded",bind(this,"ondecoded")));this.subs.push(on(socket,"error",bind(this,"onerror")));this.subs.push(on(socket,"close",bind(this,"onclose")))};Manager.prototype.ondata=function(data){this.decoder.add(data)};Manager.prototype.ondecoded=function(packet){this.emit("packet",packet)};Manager.prototype.onerror=function(err){debug("error",err);this.emitAll("error",err)};Manager.prototype.socket=function(nsp){var socket=this.nsps[nsp];if(!socket){socket=new Socket(this,nsp);this.nsps[nsp]=socket;var self=this;socket.on("connect",function(){if(!~indexOf(self.connected,socket)){self.connected.push(socket)}})}return socket};Manager.prototype.destroy=function(socket){var index=indexOf(this.connected,socket);if(~index)this.connected.splice(index,1);if(this.connected.length)return;this.close()};Manager.prototype.packet=function(packet){debug("writing packet %j",packet);var self=this;if(!self.encoding){self.encoding=true;this.encoder.encode(packet,function(encodedPackets){for(var i=0;i<encodedPackets.length;i++){self.engine.write(encodedPackets[i])}self.encoding=false;self.processPacketQueue()})}else{self.packetBuffer.push(packet)}};Manager.prototype.processPacketQueue=function(){if(this.packetBuffer.length>0&&!this.encoding){var pack=this.packetBuffer.shift();this.packet(pack)}};Manager.prototype.cleanup=function(){var sub;while(sub=this.subs.shift())sub.destroy();this.packetBuffer=[];this.encoding=false;this.decoder.destroy()};Manager.prototype.close=Manager.prototype.disconnect=function(){this.skipReconnect=true;this.readyState="closed";this.engine&&this.engine.close()};Manager.prototype.onclose=function(reason){debug("close");this.cleanup();this.readyState="closed";this.emit("close",reason);if(this._reconnection&&!this.skipReconnect){this.reconnect()}};Manager.prototype.reconnect=function(){if(this.reconnecting||this.skipReconnect)return this;var self=this;this.attempts++;if(this.attempts>this._reconnectionAttempts){debug("reconnect failed");this.emitAll("reconnect_failed");this.reconnecting=false}else{var delay=this.attempts*this.reconnectionDelay();delay=Math.min(delay,this.reconnectionDelayMax());debug("will wait %dms before reconnect attempt",delay);this.reconnecting=true;var timer=setTimeout(function(){if(self.skipReconnect)return;debug("attempting reconnect");self.emitAll("reconnect_attempt",self.attempts);self.emitAll("reconnecting",self.attempts);if(self.skipReconnect)return;self.open(function(err){if(err){debug("reconnect attempt error");self.reconnecting=false;self.reconnect();self.emitAll("reconnect_error",err.data)}else{debug("reconnect success");self.onreconnect()}})},delay);this.subs.push({destroy:function(){clearTimeout(timer)}})}};Manager.prototype.onreconnect=function(){var attempt=this.attempts;this.attempts=0;this.reconnecting=false;this.emitAll("reconnect",attempt)}},{"./on":4,"./socket":5,"./url":6,"component-bind":7,"component-emitter":8,debug:9,"engine.io-client":10,indexof:36,"object-component":37,"socket.io-parser":40}],4:[function(_dereq_,module,exports){module.exports=on;function on(obj,ev,fn){obj.on(ev,fn);return{destroy:function(){obj.removeListener(ev,fn)}}}},{}],5:[function(_dereq_,module,exports){var parser=_dereq_("socket.io-parser");var Emitter=_dereq_("component-emitter");var toArray=_dereq_("to-array");var on=_dereq_("./on");var bind=_dereq_("component-bind");var debug=_dereq_("debug")("socket.io-client:socket");var hasBin=_dereq_("has-binary");module.exports=exports=Socket;var events={connect:1,connect_error:1,connect_timeout:1,disconnect:1,error:1,reconnect:1,reconnect_attempt:1,reconnect_failed:1,reconnect_error:1,reconnecting:1};var emit=Emitter.prototype.emit;function Socket(io,nsp){this.io=io;this.nsp=nsp;this.json=this;this.ids=0;this.acks={};if(this.io.autoConnect)this.open();this.receiveBuffer=[];this.sendBuffer=[];this.connected=false;this.disconnected=true}Emitter(Socket.prototype);Socket.prototype.subEvents=function(){if(this.subs)return;var io=this.io;this.subs=[on(io,"open",bind(this,"onopen")),on(io,"packet",bind(this,"onpacket")),on(io,"close",bind(this,"onclose"))]};Socket.prototype.open=Socket.prototype.connect=function(){if(this.connected)return this;this.subEvents();this.io.open();if("open"==this.io.readyState)this.onopen();return this};Socket.prototype.send=function(){var args=toArray(arguments);args.unshift("message");this.emit.apply(this,args);return this};Socket.prototype.emit=function(ev){if(events.hasOwnProperty(ev)){emit.apply(this,arguments);return this}var args=toArray(arguments);var parserType=parser.EVENT;if(hasBin(args)){parserType=parser.BINARY_EVENT}var packet={type:parserType,data:args};if("function"==typeof args[args.length-1]){debug("emitting packet with ack id %d",this.ids);this.acks[this.ids]=args.pop();packet.id=this.ids++}if(this.connected){this.packet(packet)}else{this.sendBuffer.push(packet)}return this};Socket.prototype.packet=function(packet){packet.nsp=this.nsp;this.io.packet(packet)};Socket.prototype.onopen=function(){debug("transport is open - connecting");if("/"!=this.nsp){this.packet({type:parser.CONNECT})}};Socket.prototype.onclose=function(reason){debug("close (%s)",reason);this.connected=false;this.disconnected=true;this.emit("disconnect",reason)};Socket.prototype.onpacket=function(packet){if(packet.nsp!=this.nsp)return;switch(packet.type){case parser.CONNECT:this.onconnect();break;case parser.EVENT:this.onevent(packet);break;case parser.BINARY_EVENT:this.onevent(packet);break;case parser.ACK:this.onack(packet);break;case parser.BINARY_ACK:this.onack(packet);break;case parser.DISCONNECT:this.ondisconnect();break;case parser.ERROR:this.emit("error",packet.data);break}};Socket.prototype.onevent=function(packet){var args=packet.data||[];debug("emitting event %j",args);if(null!=packet.id){debug("attaching ack callback to event");args.push(this.ack(packet.id))}if(this.connected){emit.apply(this,args)}else{this.receiveBuffer.push(args)}};Socket.prototype.ack=function(id){var self=this;var sent=false;return function(){if(sent)return;sent=true;var args=toArray(arguments);debug("sending ack %j",args);var type=hasBin(args)?parser.BINARY_ACK:parser.ACK;self.packet({type:type,id:id,data:args})}};Socket.prototype.onack=function(packet){debug("calling ack %s with %j",packet.id,packet.data);var fn=this.acks[packet.id];fn.apply(this,packet.data);delete this.acks[packet.id]};Socket.prototype.onconnect=function(){this.connected=true;this.disconnected=false;this.emit("connect");this.emitBuffered()};Socket.prototype.emitBuffered=function(){var i;for(i=0;i<this.receiveBuffer.length;i++){emit.apply(this,this.receiveBuffer[i])}this.receiveBuffer=[];for(i=0;i<this.sendBuffer.length;i++){this.packet(this.sendBuffer[i])}this.sendBuffer=[]};Socket.prototype.ondisconnect=function(){debug("server disconnect (%s)",this.nsp);this.destroy();this.onclose("io server disconnect")};Socket.prototype.destroy=function(){if(this.subs){for(var i=0;i<this.subs.length;i++){this.subs[i].destroy()}this.subs=null}this.io.destroy(this)};Socket.prototype.close=Socket.prototype.disconnect=function(){if(this.connected){debug("performing disconnect (%s)",this.nsp);this.packet({type:parser.DISCONNECT})}this.destroy();if(this.connected){this.onclose("io client disconnect")}return this}},{"./on":4,"component-bind":7,"component-emitter":8,debug:9,"has-binary":32,"socket.io-parser":40,"to-array":44}],6:[function(_dereq_,module,exports){(function(global){var parseuri=_dereq_("parseuri");var debug=_dereq_("debug")("socket.io-client:url");module.exports=url;function url(uri,loc){var obj=uri;var loc=loc||global.location;if(null==uri)uri=loc.protocol+"//"+loc.hostname;if("string"==typeof uri){if("/"==uri.charAt(0)){if("/"==uri.charAt(1)){uri=loc.protocol+uri}else{uri=loc.hostname+uri}}if(!/^(https?|wss?):\/\//.test(uri)){debug("protocol-less url %s",uri);if("undefined"!=typeof loc){uri=loc.protocol+"//"+uri}else{uri="https://"+uri}}debug("parse %s",uri);obj=parseuri(uri)}if(!obj.port){if(/^(http|ws)$/.test(obj.protocol)){obj.port="80"}else if(/^(http|ws)s$/.test(obj.protocol)){obj.port="443"}}obj.path=obj.path||"/";obj.id=obj.protocol+"://"+obj.host+":"+obj.port;obj.href=obj.protocol+"://"+obj.host+(loc&&loc.port==obj.port?"":":"+obj.port);return obj}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{debug:9,parseuri:38}],7:[function(_dereq_,module,exports){var slice=[].slice;module.exports=function(obj,fn){if("string"==typeof fn)fn=obj[fn];if("function"!=typeof fn)throw new Error("bind() requires a function");var args=slice.call(arguments,2);return function(){return fn.apply(obj,args.concat(slice.call(arguments)))}}},{}],8:[function(_dereq_,module,exports){module.exports=Emitter;function Emitter(obj){if(obj)return mixin(obj)}function mixin(obj){for(var key in Emitter.prototype){obj[key]=Emitter.prototype[key]}return obj}Emitter.prototype.on=Emitter.prototype.addEventListener=function(event,fn){this._callbacks=this._callbacks||{};(this._callbacks[event]=this._callbacks[event]||[]).push(fn);return this};Emitter.prototype.once=function(event,fn){var self=this;this._callbacks=this._callbacks||{};function on(){self.off(event,on);fn.apply(this,arguments)}on.fn=fn;this.on(event,on);return this};Emitter.prototype.off=Emitter.prototype.removeListener=Emitter.prototype.removeAllListeners=Emitter.prototype.removeEventListener=function(event,fn){this._callbacks=this._callbacks||{};if(0==arguments.length){this._callbacks={};return this}var callbacks=this._callbacks[event];if(!callbacks)return this;if(1==arguments.length){delete this._callbacks[event];return this}var cb;for(var i=0;i<callbacks.length;i++){cb=callbacks[i];if(cb===fn||cb.fn===fn){callbacks.splice(i,1);break}}return this};Emitter.prototype.emit=function(event){this._callbacks=this._callbacks||{};var args=[].slice.call(arguments,1),callbacks=this._callbacks[event];if(callbacks){callbacks=callbacks.slice(0);for(var i=0,len=callbacks.length;i<len;++i){callbacks[i].apply(this,args)}}return this};Emitter.prototype.listeners=function(event){this._callbacks=this._callbacks||{};return this._callbacks[event]||[]};Emitter.prototype.hasListeners=function(event){return!!this.listeners(event).length}},{}],9:[function(_dereq_,module,exports){module.exports=debug;function debug(name){if(!debug.enabled(name))return function(){};return function(fmt){fmt=coerce(fmt);var curr=new Date;var ms=curr-(debug[name]||curr);debug[name]=curr;fmt=name+" "+fmt+" +"+debug.humanize(ms);window.console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}}debug.names=[];debug.skips=[];debug.enable=function(name){try{localStorage.debug=name}catch(e){}var split=(name||"").split(/[\s,]+/),len=split.length;for(var i=0;i<len;i++){name=split[i].replace("*",".*?");if(name[0]==="-"){debug.skips.push(new RegExp("^"+name.substr(1)+"$"))}else{debug.names.push(new RegExp("^"+name+"$"))}}};debug.disable=function(){debug.enable("")};debug.humanize=function(ms){var sec=1e3,min=60*1e3,hour=60*min;if(ms>=hour)return(ms/hour).toFixed(1)+"h";if(ms>=min)return(ms/min).toFixed(1)+"m";if(ms>=sec)return(ms/sec|0)+"s";return ms+"ms"};debug.enabled=function(name){for(var i=0,len=debug.skips.length;i<len;i++){if(debug.skips[i].test(name)){return false}}for(var i=0,len=debug.names.length;i<len;i++){if(debug.names[i].test(name)){return true}}return false};function coerce(val){if(val instanceof Error)return val.stack||val.message;return val}try{if(window.localStorage)debug.enable(localStorage.debug)}catch(e){}},{}],10:[function(_dereq_,module,exports){module.exports=_dereq_("./lib/")},{"./lib/":11}],11:[function(_dereq_,module,exports){module.exports=_dereq_("./socket");module.exports.parser=_dereq_("engine.io-parser")},{"./socket":12,"engine.io-parser":21}],12:[function(_dereq_,module,exports){(function(global){var transports=_dereq_("./transports");var Emitter=_dereq_("component-emitter");var debug=_dereq_("debug")("engine.io-client:socket");var index=_dereq_("indexof");var parser=_dereq_("engine.io-parser");var parseuri=_dereq_("parseuri");var parsejson=_dereq_("parsejson");var parseqs=_dereq_("parseqs");module.exports=Socket;function noop(){}function Socket(uri,opts){if(!(this instanceof Socket))return new Socket(uri,opts);opts=opts||{};if(uri&&"object"==typeof uri){opts=uri;uri=null}if(uri){uri=parseuri(uri);opts.host=uri.host;opts.secure=uri.protocol=="https"||uri.protocol=="wss";opts.port=uri.port;if(uri.query)opts.query=uri.query}this.secure=null!=opts.secure?opts.secure:global.location&&"https:"==location.protocol;if(opts.host){var pieces=opts.host.split(":");opts.hostname=pieces.shift();if(pieces.length)opts.port=pieces.pop()}this.agent=opts.agent||false;this.hostname=opts.hostname||(global.location?location.hostname:"localhost");this.port=opts.port||(global.location&&location.port?location.port:this.secure?443:80);this.query=opts.query||{};if("string"==typeof this.query)this.query=parseqs.decode(this.query);this.upgrade=false!==opts.upgrade;this.path=(opts.path||"/engine.io").replace(/\/$/,"")+"/";this.forceJSONP=!!opts.forceJSONP;this.jsonp=false!==opts.jsonp;this.forceBase64=!!opts.forceBase64;this.enablesXDR=!!opts.enablesXDR;this.timestampParam=opts.timestampParam||"t";this.timestampRequests=opts.timestampRequests;this.transports=opts.transports||["polling","websocket"];this.readyState="";this.writeBuffer=[];this.callbackBuffer=[];this.policyPort=opts.policyPort||843;this.rememberUpgrade=opts.rememberUpgrade||false;this.open();this.binaryType=null;this.onlyBinaryUpgrades=opts.onlyBinaryUpgrades}Socket.priorWebsocketSuccess=false;Emitter(Socket.prototype);Socket.protocol=parser.protocol;Socket.Socket=Socket;Socket.Transport=_dereq_("./transport");Socket.transports=_dereq_("./transports");Socket.parser=_dereq_("engine.io-parser");Socket.prototype.createTransport=function(name){debug('creating transport "%s"',name);var query=clone(this.query);query.EIO=parser.protocol;query.transport=name;if(this.id)query.sid=this.id;var transport=new transports[name]({agent:this.agent,hostname:this.hostname,port:this.port,secure:this.secure,path:this.path,query:query,forceJSONP:this.forceJSONP,jsonp:this.jsonp,forceBase64:this.forceBase64,enablesXDR:this.enablesXDR,timestampRequests:this.timestampRequests,timestampParam:this.timestampParam,policyPort:this.policyPort,socket:this});return transport};function clone(obj){var o={};for(var i in obj){if(obj.hasOwnProperty(i)){o[i]=obj[i]}}return o}Socket.prototype.open=function(){var transport;if(this.rememberUpgrade&&Socket.priorWebsocketSuccess&&this.transports.indexOf("websocket")!=-1){transport="websocket"}else if(0==this.transports.length){var self=this;setTimeout(function(){self.emit("error","No transports available")},0);return}else{transport=this.transports[0]}this.readyState="opening";var transport;try{transport=this.createTransport(transport)}catch(e){this.transports.shift();this.open();return}transport.open();this.setTransport(transport)};Socket.prototype.setTransport=function(transport){debug("setting transport %s",transport.name);var self=this;if(this.transport){debug("clearing existing transport %s",this.transport.name);this.transport.removeAllListeners()}this.transport=transport;transport.on("drain",function(){self.onDrain()}).on("packet",function(packet){self.onPacket(packet)}).on("error",function(e){self.onError(e)}).on("close",function(){self.onClose("transport close")})};Socket.prototype.probe=function(name){debug('probing transport "%s"',name);var transport=this.createTransport(name,{probe:1}),failed=false,self=this;Socket.priorWebsocketSuccess=false;function onTransportOpen(){if(self.onlyBinaryUpgrades){var upgradeLosesBinary=!this.supportsBinary&&self.transport.supportsBinary;failed=failed||upgradeLosesBinary}if(failed)return;debug('probe transport "%s" opened',name);transport.send([{type:"ping",data:"probe"}]);transport.once("packet",function(msg){if(failed)return;if("pong"==msg.type&&"probe"==msg.data){debug('probe transport "%s" pong',name);self.upgrading=true;self.emit("upgrading",transport);if(!transport)return;Socket.priorWebsocketSuccess="websocket"==transport.name;debug('pausing current transport "%s"',self.transport.name);self.transport.pause(function(){if(failed)return;if("closed"==self.readyState)return;debug("changing transport and sending upgrade packet");cleanup();self.setTransport(transport);transport.send([{type:"upgrade"}]);self.emit("upgrade",transport);transport=null;self.upgrading=false;self.flush()})}else{debug('probe transport "%s" failed',name);var err=new Error("probe error");err.transport=transport.name;self.emit("upgradeError",err)}})}function freezeTransport(){if(failed)return;failed=true;cleanup();transport.close();transport=null}function onerror(err){var error=new Error("probe error: "+err);error.transport=transport.name;freezeTransport();debug('probe transport "%s" failed because of error: %s',name,err);self.emit("upgradeError",error)}function onTransportClose(){onerror("transport closed")}function onclose(){onerror("socket closed")}function onupgrade(to){if(transport&&to.name!=transport.name){debug('"%s" works - aborting "%s"',to.name,transport.name);freezeTransport()}}function cleanup(){transport.removeListener("open",onTransportOpen);transport.removeListener("error",onerror);transport.removeListener("close",onTransportClose);self.removeListener("close",onclose);self.removeListener("upgrading",onupgrade)}transport.once("open",onTransportOpen);transport.once("error",onerror);transport.once("close",onTransportClose);this.once("close",onclose);this.once("upgrading",onupgrade);transport.open()};Socket.prototype.onOpen=function(){debug("socket open");this.readyState="open";Socket.priorWebsocketSuccess="websocket"==this.transport.name;this.emit("open");this.flush();if("open"==this.readyState&&this.upgrade&&this.transport.pause){debug("starting upgrade probes");for(var i=0,l=this.upgrades.length;i<l;i++){this.probe(this.upgrades[i])}}};Socket.prototype.onPacket=function(packet){if("opening"==this.readyState||"open"==this.readyState){debug('socket receive: type "%s", data "%s"',packet.type,packet.data);this.emit("packet",packet);this.emit("heartbeat");switch(packet.type){case"open":this.onHandshake(parsejson(packet.data));break;case"pong":this.setPing();break;case"error":var err=new Error("server error");err.code=packet.data;this.emit("error",err);break;case"message":this.emit("data",packet.data);this.emit("message",packet.data);break}}else{debug('packet received with socket readyState "%s"',this.readyState)}};Socket.prototype.onHandshake=function(data){this.emit("handshake",data);this.id=data.sid;this.transport.query.sid=data.sid;this.upgrades=this.filterUpgrades(data.upgrades);this.pingInterval=data.pingInterval;this.pingTimeout=data.pingTimeout;this.onOpen();if("closed"==this.readyState)return;this.setPing();this.removeListener("heartbeat",this.onHeartbeat);this.on("heartbeat",this.onHeartbeat)};Socket.prototype.onHeartbeat=function(timeout){clearTimeout(this.pingTimeoutTimer);var self=this;self.pingTimeoutTimer=setTimeout(function(){if("closed"==self.readyState)return;self.onClose("ping timeout")},timeout||self.pingInterval+self.pingTimeout)};Socket.prototype.setPing=function(){var self=this;clearTimeout(self.pingIntervalTimer);self.pingIntervalTimer=setTimeout(function(){debug("writing ping packet - expecting pong within %sms",self.pingTimeout);self.ping();self.onHeartbeat(self.pingTimeout)},self.pingInterval)};Socket.prototype.ping=function(){this.sendPacket("ping")};Socket.prototype.onDrain=function(){for(var i=0;i<this.prevBufferLen;i++){if(this.callbackBuffer[i]){this.callbackBuffer[i]()}}this.writeBuffer.splice(0,this.prevBufferLen);this.callbackBuffer.splice(0,this.prevBufferLen);this.prevBufferLen=0;if(this.writeBuffer.length==0){this.emit("drain")}else{this.flush()}};Socket.prototype.flush=function(){if("closed"!=this.readyState&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){debug("flushing %d packets in socket",this.writeBuffer.length);this.transport.send(this.writeBuffer);this.prevBufferLen=this.writeBuffer.length;this.emit("flush")}};Socket.prototype.write=Socket.prototype.send=function(msg,fn){this.sendPacket("message",msg,fn);return this};Socket.prototype.sendPacket=function(type,data,fn){if("closing"==this.readyState||"closed"==this.readyState){return}var packet={type:type,data:data};this.emit("packetCreate",packet);this.writeBuffer.push(packet);this.callbackBuffer.push(fn);this.flush()};Socket.prototype.close=function(){if("opening"==this.readyState||"open"==this.readyState){this.readyState="closing";var self=this;function close(){self.onClose("forced close");debug("socket closing - telling transport to close");self.transport.close()}function cleanupAndClose(){self.removeListener("upgrade",cleanupAndClose);self.removeListener("upgradeError",cleanupAndClose);close()}function waitForUpgrade(){self.once("upgrade",cleanupAndClose);self.once("upgradeError",cleanupAndClose)}if(this.writeBuffer.length){this.once("drain",function(){if(this.upgrading){waitForUpgrade()}else{close()}})}else if(this.upgrading){waitForUpgrade()}else{close()}}return this};Socket.prototype.onError=function(err){debug("socket error %j",err);Socket.priorWebsocketSuccess=false;this.emit("error",err);this.onClose("transport error",err)};Socket.prototype.onClose=function(reason,desc){if("opening"==this.readyState||"open"==this.readyState||"closing"==this.readyState){debug('socket close with reason: "%s"',reason);var self=this;clearTimeout(this.pingIntervalTimer);clearTimeout(this.pingTimeoutTimer);setTimeout(function(){self.writeBuffer=[];self.callbackBuffer=[];self.prevBufferLen=0},0);this.transport.removeAllListeners("close");this.transport.close();this.transport.removeAllListeners();this.readyState="closed";this.id=null;this.emit("close",reason,desc)}};Socket.prototype.filterUpgrades=function(upgrades){var filteredUpgrades=[];for(var i=0,j=upgrades.length;i<j;i++){if(~index(this.transports,upgrades[i]))filteredUpgrades.push(upgrades[i])}return filteredUpgrades}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./transport":13,"./transports":14,"component-emitter":8,debug:9,"engine.io-parser":21,indexof:36,parsejson:28,parseqs:29,parseuri:30}],13:[function(_dereq_,module,exports){var parser=_dereq_("engine.io-parser");var Emitter=_dereq_("component-emitter");module.exports=Transport;function Transport(opts){this.path=opts.path;this.hostname=opts.hostname;this.port=opts.port;this.secure=opts.secure;this.query=opts.query;this.timestampParam=opts.timestampParam;this.timestampRequests=opts.timestampRequests;this.readyState="";this.agent=opts.agent||false;this.socket=opts.socket;this.enablesXDR=opts.enablesXDR}Emitter(Transport.prototype);Transport.timestamps=0;Transport.prototype.onError=function(msg,desc){var err=new Error(msg);err.type="TransportError";err.description=desc;this.emit("error",err);return this};Transport.prototype.open=function(){if("closed"==this.readyState||""==this.readyState){this.readyState="opening";this.doOpen()}return this};Transport.prototype.close=function(){if("opening"==this.readyState||"open"==this.readyState){this.doClose();this.onClose()}return this};Transport.prototype.send=function(packets){if("open"==this.readyState){this.write(packets)}else{throw new Error("Transport not open")}};Transport.prototype.onOpen=function(){this.readyState="open";this.writable=true;this.emit("open")};Transport.prototype.onData=function(data){var packet=parser.decodePacket(data,this.socket.binaryType);this.onPacket(packet)};Transport.prototype.onPacket=function(packet){this.emit("packet",packet)};Transport.prototype.onClose=function(){this.readyState="closed";this.emit("close")}},{"component-emitter":8,"engine.io-parser":21}],14:[function(_dereq_,module,exports){(function(global){var XMLHttpRequest=_dereq_("xmlhttprequest");var XHR=_dereq_("./polling-xhr");var JSONP=_dereq_("./polling-jsonp");var websocket=_dereq_("./websocket");exports.polling=polling;exports.websocket=websocket;function polling(opts){var xhr;var xd=false;var xs=false;var jsonp=false!==opts.jsonp;if(global.location){var isSSL="https:"==location.protocol;var port=location.port;if(!port){port=isSSL?443:80}xd=opts.hostname!=location.hostname||port!=opts.port;xs=opts.secure!=isSSL}opts.xdomain=xd;opts.xscheme=xs;xhr=new XMLHttpRequest(opts);if("open"in xhr&&!opts.forceJSONP){return new XHR(opts)}else{if(!jsonp)throw new Error("JSONP disabled");return new JSONP(opts)}}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./polling-jsonp":15,"./polling-xhr":16,"./websocket":18,xmlhttprequest:19}],15:[function(_dereq_,module,exports){(function(global){var Polling=_dereq_("./polling");var inherit=_dereq_("component-inherit");module.exports=JSONPPolling;var rNewline=/\n/g;var rEscapedNewline=/\\n/g;var callbacks;var index=0;function empty(){}function JSONPPolling(opts){Polling.call(this,opts);this.query=this.query||{};if(!callbacks){if(!global.___eio)global.___eio=[];callbacks=global.___eio}this.index=callbacks.length;var self=this;callbacks.push(function(msg){self.onData(msg)});this.query.j=this.index;if(global.document&&global.addEventListener){global.addEventListener("beforeunload",function(){if(self.script)self.script.onerror=empty})}}inherit(JSONPPolling,Polling);JSONPPolling.prototype.supportsBinary=false;JSONPPolling.prototype.doClose=function(){if(this.script){this.script.parentNode.removeChild(this.script);this.script=null}if(this.form){this.form.parentNode.removeChild(this.form);this.form=null;this.iframe=null}Polling.prototype.doClose.call(this)};JSONPPolling.prototype.doPoll=function(){var self=this;var script=document.createElement("script");if(this.script){this.script.parentNode.removeChild(this.script);this.script=null}script.async=true;script.src=this.uri();script.onerror=function(e){self.onError("jsonp poll error",e)};var insertAt=document.getElementsByTagName("script")[0];insertAt.parentNode.insertBefore(script,insertAt);this.script=script;var isUAgecko="undefined"!=typeof navigator&&/gecko/i.test(navigator.userAgent);if(isUAgecko){setTimeout(function(){var iframe=document.createElement("iframe");document.body.appendChild(iframe);document.body.removeChild(iframe)},100)}};JSONPPolling.prototype.doWrite=function(data,fn){var self=this;if(!this.form){var form=document.createElement("form");var area=document.createElement("textarea");var id=this.iframeId="eio_iframe_"+this.index;var iframe;form.className="socketio";form.style.position="absolute";form.style.top="-1000px";form.style.left="-1000px";form.target=id;form.method="POST";form.setAttribute("accept-charset","utf-8");area.name="d";form.appendChild(area);document.body.appendChild(form);this.form=form;this.area=area}this.form.action=this.uri();function complete(){initIframe();fn()}function initIframe(){if(self.iframe){try{self.form.removeChild(self.iframe)
}catch(e){self.onError("jsonp polling iframe removal error",e)}}try{var html='<iframe src="javascript:0" name="'+self.iframeId+'">';iframe=document.createElement(html)}catch(e){iframe=document.createElement("iframe");iframe.name=self.iframeId;iframe.src="javascript:0"}iframe.id=self.iframeId;self.form.appendChild(iframe);self.iframe=iframe}initIframe();data=data.replace(rEscapedNewline,"\\\n");this.area.value=data.replace(rNewline,"\\n");try{this.form.submit()}catch(e){}if(this.iframe.attachEvent){this.iframe.onreadystatechange=function(){if(self.iframe.readyState=="complete"){complete()}}}else{this.iframe.onload=complete}}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./polling":17,"component-inherit":20}],16:[function(_dereq_,module,exports){(function(global){var XMLHttpRequest=_dereq_("xmlhttprequest");var Polling=_dereq_("./polling");var Emitter=_dereq_("component-emitter");var inherit=_dereq_("component-inherit");var debug=_dereq_("debug")("engine.io-client:polling-xhr");module.exports=XHR;module.exports.Request=Request;function empty(){}function XHR(opts){Polling.call(this,opts);if(global.location){var isSSL="https:"==location.protocol;var port=location.port;if(!port){port=isSSL?443:80}this.xd=opts.hostname!=global.location.hostname||port!=opts.port;this.xs=opts.secure!=isSSL}}inherit(XHR,Polling);XHR.prototype.supportsBinary=true;XHR.prototype.request=function(opts){opts=opts||{};opts.uri=this.uri();opts.xd=this.xd;opts.xs=this.xs;opts.agent=this.agent||false;opts.supportsBinary=this.supportsBinary;opts.enablesXDR=this.enablesXDR;return new Request(opts)};XHR.prototype.doWrite=function(data,fn){var isBinary=typeof data!=="string"&&data!==undefined;var req=this.request({method:"POST",data:data,isBinary:isBinary});var self=this;req.on("success",fn);req.on("error",function(err){self.onError("xhr post error",err)});this.sendXhr=req};XHR.prototype.doPoll=function(){debug("xhr poll");var req=this.request();var self=this;req.on("data",function(data){self.onData(data)});req.on("error",function(err){self.onError("xhr poll error",err)});this.pollXhr=req};function Request(opts){this.method=opts.method||"GET";this.uri=opts.uri;this.xd=!!opts.xd;this.xs=!!opts.xs;this.async=false!==opts.async;this.data=undefined!=opts.data?opts.data:null;this.agent=opts.agent;this.isBinary=opts.isBinary;this.supportsBinary=opts.supportsBinary;this.enablesXDR=opts.enablesXDR;this.create()}Emitter(Request.prototype);Request.prototype.create=function(){var xhr=this.xhr=new XMLHttpRequest({agent:this.agent,xdomain:this.xd,xscheme:this.xs,enablesXDR:this.enablesXDR});var self=this;try{debug("xhr open %s: %s",this.method,this.uri);xhr.open(this.method,this.uri,this.async);if(this.supportsBinary){xhr.responseType="arraybuffer"}if("POST"==this.method){try{if(this.isBinary){xhr.setRequestHeader("Content-type","application/octet-stream")}else{xhr.setRequestHeader("Content-type","text/plain;charset=UTF-8")}}catch(e){}}if("withCredentials"in xhr){xhr.withCredentials=true}if(this.hasXDR()){xhr.onload=function(){self.onLoad()};xhr.onerror=function(){self.onError(xhr.responseText)}}else{xhr.onreadystatechange=function(){if(4!=xhr.readyState)return;if(200==xhr.status||1223==xhr.status){self.onLoad()}else{setTimeout(function(){self.onError(xhr.status)},0)}}}debug("xhr data %s",this.data);xhr.send(this.data)}catch(e){setTimeout(function(){self.onError(e)},0);return}if(global.document){this.index=Request.requestsCount++;Request.requests[this.index]=this}};Request.prototype.onSuccess=function(){this.emit("success");this.cleanup()};Request.prototype.onData=function(data){this.emit("data",data);this.onSuccess()};Request.prototype.onError=function(err){this.emit("error",err);this.cleanup()};Request.prototype.cleanup=function(){if("undefined"==typeof this.xhr||null===this.xhr){return}if(this.hasXDR()){this.xhr.onload=this.xhr.onerror=empty}else{this.xhr.onreadystatechange=empty}try{this.xhr.abort()}catch(e){}if(global.document){delete Request.requests[this.index]}this.xhr=null};Request.prototype.onLoad=function(){var data;try{var contentType;try{contentType=this.xhr.getResponseHeader("Content-Type").split(";")[0]}catch(e){}if(contentType==="application/octet-stream"){data=this.xhr.response}else{if(!this.supportsBinary){data=this.xhr.responseText}else{data="ok"}}}catch(e){this.onError(e)}if(null!=data){this.onData(data)}};Request.prototype.hasXDR=function(){return"undefined"!==typeof global.XDomainRequest&&!this.xs&&this.enablesXDR};Request.prototype.abort=function(){this.cleanup()};if(global.document){Request.requestsCount=0;Request.requests={};if(global.attachEvent){global.attachEvent("onunload",unloadHandler)}else if(global.addEventListener){global.addEventListener("beforeunload",unloadHandler)}}function unloadHandler(){for(var i in Request.requests){if(Request.requests.hasOwnProperty(i)){Request.requests[i].abort()}}}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./polling":17,"component-emitter":8,"component-inherit":20,debug:9,xmlhttprequest:19}],17:[function(_dereq_,module,exports){var Transport=_dereq_("../transport");var parseqs=_dereq_("parseqs");var parser=_dereq_("engine.io-parser");var inherit=_dereq_("component-inherit");var debug=_dereq_("debug")("engine.io-client:polling");module.exports=Polling;var hasXHR2=function(){var XMLHttpRequest=_dereq_("xmlhttprequest");var xhr=new XMLHttpRequest({xdomain:false});return null!=xhr.responseType}();function Polling(opts){var forceBase64=opts&&opts.forceBase64;if(!hasXHR2||forceBase64){this.supportsBinary=false}Transport.call(this,opts)}inherit(Polling,Transport);Polling.prototype.name="polling";Polling.prototype.doOpen=function(){this.poll()};Polling.prototype.pause=function(onPause){var pending=0;var self=this;this.readyState="pausing";function pause(){debug("paused");self.readyState="paused";onPause()}if(this.polling||!this.writable){var total=0;if(this.polling){debug("we are currently polling - waiting to pause");total++;this.once("pollComplete",function(){debug("pre-pause polling complete");--total||pause()})}if(!this.writable){debug("we are currently writing - waiting to pause");total++;this.once("drain",function(){debug("pre-pause writing complete");--total||pause()})}}else{pause()}};Polling.prototype.poll=function(){debug("polling");this.polling=true;this.doPoll();this.emit("poll")};Polling.prototype.onData=function(data){var self=this;debug("polling got data %s",data);var callback=function(packet,index,total){if("opening"==self.readyState){self.onOpen()}if("close"==packet.type){self.onClose();return false}self.onPacket(packet)};parser.decodePayload(data,this.socket.binaryType,callback);if("closed"!=this.readyState){this.polling=false;this.emit("pollComplete");if("open"==this.readyState){this.poll()}else{debug('ignoring poll - transport state "%s"',this.readyState)}}};Polling.prototype.doClose=function(){var self=this;function close(){debug("writing close packet");self.write([{type:"close"}])}if("open"==this.readyState){debug("transport open - closing");close()}else{debug("transport not open - deferring close");this.once("open",close)}};Polling.prototype.write=function(packets){var self=this;this.writable=false;var callbackfn=function(){self.writable=true;self.emit("drain")};var self=this;parser.encodePayload(packets,this.supportsBinary,function(data){self.doWrite(data,callbackfn)})};Polling.prototype.uri=function(){var query=this.query||{};var schema=this.secure?"https":"http";var port="";if(false!==this.timestampRequests){query[this.timestampParam]=+new Date+"-"+Transport.timestamps++}if(!this.supportsBinary&&!query.sid){query.b64=1}query=parseqs.encode(query);if(this.port&&("https"==schema&&this.port!=443||"http"==schema&&this.port!=80)){port=":"+this.port}if(query.length){query="?"+query}return schema+"://"+this.hostname+port+this.path+query}},{"../transport":13,"component-inherit":20,debug:9,"engine.io-parser":21,parseqs:29,xmlhttprequest:19}],18:[function(_dereq_,module,exports){var Transport=_dereq_("../transport");var parser=_dereq_("engine.io-parser");var parseqs=_dereq_("parseqs");var inherit=_dereq_("component-inherit");var debug=_dereq_("debug")("engine.io-client:websocket");var WebSocket=_dereq_("ws");module.exports=WS;function WS(opts){var forceBase64=opts&&opts.forceBase64;if(forceBase64){this.supportsBinary=false}Transport.call(this,opts)}inherit(WS,Transport);WS.prototype.name="websocket";WS.prototype.supportsBinary=true;WS.prototype.doOpen=function(){if(!this.check()){return}var self=this;var uri=this.uri();var protocols=void 0;var opts={agent:this.agent};this.ws=new WebSocket(uri,protocols,opts);if(this.ws.binaryType===undefined){this.supportsBinary=false}this.ws.binaryType="arraybuffer";this.addEventListeners()};WS.prototype.addEventListeners=function(){var self=this;this.ws.onopen=function(){self.onOpen()};this.ws.onclose=function(){self.onClose()};this.ws.onmessage=function(ev){self.onData(ev.data)};this.ws.onerror=function(e){self.onError("websocket error",e)}};if("undefined"!=typeof navigator&&/iPad|iPhone|iPod/i.test(navigator.userAgent)){WS.prototype.onData=function(data){var self=this;setTimeout(function(){Transport.prototype.onData.call(self,data)},0)}}WS.prototype.write=function(packets){var self=this;this.writable=false;for(var i=0,l=packets.length;i<l;i++){parser.encodePacket(packets[i],this.supportsBinary,function(data){try{self.ws.send(data)}catch(e){debug("websocket closed before onclose event")}})}function ondrain(){self.writable=true;self.emit("drain")}setTimeout(ondrain,0)};WS.prototype.onClose=function(){Transport.prototype.onClose.call(this)};WS.prototype.doClose=function(){if(typeof this.ws!=="undefined"){this.ws.close()}};WS.prototype.uri=function(){var query=this.query||{};var schema=this.secure?"wss":"ws";var port="";if(this.port&&("wss"==schema&&this.port!=443||"ws"==schema&&this.port!=80)){port=":"+this.port}if(this.timestampRequests){query[this.timestampParam]=+new Date}if(!this.supportsBinary){query.b64=1}query=parseqs.encode(query);if(query.length){query="?"+query}return schema+"://"+this.hostname+port+this.path+query};WS.prototype.check=function(){return!!WebSocket&&!("__initialize"in WebSocket&&this.name===WS.prototype.name)}},{"../transport":13,"component-inherit":20,debug:9,"engine.io-parser":21,parseqs:29,ws:31}],19:[function(_dereq_,module,exports){var hasCORS=_dereq_("has-cors");module.exports=function(opts){var xdomain=opts.xdomain;var xscheme=opts.xscheme;var enablesXDR=opts.enablesXDR;try{if("undefined"!=typeof XMLHttpRequest&&(!xdomain||hasCORS)){return new XMLHttpRequest}}catch(e){}try{if("undefined"!=typeof XDomainRequest&&!xscheme&&enablesXDR){return new XDomainRequest}}catch(e){}if(!xdomain){try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}}}},{"has-cors":34}],20:[function(_dereq_,module,exports){module.exports=function(a,b){var fn=function(){};fn.prototype=b.prototype;a.prototype=new fn;a.prototype.constructor=a}},{}],21:[function(_dereq_,module,exports){(function(global){var keys=_dereq_("./keys");var sliceBuffer=_dereq_("arraybuffer.slice");var base64encoder=_dereq_("base64-arraybuffer");var after=_dereq_("after");var utf8=_dereq_("utf8");var isAndroid=navigator.userAgent.match(/Android/i);exports.protocol=3;var packets=exports.packets={open:0,close:1,ping:2,pong:3,message:4,upgrade:5,noop:6};var packetslist=keys(packets);var err={type:"error",data:"parser error"};var Blob=_dereq_("blob");exports.encodePacket=function(packet,supportsBinary,utf8encode,callback){if("function"==typeof supportsBinary){callback=supportsBinary;supportsBinary=false}if("function"==typeof utf8encode){callback=utf8encode;utf8encode=null}var data=packet.data===undefined?undefined:packet.data.buffer||packet.data;if(global.ArrayBuffer&&data instanceof ArrayBuffer){return encodeArrayBuffer(packet,supportsBinary,callback)}else if(Blob&&data instanceof global.Blob){return encodeBlob(packet,supportsBinary,callback)}var encoded=packets[packet.type];if(undefined!==packet.data){encoded+=utf8encode?utf8.encode(String(packet.data)):String(packet.data)}return callback(""+encoded)};function encodeArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback)}var data=packet.data;var contentArray=new Uint8Array(data);var resultBuffer=new Uint8Array(1+data.byteLength);resultBuffer[0]=packets[packet.type];for(var i=0;i<contentArray.length;i++){resultBuffer[i+1]=contentArray[i]}return callback(resultBuffer.buffer)}function encodeBlobAsArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback)}var fr=new FileReader;fr.onload=function(){packet.data=fr.result;exports.encodePacket(packet,supportsBinary,true,callback)};return fr.readAsArrayBuffer(packet.data)}function encodeBlob(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback)}if(isAndroid){return encodeBlobAsArrayBuffer(packet,supportsBinary,callback)}var length=new Uint8Array(1);length[0]=packets[packet.type];var blob=new Blob([length.buffer,packet.data]);return callback(blob)}exports.encodeBase64Packet=function(packet,callback){var message="b"+exports.packets[packet.type];if(Blob&&packet.data instanceof Blob){var fr=new FileReader;fr.onload=function(){var b64=fr.result.split(",")[1];callback(message+b64)};return fr.readAsDataURL(packet.data)}var b64data;try{b64data=String.fromCharCode.apply(null,new Uint8Array(packet.data))}catch(e){var typed=new Uint8Array(packet.data);var basic=new Array(typed.length);for(var i=0;i<typed.length;i++){basic[i]=typed[i]}b64data=String.fromCharCode.apply(null,basic)}message+=global.btoa(b64data);return callback(message)};exports.decodePacket=function(data,binaryType,utf8decode){if(typeof data=="string"||data===undefined){if(data.charAt(0)=="b"){return exports.decodeBase64Packet(data.substr(1),binaryType)}if(utf8decode){try{data=utf8.decode(data)}catch(e){return err}}var type=data.charAt(0);if(Number(type)!=type||!packetslist[type]){return err}if(data.length>1){return{type:packetslist[type],data:data.substring(1)}}else{return{type:packetslist[type]}}}var asArray=new Uint8Array(data);var type=asArray[0];var rest=sliceBuffer(data,1);if(Blob&&binaryType==="blob"){rest=new Blob([rest])}return{type:packetslist[type],data:rest}};exports.decodeBase64Packet=function(msg,binaryType){var type=packetslist[msg.charAt(0)];if(!global.ArrayBuffer){return{type:type,data:{base64:true,data:msg.substr(1)}}}var data=base64encoder.decode(msg.substr(1));if(binaryType==="blob"&&Blob){data=new Blob([data])}return{type:type,data:data}};exports.encodePayload=function(packets,supportsBinary,callback){if(typeof supportsBinary=="function"){callback=supportsBinary;supportsBinary=null}if(supportsBinary){if(Blob&&!isAndroid){return exports.encodePayloadAsBlob(packets,callback)}return exports.encodePayloadAsArrayBuffer(packets,callback)}if(!packets.length){return callback("0:")}function setLengthHeader(message){return message.length+":"+message}function encodeOne(packet,doneCallback){exports.encodePacket(packet,supportsBinary,true,function(message){doneCallback(null,setLengthHeader(message))})}map(packets,encodeOne,function(err,results){return callback(results.join(""))})};function map(ary,each,done){var result=new Array(ary.length);var next=after(ary.length,done);var eachWithIndex=function(i,el,cb){each(el,function(error,msg){result[i]=msg;cb(error,result)})};for(var i=0;i<ary.length;i++){eachWithIndex(i,ary[i],next)}}exports.decodePayload=function(data,binaryType,callback){if(typeof data!="string"){return exports.decodePayloadAsBinary(data,binaryType,callback)}if(typeof binaryType==="function"){callback=binaryType;binaryType=null}var packet;if(data==""){return callback(err,0,1)}var length="",n,msg;for(var i=0,l=data.length;i<l;i++){var chr=data.charAt(i);if(":"!=chr){length+=chr}else{if(""==length||length!=(n=Number(length))){return callback(err,0,1)}msg=data.substr(i+1,n);if(length!=msg.length){return callback(err,0,1)}if(msg.length){packet=exports.decodePacket(msg,binaryType,true);if(err.type==packet.type&&err.data==packet.data){return callback(err,0,1)}var ret=callback(packet,i+n,l);if(false===ret)return}i+=n;length=""}}if(length!=""){return callback(err,0,1)}};exports.encodePayloadAsArrayBuffer=function(packets,callback){if(!packets.length){return callback(new ArrayBuffer(0))}function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,true,function(data){return doneCallback(null,data)})}map(packets,encodeOne,function(err,encodedPackets){var totalLength=encodedPackets.reduce(function(acc,p){var len;if(typeof p==="string"){len=p.length}else{len=p.byteLength}return acc+len.toString().length+len+2},0);var resultArray=new Uint8Array(totalLength);var bufferIndex=0;encodedPackets.forEach(function(p){var isString=typeof p==="string";var ab=p;if(isString){var view=new Uint8Array(p.length);for(var i=0;i<p.length;i++){view[i]=p.charCodeAt(i)}ab=view.buffer}if(isString){resultArray[bufferIndex++]=0}else{resultArray[bufferIndex++]=1}var lenStr=ab.byteLength.toString();for(var i=0;i<lenStr.length;i++){resultArray[bufferIndex++]=parseInt(lenStr[i])}resultArray[bufferIndex++]=255;var view=new Uint8Array(ab);for(var i=0;i<view.length;i++){resultArray[bufferIndex++]=view[i]}});return callback(resultArray.buffer)})};exports.encodePayloadAsBlob=function(packets,callback){function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,true,function(encoded){var binaryIdentifier=new Uint8Array(1);binaryIdentifier[0]=1;if(typeof encoded==="string"){var view=new Uint8Array(encoded.length);for(var i=0;i<encoded.length;i++){view[i]=encoded.charCodeAt(i)}encoded=view.buffer;binaryIdentifier[0]=0}var len=encoded instanceof ArrayBuffer?encoded.byteLength:encoded.size;var lenStr=len.toString();var lengthAry=new Uint8Array(lenStr.length+1);for(var i=0;i<lenStr.length;i++){lengthAry[i]=parseInt(lenStr[i])}lengthAry[lenStr.length]=255;if(Blob){var blob=new Blob([binaryIdentifier.buffer,lengthAry.buffer,encoded]);doneCallback(null,blob)}})}map(packets,encodeOne,function(err,results){return callback(new Blob(results))})};exports.decodePayloadAsBinary=function(data,binaryType,callback){if(typeof binaryType==="function"){callback=binaryType;binaryType=null}var bufferTail=data;var buffers=[];var numberTooLong=false;while(bufferTail.byteLength>0){var tailArray=new Uint8Array(bufferTail);var isString=tailArray[0]===0;var msgLength="";for(var i=1;;i++){if(tailArray[i]==255)break;if(msgLength.length>310){numberTooLong=true;break}msgLength+=tailArray[i]}if(numberTooLong)return callback(err,0,1);bufferTail=sliceBuffer(bufferTail,2+msgLength.length);msgLength=parseInt(msgLength);var msg=sliceBuffer(bufferTail,0,msgLength);if(isString){try{msg=String.fromCharCode.apply(null,new Uint8Array(msg))}catch(e){var typed=new Uint8Array(msg);msg="";for(var i=0;i<typed.length;i++){msg+=String.fromCharCode(typed[i])}}}buffers.push(msg);bufferTail=sliceBuffer(bufferTail,msgLength)}var total=buffers.length;buffers.forEach(function(buffer,i){callback(exports.decodePacket(buffer,binaryType,true),i,total)})}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./keys":22,after:23,"arraybuffer.slice":24,"base64-arraybuffer":25,blob:26,utf8:27}],22:[function(_dereq_,module,exports){module.exports=Object.keys||function keys(obj){var arr=[];var has=Object.prototype.hasOwnProperty;for(var i in obj){if(has.call(obj,i)){arr.push(i)}}return arr}},{}],23:[function(_dereq_,module,exports){module.exports=after;function after(count,callback,err_cb){var bail=false;err_cb=err_cb||noop;proxy.count=count;return count===0?callback():proxy;function proxy(err,result){if(proxy.count<=0){throw new Error("after called too many times")}--proxy.count;if(err){bail=true;callback(err);callback=err_cb}else if(proxy.count===0&&!bail){callback(null,result)}}}function noop(){}},{}],24:[function(_dereq_,module,exports){module.exports=function(arraybuffer,start,end){var bytes=arraybuffer.byteLength;start=start||0;end=end||bytes;if(arraybuffer.slice){return arraybuffer.slice(start,end)}if(start<0){start+=bytes}if(end<0){end+=bytes}if(end>bytes){end=bytes}if(start>=bytes||start>=end||bytes===0){return new ArrayBuffer(0)}var abv=new Uint8Array(arraybuffer);var result=new Uint8Array(end-start);for(var i=start,ii=0;i<end;i++,ii++){result[ii]=abv[i]}return result.buffer}},{}],25:[function(_dereq_,module,exports){(function(chars){"use strict";exports.encode=function(arraybuffer){var bytes=new Uint8Array(arraybuffer),i,len=bytes.length,base64="";for(i=0;i<len;i+=3){base64+=chars[bytes[i]>>2];base64+=chars[(bytes[i]&3)<<4|bytes[i+1]>>4];base64+=chars[(bytes[i+1]&15)<<2|bytes[i+2]>>6];base64+=chars[bytes[i+2]&63]}if(len%3===2){base64=base64.substring(0,base64.length-1)+"="}else if(len%3===1){base64=base64.substring(0,base64.length-2)+"=="}return base64};exports.decode=function(base64){var bufferLength=base64.length*.75,len=base64.length,i,p=0,encoded1,encoded2,encoded3,encoded4;if(base64[base64.length-1]==="="){bufferLength--;if(base64[base64.length-2]==="="){bufferLength--}}var arraybuffer=new ArrayBuffer(bufferLength),bytes=new Uint8Array(arraybuffer);for(i=0;i<len;i+=4){encoded1=chars.indexOf(base64[i]);encoded2=chars.indexOf(base64[i+1]);encoded3=chars.indexOf(base64[i+2]);encoded4=chars.indexOf(base64[i+3]);bytes[p++]=encoded1<<2|encoded2>>4;bytes[p++]=(encoded2&15)<<4|encoded3>>2;bytes[p++]=(encoded3&3)<<6|encoded4&63}return arraybuffer}})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")},{}],26:[function(_dereq_,module,exports){(function(global){var BlobBuilder=global.BlobBuilder||global.WebKitBlobBuilder||global.MSBlobBuilder||global.MozBlobBuilder;var blobSupported=function(){try{var b=new Blob(["hi"]);return b.size==2}catch(e){return false}}();var blobBuilderSupported=BlobBuilder&&BlobBuilder.prototype.append&&BlobBuilder.prototype.getBlob;function BlobBuilderConstructor(ary,options){options=options||{};var bb=new BlobBuilder;for(var i=0;i<ary.length;i++){bb.append(ary[i])}return options.type?bb.getBlob(options.type):bb.getBlob()}module.exports=function(){if(blobSupported){return global.Blob}else if(blobBuilderSupported){return BlobBuilderConstructor}else{return undefined}}()}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],27:[function(_dereq_,module,exports){(function(global){(function(root){var freeExports=typeof exports=="object"&&exports;var freeModule=typeof module=="object"&&module&&module.exports==freeExports&&module;var freeGlobal=typeof global=="object"&&global;if(freeGlobal.global===freeGlobal||freeGlobal.window===freeGlobal){root=freeGlobal}var stringFromCharCode=String.fromCharCode;function ucs2decode(string){var output=[];var counter=0;var length=string.length;var value;var extra;while(counter<length){value=string.charCodeAt(counter++);if(value>=55296&&value<=56319&&counter<length){extra=string.charCodeAt(counter++);if((extra&64512)==56320){output.push(((value&1023)<<10)+(extra&1023)+65536)}else{output.push(value);counter--}}else{output.push(value)}}return output}function ucs2encode(array){var length=array.length;var index=-1;var value;var output="";while(++index<length){value=array[index];if(value>65535){value-=65536;output+=stringFromCharCode(value>>>10&1023|55296);value=56320|value&1023}output+=stringFromCharCode(value)}return output}function createByte(codePoint,shift){return stringFromCharCode(codePoint>>shift&63|128)}function encodeCodePoint(codePoint){if((codePoint&4294967168)==0){return stringFromCharCode(codePoint)}var symbol="";if((codePoint&4294965248)==0){symbol=stringFromCharCode(codePoint>>6&31|192)}else if((codePoint&4294901760)==0){symbol=stringFromCharCode(codePoint>>12&15|224);symbol+=createByte(codePoint,6)}else if((codePoint&4292870144)==0){symbol=stringFromCharCode(codePoint>>18&7|240);symbol+=createByte(codePoint,12);symbol+=createByte(codePoint,6)}symbol+=stringFromCharCode(codePoint&63|128);return symbol}function utf8encode(string){var codePoints=ucs2decode(string);var length=codePoints.length;var index=-1;var codePoint;var byteString="";while(++index<length){codePoint=codePoints[index];byteString+=encodeCodePoint(codePoint)}return byteString}function readContinuationByte(){if(byteIndex>=byteCount){throw Error("Invalid byte index")}var continuationByte=byteArray[byteIndex]&255;byteIndex++;if((continuationByte&192)==128){return continuationByte&63}throw Error("Invalid continuation byte")}function decodeSymbol(){var byte1;var byte2;var byte3;var byte4;var codePoint;if(byteIndex>byteCount){throw Error("Invalid byte index")}if(byteIndex==byteCount){return false}byte1=byteArray[byteIndex]&255;byteIndex++;if((byte1&128)==0){return byte1}if((byte1&224)==192){var byte2=readContinuationByte();codePoint=(byte1&31)<<6|byte2;if(codePoint>=128){return codePoint}else{throw Error("Invalid continuation byte")}}if((byte1&240)==224){byte2=readContinuationByte();byte3=readContinuationByte();codePoint=(byte1&15)<<12|byte2<<6|byte3;if(codePoint>=2048){return codePoint}else{throw Error("Invalid continuation byte")}}if((byte1&248)==240){byte2=readContinuationByte();byte3=readContinuationByte();byte4=readContinuationByte();codePoint=(byte1&15)<<18|byte2<<12|byte3<<6|byte4;if(codePoint>=65536&&codePoint<=1114111){return codePoint}}throw Error("Invalid UTF-8 detected")}var byteArray;var byteCount;var byteIndex;function utf8decode(byteString){byteArray=ucs2decode(byteString);byteCount=byteArray.length;byteIndex=0;var codePoints=[];var tmp;while((tmp=decodeSymbol())!==false){codePoints.push(tmp)}return ucs2encode(codePoints)}var utf8={version:"2.0.0",encode:utf8encode,decode:utf8decode};if(typeof define=="function"&&typeof define.amd=="object"&&define.amd){define(function(){return utf8})}else if(freeExports&&!freeExports.nodeType){if(freeModule){freeModule.exports=utf8}else{var object={};var hasOwnProperty=object.hasOwnProperty;for(var key in utf8){hasOwnProperty.call(utf8,key)&&(freeExports[key]=utf8[key])}}}else{root.utf8=utf8}})(this)}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],28:[function(_dereq_,module,exports){(function(global){var rvalidchars=/^[\],:{}\s]*$/;var rvalidescape=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;var rvalidtokens=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;var rvalidbraces=/(?:^|:|,)(?:\s*\[)+/g;var rtrimLeft=/^\s+/;var rtrimRight=/\s+$/;module.exports=function parsejson(data){if("string"!=typeof data||!data){return null}data=data.replace(rtrimLeft,"").replace(rtrimRight,"");if(global.JSON&&JSON.parse){return JSON.parse(data)}if(rvalidchars.test(data.replace(rvalidescape,"@").replace(rvalidtokens,"]").replace(rvalidbraces,""))){return new Function("return "+data)()}}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],29:[function(_dereq_,module,exports){exports.encode=function(obj){var str="";for(var i in obj){if(obj.hasOwnProperty(i)){if(str.length)str+="&";str+=encodeURIComponent(i)+"="+encodeURIComponent(obj[i])}}return str};exports.decode=function(qs){var qry={};var pairs=qs.split("&");for(var i=0,l=pairs.length;i<l;i++){var pair=pairs[i].split("=");qry[decodeURIComponent(pair[0])]=decodeURIComponent(pair[1])}return qry}},{}],30:[function(_dereq_,module,exports){var re=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;var parts=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];module.exports=function parseuri(str){var src=str,b=str.indexOf("["),e=str.indexOf("]");if(b!=-1&&e!=-1){str=str.substring(0,b)+str.substring(b,e).replace(/:/g,";")+str.substring(e,str.length)}var m=re.exec(str||""),uri={},i=14;while(i--){uri[parts[i]]=m[i]||""}if(b!=-1&&e!=-1){uri.source=src;uri.host=uri.host.substring(1,uri.host.length-1).replace(/;/g,":");uri.authority=uri.authority.replace("[","").replace("]","").replace(/;/g,":");uri.ipv6uri=true}return uri}},{}],31:[function(_dereq_,module,exports){var global=function(){return this}();var WebSocket=global.WebSocket||global.MozWebSocket;module.exports=WebSocket?ws:null;function ws(uri,protocols,opts){var instance;if(protocols){instance=new WebSocket(uri,protocols)}else{instance=new WebSocket(uri)}return instance}if(WebSocket)ws.prototype=WebSocket.prototype},{}],32:[function(_dereq_,module,exports){(function(global){var isArray=_dereq_("isarray");module.exports=hasBinary;function hasBinary(data){function _hasBinary(obj){if(!obj)return false;if(global.Buffer&&global.Buffer.isBuffer(obj)||global.ArrayBuffer&&obj instanceof ArrayBuffer||global.Blob&&obj instanceof Blob||global.File&&obj instanceof File){return true}if(isArray(obj)){for(var i=0;i<obj.length;i++){if(_hasBinary(obj[i])){return true}}}else if(obj&&"object"==typeof obj){if(obj.toJSON){obj=obj.toJSON()}for(var key in obj){if(obj.hasOwnProperty(key)&&_hasBinary(obj[key])){return true}}}return false}return _hasBinary(data)}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{isarray:33}],33:[function(_dereq_,module,exports){module.exports=Array.isArray||function(arr){return Object.prototype.toString.call(arr)=="[object Array]"}},{}],34:[function(_dereq_,module,exports){var global=_dereq_("global");try{module.exports="XMLHttpRequest"in global&&"withCredentials"in new global.XMLHttpRequest}catch(err){module.exports=false}},{global:35}],35:[function(_dereq_,module,exports){module.exports=function(){return this}()},{}],36:[function(_dereq_,module,exports){var indexOf=[].indexOf;module.exports=function(arr,obj){if(indexOf)return arr.indexOf(obj);for(var i=0;i<arr.length;++i){if(arr[i]===obj)return i}return-1}},{}],37:[function(_dereq_,module,exports){var has=Object.prototype.hasOwnProperty;exports.keys=Object.keys||function(obj){var keys=[];for(var key in obj){if(has.call(obj,key)){keys.push(key)}}return keys};exports.values=function(obj){var vals=[];for(var key in obj){if(has.call(obj,key)){vals.push(obj[key])}}return vals};exports.merge=function(a,b){for(var key in b){if(has.call(b,key)){a[key]=b[key]}}return a};exports.length=function(obj){return exports.keys(obj).length};exports.isEmpty=function(obj){return 0==exports.length(obj)}},{}],38:[function(_dereq_,module,exports){var re=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;var parts=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];module.exports=function parseuri(str){var m=re.exec(str||""),uri={},i=14;while(i--){uri[parts[i]]=m[i]||""}return uri}},{}],39:[function(_dereq_,module,exports){(function(global){var isArray=_dereq_("isarray");var isBuf=_dereq_("./is-buffer");exports.deconstructPacket=function(packet){var buffers=[];var packetData=packet.data;function _deconstructPacket(data){if(!data)return data;if(isBuf(data)){var placeholder={_placeholder:true,num:buffers.length};buffers.push(data);return placeholder}else if(isArray(data)){var newData=new Array(data.length);for(var i=0;i<data.length;i++){newData[i]=_deconstructPacket(data[i])}return newData}else if("object"==typeof data&&!(data instanceof Date)){var newData={};for(var key in data){newData[key]=_deconstructPacket(data[key])}return newData}return data}var pack=packet;pack.data=_deconstructPacket(packetData);pack.attachments=buffers.length;return{packet:pack,buffers:buffers}};exports.reconstructPacket=function(packet,buffers){var curPlaceHolder=0;function _reconstructPacket(data){if(data&&data._placeholder){var buf=buffers[data.num];return buf
}else if(isArray(data)){for(var i=0;i<data.length;i++){data[i]=_reconstructPacket(data[i])}return data}else if(data&&"object"==typeof data){for(var key in data){data[key]=_reconstructPacket(data[key])}return data}return data}packet.data=_reconstructPacket(packet.data);packet.attachments=undefined;return packet};exports.removeBlobs=function(data,callback){function _removeBlobs(obj,curKey,containingObject){if(!obj)return obj;if(global.Blob&&obj instanceof Blob||global.File&&obj instanceof File){pendingBlobs++;var fileReader=new FileReader;fileReader.onload=function(){if(containingObject){containingObject[curKey]=this.result}else{bloblessData=this.result}if(!--pendingBlobs){callback(bloblessData)}};fileReader.readAsArrayBuffer(obj)}else if(isArray(obj)){for(var i=0;i<obj.length;i++){_removeBlobs(obj[i],i,obj)}}else if(obj&&"object"==typeof obj&&!isBuf(obj)){for(var key in obj){_removeBlobs(obj[key],key,obj)}}}var pendingBlobs=0;var bloblessData=data;_removeBlobs(bloblessData);if(!pendingBlobs){callback(bloblessData)}}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./is-buffer":41,isarray:42}],40:[function(_dereq_,module,exports){var debug=_dereq_("debug")("socket.io-parser");var json=_dereq_("json3");var isArray=_dereq_("isarray");var Emitter=_dereq_("component-emitter");var binary=_dereq_("./binary");var isBuf=_dereq_("./is-buffer");exports.protocol=4;exports.types=["CONNECT","DISCONNECT","EVENT","BINARY_EVENT","ACK","BINARY_ACK","ERROR"];exports.CONNECT=0;exports.DISCONNECT=1;exports.EVENT=2;exports.ACK=3;exports.ERROR=4;exports.BINARY_EVENT=5;exports.BINARY_ACK=6;exports.Encoder=Encoder;exports.Decoder=Decoder;function Encoder(){}Encoder.prototype.encode=function(obj,callback){debug("encoding packet %j",obj);if(exports.BINARY_EVENT==obj.type||exports.BINARY_ACK==obj.type){encodeAsBinary(obj,callback)}else{var encoding=encodeAsString(obj);callback([encoding])}};function encodeAsString(obj){var str="";var nsp=false;str+=obj.type;if(exports.BINARY_EVENT==obj.type||exports.BINARY_ACK==obj.type){str+=obj.attachments;str+="-"}if(obj.nsp&&"/"!=obj.nsp){nsp=true;str+=obj.nsp}if(null!=obj.id){if(nsp){str+=",";nsp=false}str+=obj.id}if(null!=obj.data){if(nsp)str+=",";str+=json.stringify(obj.data)}debug("encoded %j as %s",obj,str);return str}function encodeAsBinary(obj,callback){function writeEncoding(bloblessData){var deconstruction=binary.deconstructPacket(bloblessData);var pack=encodeAsString(deconstruction.packet);var buffers=deconstruction.buffers;buffers.unshift(pack);callback(buffers)}binary.removeBlobs(obj,writeEncoding)}function Decoder(){this.reconstructor=null}Emitter(Decoder.prototype);Decoder.prototype.add=function(obj){var packet;if("string"==typeof obj){packet=decodeString(obj);if(exports.BINARY_EVENT==packet.type||exports.BINARY_ACK==packet.type){this.reconstructor=new BinaryReconstructor(packet);if(this.reconstructor.reconPack.attachments==0){this.emit("decoded",packet)}}else{this.emit("decoded",packet)}}else if(isBuf(obj)||obj.base64){if(!this.reconstructor){throw new Error("got binary data when not reconstructing a packet")}else{packet=this.reconstructor.takeBinaryData(obj);if(packet){this.reconstructor=null;this.emit("decoded",packet)}}}else{throw new Error("Unknown type: "+obj)}};function decodeString(str){var p={};var i=0;p.type=Number(str.charAt(0));if(null==exports.types[p.type])return error();if(exports.BINARY_EVENT==p.type||exports.BINARY_ACK==p.type){p.attachments="";while(str.charAt(++i)!="-"){p.attachments+=str.charAt(i)}p.attachments=Number(p.attachments)}if("/"==str.charAt(i+1)){p.nsp="";while(++i){var c=str.charAt(i);if(","==c)break;p.nsp+=c;if(i+1==str.length)break}}else{p.nsp="/"}var next=str.charAt(i+1);if(""!=next&&Number(next)==next){p.id="";while(++i){var c=str.charAt(i);if(null==c||Number(c)!=c){--i;break}p.id+=str.charAt(i);if(i+1==str.length)break}p.id=Number(p.id)}if(str.charAt(++i)){try{p.data=json.parse(str.substr(i))}catch(e){return error()}}debug("decoded %s as %j",str,p);return p}Decoder.prototype.destroy=function(){if(this.reconstructor){this.reconstructor.finishedReconstruction()}};function BinaryReconstructor(packet){this.reconPack=packet;this.buffers=[]}BinaryReconstructor.prototype.takeBinaryData=function(binData){this.buffers.push(binData);if(this.buffers.length==this.reconPack.attachments){var packet=binary.reconstructPacket(this.reconPack,this.buffers);this.finishedReconstruction();return packet}return null};BinaryReconstructor.prototype.finishedReconstruction=function(){this.reconPack=null;this.buffers=[]};function error(data){return{type:exports.ERROR,data:"parser error"}}},{"./binary":39,"./is-buffer":41,"component-emitter":8,debug:9,isarray:42,json3:43}],41:[function(_dereq_,module,exports){(function(global){module.exports=isBuf;function isBuf(obj){return global.Buffer&&global.Buffer.isBuffer(obj)||global.ArrayBuffer&&obj instanceof ArrayBuffer}}).call(this,typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],42:[function(_dereq_,module,exports){module.exports=_dereq_(33)},{}],43:[function(_dereq_,module,exports){(function(window){var getClass={}.toString,isProperty,forEach,undef;var isLoader=typeof define==="function"&&define.amd;var nativeJSON=typeof JSON=="object"&&JSON;var JSON3=typeof exports=="object"&&exports&&!exports.nodeType&&exports;if(JSON3&&nativeJSON){JSON3.stringify=nativeJSON.stringify;JSON3.parse=nativeJSON.parse}else{JSON3=window.JSON=nativeJSON||{}}var isExtended=new Date(-0xc782b5b800cec);try{isExtended=isExtended.getUTCFullYear()==-109252&&isExtended.getUTCMonth()===0&&isExtended.getUTCDate()===1&&isExtended.getUTCHours()==10&&isExtended.getUTCMinutes()==37&&isExtended.getUTCSeconds()==6&&isExtended.getUTCMilliseconds()==708}catch(exception){}function has(name){if(has[name]!==undef){return has[name]}var isSupported;if(name=="bug-string-char-index"){isSupported="a"[0]!="a"}else if(name=="json"){isSupported=has("json-stringify")&&has("json-parse")}else{var value,serialized='{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';if(name=="json-stringify"){var stringify=JSON3.stringify,stringifySupported=typeof stringify=="function"&&isExtended;if(stringifySupported){(value=function(){return 1}).toJSON=value;try{stringifySupported=stringify(0)==="0"&&stringify(new Number)==="0"&&stringify(new String)=='""'&&stringify(getClass)===undef&&stringify(undef)===undef&&stringify()===undef&&stringify(value)==="1"&&stringify([value])=="[1]"&&stringify([undef])=="[null]"&&stringify(null)=="null"&&stringify([undef,getClass,null])=="[null,null,null]"&&stringify({a:[value,true,false,null,"\x00\b\n\f\r  "]})==serialized&&stringify(null,value)==="1"&&stringify([1,2],null,1)=="[\n 1,\n 2\n]"&&stringify(new Date(-864e13))=='"-271821-04-20T00:00:00.000Z"'&&stringify(new Date(864e13))=='"+275760-09-13T00:00:00.000Z"'&&stringify(new Date(-621987552e5))=='"-000001-01-01T00:00:00.000Z"'&&stringify(new Date(-1))=='"1969-12-31T23:59:59.999Z"'}catch(exception){stringifySupported=false}}isSupported=stringifySupported}if(name=="json-parse"){var parse=JSON3.parse;if(typeof parse=="function"){try{if(parse("0")===0&&!parse(false)){value=parse(serialized);var parseSupported=value["a"].length==5&&value["a"][0]===1;if(parseSupported){try{parseSupported=!parse('"  "')}catch(exception){}if(parseSupported){try{parseSupported=parse("01")!==1}catch(exception){}}if(parseSupported){try{parseSupported=parse("1.")!==1}catch(exception){}}}}}catch(exception){parseSupported=false}}isSupported=parseSupported}}return has[name]=!!isSupported}if(!has("json")){var functionClass="[object Function]";var dateClass="[object Date]";var numberClass="[object Number]";var stringClass="[object String]";var arrayClass="[object Array]";var booleanClass="[object Boolean]";var charIndexBuggy=has("bug-string-char-index");if(!isExtended){var floor=Math.floor;var Months=[0,31,59,90,120,151,181,212,243,273,304,334];var getDay=function(year,month){return Months[month]+365*(year-1970)+floor((year-1969+(month=+(month>1)))/4)-floor((year-1901+month)/100)+floor((year-1601+month)/400)}}if(!(isProperty={}.hasOwnProperty)){isProperty=function(property){var members={},constructor;if((members.__proto__=null,members.__proto__={toString:1},members).toString!=getClass){isProperty=function(property){var original=this.__proto__,result=property in(this.__proto__=null,this);this.__proto__=original;return result}}else{constructor=members.constructor;isProperty=function(property){var parent=(this.constructor||constructor).prototype;return property in this&&!(property in parent&&this[property]===parent[property])}}members=null;return isProperty.call(this,property)}}var PrimitiveTypes={"boolean":1,number:1,string:1,undefined:1};var isHostType=function(object,property){var type=typeof object[property];return type=="object"?!!object[property]:!PrimitiveTypes[type]};forEach=function(object,callback){var size=0,Properties,members,property;(Properties=function(){this.valueOf=0}).prototype.valueOf=0;members=new Properties;for(property in members){if(isProperty.call(members,property)){size++}}Properties=members=null;if(!size){members=["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];forEach=function(object,callback){var isFunction=getClass.call(object)==functionClass,property,length;var hasProperty=!isFunction&&typeof object.constructor!="function"&&isHostType(object,"hasOwnProperty")?object.hasOwnProperty:isProperty;for(property in object){if(!(isFunction&&property=="prototype")&&hasProperty.call(object,property)){callback(property)}}for(length=members.length;property=members[--length];hasProperty.call(object,property)&&callback(property));}}else if(size==2){forEach=function(object,callback){var members={},isFunction=getClass.call(object)==functionClass,property;for(property in object){if(!(isFunction&&property=="prototype")&&!isProperty.call(members,property)&&(members[property]=1)&&isProperty.call(object,property)){callback(property)}}}}else{forEach=function(object,callback){var isFunction=getClass.call(object)==functionClass,property,isConstructor;for(property in object){if(!(isFunction&&property=="prototype")&&isProperty.call(object,property)&&!(isConstructor=property==="constructor")){callback(property)}}if(isConstructor||isProperty.call(object,property="constructor")){callback(property)}}}return forEach(object,callback)};if(!has("json-stringify")){var Escapes={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"};var leadingZeroes="000000";var toPaddedString=function(width,value){return(leadingZeroes+(value||0)).slice(-width)};var unicodePrefix="\\u00";var quote=function(value){var result='"',index=0,length=value.length,isLarge=length>10&&charIndexBuggy,symbols;if(isLarge){symbols=value.split("")}for(;index<length;index++){var charCode=value.charCodeAt(index);switch(charCode){case 8:case 9:case 10:case 12:case 13:case 34:case 92:result+=Escapes[charCode];break;default:if(charCode<32){result+=unicodePrefix+toPaddedString(2,charCode.toString(16));break}result+=isLarge?symbols[index]:charIndexBuggy?value.charAt(index):value[index]}}return result+'"'};var serialize=function(property,object,callback,properties,whitespace,indentation,stack){var value,className,year,month,date,time,hours,minutes,seconds,milliseconds,results,element,index,length,prefix,result;try{value=object[property]}catch(exception){}if(typeof value=="object"&&value){className=getClass.call(value);if(className==dateClass&&!isProperty.call(value,"toJSON")){if(value>-1/0&&value<1/0){if(getDay){date=floor(value/864e5);for(year=floor(date/365.2425)+1970-1;getDay(year+1,0)<=date;year++);for(month=floor((date-getDay(year,0))/30.42);getDay(year,month+1)<=date;month++);date=1+date-getDay(year,month);time=(value%864e5+864e5)%864e5;hours=floor(time/36e5)%24;minutes=floor(time/6e4)%60;seconds=floor(time/1e3)%60;milliseconds=time%1e3}else{year=value.getUTCFullYear();month=value.getUTCMonth();date=value.getUTCDate();hours=value.getUTCHours();minutes=value.getUTCMinutes();seconds=value.getUTCSeconds();milliseconds=value.getUTCMilliseconds()}value=(year<=0||year>=1e4?(year<0?"-":"+")+toPaddedString(6,year<0?-year:year):toPaddedString(4,year))+"-"+toPaddedString(2,month+1)+"-"+toPaddedString(2,date)+"T"+toPaddedString(2,hours)+":"+toPaddedString(2,minutes)+":"+toPaddedString(2,seconds)+"."+toPaddedString(3,milliseconds)+"Z"}else{value=null}}else if(typeof value.toJSON=="function"&&(className!=numberClass&&className!=stringClass&&className!=arrayClass||isProperty.call(value,"toJSON"))){value=value.toJSON(property)}}if(callback){value=callback.call(object,property,value)}if(value===null){return"null"}className=getClass.call(value);if(className==booleanClass){return""+value}else if(className==numberClass){return value>-1/0&&value<1/0?""+value:"null"}else if(className==stringClass){return quote(""+value)}if(typeof value=="object"){for(length=stack.length;length--;){if(stack[length]===value){throw TypeError()}}stack.push(value);results=[];prefix=indentation;indentation+=whitespace;if(className==arrayClass){for(index=0,length=value.length;index<length;index++){element=serialize(index,value,callback,properties,whitespace,indentation,stack);results.push(element===undef?"null":element)}result=results.length?whitespace?"[\n"+indentation+results.join(",\n"+indentation)+"\n"+prefix+"]":"["+results.join(",")+"]":"[]"}else{forEach(properties||value,function(property){var element=serialize(property,value,callback,properties,whitespace,indentation,stack);if(element!==undef){results.push(quote(property)+":"+(whitespace?" ":"")+element)}});result=results.length?whitespace?"{\n"+indentation+results.join(",\n"+indentation)+"\n"+prefix+"}":"{"+results.join(",")+"}":"{}"}stack.pop();return result}};JSON3.stringify=function(source,filter,width){var whitespace,callback,properties,className;if(typeof filter=="function"||typeof filter=="object"&&filter){if((className=getClass.call(filter))==functionClass){callback=filter}else if(className==arrayClass){properties={};for(var index=0,length=filter.length,value;index<length;value=filter[index++],(className=getClass.call(value),className==stringClass||className==numberClass)&&(properties[value]=1));}}if(width){if((className=getClass.call(width))==numberClass){if((width-=width%1)>0){for(whitespace="",width>10&&(width=10);whitespace.length<width;whitespace+=" ");}}else if(className==stringClass){whitespace=width.length<=10?width:width.slice(0,10)}}return serialize("",(value={},value[""]=source,value),callback,properties,whitespace,"",[])}}if(!has("json-parse")){var fromCharCode=String.fromCharCode;var Unescapes={92:"\\",34:'"',47:"/",98:"\b",116:"  ",110:"\n",102:"\f",114:"\r"};var Index,Source;var abort=function(){Index=Source=null;throw SyntaxError()};var lex=function(){var source=Source,length=source.length,value,begin,position,isSigned,charCode;while(Index<length){charCode=source.charCodeAt(Index);switch(charCode){case 9:case 10:case 13:case 32:Index++;break;case 123:case 125:case 91:case 93:case 58:case 44:value=charIndexBuggy?source.charAt(Index):source[Index];Index++;return value;case 34:for(value="@",Index++;Index<length;){charCode=source.charCodeAt(Index);if(charCode<32){abort()}else if(charCode==92){charCode=source.charCodeAt(++Index);switch(charCode){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:value+=Unescapes[charCode];Index++;break;case 117:begin=++Index;for(position=Index+4;Index<position;Index++){charCode=source.charCodeAt(Index);if(!(charCode>=48&&charCode<=57||charCode>=97&&charCode<=102||charCode>=65&&charCode<=70)){abort()}}value+=fromCharCode("0x"+source.slice(begin,Index));break;default:abort()}}else{if(charCode==34){break}charCode=source.charCodeAt(Index);begin=Index;while(charCode>=32&&charCode!=92&&charCode!=34){charCode=source.charCodeAt(++Index)}value+=source.slice(begin,Index)}}if(source.charCodeAt(Index)==34){Index++;return value}abort();default:begin=Index;if(charCode==45){isSigned=true;charCode=source.charCodeAt(++Index)}if(charCode>=48&&charCode<=57){if(charCode==48&&(charCode=source.charCodeAt(Index+1),charCode>=48&&charCode<=57)){abort()}isSigned=false;for(;Index<length&&(charCode=source.charCodeAt(Index),charCode>=48&&charCode<=57);Index++);if(source.charCodeAt(Index)==46){position=++Index;for(;position<length&&(charCode=source.charCodeAt(position),charCode>=48&&charCode<=57);position++);if(position==Index){abort()}Index=position}charCode=source.charCodeAt(Index);if(charCode==101||charCode==69){charCode=source.charCodeAt(++Index);if(charCode==43||charCode==45){Index++}for(position=Index;position<length&&(charCode=source.charCodeAt(position),charCode>=48&&charCode<=57);position++);if(position==Index){abort()}Index=position}return+source.slice(begin,Index)}if(isSigned){abort()}if(source.slice(Index,Index+4)=="true"){Index+=4;return true}else if(source.slice(Index,Index+5)=="false"){Index+=5;return false}else if(source.slice(Index,Index+4)=="null"){Index+=4;return null}abort()}}return"$"};var get=function(value){var results,hasMembers;if(value=="$"){abort()}if(typeof value=="string"){if((charIndexBuggy?value.charAt(0):value[0])=="@"){return value.slice(1)}if(value=="["){results=[];for(;;hasMembers||(hasMembers=true)){value=lex();if(value=="]"){break}if(hasMembers){if(value==","){value=lex();if(value=="]"){abort()}}else{abort()}}if(value==","){abort()}results.push(get(value))}return results}else if(value=="{"){results={};for(;;hasMembers||(hasMembers=true)){value=lex();if(value=="}"){break}if(hasMembers){if(value==","){value=lex();if(value=="}"){abort()}}else{abort()}}if(value==","||typeof value!="string"||(charIndexBuggy?value.charAt(0):value[0])!="@"||lex()!=":"){abort()}results[value.slice(1)]=get(lex())}return results}abort()}return value};var update=function(source,property,callback){var element=walk(source,property,callback);if(element===undef){delete source[property]}else{source[property]=element}};var walk=function(source,property,callback){var value=source[property],length;if(typeof value=="object"&&value){if(getClass.call(value)==arrayClass){for(length=value.length;length--;){update(value,length,callback)}}else{forEach(value,function(property){update(value,property,callback)})}}return callback.call(source,property,value)};JSON3.parse=function(source,callback){var result,value;Index=0;Source=""+source;result=get(lex());if(lex()!="$"){abort()}Index=Source=null;return callback&&getClass.call(callback)==functionClass?walk((value={},value[""]=result,value),"",callback):result}}}if(isLoader){define(function(){return JSON3})}})(this)},{}],44:[function(_dereq_,module,exports){module.exports=toArray;function toArray(list,index){var array=[];index=index||0;for(var i=index||0;i<list.length;i++){array[i-index]=list[i]}return array}},{}]},{},[1])(1)});
class ndHelper {

  constructor(args) {
    window.ndHelper = this;
  }

  random(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

} // / ndHelper
var Recorder={swfObject:null,_callbacks:{},_events:{},_initialized:false,options:{},initialize:function(options){this.options=options||{};if(!this.options.flashContainer){this._setupFlashContainer()}this.bind("initialized",function(){Recorder._initialized=true;options.initialized()});this.bind("showFlash",this.options.onFlashSecurity||this._defaultOnShowFlash);this._loadFlash()},clear:function(){Recorder._events={}},record:function(options){options=options||{};this.clearBindings("recordingStart");this.clearBindings("recordingProgress");this.clearBindings("recordingCancel");this.bind("recordingStart",this._defaultOnHideFlash);this.bind("recordingCancel",this._defaultOnHideFlash);this.bind("recordingCancel",this._loadFlash);this.bind("recordingStart",options["start"]);this.bind("recordingProgress",options["progress"]);this.bind("recordingCancel",options["cancel"]);this.flashInterface().record()},stop:function(){return this.flashInterface()._stop()},play:function(options){options=options||{};this.clearBindings("playingProgress");this.bind("playingProgress",options["progress"]);this.bind("playingStop",options["finished"]);this.flashInterface()._play()},upload:function(options){options.audioParam=options.audioParam||"audio";options.params=options.params||{};this.clearBindings("uploadSuccess");this.bind("uploadSuccess",function(responseText){options.success(Recorder._externalInterfaceDecode(responseText))});this.flashInterface().upload(options.url,options.audioParam,options.params)},audioData:function(){return this.flashInterface().audioData().split(";")},request:function(method,uri,contentType,data,callback){var callbackName=this.registerCallback(callback);this.flashInterface().request(method,uri,contentType,data,callbackName)},clearBindings:function(eventName){Recorder._events[eventName]=[]},bind:function(eventName,fn){if(!Recorder._events[eventName]){Recorder._events[eventName]=[]}Recorder._events[eventName].push(fn)},triggerEvent:function(eventName,arg0,arg1){Recorder._executeInWindowContext(function(){for(var cb in Recorder._events[eventName]){if(Recorder._events[eventName][cb]){Recorder._events[eventName][cb].apply(Recorder,[arg0,arg1])}}})},triggerCallback:function(name,args){Recorder._executeInWindowContext(function(){Recorder._callbacks[name].apply(null,args)})},registerCallback:function(fn){var name="CB"+parseInt(Math.random()*999999,10);Recorder._callbacks[name]=fn;return name},flashInterface:function(){if(!this.swfObject){return null}else if(this.swfObject.record){return this.swfObject}else if(this.swfObject.children[3].record){return this.swfObject.children[3]}},_executeInWindowContext:function(fn){window.setTimeout(fn,1)},_setupFlashContainer:function(){this.options.flashContainer=document.createElement("div");this.options.flashContainer.setAttribute("id","recorderFlashContainer");this.options.flashContainer.setAttribute("style","position: fixed; left: -9999px; top: -9999px; width: 230px; height: 140px; margin-left: 10px; border-top: 6px solid rgba(128, 128, 128, 0.6); border-bottom: 6px solid rgba(128, 128, 128, 0.6); border-radius: 5px 5px; padding-bottom: 1px; padding-right: 1px;");document.body.appendChild(this.options.flashContainer)},_clearFlash:function(){var flashElement=this.options.flashContainer.children[0];if(flashElement){this.options.flashContainer.removeChild(flashElement)}},_loadFlash:function(){this._clearFlash();var flashElement=document.createElement("div");flashElement.setAttribute("id","recorderFlashObject");this.options.flashContainer.appendChild(flashElement);swfobject.embedSWF(this.options.swfSrc,"recorderFlashObject","231","141","10.1.0",undefined,undefined,{allowscriptaccess:"always"},undefined,function(e){if(e.success){Recorder.swfObject=e.ref;Recorder._checkForFlashBlock()}else{Recorder._showFlashRequiredDialog()}})},_defaultOnShowFlash:function(){var flashContainer=Recorder.options.flashContainer;flashContainer.style.left=(window.innerWidth||document.body.offsetWidth)/2-115+"px";flashContainer.style.top=(window.innerHeight||document.body.offsetHeight)/2-70+"px"},_defaultOnHideFlash:function(){var flashContainer=Recorder.options.flashContainer;flashContainer.style.left="-9999px";flashContainer.style.top="-9999px"},_checkForFlashBlock:function(){window.setTimeout(function(){if(!Recorder._initialized){Recorder.triggerEvent("showFlash")}},500)},_showFlashRequiredDialog:function(){Recorder.options.flashContainer.innerHTML="<p>Adobe Flash Player 10.1 or newer is required to use this feature.</p><p><a href='http://get.adobe.com/flashplayer' target='_top'>Get it on Adobe.com.</a></p>";Recorder.options.flashContainer.style.color="white";Recorder.options.flashContainer.style.backgroundColor="#777";Recorder.options.flashContainer.style.textAlign="center";Recorder.triggerEvent("showFlash")},_externalInterfaceDecode:function(data){return data.replace(/%22/g,'"').replace(/%5c/g,"\\").replace(/%26/g,"&").replace(/%25/g,"%")}};if(swfobject==undefined){var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if(typeof j.readyState!=D&&j.readyState=="complete"||typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body)){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){!function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()}()}}if(M.wk){!function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()}()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;!function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()}()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return!a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||!/%$/.test(aa.width)&&parseInt(aa.width,10)<310){aa.width="310"}if(typeof aa.height==D||!/%$/.test(aa.height)&&parseInt(aa.height,10)<137){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+encodeURI(O.location).toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";!function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}}()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";!function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}}()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";!function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}}()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return Y[0]>X[0]||Y[0]==X[0]&&Y[1]>X[1]||Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=ad&&typeof ad=="string"?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring(Y[X].indexOf("=")+1))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}()}var __hasProp=Object.prototype.hasOwnProperty;window.SC=window.SC||{};window.SC.URI=function(uri,options){var AUTHORITY_REGEXP,URI_REGEXP;if(uri==null){uri=""}if(options==null){options={}}URI_REGEXP=/^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;AUTHORITY_REGEXP=/^(?:([^@]*)@)?([^:]*)(?::(\d*))?/;this.scheme=this.user=this.password=this.host=this.port=this.path=this.query=this.fragment=null;this.toString=function(){var str;str="";if(this.isAbsolute()){str+=this.scheme;str+="://";if(this.user!=null){str+=this.user+":"+this.password+"@"}str+=this.host;if(this.port!=null){str+=":"+this.port}}str+=this.path;if(this.path===""&&(this.query!=null||this.fragment!=null)){str+="/"}if(this.query!=null){str+=this.encodeParamsWithPrepend(this.query,"?")}if(this.fragment!=null){str+=this.encodeParamsWithPrepend(this.fragment,"#")}return str};this.isRelative=function(){return!this.isAbsolute()};this.isAbsolute=function(){return this.host!=null};this.decodeParams=function(string){var key,params,part,splitted,value,_i,_len,_ref;if(string==null){string=""}params={};_ref=string.split("&");for(_i=0,_len=_ref.length;_i<_len;_i++){part=_ref[_i];if(part!==""){splitted=part.split("=");key=decodeURIComponent(splitted[0]);value=decodeURIComponent(splitted[1]||"").replace(/\+/g," ");this.normalizeParams(params,key,value)}}return params};this.normalizeParams=function(params,name,v){var after,child_key,k,lastP,result,result_i;if(v==null){v=NULL}result=name.match(/^[\[\]]*([^\[\]]+)\]*(.*)/);k=result[1]||"";after=result[2]||"";if(after===""){params[k]=v}else if(after==="[]"){params[k]||(params[k]=[]);params[k].push(v)}else if(result_i=after.match(/^\[\]\[([^\[\]]+)\]$/)||(result_i=after.match(/^\[\](.+)$/))){child_key=result_i[1];params[k]||(params[k]=[]);lastP=params[k][params[k].length-1];if(lastP!=null&&lastP.constructor===Object&&!(lastP[child_key]!=null)){this.normalizeParams(lastP,child_key,v)}else{params[k].push(this.normalizeParams({},child_key,v))}}else{params[k]||(params[k]={});params[k]=this.normalizeParams(params[k],after,v)}return params};this.encodeParamsWithPrepend=function(params,prepend){var encoded;encoded=this.encodeParams(params);if(encoded!==""){return prepend+encoded}else{return""}};this.encodeParams=function(params){var flattened,key,keyValueStrings,kv,paramString,value,_i,_len;paramString="";if(params.constructor===String){return paramString=params}else{flattened=this.flattenParams(params);keyValueStrings=[];for(_i=0,_len=flattened.length;_i<_len;_i++){kv=flattened[_i];key=kv[0];value=kv[1];if(value===null){keyValueStrings.push(key)}else{keyValueStrings.push(key+"="+encodeURIComponent(value))}}return paramString=keyValueStrings.join("&")}};this.flattenParams=function(params,prefix,paramsArray){var key,prefixedKey,value,_i,_len;if(prefix==null){prefix=""}if(paramsArray==null){paramsArray=[]}if(!(params!=null)){if(prefix!=null){paramsArray.push([prefix,null])}}else if(params.constructor===Object){for(key in params){if(!__hasProp.call(params,key))continue;value=params[key];if(prefix!==""){prefixedKey=prefix+"["+key+"]"}else{prefixedKey=key}this.flattenParams(value,prefixedKey,paramsArray)}}else if(params.constructor===Array){for(_i=0,_len=params.length;_i<_len;_i++){value=params[_i];this.flattenParams(value,prefix+"[]",paramsArray)}}else if(prefix!==""){paramsArray.push([prefix,params])}return paramsArray};this.parse=function(uri,options){var authority,authority_result,nullIfBlank,result,userinfo;if(uri==null){uri=""}if(options==null){options={}}nullIfBlank=function(str){if(str===""){return null}else{return str}};result=uri.match(URI_REGEXP);this.scheme=nullIfBlank(result[1]);authority=result[2];if(authority!=null){authority_result=authority.match(AUTHORITY_REGEXP);userinfo=nullIfBlank(authority_result[1]);if(userinfo!=null){this.user=userinfo.split(":")[0];this.password=userinfo.split(":")[1]}this.host=nullIfBlank(authority_result[2]);this.port=parseInt(authority_result[3],10)||null}this.path=result[3];this.query=nullIfBlank(result[4]);if(options.decodeQuery){this.query=this.decodeParams(this.query)}this.fragment=nullIfBlank(result[5]);if(options.decodeFragment){return this.fragment=this.decodeParams(this.fragment)}};this.parse(uri.toString(),options);return this};!function(){var AbstractDialog,ConnectDialog,EchoDialog,PickerDialog,_ref,_ref1,_ref2,__hasProp={}.hasOwnProperty,__extends=function(child,parent){for(var key in parent){if(__hasProp.call(parent,key))child[key]=parent[key]}function ctor(){this.constructor=child}ctor.prototype=parent.prototype;child.prototype=new ctor;child.__super__=parent.prototype;return child};window.SC||(window.SC={});SC.Helper={merge:function(a,b){var k,newObj,v,_i,_len;if(a.constructor===Array){newObj=Array.apply(null,a);for(_i=0,_len=b.length;_i<_len;_i++){v=b[_i];newObj.push(v)}return newObj}else{newObj={};for(k in a){if(!__hasProp.call(a,k))continue;v=a[k];newObj[k]=v}for(k in b){if(!__hasProp.call(b,k))continue;v=b[k];newObj[k]=v}return newObj}},groupBy:function(collection,attribute){var group,object,value,_i,_len,_name;group={};for(_i=0,_len=collection.length;_i<_len;_i++){object=collection[_i];if(value=object[attribute]){group[_name=object[attribute]]||(group[_name]=[]);group[object[attribute]].push(object)}}return group},loadJavascript:function(src,callback){var elem;elem=document.createElement("script");elem.async=true;elem.src=src;SC.Helper.attachLoadEvent(elem,callback);document.body.appendChild(elem);return elem},extractOptionsAndCallbackArguments:function(optionsOrCallback,callback){var args;args={};if(callback!=null){args.callback=callback;args.options=optionsOrCallback}else if(typeof optionsOrCallback==="function"){args.callback=optionsOrCallback;args.options={}}else{args.options=optionsOrCallback||{}}return args},openCenteredPopup:function(url,width,height){var options;options={};if(height!=null){options.width=width;options.height=height}else{options=width}options=SC.Helper.merge(options,{location:1,left:window.screenX+(window.outerWidth-options.width)/2,top:window.screenY+(window.outerHeight-options.height)/2,toolbar:"no",scrollbars:"yes"});return window.open(url,options.name,this._optionsToString(options))},_optionsToString:function(options){var k,optionsArray,v;optionsArray=[];for(k in options){if(!__hasProp.call(options,k))continue;v=options[k];optionsArray.push(k+"="+v)}return optionsArray.join(", ")},attachLoadEvent:function(element,func){if(element.addEventListener){return element.addEventListener("load",func,false)}else{return element.onreadystatechange=function(){if(this.readyState==="complete"){return func()}}}},millisecondsToHMS:function(ms){var hms,m,mPrefix,sPrefix,tc;hms={h:Math.floor(ms/(60*60*1e3)),m:Math.floor(ms/6e4%60),s:Math.floor(ms/1e3%60)};tc=[];if(hms.h>0){tc.push(hms.h)}m=hms.m;mPrefix="";sPrefix="";if(hms.m<10&&hms.h>0){mPrefix="0"}if(hms.s<10){sPrefix="0"}tc.push(mPrefix+hms.m);tc.push(sPrefix+hms.s);return tc.join(".")},setFlashStatusCodeMaps:function(query){query["_status_code_map[400]"]=200;query["_status_code_map[401]"]=200;query["_status_code_map[403]"]=200;query["_status_code_map[404]"]=200;query["_status_code_map[422]"]=200;query["_status_code_map[500]"]=200;query["_status_code_map[503]"]=200;return query["_status_code_map[504]"]=200},responseHandler:function(responseText,xhr){var error,json;json=SC.Helper.JSON.parse(responseText);error=null;if(!json){if(xhr){error={message:"HTTP Error: "+xhr.status}}else{error={message:"Unknown error"}}}else if(json.errors){error={message:json.errors&&json.errors[0].error_message}}return{json:json,error:error}},FakeStorage:function(){return{_store:{},getItem:function(key){return this._store[key]||null},setItem:function(key,value){return this._store[key]=value.toString()},removeItem:function(key){return delete this._store[key]}}},JSON:{parse:function(string){if(string[0]!=="{"&&string[0]!=="["){return null}else if(window.JSON!=null){return window.JSON.parse(string)}else{return eval(string)}}}};window.SC=SC.Helper.merge(SC||{},{_version:"1.1.5",_baseUrl:"//connect.soundcloud.com",options:{site:"soundcloud.com",baseUrl:"//connect.soundcloud.com"},connectCallbacks:{},_popupWindow:void 0,initialize:function(options){var key,value,_base;if(options==null){options={}}this.accessToken(options["access_token"]);for(key in options){if(!__hasProp.call(options,key))continue;value=options[key];this.options[key]=value}(_base=this.options).flashXHR||(_base.flashXHR=(new XMLHttpRequest).withCredentials===void 0);return this},hostname:function(subdomain){var str;str="";if(subdomain!=null){str+=subdomain+"."}str+=this.options.site;return str}});window.SC=SC.Helper.merge(SC||{},{_apiRequest:function(method,path,query,callback){var data,uri;if(callback==null){callback=query;query=void 0}query||(query={});uri=SC.prepareRequestURI(path,query);uri.query.format="json";if(SC.options.flashXHR){SC.Helper.setFlashStatusCodeMaps(uri.query)}else{uri.query["_status_code_map[302]"]=200}if(method==="PUT"||method==="DELETE"){uri.query._method=method;method="POST"}if(method!=="GET"){data=uri.encodeParams(uri.query);uri.query={}}return this._request(method,uri,"application/x-www-form-urlencoded",data,function(responseText,xhr){var response;response=SC.Helper.responseHandler(responseText,xhr);if(response.json&&response.json.status==="302 - Found"){return SC._apiRequest("GET",response.json.location,callback)}else{return callback(response.json,response.error)}})},_request:function(method,uri,contentType,data,callback){if(SC.options.flashXHR){return this._flashRequest(method,uri,contentType,data,callback)}else{return this._xhrRequest(method,uri,contentType,data,callback)}},_xhrRequest:function(method,uri,contentType,data,callback){var request;request=new XMLHttpRequest;request.open(method,uri.toString(),true);request.setRequestHeader("Content-Type",contentType);request.onreadystatechange=function(e){if(e.target.readyState===4){return callback(e.target.responseText,e.target)}};return request.send(data)},_flashRequest:function(method,uri,contentType,data,callback){return this.whenRecordingReady(function(){return Recorder.request(method,uri.toString(),contentType,data,function(data,xhr){return callback(Recorder._externalInterfaceDecode(data),xhr)})})},post:function(path,query,callback){return this._apiRequest("POST",path,query,callback)},put:function(path,query,callback){return this._apiRequest("PUT",path,query,callback)},get:function(path,query,callback){return this._apiRequest("GET",path,query,callback)},"delete":function(path,callback){return this._apiRequest("DELETE",path,{},callback)},prepareRequestURI:function(path,query){var k,uri,v;if(query==null){query={}}uri=new SC.URI(path,{decodeQuery:true});for(k in query){if(!__hasProp.call(query,k))continue;v=query[k];uri.query[k]=v}if(uri.isRelative()){uri.host=this.hostname("api");uri.scheme=window.location.protocol.slice(0,-1)}if(this.accessToken()!=null){uri.query.oauth_token=this.accessToken();uri.scheme="https"}else{uri.query.client_id=this.options.client_id}return uri},_getAll:function(path,query,callback,collection){if(collection==null){collection=[]}if(callback==null){callback=query;query=void 0}query||(query={});query.offset||(query.offset=0);query.limit||(query.limit=50);return this.get(path,query,function(objects,error){if(objects.constructor===Array&&objects.length>0){collection=SC.Helper.merge(collection,objects);query.offset+=query.limit;return SC._getAll(path,query,callback,collection)}else{return callback(collection,null)}})}});window.SC=SC.Helper.merge(SC||{},{_connectWindow:null,connect:function(optionsOrCallback){var dialog,dialogOptions,options;if(typeof optionsOrCallback==="function"){options={connected:optionsOrCallback}}else{options=optionsOrCallback}dialogOptions={client_id:options.client_id||SC.options.client_id,redirect_uri:options.redirect_uri||SC.options.redirect_uri,response_type:"code_and_token",scope:options.scope||"non-expiring",display:"popup",window:options.window,retainWindow:options.retainWindow};if(dialogOptions.client_id&&dialogOptions.redirect_uri){dialog=SC.dialog(SC.Dialog.CONNECT,dialogOptions,function(params){if(params.error!=null){throw new Error("SC OAuth2 Error: "+params.error_description)}else{SC.accessToken(params.access_token);if(options.connected!=null){options.connected()}}if(options.callback!=null){return options.callback()}});this._connectWindow=dialog.options.window;return dialog}else{throw"Options client_id and redirect_uri must be passed"}},connectCallback:function(){return SC.Dialog._handleDialogReturn(SC._connectWindow)},disconnect:function(){return this.accessToken(null)},_trigger:function(eventName,argument){if(this.connectCallbacks[eventName]!=null){return this.connectCallbacks[eventName](argument)}},accessToken:function(value){var storage,storageKey;storageKey="SC.accessToken";storage=this.storage();if(value===void 0){return storage.getItem(storageKey)}else if(value===null){return storage.removeItem(storageKey)}else{return storage.setItem(storageKey,value)}},isConnected:function(){return this.accessToken()!=null}});window.SC=SC.Helper.merge(SC||{},{_dialogsPath:"/dialogs",dialog:function(dialogName,optionsOrCallback,callback){var a,dialog,options;a=SC.Helper.extractOptionsAndCallbackArguments(optionsOrCallback,callback);options=a.options;callback=a.callback;options.callback=callback;options.redirect_uri=this.options.redirect_uri;dialog=new SC.Dialog[dialogName+"Dialog"](options);SC.Dialog._dialogs[dialog.id]=dialog;dialog.open();return dialog},Dialog:{ECHO:"Echo",CONNECT:"Connect",PICKER:"Picker",ID_PREFIX:"SoundCloud_Dialog",_dialogs:{},_isDialogId:function(id){return(id||"").match(new RegExp("^"+this.ID_PREFIX))},_getDialogIdFromWindow:function(window){var id,loc;loc=new SC.URI(window.location,{decodeQuery:true,decodeFragment:true});id=loc.query.state||loc.fragment.state;if(this._isDialogId(id)){return id}else{return null}},_handleDialogReturn:function(window){var dialog,dialogId;dialogId=this._getDialogIdFromWindow(window);dialog=this._dialogs[dialogId];if(dialog!=null){if(dialog.handleReturn()){return delete this._dialogs[dialogId]}}},_handleInPopupContext:function(){var isiOS5;if(this._getDialogIdFromWindow(window)&&!window.location.pathname.match(/\/dialogs\//)){isiOS5=navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i);if(isiOS5){return window.opener.SC.Dialog._handleDialogReturn(window)}else if(window.opener){return window.opener.setTimeout(function(){return window.opener.SC.Dialog._handleDialogReturn(window)},1)}else if(window.top){return window.top.setTimeout(function(){return window.top.SC.Dialog._handleDialogReturn(window)},1)}}},AbstractDialog:AbstractDialog=function(){AbstractDialog.prototype.WIDTH=456;AbstractDialog.prototype.HEIGHT=510;AbstractDialog.prototype.ID_PREFIX="SoundCloud_Dialog";AbstractDialog.prototype.PARAM_KEYS=["redirect_uri"];AbstractDialog.prototype.requiresAuthentication=false;AbstractDialog.prototype.generateId=function(){return[this.ID_PREFIX,Math.ceil(Math.random()*1e6).toString(16)].join("_")};function AbstractDialog(options){this.options=options!=null?options:{};this.id=this.generateId()}AbstractDialog.prototype.buildURI=function(uri){var paramKey,_i,_len,_ref;if(uri==null){uri=new SC.URI(SC._baseUrl)}uri.scheme=window.location.protocol.slice(0,-1);uri.path+=SC._dialogsPath+"/"+this.name+"/";uri.fragment={state:this.id};if(this.requiresAuthentication){uri.fragment.access_token=SC.accessToken()}_ref=this.PARAM_KEYS;for(_i=0,_len=_ref.length;_i<_len;_i++){paramKey=_ref[_i];if(this.options[paramKey]!=null){uri.fragment[paramKey]=this.options[paramKey]}}uri.port=null;return uri};AbstractDialog.prototype.open=function(){var url;if(this.requiresAuthentication&&SC.accessToken()==null){return this.authenticateAndOpen()}else{url=this.buildURI();if(this.options.window!=null){return this.options.window.location=url}else{return this.options.window=SC.Helper.openCenteredPopup(url,{width:this.WIDTH,height:this.HEIGHT})}}};AbstractDialog.prototype.authenticateAndOpen=function(){var connectDialog,_this=this;return connectDialog=SC.connect({retainWindow:true,window:this.options.window,connected:function(){_this.options.window=connectDialog.options.window;return _this.open()}})};AbstractDialog.prototype.paramsFromWindow=function(){var params,url;url=new SC.URI(this.options.window.location,{decodeFragment:true,decodeQuery:true});return params=SC.Helper.merge(url.query,url.fragment)};AbstractDialog.prototype.handleReturn=function(){var params;params=this.paramsFromWindow();if(!this.options.retainWindow){this.options.window.close()}return this.options.callback(params)};return AbstractDialog}(),EchoDialog:EchoDialog=function(_super){__extends(EchoDialog,_super);function EchoDialog(){_ref=EchoDialog.__super__.constructor.apply(this,arguments);return _ref}EchoDialog.prototype.PARAM_KEYS=["client_id","redirect_uri","hello"];EchoDialog.prototype.name="echo";return EchoDialog}(AbstractDialog),PickerDialog:PickerDialog=function(_super){__extends(PickerDialog,_super);
function PickerDialog(){_ref1=PickerDialog.__super__.constructor.apply(this,arguments);return _ref1}PickerDialog.prototype.PARAM_KEYS=["client_id","redirect_uri"];PickerDialog.prototype.name="picker";PickerDialog.prototype.requiresAuthentication=true;PickerDialog.prototype.handleReturn=function(){var params,_this=this;params=this.paramsFromWindow();if(params.action==="logout"){SC.accessToken(null);this.open();return false}else if(params.track_uri!=null){if(!this.options.retainWindow){this.options.window.close()}SC.get(params.track_uri,function(track){return _this.options.callback({track:track})});return true}};return PickerDialog}(AbstractDialog),ConnectDialog:ConnectDialog=function(_super){__extends(ConnectDialog,_super);function ConnectDialog(){_ref2=ConnectDialog.__super__.constructor.apply(this,arguments);return _ref2}ConnectDialog.prototype.PARAM_KEYS=["client_id","redirect_uri","client_secret","response_type","scope","display"];ConnectDialog.prototype.name="connect";ConnectDialog.prototype.buildURI=function(){var uri;uri=ConnectDialog.__super__.buildURI.apply(this,arguments);uri.scheme="https";uri.host="soundcloud.com";uri.path="/connect";uri.query=uri.fragment;uri.fragment={};return uri};return ConnectDialog}(AbstractDialog)}});SC.Dialog._handleInPopupContext();window.SC=SC.Helper.merge(SC||{},{Loader:{States:{UNLOADED:1,LOADING:2,READY:3},Package:function(name,loadFunction){return{name:name,callbacks:[],loadFunction:loadFunction,state:SC.Loader.States.UNLOADED,addCallback:function(fn){return this.callbacks.push(fn)},runCallbacks:function(){var callback,_i,_len,_ref3;_ref3=this.callbacks;for(_i=0,_len=_ref3.length;_i<_len;_i++){callback=_ref3[_i];callback.apply(this)}return this.callbacks=[]},setReady:function(){this.state=SC.Loader.States.READY;return this.runCallbacks()},load:function(){this.state=SC.Loader.States.LOADING;return this.loadFunction.apply(this)},whenReady:function(callback){switch(this.state){case SC.Loader.States.UNLOADED:this.addCallback(callback);return this.load();case SC.Loader.States.LOADING:return this.addCallback(callback);case SC.Loader.States.READY:return callback()}}}},packages:{},registerPackage:function(pkg){return this.packages[pkg.name]=pkg}}});window.SC=SC.Helper.merge(SC||{},{oEmbed:function(trackUrl,query,callback){var element,uri,_this=this;if(callback==null){callback=query;query=void 0}query||(query={});query.url=trackUrl;uri=new SC.URI(window.location.protocol+"//"+SC.hostname()+"/oembed.json");uri.query=query;if(callback.nodeType!==void 0&&callback.nodeType===1){element=callback;callback=function(oembed){return element.innerHTML=oembed.html}}return this._request("GET",uri.toString(),null,null,function(responseText,xhr){var response;response=SC.Helper.responseHandler(responseText,xhr);return callback(response.json,response.error)})}});window.SC=SC.Helper.merge(SC||{},{_recorderSwfPath:"/recorder.js/recorder-0.9.0.swf",whenRecordingReady:function(callback){return SC.Loader.packages.recording.whenReady(callback)},record:function(options){if(options==null){options={}}return this.whenRecordingReady(function(){return Recorder.record(options)})},recordStop:function(options){if(options==null){options={}}return Recorder.stop()},recordPlay:function(options){if(options==null){options={}}return Recorder.play(options)},recordUpload:function(query,callback){var flattenedParams,uri;if(query==null){query={}}uri=SC.prepareRequestURI("/tracks",query);uri.query.format="json";SC.Helper.setFlashStatusCodeMaps(uri.query);flattenedParams=uri.flattenParams(uri.query);return Recorder.upload({method:"POST",url:"https://"+this.hostname("api")+"/tracks",audioParam:"track[asset_data]",params:flattenedParams,success:function(responseText){var response;response=SC.Helper.responseHandler(responseText);return callback(response.json,response.error)}})}});SC.Loader.registerPackage(new SC.Loader.Package("recording",function(){if(Recorder.flashInterface()){return SC.Loader.packages.recording.setReady()}else{return Recorder.initialize({swfSrc:SC._baseUrl+SC._recorderSwfPath+"?"+SC._version,initialized:function(){return SC.Loader.packages.recording.setReady()}})}}));window.SC=SC.Helper.merge(SC||{},{storage:function(){return this._fakeStorage||(this._fakeStorage=new SC.Helper.FakeStorage)}});window.SC=SC.Helper.merge(SC||{},{_soundmanagerPath:"/soundmanager2",_soundmanagerScriptPath:"/soundmanager2.js",whenStreamingReady:function(callback){return SC.Loader.packages.streaming.whenReady(callback)},_prepareStreamUrl:function(idOrUrl){var preparedUrl,url;if(idOrUrl.toString().match(/^\d.*$/)){url="/tracks/"+idOrUrl}else{url=idOrUrl}preparedUrl=SC.prepareRequestURI(url);if(!preparedUrl.path.match(/\/stream/)){preparedUrl.path+="/stream"}return preparedUrl.toString()},_setOnPositionListenersForComments:function(sound,comments,callback){var commentBatch,group,timestamp,_results;group=SC.Helper.groupBy(comments,"timestamp");_results=[];for(timestamp in group){commentBatch=group[timestamp];_results.push(function(timestamp,commentBatch,callback){return sound.onposition(parseInt(timestamp,10),function(){return callback(commentBatch)})}(timestamp,commentBatch,callback))}return _results},stream:function(idOrUrl,optionsOrCallback,callback){var a,options,_this=this;a=SC.Helper.extractOptionsAndCallbackArguments(optionsOrCallback,callback);options=a.options;callback=a.callback;return SC.whenStreamingReady(function(){var createAndCallback,ontimedcommentsCallback;options.id="T"+idOrUrl+"-"+Math.random();options.url=_this._prepareStreamUrl(idOrUrl);createAndCallback=function(options){var sound;sound=soundManager.createSound(options);if(callback!=null){callback(sound)}return sound};if(ontimedcommentsCallback=options.ontimedcomments){delete options.ontimedcomments;return SC._getAll(options.url.replace("/stream","/comments"),function(comments){var sound;sound=createAndCallback(options);return _this._setOnPositionListenersForComments(sound,comments,ontimedcommentsCallback)})}else{return createAndCallback(options)}})},streamStopAll:function(){if(window.soundManager!=null){return window.soundManager.stopAll()}}});SC.Loader.registerPackage(new SC.Loader.Package("streaming",function(){var soundManagerURL;if(window.soundManager!=null){return SC.Loader.packages.streaming.setReady()}else{soundManagerURL=SC._baseUrl+SC._soundmanagerPath;window.SM2_DEFER=true;return SC.Helper.loadJavascript(soundManagerURL+SC._soundmanagerScriptPath,function(){window.soundManager=new SoundManager;soundManager.url=soundManagerURL;soundManager.flashVersion=9;soundManager.useFlashBlock=false;soundManager.useHTML5Audio=false;soundManager.beginDelayedInit();return soundManager.onready(function(){return SC.Loader.packages.streaming.setReady()})})}}))}.call(this);
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

    // Input mapping mode activated?
    this.mappingMode = args.mappingMode || false;

    // The active input elements
    this.inputElements = args.inputElements || [];

    // Mapping of input elements
    this.inputMapping = args.inputMapping || null;
  } // / constructor

  /**
   * Connect to the MIDI devices. 
   * 
   */
  connect() {

    // Get permission to use connected MIDI devices
    navigator.permissions.query({ name: 'midi', sysex: true }).then(

    // Success
    function (permission) {

      if (this.debug) {
        console.log('"midi" permission:', permission.state);
      }

      // Permission is granted
      if (permission.state === 'granted') {
        // Request access to the MIDI devices
        navigator.requestMIDIAccess({ sysex: true }).then(function (access) {

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

          // Input mapping exists
          if (this.inputMapping !== null) {
            // Iterate over all input element mappings
            for (var key in this.inputMapping) {
              var note = this.inputMapping[key];

              this.inputElements[note] = {};
              this.inputElements[note].pressed = false;
              this.inputElements[note].velocity = 0;
            }
          }

          // TODO: Handle output messages

          // A new MIDI device was added or an existing MIDI device changes state
          this.access.onstatechange = function (MIDIConnectionEvent) {
            console.log('MIDIAccess state change:', MIDIConnectionEvent);
          }; // / this.access.onstatechange
        }.bind(this));

        // No permission
      } else {
          console.error('permission was not granted!');
        }
    }.bind(this), // / Success

    // Failure
    function (err) {
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
        this.noteOff({ note: note, velocity: velocity, channel: channel });
        break;

      // Note On
      case '9':
        this.noteOn({ note: note, velocity: velocity, channel: channel });
        break;

      // Aftertouch
      case 'a':
        this.aftertouch({ note: note, velocity: velocity, channel: channel });
        break;

      // Continuous controller
      case 'b':
        this.continuousController({ note: note, velocity: velocity, channel: channel });
        break;

      // Patch change
      case 'c':
        this.patchChange({ note: note, velocity: velocity, channel: channel });
        break;

      // Channel Pressure
      case 'd':
        this.channelPressure({ note: note, velocity: velocity, channel: channel });
        break;

      // Pitch bend
      case 'e':
        this.pitchBend({ note: note, velocity: velocity, channel: channel });
        break;

      // (non-musical commands)
      case 'f':
        this.nonMusicalCommand({ note: note, velocity: velocity, type: type });
        break;

      default:
        console.log('UNKOWN VALUE', 'channel_command', channel_command, 'channel', channel, 'type', type, 'note', note, 'velocitiy', velocity, 'message', message);

    } // / switch(type)

    if (this.mappingMode && channel_command !== '9') {
      console.log(note);
    }

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

    this.inputElements[args.note] = Object.assign(this.inputElements[args.note], args);
    this.inputElements[args.note].pressed = true;
    this.inputElements[args.note].noteOn = true;
  }

  /**
   * Note (for example a button on a drumpad) on MIDI device was activated (for example pressed).
   * 
   */
  noteOff(args) {
    if (this.debug) {
      console.log('note off', args);
    }

    this.inputElements[args.note] = Object.assign(this.inputElements[args.note], args);
    this.inputElements[args.note].pressed = false;
  }

  pitchBend(args) {
    if (this.debug) {
      console.log('pitch bend', args);
    }

    if (this.inputElements[1337] == undefined) {
      this.inputElements[1337] = args;
    } else {
      this.inputElements[1337] = Object.assign(this.inputElements[1337], args);
    }
  }

  continuousController(args) {
    if (this.debug) {
      console.log('continuous controller', args);
    }

    if (this.inputElements[args.note] != undefined) {
      this.inputElements[args.note] = Object.assign(this.inputElements[args.note], args);
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
/**
 * Select an area on canvas. 
 */
function ndSelector(args) {
  // Element which holds the selector (e.g. canvas)
  this.parent_element = args.parent_element || null;

  // The selector element
  this.selector_element = null;

  // The name of the selector (which gets saved into the "data-name" attribute)
  this.selector_element_name = args.selector_element_name || 'A';

  // The CSS class for the selector_element
  this.selector_element_class = args.selector_element_class || 'ndSelector';

  // The width of the selector_element (default: 10 real pixel / LED (8 LEDs per row))
  this.selector_element_width = args.selector_element_width || 10 * 8;

  // The height of the selector_element (default: 10 real pixel / LED (8 LEDs per row))
  this.selector_element_height = args.selector_element_height || 10 * 8;

  // The x position of the selector_element
  this.selector_element_x = args.selector_element_x || 0;

  // x is saved in localStorage
  if (window.localStorage[this.selector_element_name + 'x'] !== undefined) {
    // Set the x position of the selector_element
    this.selector_element_x = window.localStorage[this.selector_element_name + 'x'];
  }

  // The y position of the selector_element
  this.selector_element_y = args.selector_element_y || 0;

  // y is saved in localStorage
  if (window.localStorage[this.selector_element_name + 'y'] !== undefined) {
    // Set the y position of the selector_element
    this.selector_element_y = window.localStorage[this.selector_element_name + 'y'];
  }

  // The visibility of the selector_element
  this.selector_element_visible = args.selector_element_visible || true;

  // Initialize the selector
  this.init();
} // / ndSelector

ndSelector.prototype = {

  /**
   * Initialize the selector:
   * - create the selector_element (div)
   * - set default position
   * - add the selector_element to it's parent_element
   */
  init: function () {

    // Parent element is defined
    if (this.parent_element !== null) {

      // Create the selector_element using a div
      this.selector_element = document.createElement('div');

      // Set the name of the selector_element using a data attribute
      this.selector_element.setAttribute('data-name', this.selector_element_name);

      // Set the CSS class of the selector_element
      this.selector_element.className = this.selector_element_class + ' ' + 'draggable';

      // Set the width of the selector_element
      this.selector_element.style.width = this.selector_element_width + 'px';

      // Set the height of the selector_element
      this.selector_element.style.height = this.selector_element_height + 'px';

      // Set the initial y position of the selector_element
      // this.selector_element.style.top = this.selector_element_y + 'px';
      this.selector_element.setAttribute('data-y', this.selector_element_y);

      // Set the initial x position of the selector_element
      // this.selector_element.style.left = this.selector_element_x + 'px';
      this.selector_element.setAttribute('data-x', this.selector_element_x);

      // Translate the selector_element to the given (x, y) position
      this.selector_element.style.transform = 'translate(' + this.selector_element_x + 'px, ' + this.selector_element_y + 'px)';

      // Set the initial visibility of the selector_element
      this.setVisible();

      // Add the selecotr_element to the parent_element
      this.parent_element.appendChild(this.selector_element);

      // Mouse was released
      this.selector_element.addEventListener('mouseup', function (e) {

        var x = parseInt(this.selector_element.getAttribute('data-x'));
        var y = parseInt(this.selector_element.getAttribute('data-y'));

        this.current_x = x;
        this.current_y = y;
      }.bind(this), false);

      // Current position
      this.current_x = parseInt(this.selector_element_x);
      this.current_y = parseInt(this.selector_element_y);
    }
  }, // / ndSelector.prototype.init

  changePosition: function (x, y) {

    var _x, _y;

    // Default position
    if (x == 0 && y == 0) {
      _x = this.current_x;
      _y = this.current_y;

      // Super awesome position
    } else {
        _x = this.current_x + x * 1.5;
        _y = this.current_y - y * 1.5;
      }

    // translate the element
    this.selector_element.style.webkitTransform = this.selector_element.style.transform = 'translate(' + _x + 'px, ' + _y + 'px)';

    // update the posiion attributes
    this.selector_element.setAttribute('data-x', _x);
    this.selector_element.setAttribute('data-y', _y);
  },

  /**
   * Update / get the current position of the selector_element
   */
  getPosition: function () {

    // Get the current x position from the selector_element
    this.selector_element_x = parseInt(this.selector_element.getAttribute('data-x'));

    // Save the current x position into localStorage
    window.localStorage[this.selector_element_name + 'x'] = this.selector_element_x;

    // Get the current y position from the selector_element
    this.selector_element_y = parseInt(this.selector_element.getAttribute('data-y'));

    // Save the current y position into localStorage
    window.localStorage[this.selector_element_name + 'y'] = this.selector_element_y;

    // Return the current (x, y) position, width and height
    return {
      x: this.selector_element_x,
      y: this.selector_element_y
    };
  }, // / ndSelector.prototype.getPosition

  /**
   * Set the visibility of the selector_element.
   */
  setVisible: function (visible) {
    // Parameter "visible" is not defined
    if (typeof visible === 'undefined') {
      // Use the default value
      visible = this.selector_element_visible;
    }

    // Set the visiblity for the selector_element
    this.selector_element_visible = visible;
    // FUCK YOU
    // Set the data-attribute "data-visible" for the selector_element to use it in CSS
    this.selector_element.setAttribute('data-visible', this.selector_element_visible);
  }, // / ndSelector.prototype.setVisible

  /**
   * Is the selector_element visible?
   */
  isVisible: function () {
    return this.selector_element_visible;
  } // / ndSelector.prototype.setVisible

}; // / ndSelector.prototype

// target elements with the "draggable" class
interact('.draggable').draggable({
  // enable inertial throwing
  inertia: true,
  // keep the element within the area of it's parent
  restrict: {
    restriction: "parent",
    endOnly: true,
    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
  },

  // call this function on every dragmove event
  onmove: function (event) {
    var target = event.target,

    // keep the dragged position in the data-x/data-y attributes
    x = (parseInt(target.getAttribute('data-x'), 10) || 0) + event.dx,
        y = (parseInt(target.getAttribute('data-y'), 10) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },
  // call this function on every dragend event
  onend: function (event) {}
});
/**
 * SoundCloud extension for ndAudio
 *
 * Dependency:
 * - ndAudio
 */
function ndSoundcloud(args) {
  // Name of the function
  this.functionName = 'ndSoundcloud';

  // Reference to ndAudio
  this.ndAudio = args.ndAudio || null;

  // ID of the registered SoundCloud App
  this.clientID = args.clientID || null;

  // URL to a track on SoundCloud
  this.trackURL = args.trackURL || null;

  // Reference to the SoundCloud track (loaded using the SoundCloud SDK)
  this.track = null;

  // URL to the SoundCloud stream for a given trackURL
  this.streamURL = null;

  // Reference to the mediaElement from ndAudio
  this.mediaElement = this.ndAudio.mediaElement;

  // Reference to the SoundCloud SDK
  // @see https://github.com/soundcloud/soundcloud-javascript
  // @see https://developers.soundcloud.com/docs/api/sdks#javascript
  this.sdk = SC;

  // Initialize SoundCloud SDK with the given clientID
  // to identify this application towards the SoundCloud API
  this.sdk.initialize({
    client_id: this.clientID
  });
} // / ndSoundcloud

/**
 * ndSoundcloud - functions
 */
ndSoundcloud.prototype = {

  /*
   * Load the SoundCloud track data as JSON for a given trackURL.
   * 
   * # Example:
   * loadTrack({ trackURL : 'https://soundcloud.com/blaize323/spongebob-bounce-pants-blaize-remix-edit' })
   */
  loadTrack: function (args) {

    // Init args if not set
    args = args || {};

    // The URL to the track
    this.trackURL = args.trackURL || this.trackURL;

    // Ajax to get the track-JSON for the given trackURL
    this.sdk.get(
    // API endpoint to lookup / access resources for a given SoundCloud URL
    '/resolve',

    // URL of the track
    { url: this.trackURL },

    // Result from SoundCloud
    function (track) {

      // Resolving the track was successful
      if (typeof track.errors === 'undefined') {
        // Save the track data
        this.track = track;

        // The track is streamable
        if (track.streamable) {
          // Create the streamURL using the given clientID
          this.streamURL = this.track.stream_url + '?client_id=' + this.clientID;

          // Update the mediaElement
          this.ndAudio.updateMediaElement(this.streamURL);

          // The track is not streamable D:<
        } else {
            console.error('This SoundCloud URL is not allowed to be streamed.');
          }

        // Error while resolving the track
      } else {
          // Iterate over all errors
          for (var i = 0; i < track.errors.length; i++) {
            // Show a specific error message
            console.error(this.functionName, ':', track.errors[i].error_message);
          }
        }

      // Bind ndSoundcloud scope to the function
    }.bind(this) // / function(track)

    ); // / this.sdk.get('/resolve')
  } // / ndSoundcloud.loadTrack

}; // / ndSoundcloud.prototype
function ndSquare(args) {
  this.x = args.x || 0;
  this.y = args.y || 0;

  this.width = args.width || 0;
  this.height = args.height || 0;

  this._width = this.width;
  this._height = this.height;

  this.life = args.life || 0;

  this.max_life = args.max_life || 5;

  this.almost_dead = args.almost_dead || 0;
  this.max_almost_dead = args.max_almost_dead || 0;

  this.die_sooner = args.die_sooner || 0;

  this.ndVisualization = args.ndVisualization || null;

  this.ndAudio = args.ndAudio || null;

  this.canvas_context = this.ndVisualization.canvas_context;
  this.canvas_element = this.ndVisualization.canvas_element;

  this.color = args.color || null;
  this.opacity = args.opacity || 0.35;

  this.frequency_range = args.frequency_range || 'null';

  this.min_frequency = args.min_frequency || 185;

  this.frequency = 0;
  this._frequency = this.frequency;

  this.drawing = false;

  this.ratio_x = 0;
  this.ratio_y = 0;

  this.size_multiplicator = args.size_multiplicator || 1.2;

  this.change_color = ['highmid', 'high', 'superhigh'];

  this._delay = 0;
} // / ndSquare

ndSquare.prototype = {

  init: function () {}, // / ndSquare.prototype.init

  draw: function () {

    if (this.ndAudio.audioGroupedFrequencyData !== null && typeof this.ndAudio.audioGroupedFrequencyData[this.frequency_range] !== 'undefined') {

      this.frequency = this.ndAudio.audioGroupedFrequencyData[this.frequency_range].value;

      if (this.life++ > this.max_life) {
        this.max_life = this.frequency / 6;

        this.life = 0;

        this.opacity = 0.65;

        this._width = this.width;
        this._height = this.height;

        this.x = getRandomInt(this.canvas_element.width / 2 * 0.5, this.canvas_element.width / 2 * 1.5);
        this.y = getRandomInt(this.canvas_element.height / 2 * 0.5, this.canvas_element.height / 2 * 1.5);

        this.color = 360 / 255 * (this.frequency * Math.random() + this.frequency);

        this._delay = 0;

        this.drawing = false;

        this.ratio_x = 0;
        this.ratio_y = 0;
      }

      // Fade out
      if (this.life > this.max_life * 0.8) {
        this.opacity -= 0.075;

        if (this.opacity < 0) {
          this.drawing = false;
          this.life = this.max_life + 1;
        }
      }

      if (!this.drawing && this.frequency >= this.min_frequency && this._delay++ >= this.die_sooner) {
        this.life = 0;
        this.max_life -= this.die_sooner;
        this.drawing = true;

        //this.ratio_x = Math.random();
        //this.ratio_y = Math.random();
        this.ratio_x = this.ratio_y = 1;
      }

      if (!this.drawing && this.frequency < this.min_frequency) {
        this._delay = 0;
      }

      if (this.drawing) {

        if (this.change_color.indexOf(this.frequency_range) != -1) {
          this.color += this.life;
        }

        this.canvas_context.fillStyle = "hsla(" + this.color + ", 100%, 60%, " + this.opacity + ")";

        this._width += this.life * this.ratio_x * this.size_multiplicator;
        this._height += this.life * this.ratio_y * this.size_multiplicator;

        this.canvas_context.fillRect(this.x - this._width / 2, this.y - this._height / 2, this._width, this._height);
      }

      // if (this.frequency < 185 && this.life <= 1) {
      //   this.life = 0;

      // } else {

      //   // if (this.life <= 1) {
      //   //   this.life = this.die_sooner;
      //   // }

      // }

      //this.canvas_context.restore();
    }
  } // / ndSquare.prototype.draw

}; // / ndSquare
function ndVisualization(args) {

  // The canvas element
  this.canvas_element = args.canvas_element || null;

  // Is the mouse down on the canvas_element
  this.canvas_element_is_mouse_down = false;

  // The event that is fired when the mouse is down
  this.canvas_element_mouse_down_event = null;

  // The rendering context of the canvas_element
  this.canvas_context = null;

  // The background color for the canvas_context
  this.canvas_context_background_color = args.canvas_context_background_color || 'rgb(0, 0, 0)';

  // The parent element for the canvas_element
  this.parent_element = args.parent_element || document.body;

  /*
   * Elements 
   */
  // A queue of elements which can be rendered to the canvas
  this.element_queue = [];

  /*
   * @see ndAudio
   */
  this.ndAudio = args.ndAudio || null;

  /*
   * @see ndMidi
   */
  this.ndMidi = args.ndMidi || null;

  /*
   * ndSelector
   */
  // Group of ndSelector
  this.selectors = args.selectors || null;

  /*
   * Drawing mode
   */
  // Is drawing activated?
  this.drawing_activated = args.drawing_activated || false;

  // The drawing should not be removed
  this.drawing_permanent = args.drawing_permanent || false;

  // Size of one square
  this.drawing_square_size = args.drawing_square_size || 60;

  /*
   * LED
   */
  // Amount of pixel that are used per LED (pixel_per_led * pixel_per_led)
  this.pixel_per_led = args.pixel_per_led || 10;

  // Amount of LED in every row
  this.led_row_amount = 8;

  // Amount of LED in every column
  this.led_column_amount = 8;

  // Initialize this instance of ndVisualization
  this.init();
} // / ndVisualization

/*
 * Functions for ndVisualization
 */
ndVisualization.prototype = {

  init: function () {

    // The canvas_element is not defined
    if (this.canvas_element === null) {
      // Create the canvas_element
      this.canvas_element = document.createElement('canvas');

      // Add the canvas_element to the parent_element
      this.parent_element.appendChild(this.canvas_element);
    }

    // Listen to "resize" events
    window.addEventListener('resize', function (event) {

      // Resize the canvas_element
      this.resize();
    }.bind(this), false); // / window.addEventListener('resize')

    // Listen to the mousedown event on the canvas_element
    this.parent_element.addEventListener('mousedown', function (event) {
      event.preventDefault();

      // Drawing is activated
      if (this.drawing_activated) {
        // Mouse is down
        this.canvas_element_is_mouse_down = true;

        // Reference to the event
        this.canvas_element_mouse_down_event = event;
      }
    }.bind(this), true); // / this.canvas_element.addEventListener('mousedown')

    // Listen to the mouseup event on the canvas_element
    this.parent_element.addEventListener('mouseup', function (event) {
      event.preventDefault();

      this.canvas_element_is_mouse_down = false;
      this.canvas_element_mouse_down_event = null;
    }.bind(this), true); // / this.canvas_element.addEventListener('mouseup')

    // Listen to the mousemove event on the canvas_element
    this.parent_element.addEventListener('mousemove', function (event) {
      // Drawing is activated
      if (this.drawing_activated && this.canvas_element_is_mouse_down) {
        event.preventDefault();

        // Update the mouse_down_event
        this.canvas_element_mouse_down_event = event;
      }
    }.bind(this), true); // / this.canvas_element.addEventListener('mousemove')

    // Set the canvas_context
    this.canvas_context = this.canvas_element.getContext('2d');

    // Resize the canvas_element
    this.resize();
  }, // / ndVisualization.prototype.init

  /**
   * Resize the canvas and every ndVisualizationElement. 
   * 
   */
  resize: function () {

    // Set the width of the canvas_element using the width of the parent_element
    this.canvas_element.width = this.parent_element.clientWidth;

    // Set the height of the canvas_element using the height of the parent_element
    this.canvas_element.height = this.parent_element.clientHeight;

    // Iterate over all elements in the queue
    for (var i = 0; i < this.element_queue.length; i++) {
      // Resize the current element
      this.element_queue[i].resize();
    }

    // Redraw the default canvas_context
    this.drawDefaultCanvasContext();
  }, // / ndVisualization.prototype.resize

  /**
   * Draw the default canvas_context:
   * - background color
   */
  drawDefaultCanvasContext: function () {

    // Clear the canvas_context
    this.canvas_context.clearRect(0, 0, this.canvas_element.width, this.canvas_element.height);

    // Set the background color of the canvas_context
    this.canvas_context.fillStyle = this.canvas_context_background_color;
    this.canvas_context.fillRect(0, 0, this.canvas_element.width, this.canvas_element.height);
  }, // / ndVisualization.prototype.drawDefaultCanvasContext

  draw: function () {
    // this.canvas_context.globalCompositeOperation = 'source-over';

    // Drawing is not permanent
    if (!this.drawing_permanent) {
      // Redraw the background
      this.canvas_context.fillStyle = "rgba(0, 0, 0, .3)";
      this.canvas_context.fillRect(0, 0, this.canvas_element.width, this.canvas_element.height);
    }

    if (this.drawing_activated && this.canvas_element_is_mouse_down) {
      // Draw a square at the (x, y) position of the event
      this.drawSquare(this.canvas_element_mouse_down_event);
    }

    // Iterate over all elements in the queue
    for (var i = 0; i < this.element_queue.length; i++) {
      this.element_queue[i].draw();
    }
  },

  /**
   * Add an element to the element_queue.
   */
  addElement: function (element) {

    // Reference to ndVisualization
    element.ndVisualization = this;

    // Set the context
    element.context = this.canvas_context;

    // Set the canvas
    element.canvas = this.canvas_element;

    // Set audio
    element.ndAudio = this.ndAudio;

    // Add the element to the element_queue
    this.element_queue.push(element);
  }, // / ndVisualization.addElement

  /**
   * Draw a square onto the canvas_context test test
   */
  drawSquare: function (event) {
    this.canvas_context.fillStyle = "hsla(" + 360 / 255 * getRandomInt(0, 255) + ", 100%, 60%,  .5)";
    this.canvas_context.fillRect(event.x - this.drawing_square_size / 2 + 10 * Math.random() / 2, event.y - this.drawing_square_size / 2 + 10 * Math.random() / 2, this.drawing_square_size, this.drawing_square_size);
  }, // / ndVisualization.prototype.drawSquare

  getLEDs: function () {
    var openPixelControl = [];

    // selectors is defined
    if (this.selectors !== null) {

      // The (x, y) position of the selector
      var selector_position;

      // The image_data represented by the position / size of the selector
      var image_data;

      // The list of RGB values
      var rgb_list;

      // The position of the current pixel
      var position;

      // The current led in the specific row
      var led_row;

      // The current led in the specific column
      var led_column;

      // The RGB values for every LED
      var leds;

      // The index of the current LED
      var current_led;

      // Iterate over all selectors
      this.selectors.forEach(function (selector) {

        // Reset
        position = 0;
        current_led = 0;
        led_row = 0;
        led_column = 0;
        leds = [];

        // Get current (x, y) position from the selector
        selector_position = selector.getPosition();

        // Get the image data from the canvas using the selector_position
        image_data = this.canvas_context.getImageData(selector_position.x, selector_position.y, this.pixel_per_led * this.led_row_amount, this.pixel_per_led * this.led_column_amount);

        // Get the data
        rgb_list = image_data.data;

        // For every row of pixels
        for (var row = 0; row < this.led_row_amount * this.pixel_per_led; row++) {

          // For every column pixels
          for (var column = 0; column < this.led_column_amount * this.pixel_per_led; column++) {

            // Set the LED for the current pixel
            current_led = led_row * this.led_row_amount + led_column;

            // Set the position of the current pixel
            // - current row: (row * (this.pixel_per_led * this.led_column_amount * 4))
            // - current column: (column * 4)
            position = row * (this.pixel_per_led * this.led_column_amount * 4) + column * 4;

            // console.log(led_row, led_column, current_led, position);

            // The current_led is not defined inside leds
            if (typeof leds[current_led] === 'undefined') {
              // @TODO [TimPietrusky] jsperf about "insert array2 into array1 at position x"
              leds.splice(current_led, 0, []);

              // Initialize the 3 value array [red, green, blue] for the current_led
              leds[current_led][0] = 0;
              leds[current_led][1] = 0;
              leds[current_led][2] = 0;
            }

            // Sum up all red values
            leds[current_led][0] += rgb_list[position];

            // Sum up all green values
            leds[current_led][1] += rgb_list[position + 1];

            // Sum up all blue values
            leds[current_led][2] += rgb_list[position + 2];

            // Increase current led per column
            if ((column + 1) % this.pixel_per_led === 0) {
              ++led_column;
            }
          } // / for every column of LEDs

          // Reset led_column
          led_column = 0;

          // Increase current led per row
          if ((row + 1) % this.pixel_per_led === 0) {
            ++led_row;
          }
        } // / for every row of LEDs

        // Iterate over all leds
        for (var i = 0; i < leds.length; i++) {
          // Create a normalized value for red
          openPixelControl.push(Math.floor(leds[i][0] / (this.pixel_per_led * this.pixel_per_led)));
          // Create a normalized value for green
          openPixelControl.push(Math.floor(leds[i][1] / (this.pixel_per_led * this.pixel_per_led)));
          // Create a normalized value for blue
          openPixelControl.push(Math.floor(leds[i][2] / (this.pixel_per_led * this.pixel_per_led)));
        }
      }, this); // / this.selectors.forEach
    } // / selectors is defined

    return openPixelControl;
  }

}; // / ndVisualization.prototype

function getRandomInt(min, max) {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/*jshint strict:false */
"use strict";

class ndVisualizationElement {

  constructor(args) {
    // @see ndVisualization
    this.ndVisualization = args.ndVisualization || null;

    // Set the canvas context
    this.context = args.context || null;

    // Set the canvas
    this.canvas = args.canvas || null;

    // Shorthand for context
    this.ctx = this.context;

    // The global position operation of the canvas
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
    this.globalCompositionOperation = args.globalCompositionOperation || 'source-over';

    // x position
    this.x = args.x || 0;

    // y position
    this.y = args.y || 0;

    // The note (code) of the MIDI input element
    this.midiInputCode = args.midiInputCode || null;

    // Audio data for this element
    this.audio = {

      // Current frequency for the specified range
      frequency: 0
    };

    // Enable debugging
    this.debug = args.debug === undefined ? false : args.debug;
  }

  set context(context) {
    this.ctx = context;
  }

  // Draw on canvas
  draw() {}

  // Resize element
  resize() {}
}

class ndBar extends ndVisualizationElement {

  constructor(args) {
    super(args);

    this.color = args.color || 0;

    this.range = args.range || null;
    this.trigger = args.trigger || 255;

    this.velocity = 0;

    this.audio = {
      frequency: 0
    };

    this.amount = args.amount || undefined;
  }

  draw() {

    // Audio data available
    if (this.ndAudio.audioFrequencyData !== null) {

      this.ctx.save();

      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;

      //this._color = this.color + (360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

      this._velocity = this.velocity / 127 * 4;

      // this._amount = this.amount || this.ndAudio.audioAnalyser.frequencyBinCount;
      this._amount = this.ndAudio.audioFrequencyData.length;

      this.sliceWidth = (this.canvas.width + 250) / this._amount;

      this._x = 0;

      this.ctx.beginPath();
      this.ctx.lineWidth = this._velocity;

      // Initial position
      this.ctx.moveTo(0, this.canvas.height);

      // For each audio frequency
      for (var i = 0; i < this._amount; i++) {
        // Calculate y based on the current frequency and the height of the canvas
        this._y = this.ndAudio.audioFrequencyData[i] / 255 * this.canvas.height;

        this._color = this.color + 360 / 255 * this.ndAudio.audioFrequencyData[i];

        this.ctx.beginPath();
        this.ctx.moveTo(this._x, this.canvas.height);
        this.ctx.lineTo(this._x, this._y);

        if (this.ndAudio.audioFrequencyData[i] < 5) {
          this.ctx.strokeStyle = "rgba(60, 60, 60, 0)";
        } else {
          this.ctx.strokeStyle = "hsla(" + this._color + ", 100%, 70%, .85)";
        }

        this.ctx.stroke();

        // Increase the x position for the next bar
        this._x += this.sliceWidth;
      } // / for each frequency

      // this.ctx.lineTo(this.canvas.width + 15, 0);

      // this.ctx.fill();
      // this.ctx.stroke();

      this.ctx.restore();
    } // / Audio data available
  } // / ndBar.draw

  // resize() {

  // } // / ndBar.resize

} // / ndBar
class ndCircle extends ndVisualizationElement {
  constructor(args) {
    super(args);

    this.color = args.color || '#fff';

    this.range = args.range || null;

    this.trigger = args.trigger || 255;

    this.x = args.x || 0;
    this.y = args.y || 0;
    this.r = args.r || 0;

    this.isToggle = args.isToggle || false;
    this.toggle = args.toggle || false;

    this.audio = {
      frequency: 0
    };
  }

  draw() {

    // ndAudio available
    if (this.ndAudio.audioGroupedFrequencyData !== null && typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {

      this.ctx.save();

      this.ctx.globalCompositeOperation = "source-over";

      this._x = this.canvas.width / 2 + this.x;
      this._y = this.canvas.height / 2 + this.y;

      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;

      this._r = this.audio.frequency / 255 * this.r;

      this.ctx.beginPath();

      if (this.audio.frequency >= this.trigger) {
        this._color += 1;
        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .85)";

        this.ctx.globalAlpha = 1;
        this._r = window.getRandomInt(this._r + Math.PI, this._r + Math.PI * 4);
      } else {

        this._color = this.color + 360 / 255 * this.audio.frequency;
        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .85)";

        this.ctx.globalAlpha = 1;
        this.ctx.lineWidth = this.audio.frequency / 2;
      }

      this.ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
      this.ctx.fill();

      this.ctx.restore();
    } // / ndAudio available
  } // / draw
}
class ndGiphyElement extends ndVisualizationElement {

  constructor(args) {
    super(args);

    // Reference to ndGiphy
    this.ndGiphy = args.ndGiphy || null;

    // The ID of a specific Giphy
    this._id = args.id || null;

    // this.ndGiphy.currentId = this._id;

    this.loaded = false;

    this.video = null;

    this.isToggle = args.isToggle || false;

    this.toggle = args.toggle || false;
  }

  draw() {

    // if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

    // Toggle button
    // if (this.isToggle) {
    //   // Toggle: On
    //   if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn && !this.toggle) {
    //     this.toggle = true;
    //     this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;
    //   }

    //   // Toggle: Off
    //   if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn && this.toggle) {
    //     this.toggle = false;
    //     this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;
    //   }
    // }

    // The id of current video was changed
    if (this._id !== this.ndGiphy.currentId && this.video !== null) {
      // Load the "new" video
      this.loaded = false;

      // Element with the given ID already exists in the DOM
      // if (document.getElementById(this.ndGiphy.gifs[this._id].id) !== undefined) {
      this.video.pause();
      this.video.currentTime = 0;
      // }

      this._id = this.ndGiphy.currentId;
    }

    // No response from giphy yet
    if (!this.loaded) {

      // The giphy with the specified id was loaded
      if (this.ndGiphy.gifs[this.ndGiphy.currentId] !== undefined) {

        // Giphy was loaded from the Giphy API
        this.loaded = true;

        // Update the active video element
        this.video = this.ndGiphy.gifs[this.ndGiphy.currentId].video;

        // Start the video playback
        this.video.play();
      }

      // Video is loaded
    } else {

        // if (this.isToggle) {

        //   if (this.toggle) {
        //     this.ctx.save();
        //     this.ctx.globalAlpha = this.ndGiphy.opacity;
        //     this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        //     this.ctx.restore();
        //   }

        // } else {

        // The element is pressed
        // if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {
        this.ctx.save();
        this.ctx.globalAlpha = this.ndGiphy.opacity;
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        // } // / element is pressed

        // }
      } // / video is loaded

    // } // / MIDI input exists
  } // / draw

} // / ndGiphyElement
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
class ndGiphyElementRestart extends ndVisualizationElement {

  constructor(args) {
    super(args);

    // Reference to ndGiphy
    this.ndGiphy = args.ndGiphy || null;

    this.video = args.video || null;
  }

  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn) {

        this.ndVisualization.ndMidi.inputElements[this.midiInputCode].noteOn = false;

        // Get current video
        this.video = this.ndGiphy.gifs[this.ndGiphy.currentId].video;

        // Restart the video
        this.video.currentTime = 0;
      } // / element is pressed
    } // / input element exists
  } // / draw

} // / ndGiphyElementRestart
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
class ndGlobalAlpha extends ndVisualizationElement {

  constructor(args) {
    super(args);
  }

  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      this.ctx.save();

      var opacity = 1 - 1 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;

      this.ctx.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.restore();

      if (window.registry != undefined) {
        registry.getAll().brightness = 1 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;
      }
    } // / input element exists
  } // / draw

} // / ndGiphyElement
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
class ndStar extends ndVisualizationElement {

  constructor(args) {
    super(args);

    this.color = args.color || 0;

    this.spikes = args.spikes || 3;
    this.outerRadius = args.outerRadius || 3;
    this.innerRadius = args.innerRadius || 3;

    this.rotate = Math.PI / 2 * 3;
    this.step = Math.PI / this.spikes;

    this.factor = args.factor || 1;

    this.midiInputCode = args.midiInputCode || null;
    this.range = args.range || null;
    this.trigger = args.trigger || 255;

    this.audio = {
      frequency: 0
    };

    this.globalCompositionOperation = args.globalCompositionOperation || 'source-over';
  }

  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {

        // Audio data available
        if (this.ndAudio.audioGroupedFrequencyData !== null && typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {

          this.ctx.save();

          this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;

          this._x = this.x;
          this._y = this.y;
          this._color = this.color + 360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;

          this._velocity = this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity / 127 * this.factor * (this.audio.frequency / 255);

          this._outerRadius = Math.random() * this._velocity + this.outerRadius;
          this._innerRadius = Math.random() * this._velocity + this.innerRadius;

          this.ctx.beginPath();
          this.ctx.moveTo(this._x * this._velocity, this._y * this._velocity - this._outerRadius);

          for (var i = 0; i < this.spikes; i++) {
            this._x = this.x * this._velocity + Math.cos(this.rotate) * this._outerRadius;
            this._y = this.y * this._velocity + Math.sin(this.rotate) * this._outerRadius;
            this.ctx.lineTo(this._x, this._y);
            this.rotate += this.step;

            this._x = this.x * this._velocity + Math.cos(this.rotate) * this._innerRadius;
            this._y = this.y * this._velocity + Math.sin(this.rotate) * this._innerRadius;
            this.ctx.lineTo(this._x, this._y);
            this.rotate += this.step;
          }

          this.ctx.lineTo(this.x * this._velocity, this.y * this._velocity - this._outerRadius);
          this.ctx.closePath();

          if (this.audio.frequency >= this.trigger) {
            this.ctx.lineWidth = getRandomInt(this.audio.frequency / 255, this.audio.frequency / 255 * 10);
          } else {
            this.ctx.lineWidth = 2;
          }

          this.ctx.strokeStyle = "hsla(" + this._color + ", 100%, 70%, .85)";
          this.ctx.stroke();
          this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";
          this.ctx.fill();

          this.ctx.restore();
        } // / Audio data available
      } // / element is pressed
    } // / input element exists
  }

} // / ndStar
class ndStrobeLight extends ndVisualizationElement {

  constructor(args) {
    super(args);

    this.color = args.color || 0;

    // This element will in color and not in black / white
    this.inColor = args.inColor === undefined ? true : args.inColor;

    // The color will be generated randomly
    this.isRandom = args.isRandom === undefined ? false : args.isRandom;

    // The note (code) of the MIDI input element
    this.midiInputCode = args.midiInputCode || null;

    // State: on (activated), off (deactivated)
    this.state = args.state || 'on';

    // Redraw instantly
    this.instantReset = args.instantReset === undefined ? true : args.instantReset;

    // Time (ms) to wait until the element will be redrawn
    this.delay = args.delay || 0;

    // Change the delay based on Audio / MIDI input
    this.dynamicDelay = args.dynamicDelay === undefined ? false : args.dynamicDelay;

    // The timestamp of the last draw
    this.lastDraw = null;

    // The timestamp of the current attemp to draw
    this.currentDraw = null;

    // The width of the element
    this.width = args.width || -1;

    // The height of the element
    this.height = args.height || -1;
  }

  /**
   * Draw ndStrobeLight on canvas.
   * 
   */
  draw() {

    // Save the current timestamp
    this.currentDraw = Date.now();

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      this._delay = this.delay * (127 / this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {

        // The delay is over
        if (this.lastDraw + this._delay <= this.currentDraw) {

          // Save currentDraw time into lastDraw
          this.lastDraw = this.currentDraw;

          // Resize the element
          this.resize();

          this.ctx.save();

          this.ctx.globalCompositeOperation = this.globalCompositionOperation;

          // Create a color based on the velocity of the MIDI element
          if (this.inColor) {

            // Create a random color
            if (this.isRandom) {
              this._color = this.color + 360 / 127 * getRandomInt(0, 127);

              // Create a color based on the velocity
            } else {
                this._color = this.color + 360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;
              }

            this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";

            // XEON light :D BOOOM! (6200 Kelvin)
          } else {
              this.ctx.fillStyle = "rgba(255, 249, 242, .85)";
            }

          // Redraw instantly
          if (this.instantReset) {

            // State is on
            if (this.state === 'on') {
              // Set state to off
              this.state = 'off';

              // State is off
            } else {
                this.ctx.fillStyle = "#000";
                // Set state to on
                this.state = 'on';
              }

            // Don't redraw instantly
          } else {
              this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .85)";
            }

          // Draw a rectangle on the whole canvas
          this.ctx.rect(this.x, this.y, this._width, this._height);

          this.ctx.fill();
          this.ctx.restore();
        } // / delay is over

        // The element is not pressed
      } else {
          // Reset the lastDraw
          this.lastDraw = 0;

          // Reset state
          this.state = 'on';
        }

      // Could not find element with that note
    } else {
        // Debug is enabled
        if (this.debug) {
          console.info(this.midiInputCode, 'is not mapped. Please try again :D');
        }
      }
  } // / ndStrobeLight.draw

  /**
   * Resize the element.
   *
   * @see ndVisualization#resize()
   */
  resize() {

    // Set the width / height automatically if no width / height got provided
    if (this.width === -1 || this.height === -1) {
      // The element should be as big as the canvas
      this._width = this.ndVisualization.canvas_element.width;
      this._height = this.ndVisualization.canvas_element.height;

      // The user specified the width / height
    } else {
        this._width = this.width;
        this._height = this.height;

        this.x = this.ndVisualization.canvas_element.width / 2 - this._width / 2;
        this.y = this.ndVisualization.canvas_element.height / 2 - this._height / 2;
      }
  } // / ndStrobeLight.resize

} // / ndStrobeLight
class ndStrokeCircle extends ndVisualizationElement {
  constructor(args) {
    super(args);

    this.color = args.color || '#fff';

    this.range = args.range || null;

    this.trigger = args.trigger || 255;

    this.x = args.x || 0;
    this.y = args.y || 0;
    this.r = args.r || 0;

    this.audio = {
      frequency: 0
    };
  }

  draw() {

    // ndAudio available
    if (this.ndAudio.audioGroupedFrequencyData !== null && typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {

      this.ctx.save();

      this.ctx.globalCompositeOperation = "difference";

      this._x = this.canvas.width / 2 + this.x;
      this._y = this.canvas.height / 2 + this.y;

      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;
      this._color = this.color + 360 / 255 * this.audio.frequency;
      this._r = this.audio.frequency / 255 * this.r;

      this.ctx.beginPath();

      // this.ctx.translate(this._x, this._y);
      // this.ctx.scale(1.225, 1.225);
      // this.ctx.translate(-this._x, -this._y);

      if (this.audio.frequency >= this.trigger) {

        this.ctx.globalAlpha = .75;

        //this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";
        this.ctx.fillStyle = 'transparent';
        this._color = window.getRandomInt(0, this._color);
        this._strokeColor = this._color + 360 / 255 * this.audio.frequency;
        this._strokeStyle = "hsla(" + this._strokeColor + ", 100%, 60%, 1)";

        this.ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = this._strokeStyle;
        this.ctx.lineWidth = window.getRandomInt(Math.PI * 4, Math.PI * 8);
      } else {

        this.ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = 'transparent';

        this.ctx.globalAlpha = .15;
        this.ctx.lineWidth = this.audio.frequency / 2;
      }

      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();

      this.ctx.restore();
    } // / ndAudio available
  } // / draw
}
class ndUltraSquare extends ndVisualizationElement {
  constructor(args) {
    super(args);

    this.color = args.color || '#fff';

    this.range = args.range || null;

    this.trigger = args.trigger || 255;

    this.x = args.x || 0;
    this.y = args.y || 0;
    this.width = args.width || 0;
    this.height = args.height || 0;
    this.angle = args.angle || 0;

    this._angle = this.angle;

    this.midiInputCode = args.midiInputCode || null;

    this.audio = {
      frequency: 0
    };
  }

  draw() {

    // Audio data available
    if (this.ndAudio.audioGroupedFrequencyData !== null && typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {

      this.ctx.save();

      this.ctx.globalCompositeOperation = "lighten";

      this._x = this.canvas.width / 2 + this.x;
      this._y = this.canvas.height / 2 + this.y;

      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;
      this._color = this.color + 360 / 255 * this.audio.frequency;
      this._r = this.audio.frequency / 255 * this.r;

      this._width = this.width;
      this._height = this.height;

      this.ctx.beginPath();

      this.ctx.globalAlpha = .05;

      this.angle_factor = 2;

      // this._color = window.getRandomInt(0, 360);

      this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";

      this.ctx.translate(this._x, this._y);

      this.ctx.rotate(this._angle * Math.PI / 180);

      this.factor = 2.5 * (this.audio.frequency / 255);

      this._width *= this.factor;
      this._height *= this.factor;

      this.ctx.fillRect(-(this._width / 2), -(this._height / 2), this._width, this._height);

      this.factor *= .45;

      this._width *= this.factor;
      this._height *= this.factor;

      this.ctx.globalAlpha = .5;
      this.ctx.fillRect(-(this._width / 2), -(this._height / 2), this._width, this._height);

      this._angle += this.angle_factor;

      if (this._angle > 360) {
        this._angle = 0;
      }

      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.restore();
    } // / Audio data available
  } // / draw
}
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
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined && this.ndVisualization.ndMidi.inputElements[1337] !== undefined) {

      // Values changed
      if (this.x != this.ndVisualization.ndMidi.inputElements[1337].velocity || this.y != this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity) {

        this.x = this.ndVisualization.ndMidi.inputElements[1337].velocity;
        this.y = this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;

        // Finger moved from the pad
        if (this.x - 64 == 0 && this.y == 0) {
          this.x = 0;
          this.ndVisualization.ndMidi.inputElements[1337].velocity = 0;
        }

        this.selector.changePosition(this.x, this.y);
      } // / Values changed

      // miniled.tilt = this.tiltMapper(this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);
    } // / input element exists

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[1337] !== undefined) {
      // miniled.pan = this.panMapper(this.ndVisualization.ndMidi.inputElements[1337].velocity);
    }
  } // / draw

} // / ndGiphyElement
"use strict";

window.onload = function () {

  /*
   * Container for the NERD DISCO, you might say it's a party.
   */
  var container = document.getElementById('nerddisco');

  // Create a new global helper
  var NERDDISCO_helper = new ndHelper({});

  var button_korg_nanoPAD2 = {
    // First block
    a: 37,
    b: 39,
    c: 41,
    d: 43,
    e: 36,
    f: 38,
    g: 40,
    h: 42,

    // Second block
    i: 45,
    j: 47,
    k: 49,
    l: 51,
    m: 44,
    n: 46,
    o: 48,
    p: 50
  };

  var button_korg_padKONTROL = {
    a: 61,
    b: 69,
    c: 65,
    d: 63,

    e: 60,
    f: 59,
    g: 57,
    h: 55,

    i: 49,
    j: 51,
    k: 68,
    l: 56,

    m: 48,
    n: 52,
    o: 54,
    p: 58,

    knob_a: 20,
    knob_b: 21,

    pad_y: 1
  };

  var button = button_korg_padKONTROL;

  var pixel_per_led = 20;

  /*
   * Selectors
   */
  var NERDDISCO_selector_front = new ndSelector({
    parent_element: container,
    selector_element_name: ' ',
    selector_element_x: 500,
    selector_element_width: pixel_per_led * 8,
    selector_element_height: pixel_per_led * 8
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
    mediaElement: document.getElementById('soundcloud__player'),
    fftSize: 512
  });

  /**
   * MIDI
   */
  var NERDDISCO_midi = new ndMidi({
    debug: false,
    mappingMode: false,
    inputMapping: button
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
    ndAudio: NERDDISCO_audio,
    ndMidi: NERDDISCO_midi,
    parent_element: container,
    drawing_activated: false,
    drawing_permanent: false,
    drawing_square_size: 200,
    pixel_per_led: pixel_per_led,
    selectors: [NERDDISCO_selector_front]
  });

  /*
   * Giphy
   */

  // NERDDISCO_selector_right,
  // NERDDISCO_selector_left,
  // NERDDISCO_selector_top,
  // NERDDISCO_selector_back
  NERDDISCO_giphy = new ndGiphy({
    apiKey: 'dc6zaTOxFJmzC',
    apiURL: 'http://api.giphy.com/v1/gifs',
    playlist: ['LcGFscTzOn9xm', 'NwcjVktO9w3CM', '13THeOXYzh24o0', 'VeevaQ0W85jzy', '11OKI6CBKaEBr2', '3o85xHnzGXZIL0VKH6', '4Npgg5KTV0zAc', 'lNXfBBMCvXRug', '9DfUujoR6pFok', 'x0zayPYjR2lq0', '11Ou8NkBsR3aAE', '1NiRukZ0JAW8U', 'PfqP2XHkF2YfK', 'PrMDV9aUpsZTa', 'kVo3H6tgrupYk', 'gT8rZKoR5bzpe', '3zYt8xNZa5QU8', 'cSRVRajOQynF6', '1JTjMMviVJ7pK', '11lvZGTAZIhAhW', 's06V9SxnAcVR6', '10fmV6zxKSKq2I', 'aPjiWa9dUtBC', 'vozrWmW8jnKCs', 'GdXxnTNXpxfAA', 'M4zazQOlyv4c0', '4MIiLGFlKXm8g', '14bPSP6sM7Ynte', '8Jj9OcQjKJQFG']
  });

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
  NERDDISCO_giphy.request();

  /*
   * GiphyElement
   */
  // The video itself loaded from Giphy
  NERDDISCO_visualization.addElement(new ndGiphyElement({
    id: 1,
    ndGiphy: NERDDISCO_giphy
  }));

  // Change the giphy
  NERDDISCO_visualization.addElement(new ndGiphyElementSwitcher({
    ndGiphy: NERDDISCO_giphy,
    midiInputCode: button.i
  }));

  // Restart the current giphy
  NERDDISCO_visualization.addElement(new ndGiphyElementRestart({
    ndGiphy: NERDDISCO_giphy,
    midiInputCode: button.j
  }));

  // Change the opacity of the current giphy
  NERDDISCO_visualization.addElement(new ndGiphyElementKnob({
    ndGiphy: NERDDISCO_giphy,
    midiInputCode: button.knob_a
  }));

  /*
   * Add elements to the visualization queue.
   */

  /*
   * Some squares on top of each other looking like a "blackhole star" and spinning around
   */

  // Group of circles
  var group_blackholeStar = new ndGroup({
    midiInputCode: button.a,
    isToggle: true
  });
  // Add group to element queue
  NERDDISCO_visualization.addElement(group_blackholeStar);

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -40,
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    range: 'superhigh',
    trigger: 180
  }));

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -80,
    x: 0,
    y: 0,
    angle: 22.5,
    width: 300,
    height: 300,
    range: 'superhigh',
    trigger: 180
  }));

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -120,
    x: 0,
    y: 0,
    angle: 45,
    width: 300,
    height: 300,
    range: 'superhigh',
    trigger: 180
  }));

  group_blackholeStar.addChild(new ndUltraSquare({
    color: -160,
    x: 0,
    y: 0,
    angle: 67.5,
    width: 300,
    height: 300,
    range: 'superhigh',
    trigger: 180
  }));

  /**
   * ndBar
   * 
   */
  var group_frequencyBar = new ndGroup({
    midiInputCode: button.b,
    isToggle: true
  });
  // Add group to element queue
  NERDDISCO_visualization.addElement(group_frequencyBar);

  group_frequencyBar.addChild(new ndBar({
    color: 50,
    x: NERDDISCO_visualization.canvas_element.width / 2,
    y: NERDDISCO_visualization.canvas_element.height / 2,
    range: 'mid',
    trigger: 200,
    factor: 1.25
  }));

  /**
   * ndCircle
   *
   * In the middle of the canvas
   * 
   */
  // Group of circles
  var group_circles = new ndGroup({
    midiInputCode: button.d,
    isToggle: true
  });
  // Add group to element queue
  NERDDISCO_visualization.addElement(group_circles);

  // Add childs to the group
  group_circles.addChild(new ndStrokeCircle({
    color: -120,
    x: -80 - 80 / 2,
    y: 0,
    r: 80,
    range: 'low',
    trigger: 254
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -240,
    x: 80 + 120 / 2,
    y: 0,
    r: 120,
    range: 'lowmid',
    trigger: 235
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -300,
    x: 0,
    y: -80 - 160 / 2,
    r: 160,
    range: 'mid',
    trigger: 200
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -120,
    x: 0,
    y: 80 + 150 / 2,
    r: 150,
    range: 'highmid',
    trigger: 190
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -240,
    x: 0,
    y: 80 + 150 / 2,
    r: 100,
    range: 'highmid',
    trigger: 200
  }));

  group_circles.addChild(new ndStrokeCircle({
    color: -360,
    x: 0,
    y: 80 + 150 / 2,
    r: 50,
    range: 'highmid',
    trigger: 210
  }));

  group_circles.addChild(new ndCircle({
    color: -40,
    x: 0,
    y: 0,
    r: 120,
    range: 'lowmid',
    trigger: 254
  }));

  group_circles.addChild(new ndCircle({
    color: -40,
    x: 0,
    y: 0,
    r: 100,
    range: 'low',
    trigger: 254
  }));

  group_circles.addChild(new ndCircle({
    color: -40,
    x: 0,
    y: 0,
    r: 80,
    range: 'sublow',
    trigger: 254
  }));

  /**
   * 4 different ndStrobeLights, each one mapped to a different MIDI button. 
   *
   */

  // Multiply filter
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 0,
    x: 0,
    y: 0,
    midiInputCode: button.h,
    delay: 25,
    inColor: false,
    globalCompositionOperation: 'multiply'
  }));

  // Fast, black / white, instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 0,
    x: 0,
    y: 0,
    midiInputCode: button.e,
    delay: 10,
    inColor: false
  }));

  // Middle-fast, in color, instantly redrawn
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 160,
    x: 0,
    y: 0,
    midiInputCode: button.f,
    instantReset: false,
    delay: 25
  }));

  // Middle-fast, in color, not instantly redrawn, dynamic delay
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: 240,
    x: 0,
    y: 0,
    midiInputCode: button.g,
    instantReset: false,
    inColor: true,
    isRandom: true,
    dynamicDelay: true,
    delay: 50
  }));

  /**
   * 3 strobeLight squares with a defined size on top of each other in the middle.
   */
  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -100,
    x: NERDDISCO_visualization.canvas_element.width / 2 - 300,
    y: NERDDISCO_visualization.canvas_element.height / 2 - 300,
    width: 200,
    height: 200,
    midiInputCode: button.m,
    instantReset: false,
    delay: 25,
    isRandom: false
  }));

  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -200,
    x: NERDDISCO_visualization.canvas_element.width / 2 - 200,
    y: NERDDISCO_visualization.canvas_element.height / 2 - 200,
    width: 400,
    height: 400,
    midiInputCode: button.m,
    instantReset: false,
    delay: 50,
    isRandom: false
  }));

  NERDDISCO_visualization.addElement(new ndStrobeLight({
    color: -300,
    x: NERDDISCO_visualization.canvas_element.width / 2 - 100,
    y: NERDDISCO_visualization.canvas_element.height / 2 - 100,
    width: 600,
    height: 600,
    midiInputCode: button.m,
    instantReset: false,
    delay: 75,
    isRandom: false
  }));

  /**
   * 5 different stars
   */
  NERDDISCO_visualization.addElement(new ndStar({
    color: -180,
    x: NERDDISCO_visualization.canvas_element.width / 2,
    y: NERDDISCO_visualization.canvas_element.height / 2,
    midiInputCode: button.c,
    range: 'low',
    trigger: 200,
    spikes: 25,
    outerRadius: 60,
    innerRadius: 15
  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -220,
    x: NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y: NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode: button.c,
    range: 'sublow',
    trigger: 200,
    spikes: 5,
    outerRadius: 65,
    innerRadius: 15,
    factor: 1.5

  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -260,
    x: NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y: NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode: button.c,
    range: 'mid',
    trigger: 200,
    spikes: 5,
    outerRadius: 125,
    innerRadius: 15,
    factor: 2.5

  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -300,
    x: NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y: NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode: button.c,
    range: 'highmid',
    trigger: 200,
    spikes: 5,
    outerRadius: 65,
    innerRadius: 15,
    factor: 3.5

  }));

  NERDDISCO_visualization.addElement(new ndStar({
    color: -340,
    x: NERDDISCO_visualization.canvas_element.width / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.width / 4),
    y: NERDDISCO_visualization.canvas_element.height / 2 + getRandomInt(0, NERDDISCO_visualization.canvas_element.height / 4),
    midiInputCode: button.c,
    range: 'mid',
    trigger: 200,
    spikes: 50,
    outerRadius: 250,
    innerRadius: 100,
    factor: 1.25
  }));

  NERDDISCO_visualization.addElement(new ndGlobalAlpha({
    midiInputCode: button.knob_b
  }));

  // var tiltMapper = rangeMapper(0, 127, 0, 250);
  // var panMapper = rangeMapper(0, 127, 0, 250);

  NERDDISCO_visualization.addElement(new ndXYPad({
    midiInputCode: button.pad_y,
    selector: NERDDISCO_selector_front
    // tiltMapper : tiltMapper,
    // panMapper : panMapper
  }));

  /*
   * SoundCloud
   */
  var NERDDISCO_soundcloud = new ndSoundcloud({
    ndAudio: NERDDISCO_audio,
    clientID: 'dce5652caa1b66331903493735ddd64d',
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
    trackURL: 'https://soundcloud.com/cero39-remixes/toro-rojo-no-sentao-cero39'

  });

  NERDDISCO_soundcloud.loadTrack();

  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Bassnectar_Generate.mp3');
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Bassnectar_Mixtape.mp3');
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Worakls - Live act 2013.mp3');
  // NERDDISCO_audio.updateMediaElement('http://nerddiscodata.local/Netsky - Detonate.mp3');

  /*
   * Connector
   */
  var NERDDISCO_connector = new ndConnector({});

  // Get all tracks
  var tracks = document.querySelectorAll('.track');

  // Iterate over all tracks
  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];

    // Listen to the click event
    track.addEventListener('click', function (e) {

      // Update the media element with the new URL
      NERDDISCO_audio.updateMediaElement(this.getAttribute('data-url'));
    });
  };

  var selectors = document.querySelectorAll('.ndSelector');
  var selectorToggle = document.querySelector('.ndSelectorToggle');
  var isToggle = false;

  selectorToggle.addEventListener('click', function (e) {

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
        registry.devices[i].color = 'rgb(' + data[j] + ',' + data[j + 1] + ',' + data[j + 2] + ')';
      };
    }

    // Get the RGB values for the specified selector areas and send them via WebSocket to the Node.js-Server
    NERDDISCO_connector.sendLEDs(data);

    setTimeout(function () {
      window.requestAnimationFrame(update);
    }, 1000 / fps);
  }

  update();
}.bind(this);