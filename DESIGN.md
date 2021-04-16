Our text chat component was implemented completely in parallel to the existing codebase and did not make any substantive changes to it.

## Backend Design Changes

#### Chat Classes
- **AChatMessage:**
  - We defined the AChatMessage abstract class as a foundation for our more specific chat classes. 
- **GlobalChatMessage:**
  - The GlobalChatMessage class is our representation of a chat message that is sent to everyone in the town in the chat box and is visible above the head of the Player that sent it.
- **PrivateChatMessage:**
  - The PrivateChatMessage class is our representation of a chat message that is sent between two players in the same town and appears in the chat box only.

#### API Endpoints
- **sendGlobalPlayerMessage:**
  - An endpoint that posts a GlobalPlayerMessage to the server. 
- **sendPrivatePlayerMessage:**
  - An endpoint that posts a PrivatePlayerMessage to the server.

We implemented socket endpoints so that the chat messages can be sent to the covey server and distributed amongst all players. Messages are stored in an instance of a CoveyTownController, where they can be easily rendered based on their own data.

## Frontend Design Changes

#### Chatbox
We have a chatbox that allows players to send both global and private messages. Players can specify what kind of message they want to send using the "send global" and "send private" buttons. Private messages display the usernames of the Players involved alongside the message and are purple, while global messages display the username of the Player sending the message alongside the message itself and are green.

#### Global message display over Players' heads
Global messages are displayed over the head of the Player sending the message and will remain there for 5 seconds or until they send another message, whichever comes first.

### Censorer
We implemented a censorer in the frontend and backend that checks all messages for prohibited phrases and replaces them with \*s before they are sent. We implemented it in both parts of the codebase so that it would censor words for players receiving messages (covered by the backend) and players sending messages (covered by the frontend).

<img width="880" alt="designChart" src="https://user-images.githubusercontent.com/20538578/114900869-44f4dd80-9de2-11eb-92d7-27f27510a8d2.png">
