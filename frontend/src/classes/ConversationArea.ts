import assert from 'assert';
import Phaser from 'phaser';

type ConversationGameObjects = {
  labelText: Phaser.GameObjects.Text;
  topicText: Phaser.GameObjects.Text;
  sprite: Phaser.GameObjects.Sprite;
};

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ServerConversationArea = {
  label: string;
  topic?: string;
  occupantsByID: string[];
  boundingBox: BoundingBox;
};

export default class ConversationArea {
  private _occupants: string[] = [];

  private _label: string;

  private _topic?: string;

  private _gameObjects?: ConversationGameObjects;

  private _boundingBox: BoundingBox;

  constructor(
    label: string,
    topic?: string,
    gameObjects?: ConversationGameObjects,
    boundingBox?: BoundingBox,
  ) {
    if (gameObjects) {
      this._boundingBox = {
        x: gameObjects.sprite.x,
        y: gameObjects.sprite.y,
        width: gameObjects.sprite.displayWidth,
        height: gameObjects.sprite.displayHeight,
      };
    } else if (boundingBox) {
      this._boundingBox = boundingBox;
    } else {
      throw new Error('Must provide gameObjects or boundingBox');
    }
    this._gameObjects = gameObjects;
    this._label = label;
    this._topic = topic;
  }

  get label() {
    return this._label;
  }

  set occupants(newOccupants: string[]) {
    this._occupants = newOccupants;
  }

  get occupants() {
    return this._occupants;
  }

  set topic(newTopic: string|undefined) {
    this._topic = newTopic;
  }

  get topic() {
    return this._topic || '(No topic)';
  }

  isEmpty(): boolean {
    return this._topic === undefined;
  }

  getBounds(): Phaser.Geom.Rectangle {
    assert(this._gameObjects);
    return this._gameObjects.sprite.getBounds();
  }

  getBoundingBox(): BoundingBox {
    return this._boundingBox;
  }

  destroy() {
    this.onTopicChange(undefined);
    this.occupants = [];
  }

  onTopicChange(newTopic?: string) {
    this._topic = newTopic;
    if (this._gameObjects) {
      if (newTopic) {
        this._gameObjects.topicText.text = newTopic;
      } else {
        this._gameObjects.topicText.text = '(No topic)';
      }
    }
  }

  onOccupantsChange(newOccupants: string[]) {
    this._occupants = newOccupants;
  }

  toServerConversationArea(): ServerConversationArea {
    return {
      label: this.label,
      occupantsByID: this.occupants,
      topic: this.topic,
      boundingBox: this.getBoundingBox(),
    };
  }

  static fromServerConversationArea(serverArea: ServerConversationArea): ConversationArea {
    const ret = new ConversationArea(serverArea.label, serverArea.topic, undefined, serverArea.boundingBox);
    ret.occupants = serverArea.occupantsByID;
    return ret;
  }
}
