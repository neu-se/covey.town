import CoveySuperMapScene from "./CoveySuperMapScene";

// TODO : Stub-out CoveySubMapScene
// TODO: Add trigger-tile event handling to CoveySubMapScene
export default class CoveySubMapScene extends CoveySuperMapScene {

  
  preload() {
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town.json');
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
  }





}
// function to send trigger value that player is in subMap or superMap

// function to exit submap

// function to enter submap