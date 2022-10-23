import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class Transporter extends Interactable {
  private _targetX?: number;

  private _targetY?: number;

  addedToScene(): void {
    super.addedToScene();
    const target = this.findTargetObject();
    if (target.x === undefined || target.y === undefined) {
      throw new Error('Expected target object to have x,y coordinates');
    }
    this._targetX = target.x;
    this._targetY = target.y;
    this.setVisible(false);
  }

  isOverlappingOnServer(): boolean {
    return true;
  }

  findTargetObject(): Phaser.Types.Tilemaps.TiledObject {
    // In the tiled editor, set the 'target' to be an *object* pointer
    // Here, we'll see just the ID, then find the object by ID
    const targetObjectID = this.getData('target') as number;
    const target = this._scene.map.findObject(
      'Objects',
      obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id == targetObjectID,
    );
    if (!target) {
      throw new Error(
        `Unable to find target object ${targetObjectID} for transporter ${this.name}`,
      );
    }
    return target;
  }

  overlap(): void {
    this._scene.moveOurPlayerTo({ x: this._targetX, y: this._targetY });
  }

  getType(): KnownInteractableTypes {
    return 'transporter';
  }
}
