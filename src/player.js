/** 
* LibsynPlayer wraps embedded libsyn podcast players and listens for 
* updates from them over the window.PostMessage API
*/
class LibsynPlayer {

  constructor(iframe) {
    this._trustedOrigins = Object.freeze(["https://html5-player.libsyn.com"]);
    this._supportedEvents = Object.freeze({START: "START"});
    this._dataFormat = /^\d{2}:\d{2}:\d{2}/;

    this.attach(iframe);
  }

  reset() {
    window && window.removeEventListener("message", this._handleMessage);
    this._element = undefined;
    this._listeners = {};
    this._state = {hasStarted: false};
  }

  attach(element) {
    if (element && element.tagName === "IFRAME") {
      this.reset();
      this._element = element;
      this._listen();
    } else {
      console.error("Failed to initialize Libsyn embed wrapper. Element given not an iframe.")
    }
  }
  
  /** 
  * Add event listener for message events from an embedded libsyn player
  */
  _listen() {
    if (! window) { return; }
    window.addEventListener("message", this._handleMessage.bind(this));
  }

  _handleMessage(e) {
    // Check that it came from expected origin 
    if (!e.origin || !this._trustedOrigins.includes(e.origin)) {
      return;
    }
    // Ensure data is in Libsyn's timestamp format 
    if (!this._isValidData(e.data)) {
      return;
    }

    if (!this._isThisPlayer(e.source)) {
      return;
    }

    if (! this.hasStarted()) {
      this._state.hasStarted = true;
      this._fire(this._supportedEvents.START);
    } 
  }

  /** 
  * Checks if a given source is the same source as  
  * the instance of this player 
  * @param string source 
  * @return bool 
  */
  _isThisPlayer(source) {
    return this._element && this._element.contentWindow === source;
  }

  /** 
  * Validates message data for libsyn postMessage events 
  * Libsyn sends messages with a timestamp in the format 00:00:00
  * @param string data from event
  * @return bool 
  */
  _isValidData(data) {
   return typeof data === 'string' && this._dataFormat.test(data);
  }

  /** 
  * Fires callback functions associated with a given event name 
  * Libsyn sends messages with a timestamp in the format 00:00:00
  * @param string name of event (must match supported events)
  */
  _fire(event) {
    if (! this._listeners[event]) {
      return;
    }

    this._listeners[event].forEach(cb => cb());
  }

  /** 
  * Registers callback functions to be executed when a given event occurs 
  * @param string name of event 
  * @param function callback function 
  */
  on(eventName, cb) {
    if ((typeof cb) !== 'function') {
      console.error(`Libsyn player callback must be a function`);
      return;
    }

    eventName = eventName ? eventName.toUpperCase() : ''; 

    if (!eventName || !this._supportedEvents[eventName]) {
      console.error(`Libsyn wrapper does not support ${eventName} events`)
      return;
    }

    if (this._listeners[eventName]) {
      this._listeners[eventName].push(cb);
    } else {
      this._listeners[eventName] = [cb];
    }
  }

  /** 
  * Returns true or false if player has been started 
  * @param string name of event 
  * @param function callback function 
  */
  hasStarted() {
    return this._state.hasStarted;
  }

}

export default LibsynPlayer;

export function player(iframe) {
  return new LibsynPlayer(iframe);
}
