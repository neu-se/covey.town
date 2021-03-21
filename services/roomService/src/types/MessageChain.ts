import { Message, MessageType } from "../CoveyTypes";

/**
 * Each set of messages that a player has is represented by a MessageChain
 */
export default class MessageChain {
    private _messages: Message[] = [];
    private _isActive: boolean;
    // only needed for MessageChains containing messages of the DirectMessage type
    private readonly _directMessageId: string | undefined;
    private readonly _participants: string[] | undefined;
    
    constructor(message : Message) {
        this._isActive = true;
        this._messages.push(message);
        if (message.type == MessageType.DirectMessage) {
            this._directMessageId = message.directMessageId;
            
            // split directMessageID into two player IDs
            this._participants = message.directMessageId?.split(':');
        }
        else {
            this._directMessageId = undefined;
            this._participants = undefined;
        }
    }

    get messages(): Message[] {
        return this._messages;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get directMessageId(): string | undefined {
        return this._directMessageId;
    }

    get participants(): string[] | undefined {
        return this._participants;
    }

    set isActive(value: boolean) {
        this._isActive = value;
    }

    /**
     * Adds new message to this message chain. Return true if message was added, 
     * false if this chain is inactive.
     * @param newMessage The new message to add to this chain
     */
    addMessage(newMessage: Message): boolean {
        if (this._isActive == true) {
            this._messages.push(newMessage);
            return true;
        }
        return false;
    }

}