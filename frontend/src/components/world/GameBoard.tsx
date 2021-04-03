import Phaser from 'phaser';

export default class GameBoard extends Phaser.Scene {

    create() {
        const board = this.add.grid(500, 840, 512, 512, 64, 64, 0xff0000).setAltFillStyle(0x000000).setOutlineStyle().setDepth(32);
    }

}
