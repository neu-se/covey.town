import BoundingBox from './BoundingBox';

export type ServerConversationArea = {
  label: string;
  topic?: string;
  occupantsByID: string[];
  boundingBox: BoundingBox;
};

export type ConversationAreaListener = {
  onTopicChange?: (newTopic: string | undefined) => void;
  onOccupantsChange?: (newOccupants: string[]) => void;
};
export default class ConversationArea {
  private _occupants: string[] = [];

  private _label: string;

  private _topic?: string;

  private _boundingBox: BoundingBox;

  private _listeners: ConversationAreaListener[] = [];

  constructor(label: string, boundingBox: BoundingBox, topic?: string) {
    this._boundingBox = boundingBox;
    this._label = label;
    this._topic = topic;
  }

  get label() {
    return this._label;
  }

  set occupants(newOccupants: string[]) {
    if(newOccupants.length !== this._occupants.length || 
      !this._occupants.every(oldOccupant => newOccupants.includes(oldOccupant))){
      this._listeners.forEach(listener => listener.onOccupantsChange?.(newOccupants));
      this._occupants = newOccupants;
    }
  }

  get occupants() {
    return this._occupants;
  }

  set topic(newTopic: string | undefined) {
    if(this._topic !== newTopic){
      this._listeners.forEach(listener => listener.onTopicChange?.(newTopic));
    }
    this._topic = newTopic;
  }

  get topic() {
    return this._topic || '(No topic)';
  }

  isEmpty(): boolean {
    return this._topic === undefined;
  }

  getBoundingBox(): BoundingBox {
    return this._boundingBox;
  }

  toServerConversationArea(): ServerConversationArea {
    return {
      label: this.label,
      occupantsByID: this.occupants,
      topic: this.topic,
      boundingBox: this.getBoundingBox(),
    };
  }

  addListener(listener: ConversationAreaListener) {
    this._listeners.push(listener);
  }

  removeListener(listener: ConversationAreaListener) {
    this._listeners = this._listeners.filter(eachListener => eachListener !== listener);
  }

  static fromServerConversationArea(serverArea: ServerConversationArea): ConversationArea {
    const ret = new ConversationArea(serverArea.label, serverArea.boundingBox, serverArea.topic);
    ret.occupants = serverArea.occupantsByID;
    return ret;
  }
}
