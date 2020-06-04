# libsyn-embed
Library for wrapping embedded podcast players from [Libsyn](https://libsyn.com/).

# Usage

```javascript
import LibsynPlayer from "@twincitiespublictelevision/libsyn-embed";

let iframes = document.querySelectorAll('iframe[src*="html5-player.libsyn.com"]');

iframes.forEach(iframe => {
  let player = new LibsynPlayer(iframe);
  player.on("start", function() {
    console.log("The player started!");
  });
});
```

## Supported Events

- `start`: When the podcast begins to play
