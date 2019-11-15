import { fireMessageEvent } from "../test/setup";
import LibsynPlayer from "./player";

const timestamp = "00:00:00";
document.body.innerHTML = `<iframe 
                src="//html5-player.libsyn.com/embed/episode/id/11859134/height/90/theme/custom/thumbnail/no/direction/backward/render-playlist/no/custom-color/17a649/" 
                scrolling="no" 
                allowfullscreen="allowfullscreen" 
              ></iframe>`;

const getPlayerEmbed = () => {
  return document.querySelector("iframe[src^='//html5-player.libsyn.com'");
}

describe("Validates incoming event and associated data", () => {
    test('_isValidData returns true for valid timestamp', () => {
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);

      expect(player._isValidData(timestamp)).toBe(true);
    });

    test('_isValidData returns false for non timestamp', () => {
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);

      expect(player._isValidData("some malicious message")).toBe(false);
    });

    test('does not change state of player when message data is incorrectly formatted', () => {
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);
      fireMessageEvent("some malicious message data");

      expect(player.hasStarted()).toBe(false);
    }); 

    test('does not change state when origin does is untrusted', () => {
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);
      fireMessageEvent(timestamp, 'https://google.com');

      expect(player.hasStarted()).toBe(false);
    }); 

    test('logs an error when constructing without an iframe', () => {
      console.error = jest.fn();
      let player = new LibsynPlayer(undefined);

      expect(console.error).toHaveBeenCalledTimes(1);
    });

    test('logs an error when trying to register callback for unsupported event', () => {
      let cb = jest.fn();
      console.error = jest.fn();
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);

      player.on("unsupported_event", cb);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledTimes(0);
    });

    test('logs an error when trying to register callback when callback is not a function', () => {
      console.error = jest.fn();
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);

      player.on("unsupported_event", undefined);

      expect(console.error).toHaveBeenCalledTimes(1);
    });
});

describe('Supports start event', () => {
    test('hasStarted reports true after receiving first message event', () => {
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);
      fireMessageEvent("00:00:00");

      expect(player.hasStarted()).toBe(true);
    });

    test('fires callback after receiving first message event', () => {
      let cb = jest.fn();
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);
      player.on("start", cb);
      fireMessageEvent("00:00:00");

      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('fires multiple callbacks registered under same event', () => {
      let cb = jest.fn();
      let cb2 = jest.fn();
      let iframe = getPlayerEmbed();
      let player = new LibsynPlayer(iframe);
      player.on("start", cb);
      player.on("start", cb2);
      fireMessageEvent("00:00:00");

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
});