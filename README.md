# SpaceBlazer

A full-featured HTML5 canvas space shooter game built with vanilla JavaScript.

## Features

- **Start Screen**: Space-themed start screen with animated logo
- **Responsive Gameplay**: Smooth gameplay using requestAnimationFrame
- **Power-ups**: Two types of missile upgrades (2-missile and 5-missile)
- **Planets**: Four different planet types (Moon, Mars, Jupiter, Saturn)
- **Explosions**: Smooth particle-based explosion animations
- **Scoring System**: 100 points per planet destroyed
- **Modern UI**: Beautiful space-themed interface with glassmorphism effects

## How to Play

1. Open `index.html` in a web browser
2. Click "Start" to begin the game
3. Use **Left/Right Arrow Keys** or **A/D Keys** to move your spaceship
4. Your spaceship automatically fires missiles
5. Destroy planets to earn points (100 points each)
6. Collect power-up boxes:
   - **Green Box (2)**: Fire 2 missiles for 40 seconds
   - **Blue Box (5)**: Fire 5 missiles for 50 seconds
7. Avoid colliding with planets or letting them reach the bottom

## Controls

- **Arrow Keys** or **A/D**: Move spaceship left/right
- **Start Button**: Begin the game
- **Restart Button**: Restart current game
- **Play Again**: Restart after game over

## Technical Features

- **Canvas Rendering**: Hardware-accelerated 2D graphics
- **Modular Design**: Object-oriented JavaScript classes
- **Particle Systems**: Dynamic explosion and particle effects
- **Asset Management**: Automatic fallback to procedural graphics
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animation**: 60fps gameplay with requestAnimationFrame

## Game Classes

- **Game**: Main game engine and state management
- **Spaceship**: Player-controlled ship with movement and collision
- **Missile**: Projectile system with collision detection
- **Planet**: Enemy targets with different types and behaviors
- **PowerUp**: Collectible items with timed effects
- **Explosion**: Particle-based explosion system
- **Particle**: Individual particle physics simulation

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas and ES6 classes:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## File Structure

```
├── index.html          # Main HTML file
├── style.css           # Game styles and animations
├── game.js             # Game logic and classes
├── assets/             # Game assets
│   ├── spaceship.png   # Spaceship sprite
│   └── reload.png      # Reload icon
└── README.md           # This file
```

## Development

The game uses procedural graphics generation as fallback, so it works even without external image assets. All sprites are generated using HTML5 Canvas if image files are not available.

Enjoy playing SpaceBlazer! 🚀
