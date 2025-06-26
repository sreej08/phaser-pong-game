import { Scene } from 'phaser';

const WIDTH = 1024;
const HEIGHT = 768;

export class Game extends Scene {
    constructor() {
        super('Game');
        this.ball = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.ballInMotion = false;
        this.wasd = null;
        this.cursors = null;
        this.leftScore = 0;
        this.rightScore = 0;
        this.leftScoreText = null;
        this.rightScoreText = null;
        this.gameOver = false; // <-- Add this line
        this.gameOverText = null;
        this.winnerText = null;
        this.singlePlayer = null; // null = not chosen yet, true = single, false = two-player
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('paddle', 'assets/paddle.png');
        this.load.image('particle', 'assets/particle.png'); // <-- Add this line
    }

    create() {
        this.add.image(WIDTH/2, HEIGHT/2, 'background').setScale(0.8, 0.8);
        
        this.ball = this.physics.add.image(WIDTH / 2, HEIGHT / 2, 'ball').setScale(0.05, 0.05).refreshBody();
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1, 1);

        this.leftPaddle = this.physics.add.image(50, 384, "paddle");
        this.leftPaddle.setImmovable(true);
        this.rightPaddle = this.physics.add.image(974, 384, "paddle");
        this.rightPaddle.setImmovable(true);
        this.physics.add.collider(this.ball, this.leftPaddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.rightPaddle, this.hitPaddle, null, this);
        this.input.keyboard.on('keydown-SPACE', this.startBall, this);
        
        this.leftScoreText = this.add.text(100, 50, '0', { fontSize: '50px' });
        this.rightScoreText = this.add.text(924, 50, '0', { fontSize: '50px' });

        this.modeText = this.add.text(WIDTH/2, HEIGHT/2, 'Press 1 for Single Player\nPress 2 for Two Player', {
            fontSize: '40px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ONE', () => this.chooseMode(true));
        this.input.keyboard.on('keydown-TWO', () => this.chooseMode(false));

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });

    
    }

    chooseMode(isSingle) {
        if (this.singlePlayer !== null) return;
        this.singlePlayer = isSingle;
        this.modeText.setVisible(false);
        // Only start the game after mode is chosen
        this.ball.setVisible(true);
        this.leftPaddle.setVisible(true);
        this.rightPaddle.setVisible(true);
        this.leftScoreText.setVisible(true);
        this.rightScoreText.setVisible(true);
    }

    update() {
        if (this.singlePlayer === null) return; // Wait for mode selection
        if (this.gameOver) return; // <-- Prevent updates if game is over

        // left paddle movement logic
        if (this.wasd.up.isDown && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= 5;
        } else if (this.wasd.down.isDown && this.leftPaddle.y < HEIGHT) {
            this.leftPaddle.y += 5;
        }

        // right paddle logic
        if (this.singlePlayer) {
            // Simple AI: follow the ball with some delay
            const aiSpeed = 4;
            if (this.ball.y < this.rightPaddle.y - 10) {
                this.rightPaddle.y -= aiSpeed;
            } else if (this.ball.y > this.rightPaddle.y + 10) {
                this.rightPaddle.y += aiSpeed;
            }
        } else {
            if (this.cursors.up.isDown && this.rightPaddle.y > 0) {
                this.rightPaddle.y -= 5;
            } else if (this.cursors.down.isDown && this.rightPaddle.y < HEIGHT) {
                this.rightPaddle.y += 5;
            }
        }
        const margin = 30;
        if (this.ball.x < margin) {  // ball hits left wall
            this.rightScore += 1;
            this.rightScoreText.setText(this.rightScore);
            this.resetBall();
        } else if (this.ball.x > WIDTH - margin) {  // ball hits right wall
            this.leftScore += 1;
            this.leftScoreText.setText(this.leftScore);
            this.resetBall();
        }

        // Check for game over
        if (this.leftScore > 10 || this.rightScore > 10) {
            this.showGameOver();
        }
    }

    startBall() {
        if (!this.ballInMotion) { // checks flag to determine if ball is NOT in motion
            let initialVelocityX = 300 * (Phaser.Math.Between(0, 1) ? 1 : -1); // sets to either 300 or -300
            let initialVelocityY = 300 * (Phaser.Math.Between(0, 1) ? 1 : -1); // sets to either 300 or -300
            this.ball.setVelocity(initialVelocityX, initialVelocityY); // sets ball to RANDOM velocity
            this.ballInMotion = true; // sets flag to ball is in motion
        }
    }
    
    hitPaddle(ball, paddle) {
        let velocityFactor = 1.15;
        let newVelocityX = ball.body.velocity.x * velocityFactor;
        let newVelocityY = ball.body.velocity.y * velocityFactor;
        ball.setVelocity(newVelocityX, newVelocityY);

        let angleDeviationInDeg = Phaser.Math.Between(-30, 30);
        let angleDeviationInRad = Phaser.Math.DegToRad(angleDeviationInDeg);
        let newVelocity = new Phaser.Math.Vector2(newVelocityX, newVelocityY).rotate(angleDeviationInRad);
        ball.setVelocity(newVelocity.x, newVelocity.y);
    }   

    resetBall() {
        this.ball.setPosition(WIDTH/2, 384);
        this.ball.setVelocity(0, 0);
        this.ballInMotion = false;
        this.startBall()
    }

    showGameOver() {
        this.gameOver = true;

        // Hide game elements
        this.ball.setVisible(false);
        this.leftPaddle.setVisible(false);
        this.rightPaddle.setVisible(false);
        this.leftScoreText.setVisible(false);
        this.rightScoreText.setVisible(false);

        // Show GAME OVER text
        this.gameOverText = this.add.text(WIDTH/2, HEIGHT/2 - 60, 'GAME OVER', {
            fontSize: '80px',
            color: '#ff0000'
        }).setOrigin(0.5);

        // Show winner
        let winner = this.leftScore > this.rightScore ? "Left side won!" : "Right side won!";
        this.winnerText = this.add.text(WIDTH/2, HEIGHT/2 + 40, winner, {
            fontSize: '50px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}