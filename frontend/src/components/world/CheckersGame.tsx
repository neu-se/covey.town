import Phaser from 'phaser';

export default class CheckersGame extends Phaser.Scene {

    public WIDTH = 600;

    public HEIGHT = 600;

    constructor(){
        super({
            key: "checkers"
        })
        
    }

    init(data: any) {
        console.log(data)
        this.scene.bringToTop();
    }

    preload() {
        this.load.image('gameboard', "./assets/checkers/checker-board.png");
        this.load.image('play-button', "./assets/checkers/play-button.png");

    }

    create() {
        const playButton = this.add.image(this.game.renderer.width / 2 - 200, this.game.renderer.height * 0.2, 'play-button', 0).setOrigin(0).setInteractive();
        
        // Add tint on button hover
        playButton.on('pointerover', () => {
            playButton.setTint(0x44ff44);
        });

        // Clear tint on hover exit
        playButton.on('pointerout', () => {
            playButton.clearTint();
        });
        
        playButton.on('pointerup', () => {
            console.log('play button pressed');
        }, this);
        // const board = this.add.grid(500, 840, 512, 512, 64, 64, 0xff0000).setAltFillStyle(0x000000).setOutlineStyle().setDepth(32);
    }

}
