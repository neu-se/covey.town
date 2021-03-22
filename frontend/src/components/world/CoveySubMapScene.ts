import Phaser from "phaser";
import CoveySuperMapScene from "./CoveySuperMapScene";
import Player from "../../classes/Player";

// TODO : Stub-out CoveySubMapScene
// TODO: Add trigger-tile event handling to CoveySubMapScene
export default class CoveySubMapScene extends CoveySuperMapScene {

  // updated preload with tilemaps specific to subMap tilesets
  preload() {
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
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

  /* update function for the checks on the trigger points of the doorway in subMap */
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
  is in the subMap.
  Expected behavior:
   - the 100th player is allowed to to still enter and exit subMaps freely
     - Question: If we are at capacity, can the player enter a NEW submap?
     - OR are we saying no more subMaps are to be created.

  Scenario: we are at capacity for the map e.g. 100/100 players.  The 100th player
  is in the subMap.  They want to exit the game.
  Expected behavior:
   - the 100th player wants to exit the game from the subMap
   - player exits, but the subMap should notify the SuperMap or an event listener that
   - we are no longer at capacity e.g. 99/100.

  Scenario: SuperMap player needs a validation that they can video with
  another subMap player.
  function needed to: set the property that they can video each other
   */

