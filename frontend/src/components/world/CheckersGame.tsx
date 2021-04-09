import Phaser from 'phaser';
import { isShorthandPropertyAssignment } from 'typescript';
import Checker from '../Checkers/Checker';

export default class CheckersGame extends Phaser.Scene {

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
        this.load.image('play-button', "./assets/checkers/playGameButton.png");
        this.load.image('popupBackground', "./assets/checkers/popupBackground.png");
        this.load.image('checkerBoardWithBackground', "./assets/checkers/checkerBoardWithBackground.png");
        this.load.image('redChecker', "./assets/checkers/redChecker.png");
        this.load.image('blackChecker', "./assets/checkers/blackChecker.png");
        this.load.image('redCheckerKing', "./assets/checkers/redCheckerKing.png");
        this.load.image('blackCheckerKing', "./assets/checkers/blackCheckerKing.png");
        this.load.image('tanCheckerTile', "./assets/checkers/tan-checker.png");
        this.load.image('brownCheckerTile', "./assets/checkers/brown-checker.png");
    }

    create() {
        
        this.setUpPopupUI();

    }

    setUpPopupUI() {

        // Create container
        const windowContainer = this.add.container(this.game.renderer.width * 0.2, this.game.renderer.height * 0.1);

        // Add play button and background image
        const playButton: Phaser.GameObjects.Image = this.addPlayButton(150, 350, windowContainer);
        const backgroundImage = this.add.image(0, 0, 'popupBackground', 0)
            .setScale(0.75, 0.75)
            .setOrigin(0);
        windowContainer.add([backgroundImage, playButton]);

        // this.addCheckersToBoard();
    }

    addPlayButton(x :number, y :number, container :Phaser.GameObjects.Container) {
        const playButton = this.add.image(x, y, 'play-button', 1)
            .setOrigin(0)
            .setInteractive();
        
        // Add tint on button hover
        playButton.on('pointerover', () => {
            playButton.setTint(0x44ff44);
        });

        // Clear tint on hover exit
        playButton.on('pointerout', () => {
            playButton.clearTint();
        });
        
        playButton.on('pointerup', () => {
            this.startGame(container)
        }, this);
        return playButton;
    }

    startGame(container :Phaser.GameObjects.Container) {
        container.removeAll(true);
        const gameboardImage = this.add.image(0, 0, 'checkerBoardWithBackground', 0)
            .setScale(0.75, 0.75)
            .setOrigin(0);
            container.add(gameboardImage);
    }

    addCheckersToBoard() {
        this.addCheckersToBoard = () => {
            // Rows
            for (let r = 0; r <= 2; r += 1) {
                // Each checker
                for (let i = 0; i <= 7; i += 1) {
                    // const checker = new Checker(this);
                    // checker.render(, '')
                }
            }
        }
        console.log('added checkers to board');
    }

    // createCheckerBoard() {
    //     // TODO: add tiles
    //     console.log('created checker board');
    // }

}
