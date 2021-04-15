## Interacticting with our user stories

- **User Story 1:** Players can send text chats to all other players in the room. These messages will appear above their heads.
  - If a player wants to send a message to everyone else in the room, they can type a message in the box above the "send global message" button. Then they should click the "send global message" button.
  - The message and the username of the person that sent it will appear in the chat box for everyone to see. Global messages are green in the chat box.
  - The message will also appear above the player's name for 5 seconds or until the player sends another message, whichever comes first. The message will follow the player around while they walk.
- **User Story 2:** Players can send private text chats to other players. These private messages should only be visible to the player sending the message and the player receiving the message.
  - If a player wants to send a message to one other player in the room, they can type a message in the box above the "send global message" button. Before clicking any buttons, they should also type in the username of the player they want to message in the box above the "send private message" button. Then they should click the "send private message" button.
  - The message, its sender, and its receiver will be displayed in the chat box and should only be visible to the sender and receiver. Private messages are purple and do NOT appear above the player's name.
  - Please note that if there are multiple players with the same username, their message may not go through to the player they have in mind, so players should try to have unique usernames for the optimal player experience.
- **User Story 3:** Players that send inappropriate messages will have the inappropriate words in their messages censored.

  - If a player tries to send an inappropriate message, the "bad" words in the message will be automatically censored by replacing every letter in the word with a '\*'.
  - For example, if a player wanted to send the message "I love Professor Bell!", the message everyone would see is "I love Professor \*\*\*\*!" (we used "bell" as a test word so testing wouldn't be full of more colorful language)

  ## Other Features

  ### Emoji's:

  - **Players can send emojis!** If a player wants to send an emoji, they need to send it in the form: ':name_of_emoji_here:'
    - Example: (:face_with_cowboy_hat: sends 🤠)
  - [Link to the page for the emoji API] (https://github.com/omnidan/node-emoji/blob/master/README.md)
  - [List of supported emoji's] (https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json)
