import { fireMessageEvent } from "../test/setup";
import LibsynPlayer from "./player";


const timestamp = "00:00:00";

const getPlayers = () => {
  let urls = [
    "https://html5-player.libsyn.com/embed/episode/id/11859134/height/90/theme/custom/thumbnail/no/direction/backward/render-playlist/no/custom-color/17a649/",
    "https://html5-player.libsyn.com/embed/episode/id/11784863/height/90/theme/custom/thumbnail/no/direction/backward/render-playlist/no/custom-color/17a649/"
  ];

  let iframes = urls.map(url => getPlayer(url));
  return iframes;
}

const getPlayer = (url) => {
  return {
    tagName: "IFRAME",
    contentWindow: url
  }
}

describe("Validates incoming event and associated data", () => {

    test('_isValidData returns true for valid timestamp', () => {
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);

      expect(player._isValidData(timestamp)).toBe(true);
    });

    test('_isValidData returns false for non timestamp', () => {
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);

      expect(player._isValidData("some malicious message")).toBe(false);
    });

    test('does not change state of player when message data is incorrectly formatted', () => {
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);
      fireMessageEvent("some malicious message data");

      expect(player.hasStarted()).toBe(false);
    }); 

    test('does not change state when origin does is untrusted', () => {
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);
      fireMessageEvent(timestamp, 'https://google.com');

      expect(player.hasStarted()).toBe(false);
    }); 

    test('does not change state when origin is separate iframe', () => {
      let first = getPlayers()[0];
      let second = getPlayers()[1];

      let player1 = new LibsynPlayer(first);
      let player2 = new LibsynPlayer(second);

      fireMessageEvent(timestamp, 
         'https://html5-player.libsyn.com', 
         'https://html5-player.libsyn.com/embed/episode/id/11784863/height/90/theme/custom/thumbnail/no/direction/backward/render-playlist/no/custom-color/17a649/'
      );

      expect(player1.hasStarted()).toBe(false);
      expect(player2.hasStarted()).toBe(true);
    }); 

    test('logs an error when constructing without an iframe', () => {
      console.error = jest.fn();
      let player = new LibsynPlayer(undefined);

      expect(console.error).toHaveBeenCalledTimes(1);
    });

    test('logs an error when trying to register callback for unsupported event', () => {
      let cb = jest.fn();
      console.error = jest.fn();
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);

      player.on("unsupported_event", cb);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledTimes(0);
    });

    test('logs an error when trying to register callback when callback is not a function', () => {
      console.error = jest.fn();
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);

      player.on("unsupported_event", undefined);

      expect(console.error).toHaveBeenCalledTimes(1);
    });
});

describe('Supports start event', () => {
    test('hasStarted reports true after receiving first message event', () => {
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);
      fireMessageEvent("00:00:00");

      expect(player.hasStarted()).toBe(true);
    });

    test('fires callback after receiving first message event', () => {
      let cb = jest.fn();
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);
      player.on("start", cb);
      fireMessageEvent("00:00:00");

      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('fires multiple callbacks registered under same event', () => {
      let cb = jest.fn();
      let cb2 = jest.fn();
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);
      player.on("start", cb);
      player.on("start", cb2);
      fireMessageEvent("00:00:00");

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
});

describe('Resets player', () => {
    test('stops listening event listener', () => {
      let cb = jest.fn();
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);
      player.on("start", cb);
      fireMessageEvent("00:00:00");

      player.reset();
      fireMessageEvent("00:01:00");

      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('removes element and state', () => {
      let cb = jest.fn();
      let iframe = getPlayers()[0];
      let player = new LibsynPlayer(iframe);

      player.on("start", cb);
      fireMessageEvent("00:00:00");
      
      expect(player.hasStarted()).toBe(true);
      player.reset();

      expect(player.hasStarted()).toBe(false);
      expect(player._element).toBe(undefined);
    });
});
