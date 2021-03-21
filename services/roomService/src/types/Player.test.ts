import { MessageType } from '../CoveyTypes';
import { createMessageForTesting, createMessageChainForTesting, createPlayerForTesting } from '../TestUtils';

describe('Player', () => {
    it('has an empty town message chain upon initialization', () => {
        const player = createPlayerForTesting();
        expect(player.townMessageChain.messages).toBe([]);
    });

    describe('receiveMessage', () => {
        it('adds an incoming townwide message to the town message list', () => {
            const player = createPlayerForTesting();
            const message = createMessageForTesting(MessageType.TownMessage, player);
            player.receiveMessage(message);
            const townMessages = player.townMessageChain.messages;
            expect(townMessages.length).toBe(1);
            expect(townMessages[0]).toBe(message);
        });
        it('does not add other message types to the town message list', () => {
            const player = createPlayerForTesting();
            const message = createMessageForTesting(MessageType.ProximityMessage, player);
            player.receiveMessage(message);
            expect(player.townMessageChain.messages.length).toBe(0);
        });
    });
});