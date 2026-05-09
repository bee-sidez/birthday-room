# Birthday Room

A tiny pixel-style room game for Muthu.

Open `index.html` in a browser, then use:

- Move: `WASD` or arrow keys
- Interact: `E` or `Space`
- Mobile: tap the room to walk, tap an object to walk toward it, or use the small on-screen D-pad and `E` button

Abitha is the NPC who says:

> "Happy Birthday Muthu"

## Spotify playlist

To use Spotify instead of the built-in chiptune fallback, paste your Spotify playlist iframe into `game.js`:

```js
const SPOTIFY_EMBED_HTML = '<iframe src="https://open.spotify.com/embed/playlist/YOUR_PLAYLIST_ID?utm_source=generator" width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
```

## Greeting card

Update the card text in `game.js`:

```js
const GREETING_CARD_MESSAGE = "Your message here";
```

## Mini-game ideas

The console currently uses `Catch the Sparkle`, a simple tap/click reaction game that works well on mobile. Other good fits for this room would be:

- Memory match with tiny cake, gift, TV, and music icons
- Quick rhythm tap game synced loosely to the music player
- Tiny maze where the player collects candles for the cake
