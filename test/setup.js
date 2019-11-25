export const origin = 'https://html5-player.libsyn.com';


export function mockMessageEventFactoryFactory(source) {
  return function(eventData) {
    return new MessageEvent(
      'message',
      {
        data: eventData,
        origin: origin,
        source: source
      }
    );
  };
}

export function fireMessageEvent(data, origin = '', source = {}) {
  if (origin === '') {
    origin = 'https://html5-player.libsyn.com';
  }

  if (Object.keys(source).length === 0) {
    source = 'https://html5-player.libsyn.com/embed/episode/id/11859134/height/90/theme/custom/thumbnail/no/direction/backward/render-playlist/no/custom-color/17a649/';
  }

  let event = new MessageEvent(
        'message',
        {
          data: data,
          origin: origin,
          source: source
        }
      );

  window.dispatchEvent(event);
}