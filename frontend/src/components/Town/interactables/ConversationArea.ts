import ConversationAreaController, {
  ConversationAreaEvents,
} from '../../../classes/interactable/ConversationAreaController';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class ConversationArea extends Interactable {
  private _topicTextOrUndefined?: Phaser.GameObjects.Text;

  private _infoTextBox?: Phaser.GameObjects.Text;

  private _conversationArea?: ConversationAreaController;

  private _changeListener?: ConversationAreaEvents['topicChange'];

  private get _topicText() {
    const ret = this._topicTextOrUndefined;
    if (!ret) {
      throw new Error('Expected topic text to be defined');
    }
    return ret;
  }

  getType(): KnownInteractableTypes {
    return 'conversationArea';
  }

  removedFromScene(): void {
    if (this._changeListener) {
      this._conversationArea?.removeListener('topicChange', this._changeListener);
    }
  }

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._topicTextOrUndefined = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      '(No Topic)',
      { color: '#000000' },
    );
    this._conversationArea = this.townController.getConversationAreaController(this);
    this._updateLabelText(this._conversationArea.topic);
    this._changeListener = newTopic => this._updateLabelText(newTopic);
    this._conversationArea.addListener('topicChange', this._changeListener);
  }

  private _updateLabelText(newTopic: string | undefined) {
    if (newTopic === undefined) {
      this._topicText.text = '(No topic)';
    } else {
      if (this.isOverlapping) {
        this._scene.moveOurPlayerTo({ interactableID: this.name });
      }
      this._topicText.text = newTopic;
      if (this._infoTextBox && this._infoTextBox.visible) {
        this._infoTextBox.setVisible(false);
      }
    }
  }

  public getBoundingBox(): BoundingBox {
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          "You've found an empty conversation area!\nTell others what you'd like to talk about here\nby providing a topic label for the conversation.\nSpecify a topic by pressing the spacebar.",
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    if (this._conversationArea?.topic === undefined) {
      this._showInfoBox();
    }
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
