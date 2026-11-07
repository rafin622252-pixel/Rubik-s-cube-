# CubeSolve — Rubik's Cube Solver Website

A mobile-friendly 3×3 Rubik's Cube solver built with HTML, CSS and vanilla JavaScript.

## Run
1. Extract the ZIP.
2. Open `index.html` in a modern browser, or serve the folder with a local web server.
3. Internet is required on first load for the Cube.js solver library (CDN) and Google Fonts.

## How to use
1. Hold the cube with the standard orientation: white on top, green in front, red on right.
2. Enter the colors on U, R, F, D, L and B. The center stickers are fixed.
3. Select a color in the palette, then tap stickers to paint them.
4. Press **Solve my cube**. The solution moves appear on the right.
5. Tap any move or use Previous / Next to follow the sequence.

## Important
- This is a 3×3 solver. It uses Cube.js and its Kociemba two-phase solver.
- Face order is URFDLB, with each face entered row-by-row.
- The standard color scheme is assumed: U white, R red, F green, D yellow, L orange, B blue.
- If your cube uses a different color arrangement, this default-center layout must be adjusted to match it.
- An impossible or incorrectly entered cube state cannot be solved.
- The solver library is loaded from jsDelivr, so the website needs an internet connection to calculate solutions.

## Files
- `index.html` — page structure
- `style.css` — responsive styling
- `app.js` — color input and solver logic
