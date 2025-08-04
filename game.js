// SpaceBlazer Game - Main JavaScript File

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        this.keys = {};
        this.lastTime = 0;
        
        // Game objects
        this.spaceship = null;
        this.missiles = [];
        this.planets = [];
        this.powerUps = [];
        this.explosions = [];
        this.particles = [];
        
        // Timers
        this.missileTimer = 0;
        this.planetTimer = 0;
        this.powerUpTimer = 0;
        this.powerUpActive = null;
        this.powerUpEndTime = 0;
        
        // Settings
        this.missileSpeed = 5;
        this.planetSpeed = 2;
        this.missileInterval = 300; // ms
        this.planetInterval = 2000; // ms
        this.powerUpInterval = 15000; // ms
        
        this.setupCanvas();
        this.loadAssets();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    loadAssets() {
        this.assets = {};
        this.assetsLoaded = 0;
        this.totalAssets = 0;
        
        const assetPaths = {
            spaceship: 'assets/spaceship.png',
            thruster: 'assets/thruster.png',
            missile: 'assets/missile.png',
            moon: 'assets/moon.png',
            mars: 'assets/mars.png',
            jupiter: 'assets/jupiter.png',
            saturn: 'assets/saturn.png',
            box2missile: 'assets/box-2-missile.png',
            box5missile: 'assets/box-5-missile.png',
            reload: 'assets/reload.png'
        };
        
        this.totalAssets = Object.keys(assetPaths).length;
        
        // Create canvas-based assets as fallback
        this.createCanvasAssets();
        
        // Try to load real images
        for (const [key, path] of Object.entries(assetPaths)) {
            const img = new Image();
            img.onload = () => {
                this.assets[key] = img;
                this.assetsLoaded++;
            };
            img.onerror = () => {
                // Use canvas fallback
                this.assetsLoaded++;
            };
            img.src = path;
        }
    }
    
    createCanvasAssets() {
        // Create spaceship
        const spaceshipCanvas = document.createElement('canvas');
        spaceshipCanvas.width = 60;
        spaceshipCanvas.height = 60;
        const spaceshipCtx = spaceshipCanvas.getContext('2d');
        
        spaceshipCtx.fillStyle = '#00ff88';
        spaceshipCtx.beginPath();
        spaceshipCtx.moveTo(30, 0);
        spaceshipCtx.lineTo(10, 50);
        spaceshipCtx.lineTo(30, 40);
        spaceshipCtx.lineTo(50, 50);
        spaceshipCtx.closePath();
        spaceshipCtx.fill();
        this.assets.spaceship = spaceshipCanvas;
        
        // Create thruster
        const thrusterCanvas = document.createElement('canvas');
        thrusterCanvas.width = 30;
        thrusterCanvas.height = 30;
        const thrusterCtx = thrusterCanvas.getContext('2d');
        
        const gradient = thrusterCtx.createRadialGradient(15, 15, 5, 15, 15, 15);
        gradient.addColorStop(0, '#ff4757');
        gradient.addColorStop(0.5, '#ff6b35');
        gradient.addColorStop(1, 'transparent');
        thrusterCtx.fillStyle = gradient;
        thrusterCtx.fillRect(0, 0, 30, 30);
        this.assets.thruster = thrusterCanvas;
        
        // Create missile
        const missileCanvas = document.createElement('canvas');
        missileCanvas.width = 8;
        missileCanvas.height = 20;
        const missileCtx = missileCanvas.getContext('2d');
        
        missileCtx.fillStyle = '#ffff00';
        missileCtx.fillRect(2, 0, 4, 20);
        missileCtx.fillStyle = '#ff4757';
        missileCtx.fillRect(0, 0, 8, 8);
        this.assets.missile = missileCanvas;
        
        // Create planets
        this.createPlanet('moon', '#cccccc', 40);
        this.createPlanet('mars', '#ff4757', 35);
        this.createPlanet('jupiter', '#ff6b35', 50);
        this.createPlanet('saturn', '#ffdd59', 45);
        
        // Create power-up boxes
        this.createPowerUpBox('box2missile', '#00ff88', '2');
        this.createPowerUpBox('box5missile', '#667eea', '5');
        
        // Create reload icon
        const reloadCanvas = document.createElement('canvas');
        reloadCanvas.width = 24;
        reloadCanvas.height = 24;
        const reloadCtx = reloadCanvas.getContext('2d');
        
        reloadCtx.strokeStyle = '#ffffff';
        reloadCtx.lineWidth = 2;
        reloadCtx.beginPath();
        reloadCtx.arc(12, 12, 8, 0, Math.PI * 1.5);
        reloadCtx.stroke();
        reloadCtx.beginPath();
        reloadCtx.moveTo(16, 4);
        reloadCtx.lineTo(20, 8);
        reloadCtx.lineTo(12, 8);
        reloadCtx.closePath();
        reloadCtx.fill();
        this.assets.reload = reloadCanvas;
    }
    
    createPlanet(name, color, size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.5));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        this.assets[name] = canvas;
    }
    
    createPowerUpBox(name, color, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 40, 40);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 40, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 20, 26);
        
        this.assets[name] = canvas;
    }
    
    darkenColor(color, factor) {
        // Simple color darkening function
        if (color.includes('#')) {
            const rgb = parseInt(color.slice(1), 16);
            const r = Math.floor((rgb >> 16) * factor);
            const g = Math.floor(((rgb >> 8) & 0x00FF) * factor);
            const b = Math.floor((rgb & 0x0000FF) * factor);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return color;
    }
    
    setupEventListeners() {
        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Play again button
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.missiles = [];
        this.planets = [];
        this.powerUps = [];
        this.explosions = [];
        this.particles = [];
        this.powerUpActive = null;
        this.powerUpEndTime = 0;
        
        this.spaceship = new Spaceship(this.canvas.width / 2, this.canvas.height - 100, this.assets);
        
        this.showScreen('gameScreen');
        this.updateScore();
        this.hidePowerUpIndicator();
    }
    
    restartGame() {
        this.startGame();
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('finalScore').textContent = this.score;
    }
    
    showPowerUpIndicator(type, duration) {
        const indicator = document.getElementById('powerUpIndicator');
        const text = document.getElementById('powerUpText');
        const timer = document.getElementById('powerUpTimer');
        
        text.textContent = type === 'double' ? 'DOUBLE MISSILES!' : 'QUINTUPLE MISSILES!';
        timer.textContent = `${Math.ceil(duration / 1000)}s remaining`;
        
        indicator.classList.remove('hidden');
    }
    
    hidePowerUpIndicator() {
        document.getElementById('powerUpIndicator').classList.add('hidden');
    }
    
    updatePowerUpIndicator() {
        if (this.powerUpActive && this.powerUpEndTime > Date.now()) {
            const remaining = this.powerUpEndTime - Date.now();
            const timer = document.getElementById('powerUpTimer');
            timer.textContent = `${Math.ceil(remaining / 1000)}s remaining`;
        } else if (this.powerUpActive) {
            this.powerUpActive = null;
            this.hidePowerUpIndicator();
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState === 'playing') {
            this.update(deltaTime);
            this.render();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update spaceship
        this.spaceship.update(this.keys, this.canvas.width);
        
        // Update power-up indicator
        this.updatePowerUpIndicator();
        
        // Spawn missiles
        this.missileTimer += deltaTime;
        if (this.missileTimer >= this.missileInterval) {
            this.spawnMissiles();
            this.missileTimer = 0;
        }
        
        // Spawn planets
        this.planetTimer += deltaTime;
        if (this.planetTimer >= this.planetInterval) {
            this.spawnPlanet();
            this.planetTimer = 0;
        }
        
        // Spawn power-ups
        this.powerUpTimer += deltaTime;
        if (this.powerUpTimer >= this.powerUpInterval) {
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }
        
        // Update missiles
        this.missiles.forEach(missile => missile.update());
        this.missiles = this.missiles.filter(missile => missile.y > -50);
        
        // Update planets
        this.planets.forEach(planet => planet.update());
        this.planets = this.planets.filter(planet => planet.y < this.canvas.height + 50 && !planet.destroyed);
        
        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update());
        this.powerUps = this.powerUps.filter(powerUp => powerUp.y < this.canvas.height + 50 && !powerUp.collected);
        
        // Update explosions
        this.explosions.forEach(explosion => explosion.update(deltaTime));
        this.explosions = this.explosions.filter(explosion => !explosion.finished);
        
        // Update particles
        this.particles.forEach(particle => particle.update(deltaTime));
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Check collisions
        this.checkCollisions();
        
        // Check game over conditions
        this.checkGameOver();
    }
    
    spawnMissiles() {
        const missileCount = this.getMissileCount();
        
        if (missileCount === 1) {
            this.missiles.push(new Missile(this.spaceship.x, this.spaceship.y - 20, this.assets));
        } else if (missileCount === 2) {
            this.missiles.push(new Missile(this.spaceship.x - 15, this.spaceship.y - 20, this.assets));
            this.missiles.push(new Missile(this.spaceship.x + 15, this.spaceship.y - 20, this.assets));
        } else if (missileCount === 5) {
            for (let i = 0; i < 5; i++) {
                this.missiles.push(new Missile(this.spaceship.x + (i - 2) * 15, this.spaceship.y - 20, this.assets));
            }
        }
    }
    
    getMissileCount() {
        if (this.powerUpActive && this.powerUpEndTime > Date.now()) {
            return this.powerUpActive === 'double' ? 2 : 5;
        }
        return 1;
    }
    
    spawnPlanet() {
        const planetTypes = ['moon', 'mars', 'jupiter', 'saturn'];
        const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
        const column = Math.floor(Math.random() * 4);
        const x = (this.canvas.width / 4) * column + (this.canvas.width / 8);
        
        this.planets.push(new Planet(x, -50, type, this.assets));
    }
    
    spawnPowerUp() {
        const types = ['box2missile', 'box5missile'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 40) + 20;
        
        this.powerUps.push(new PowerUp(x, -40, type, this.assets));
    }
    
    checkCollisions() {
        // Missile-Planet collisions
        this.missiles.forEach(missile => {
            this.planets.forEach(planet => {
                if (missile.collidesWith(planet) && !planet.destroyed) {
                    planet.destroy();
                    missile.destroyed = true;
                    this.score += 100;
                    this.updateScore();
                    
                    // Create explosion
                    this.explosions.push(new Explosion(planet.x, planet.y, this.assets));
                    
                    // Create particles
                    this.createParticles(planet.x, planet.y, planet.color);
                }
            });
        });
        
        // Remove destroyed missiles
        this.missiles = this.missiles.filter(missile => !missile.destroyed);
        
        // Spaceship-PowerUp collisions
        this.powerUps.forEach(powerUp => {
            if (this.spaceship.collidesWith(powerUp) && !powerUp.collected) {
                powerUp.collect();
                this.activatePowerUp(powerUp.type);
            }
        });
        
        // Spaceship-Planet collisions (Game Over)
        this.planets.forEach(planet => {
            if (this.spaceship.collidesWith(planet) && !planet.destroyed) {
                this.gameOver();
            }
        });
    }
    
    activatePowerUp(type) {
        const duration = type === 'box2missile' ? 40000 : 50000; // 40s or 50s
        const powerUpType = type === 'box2missile' ? 'double' : 'quintuple';
        
        this.powerUpActive = powerUpType;
        this.powerUpEndTime = Date.now() + duration;
        this.showPowerUpIndicator(powerUpType, duration);
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    checkGameOver() {
        // Check if any planet reached the bottom
        this.planets.forEach(planet => {
            if (planet.y > this.canvas.height - 50 && !planet.destroyed) {
                this.gameOver();
            }
        });
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.showScreen('gameOverScreen');
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw space background
        this.drawStars();
        
        // Draw spaceship
        this.spaceship.render(this.ctx);
        
        // Draw missiles
        this.missiles.forEach(missile => missile.render(this.ctx));
        
        // Draw planets
        this.planets.forEach(planet => planet.render(this.ctx));
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        
        // Draw explosions
        this.explosions.forEach(explosion => explosion.render(this.ctx));
        
        // Draw particles
        this.particles.forEach(particle => particle.render(this.ctx));
    }
    
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 137.5) % this.canvas.width;
            const y = (i * 217.3) % this.canvas.height;
            const size = Math.random() * 2;
            this.ctx.fillRect(x, y, size, size);
        }
    }
}

class Spaceship {
    constructor(x, y, assets) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.speed = 5;
        this.assets = assets;
    }
    
    update(keys, canvasWidth) {
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x = Math.max(this.width / 2, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x = Math.min(canvasWidth - this.width / 2, this.x + this.speed);
        }
    }
    
    render(ctx) {
        // Draw thruster
        ctx.drawImage(
            this.assets.thruster,
            this.x - 15,
            this.y + 20,
            30,
            30
        );
        
        // Draw spaceship
        ctx.drawImage(
            this.assets.spaceship,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    }
    
    collidesWith(other) {
        return this.x - this.width / 2 < other.x + other.width / 2 &&
               this.x + this.width / 2 > other.x - other.width / 2 &&
               this.y - this.height / 2 < other.y + other.height / 2 &&
               this.y + this.height / 2 > other.y - other.height / 2;
    }
}

class Missile {
    constructor(x, y, assets) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = 8;
        this.assets = assets;
        this.destroyed = false;
    }
    
    update() {
        this.y -= this.speed;
    }
    
    render(ctx) {
        if (!this.destroyed) {
            ctx.drawImage(
                this.assets.missile,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }
    
    collidesWith(other) {
        return this.x - this.width / 2 < other.x + other.width / 2 &&
               this.x + this.width / 2 > other.x - other.width / 2 &&
               this.y - this.height / 2 < other.y + other.height / 2 &&
               this.y + this.height / 2 > other.y - other.height / 2;
    }
}

class Planet {
    constructor(x, y, type, assets) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = this.getSize();
        this.height = this.getSize();
        this.speed = 1 + Math.random() * 2;
        this.assets = assets;
        this.destroyed = false;
        this.color = this.getColor();
    }
    
    getSize() {
        const sizes = {
            moon: 40,
            mars: 35,
            jupiter: 50,
            saturn: 45
        };
        return sizes[this.type] || 40;
    }
    
    getColor() {
        const colors = {
            moon: '#cccccc',
            mars: '#ff4757',
            jupiter: '#ff6b35',
            saturn: '#ffdd59'
        };
        return colors[this.type] || '#cccccc';
    }
    
    update() {
        this.y += this.speed;
    }
    
    render(ctx) {
        if (!this.destroyed) {
            ctx.drawImage(
                this.assets[this.type],
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }
    
    destroy() {
        this.destroyed = true;
    }
}

class PowerUp {
    constructor(x, y, type, assets) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.speed = 2;
        this.assets = assets;
        this.collected = false;
        this.pulseTimer = 0;
    }
    
    update() {
        this.y += this.speed;
        this.pulseTimer += 0.1;
    }
    
    render(ctx) {
        if (!this.collected) {
            const scale = 1 + Math.sin(this.pulseTimer) * 0.1;
            const size = this.width * scale;
            
            ctx.drawImage(
                this.assets[this.type],
                this.x - size / 2,
                this.y - size / 2,
                size,
                size
            );
        }
    }
    
    collect() {
        this.collected = true;
    }
}

class Explosion {
    constructor(x, y, assets) {
        this.x = x;
        this.y = y;
        this.scale = 0;
        this.maxScale = 3;
        this.duration = 1000; // 1 second
        this.timer = 0;
        this.finished = false;
        this.particles = [];
        
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: `hsl(${Math.random() * 60 + 15}, 100%, ${50 + Math.random() * 50}%)`
            });
        }
    }
    
    update(deltaTime) {
        this.timer += deltaTime;
        this.scale = (this.timer / this.duration) * this.maxScale;
        
        if (this.timer >= this.duration) {
            this.finished = true;
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime / this.duration;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
        });
    }
    
    render(ctx) {
        if (!this.finished) {
            // Draw explosion particles
            this.particles.forEach(particle => {
                if (particle.life > 0) {
                    ctx.save();
                    ctx.globalAlpha = particle.life;
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, 3 * this.scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.maxLife = 1000; // ms
        this.color = color;
        this.size = Math.random() * 3 + 1;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= deltaTime / this.maxLife;
        this.vx *= 0.99;
        this.vy *= 0.99;
    }
    
    render(ctx) {
        if (this.life > 0) {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});