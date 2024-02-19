import { useEffect, useState } from 'react';
import { ConversationArea as ConversationAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  CONVERSATION_AREA_TYPE,
} from './InteractableAreaController';

/**
 * The events that the ConversationAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type ConversationAreaEvents = BaseInteractableEventMap & {
  topicChange: (newTopic: string | undefined) => void;
};

// The special string that will be displayed when a conversation area does not have a topic set
export const NO_TOPIC_STRING = '(No topic)';
/**
 * A ConversationAreaController manages the local behavior of a conversation area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of conversation areas and the
 * frontend's. The ConversationAreaController emits events when the conversation area changes.
 */
export default class ConversationAreaController extends InteractableAreaController<
  ConversationAreaEvents,
  ConversationAreaModel
> {
  private _topic?: string;

  /**
   * Create a new ConversationAreaController
   * @param id
   * @param topic
   */
  constructor(id: string, topic?: string) {
    super(id);
    this._topic = topic;
  }

  public isActive(): boolean {
    return this.topic !== undefined && this.occupants.length > 0;
  }

  /**
   * The topic of the conversation area. Changing the topic will emit a topicChange event
   *
   * Setting the topic to the value `undefined` will indicate that the conversation area is not active
   */
  set topic(newTopic: string | undefined) {
    if (this._topic !== newTopic) {
      this.emit('topicChange', newTopic);
      if (newTopic !== undefined) this.emit('friendlyNameChange', newTopic);
      else this.emit('friendlyNameChange', NO_TOPIC_STRING);
    }
    this._topic = newTopic;
  }

  get topic(): string | undefined {
    return this._topic;
  }

  get friendlyName(): string {
    return this.id + ': ' + this.topic || NO_TOPIC_STRING;
  }

  get type(): string {
    return CONVERSATION_AREA_TYPE;
  }

  protected _updateFrom(newModel: ConversationAreaModel): void {
    this.topic = newModel.topic;
  }

  /**
   * A conversation area is empty if there are no occupants in it, or the topic is undefined.
   */
  isEmpty(): boolean {
    return this._topic === undefined || this.occupants.length === 0;
  }

  /**
   * Return a representation of this ConversationAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): ConversationAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      topic: this.topic,
      type: 'ConversationArea',
    };
  }

  /**
   * Create a new ConversationAreaController to match a given ConversationAreaModel
   * @param convAreaModel Conversation area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromConversationAreaModel(
    convAreaModel: ConversationAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): ConversationAreaController {
    const ret = new ConversationAreaController(convAreaModel.id, convAreaModel.topic);
    ret.occupants = playerFinder(convAreaModel.occupants);
    return ret;
  }
}

/**
 * A react hook to retrieve the topic of a ConversationAreaController.
 * If there is currently no topic defined, it will return NO_TOPIC_STRING.
 *
 * This hook will re-render any components that use it when the topic changes.
 */
export function useConversationAreaTopic(area: ConversationAreaController): string {
  const [topic, setTopic] = useState(area.topic);
  useEffect(() => {
    area.addListener('topicChange', setTopic);
    return () => {
      area.removeListener('topicChange', setTopic);
    };
  }, [area]);
  return topic || NO_TOPIC_STRING;
}
