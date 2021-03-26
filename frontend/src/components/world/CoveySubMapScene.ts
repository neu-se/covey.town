// import Phaser from "phaser";
import CoveySuperMapScene from "./CoveySuperMapScene";
// import Player, {UserLocation} from "../../classes/Player";
// import Video from "../../classes/Video/Video";

// TODO : Stub-out CoveySubMapScene
// TODO: Add trigger-tile event handling to CoveySubMapScene
export default class CoveySubMapScene extends CoveySuperMapScene {
  // class types are inferred from their assignments in the constructor

  // constructor takes values from CoveySuperMapScene can include additional properties above
  // and parameters if needed.
  // constructor(video: Video, emitMovement: (loc:UserLocation) => void) {
  //   super(video, emitMovement);
  // }

  // updated preload with tilemaps specific to subMap tilesets
  preload() {
    this.load.image('tiles', '/assets/tilesets/pokemon_big.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/submap.json');
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
  }

  /* hard-coding this to filter the players out to just include subMap players
  this can be refactored later once it is working. */
  // updatePlayersLocations(players: Player[]) {
  // }

 /* note to check: inside the updatePlayersLocations function, it makes a call to
  * updatePlayerLocation function.  So I pasted it here and we can decide later
  * if we need keep it, copy the whole thing over, or tweak it
  */
  // updatePlayerLocation(player: Player) {


  /* may need the update() function which checks the trigger points of the doorway on a subMap.
  * Within this function from the superMap, it has a lot of things we may not need to copy over.
  * One thing we may need is the code towards the end of that function, where JP wrote
  * some validation checks to check if the player is in the door way. We may want
  * to do this for a subMap doorway, but need to figure out how much to copy over.
  */
  // update() {
}


  /*
  Scenario: SuperMap player steps on to tile trigger player is now in subMap
  function needed to: validate that the player has entered the subMap tile

  Scenario: SuperMap player is now in the subMap, they want to leave, so they need to
  step onto the exit tile, which is the exit trigger
  function needed to: an exit trigger to set the map.id of hte player to == 0.
  then send this information back to the backend

  Scenario : SubMap player wants to exit the game from the subMap

  Scenario: we are at capacity for the map e.g. 100/100 players.  The 100th player
  is in the subMap.  If at capacity, is the player still allowed to enter new subMaps?

  Scenario: we are at capacity for the map e.g. 100/100 players.  The 100th player
  is in the subMap.  They want to exit the game from the subMap. Do we want to notify
  the SuperMap or an event listener that we are no longer at capacity?

  Scenario: SuperMap player needs a validation that they can video with
  another subMap player.
  function needed to: set the property that they can video each other
   */

