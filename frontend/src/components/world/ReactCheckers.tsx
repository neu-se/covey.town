import React, { useContext, useEffect, useState } from 'react';
 import Phaser from 'phaser';
 import Video from '../../classes/Video/Video';
 import useCoveyAppState from '../../hooks/useCoveyAppState';
 import Player, { UserLocation } from '../../classes/Player';
 import useNearbyPlayers from '../../hooks/useNearbyPlayers';

 class ReactCheckersScene extends Phaser.Scene {
        
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
         // Create container
         const windowContainer = this.add.container(this.game.renderer.width * 0.2, this.game.renderer.height * 0.1);

         // Add play button and background image
         const playButton: Phaser.GameObjects.Image = this.addPlayButton(150, 350, windowContainer);
         const backgroundImage = this.add.image(0, 0, 'popupBackground', 0)
             .setScale(0.75, 0.75)
             .setOrigin(0);
         windowContainer.add([backgroundImage, playButton]);

         this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) => {
             const object = gameObject;
             object.x = dragX;
             object.y = dragY;
        });
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
        
        // Remove popup items from container
        container.removeAll(true);
         
        // Add gameboard background
        const gameboardImage = this.add.image(0, 0, 'checkerBoardWithBackground', 0).setScale(0.75, 0.75).setOrigin(0);
        this.addCheckersToBoard(container);

        container.add(gameboardImage);
        container.sendToBack(gameboardImage);
     }

     addCheckersToBoard(container: Phaser.GameObjects.Container) {
        // Iterate through rows of the board
        for (let r = 0; r <= 7; r += 1) {
            switch (r) {
                case 0:
                    this.addCheckerRow(r, 'redChecker', 2, container);
                    break;
                case 1:
                    this.addCheckerRow(r, 'redChecker', 1, container);
                    break;
                case 2:
                    this.addCheckerRow(r, 'redChecker', 2, container);
                    break;
                case 3:
                    // (no checkers)
                    break;
                case 4:
                    // (no checkers)
                    break;
                case 5:
                    this.addCheckerRow(r, 'blackChecker', 1, container);
                    break;
                case 6:
                    this.addCheckerRow(r, 'blackChecker', 2, container);
                    break;
                case 7:
                    this.addCheckerRow(r, 'blackChecker', 1, container);
                    break;
                default: 
                    break;
            }
        }    
        console.log('added checkers to board');
    }

    addCheckerRow(row: number, color: string, type: number, container: Phaser.GameObjects.Container) {
        if (type === 1) {
            for (let i = 0; i <= 7; i += 1) {
                if (i % 2 === 0) {
                    const checker = this.add.image((i * 60) + 90, (row * 60) + 90, color).setScale(0.75, 0.75).setInteractive();
                    this.input.setDraggable(checker);
                    container.add(checker);
                    console.log('added red checker');
                }
            }
        } else {
            for (let i = 0; i <= 7; i += 1) {
                if (i % 2 === 1) {
                    const checker = this.add.image((i * 60) + 90, (row * 60) + 90, color).setScale(0.75, 0.75).setInteractive();
                    this.input.setDraggable(checker);
                    container.add(checker);
                    console.log('added black checker');
                }
            }
        }
    }
 }

 export default function ReactCheckers(): JSX.Element {
     const [gameScene, setGameScene] = useState<ReactCheckersScene>();
     const { nearbyPlayers } = useNearbyPlayers();
     const hasNearbyPlayer = nearbyPlayers.length > 0;

     console.log(hasNearbyPlayer);
     console.log("playa");


     useEffect(() => {
         const config = {
           type: Phaser.AUTO,
           parent: 'board-container',
           transparent: true,
           minWidth: 200,
           minHeight: 150,
           physics: {
             default: 'arcade',
             arcade: {
               gravity: { y: 0 }, // Top down game, so no gravity
             },
           },
         };

         
         const game = new Phaser.Game(config);
             const newGameScene = new ReactCheckersScene();
             setGameScene(newGameScene);
             game.scene.add('checkers', newGameScene, true);

         return () => {
             game.destroy(true);
           };
     }, []);


     return <div id="board-container" style={{ display: hasNearbyPlayer ? "block" : "none" }}/>;

 }