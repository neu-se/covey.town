import { nanoid } from 'nanoid';
import { Message, MessageType } from "../CoveyTypes";
import MessageChain from "./MessageChain";
import Player from "./Player";

function createPlayerForTesting(){
    return new Player('player 1');
}

function createMessageForTesting(type: MessageType, player1: Player, player2id?: string) {
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

function createMessageChainForTesting(startingMessage: Message): MessageChain {
    return new MessageChain(startingMessage);
}

describe('MessageChain', () => {
    it('get messages', () => {
        const firstMessage = createMessageForTesting(MessageType.ProximityMessage, new Player('player 1'));
        const testChain = createMessageChainForTesting(firstMessage);
        expect(firstMessage).toBe(testChain.messages[0]);
    });
    it('get isActive', () => {
        const firstMessage = createMessageForTesting(MessageType.ProximityMessage, new Player('player 1'));
        const testChain = createMessageChainForTesting(firstMessage);
        expect(testChain.isActive).toBe(true);
    });
    it('set isActive', () => {
        const firstMessage = createMessageForTesting(MessageType.ProximityMessage, new Player('player 1'));
        const testChain = createMessageChainForTesting(firstMessage);
        expect(testChain.isActive).toBe(true);
        testChain.isActive = false;
        expect(testChain.isActive).toBe(false);
    });
    describe('get directMessageId', () => {
        it('should return undefined for MessageChain that is not direct', () => {
            const firstMessage = createMessageForTesting(MessageType.ProximityMessage, new Player('player 1'));
            const testChain = createMessageChainForTesting(firstMessage);
            expect(testChain.directMessageId).toBeUndefined();
        });
        it('should return a string id for a MessageChain containing DirectMessages', () => {
            const player1 = createPlayerForTesting();
            const player2id = nanoid();
            const firstMessage = createMessageForTesting(MessageType.DirectMessage, player1, player2id);
            const testChain = createMessageChainForTesting(firstMessage);
            expect(testChain.directMessageId).toBe(firstMessage.directMessageId);
            expect(testChain.directMessageId).toBe(player1.id + ':' + player2id);
        });
    })
    describe('get participants', () => {
        it('should return undefined for MessageChain that is not direct', () => {
            const firstMessage = createMessageForTesting(MessageType.ProximityMessage, new Player('player 1'));
            const testChain = createMessageChainForTesting(firstMessage);
            expect(testChain.participants).toBeUndefined();
        });
        it('should return a string array for a MessageChain containing DirectMessages', () => {
            const player1 = createPlayerForTesting();
            const player2id = nanoid();
            const firstMessage = createMessageForTesting(MessageType.DirectMessage, player1, player2id);
            const testChain = createMessageChainForTesting(firstMessage);
            expect(testChain.participants?.length).toBe(2);
        });
    })
    describe('addMessage', () => {
        it('should allow for message added to active MessageChain', () => {
            const player1 = createPlayerForTesting();
            const firstMessage = createMessageForTesting(MessageType.ProximityMessage, player1);
            const testChain = createMessageChainForTesting(firstMessage);
            expect(testChain.messages.length).toBe(1);
            const secondMessage = createMessageForTesting(MessageType.ProximityMessage, player1);
            expect(testChain.addMessage(secondMessage)).toBe(true);
            expect(testChain.messages.length).toBe(2);
            expect(secondMessage).toBe(testChain.messages[1]);
        });
        it('should not allow message to add to inactive chain', () => {
            const player1 = createPlayerForTesting();
            const firstMessage = createMessageForTesting(MessageType.ProximityMessage, player1);
            const testChain = createMessageChainForTesting(firstMessage);
            expect(testChain.messages.length).toBe(1);
            testChain.isActive = false;
            const secondMessage = createMessageForTesting(MessageType.ProximityMessage, player1);
            expect(testChain.addMessage(secondMessage)).toBe(false);
            expect(testChain.messages.length).toBe(1);
        });
    })

})