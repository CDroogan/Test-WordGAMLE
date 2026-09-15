// Mobile browsers routinely reload a backgrounded tab (or restore a stale
// snapshot of it) after a Gamler switches away to play on the actual game
// site and back again. These helpers remember that a "Paste Result" box
// was left open in sessionStorage, so a game's PlayService component can
// restore it on mount instead of silently dropping back to whatever page
// the reload happened to land on.
//
// Wrapped in try/catch since sessionStorage can throw in some browser
// privacy modes - if that happens, the Gamler just has to navigate back
// manually, same as before this existed.

const keyFor = (game) => `wordgamle_pending_paste_${game}`;

export function isPastePending(game) {
  try {
    return sessionStorage.getItem(keyFor(game)) === '1';
  } catch {
    return false;
  }
}

export function markPastePending(game) {
  try {
    sessionStorage.setItem(keyFor(game), '1');
  } catch {
    // ignore
  }
}

export function clearPastePending(game) {
  try {
    sessionStorage.removeItem(keyFor(game));
  } catch {
    // ignore
  }
}
