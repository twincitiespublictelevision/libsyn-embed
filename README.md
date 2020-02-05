# libsyn-embed
Library for wrapping embedded podcast players from [Libsyn](https://libsyn.com/).


# Usage

```javascript
let iframes = document.querySelectorAll('iframe[src*="html5-player.libsyn.com"]');
iframes.forEach(iframe => {
  let player = LibsynPlayer.player(iframe);
  player.on("start", function() {
    console.log("The player started!");
  });
});
```

## Supported Events

- `start`: When the podcast begins to play

Deploy test
