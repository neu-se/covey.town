import Phaser from 'phaser';

type ConversationGameObjects = {
  labelText: Phaser.GameObjects.Text;
  topicText: Phaser.GameObjects.Text;
  sprite: Phaser.GameObjects.Sprite;
};

type BoundingBox = {
  x: number,
  y: number,
  width: number,
  height: number
}

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

  private _gameObjects: ConversationGameObjects; 

  constructor(gameObjects: ConversationGameObjects, label: string, topic?: string) {
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

  set topic(newTopic: string) {
    this._topic = newTopic;
  }

  get topic() {
    return this._topic || '(No topic)';
  }

  isEmpty(): boolean{
    return this._topic === undefined;
  }

  getBounds(): Phaser.Geom.Rectangle {
    return this._gameObjects.sprite.getBounds();
  }

  getBoundingBox(): BoundingBox {
    return {
      x: this._gameObjects.sprite.x,
      y: this._gameObjects.sprite.y,
      width: this._gameObjects.sprite.displayWidth,
      height: this._gameObjects.sprite.displayHeight
    }
  }

  destroy() {
    this.onTopicChange(undefined);
    this.occupants = [];
  }

  onTopicChange(newTopic?: string) {
    this._topic = newTopic;
    if (newTopic) {
      this._gameObjects.topicText.text = newTopic;
    } else {
      this._gameObjects.topicText.text = '(No topic)';
    }
  }

  onOccupantsChange(newOccupants: string[]) {
    this._occupants = newOccupants;
  }

  // eslint-disable-next-line
  onCurrentPlayerEntered() {
  }

  // eslint-disable-next-line
  onCurrentPlayerExits() {
  }

  toServerConversationArea() : ServerConversationArea{
    return {
      label: this.label,
      occupantsByID: this.occupants,
      topic: this.topic,
      boundingBox: this.getBoundingBox()
    }
  }
}
