const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
let player, platforms, apples, cursors;
let score = 0;
let scoreText;
let isMobile = false;
let leftBtn, rightBtn, jumpBtn;

function preload() {
    // Load assets (replace with your own)
    this.load.image('background', 'assets/background.png');
    this.load.image('bike', 'assets/bike.png');
    this.load.image('apple', 'assets/apple.png');
    this.load.image('ground', 'assets/ground.png');
}

function create() {
    // Check if mobile
    isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    
    // Add background
    this.add.image(400, 300, 'background');
    
    // Platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    
    // Player
    player = this.physics.add.sprite(100, 450, 'bike');
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);
    player.body.setSize(40, 60);
    
    // Apples
    apples = this.physics.add.group();
    createApples(this);
    
    // Collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, apples, collectApple, null, this);
    
    // Score
    scoreText = this.add.text(16, 16, 'Apples: 0', {
        fontSize: '32px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
    });
    
    // Controls
    if (isMobile) {
        setupMobileControls(this);
    } else {
        cursors = this.input.keyboard.createCursorKeys();
    }
    
    // Camera follows player
    this.cameras.main.startFollow(player);
}

function update() {
    // Movement controls
    if (isMobile) {
        // Mobile controls handled via touch events
    } else {
        // Keyboard controls
        if (cursors.left.isDown) {
            player.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
        } else {
            player.setVelocityX(0);
        }
        
        if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down) {
            player.setVelocityY(-400);
        }
    }
    
    // Keep player from going off left edge
    if (player.x < 50) {
        player.x = 50;
    }
}

function createApples(scene) {
    const applePositions = [
        { x: 200, y: 450 },
        { x: 300, y: 400 },
        { x: 400, y: 350 },
        { x: 500, y: 400 },
        { x: 600, y: 450 },
        { x: 700, y: 400 },
        { x: 800, y: 350 },
        { x: 900, y: 400 },
        { x: 1000, y: 450 },
        { x: 1100, y: 400 }
    ];
    
    applePositions.forEach(pos => {
        apples.create(pos.x, pos.y, 'apple').setScale(0.5);
    });
}

function collectApple(player, apple) {
    apple.disableBody(true, true);
    score += 10;
    scoreText.setText('Apples: ' + score);
    
    // Respawn apple after delay
    this.time.delayedCall(3000, () => {
        apple.enableBody(true, Phaser.Math.Between(600, 1200), Phaser.Math.Between(300, 500), true, true);
    });
}

function setupMobileControls(scene) {
    leftBtn = document.getElementById('left-btn');
    rightBtn = document.getElementById('right-btn');
    jumpBtn = document.getElementById('jump-btn');
    
    let leftActive = false;
    let rightActive = false;
    
    // Touch events
    leftBtn.addEventListener('touchstart', () => { leftActive = true; });
    leftBtn.addEventListener('touchend', () => { leftActive = false; });
    
    rightBtn.addEventListener('touchstart', () => { rightActive = true; });
    rightBtn.addEventListener('touchend', () => { rightActive = false; });
    
    jumpBtn.addEventListener('touchstart', () => {
        if (player.body.touching.down) {
            player.setVelocityY(-400);
        }
    });
    
    // Update mobile controls
    scene.events.on('update', () => {
        if (leftActive) {
            player.setVelocityX(-200);
        } else if (rightActive) {
            player.setVelocityX(200);
        } else {
            player.setVelocityX(0);
        }
    });
    
    // Hide controls on desktop
    if (!isMobile) {
        document.getElementById('controls').style.display = 'none';
    }
}