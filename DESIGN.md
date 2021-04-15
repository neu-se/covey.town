Our text chat component was implemented completely in parallel to the existing codebase and did not make any substantive changes to it.

Types were defined to represent Private and Global chat messages. Private messages are designed to be sent directly between 2 players in the same town, while Global messages are sent to all players in the town, and are displayed above the head of the player that sent it. These two classes extend an abstract chat message class.

We implemented socket endpoints so that the chat messages can be sent to the covey server and distributed amongst all players. Messages are stored in an instance of a CoveyTownController, where they can be easily rendered based on their own data.

We also implemented a backend censorer that checks the message for prohibited phrases and replaces them with \*s before they are sent. 

<img width="880" alt="designChart" src="https://user-images.githubusercontent.com/20538578/114900869-44f4dd80-9de2-11eb-92d7-27f27510a8d2.png">
