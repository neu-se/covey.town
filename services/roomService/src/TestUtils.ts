import { MessageType, Message } from "./CoveyTypes";
import MessageChain from "./types/MessageChain";
import Player from "./types/Player";

export function createPlayerForTesting(){
    return new Player('player 1');
}

export function createMessageForTesting(type: MessageType, player1: Player, player2id?: string) {
    const timestamp = Date.now().toString();
    let directMessageID = undefined;
    if (player2id) {
        directMessageID = player1.id + ':' + player2id;
    }
    return {
        user: player1,
        messageContent: 'Omg I\'m a test',
        timestamp: timestamp,
        type: type,
        directMessageId: directMessageID,
    }
}

export function createMessageChainForTesting(startingMessage: Message): MessageChain {
    return new MessageChain(startingMessage);
}
