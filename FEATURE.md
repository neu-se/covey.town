# FEATURES

Here are some helpful hints for deploying Covey.Town with the Covey.Town Games feature:

### User Story 1: Create A New Game

- Launch the [covey.town website](https://covey-town-games.netlify.app/) and enter your username. Either create a new town or join an existing town.
- Once inside a town, click the ‘New Game’ button on the town menu bar.
- Choose which game you would like to start (for our feature, this is a choice between Hangman or Two Truths and a Lie).
- Once you’ve chosen which game you want to play, enter the required game information
  - For Hangman, this will be the word that the other player needs to guess
  - For Two Truths and a Lie, this will be three statements: two that are true, and one that is false
- Click ‘Create Game’
  - Alternatively, if you’d like to cancel creating this game, you can click ‘Cancel’ which will bring you out of the modal and back to the town. If you’d like to create a new game at any point after this, you can follow the same steps above.
- Once you click ‘Create Game’ you will see ‘Waiting for Player 2 to join...’ until another player chooses to join your game from the ‘Browse Games’ list
- Once another player in the town joins your game:
  - If you are playing hangman, you will see the hangman image along with Player 2’s guesses and the message ‘[Player 2 username] is guessing!’
  - If you are playing Two Truths and a Lie, you will see ‘[Player 2 username] is guessing!’
- Once the game has finished:
  - The display will say [winning player] won the game!’
  - You can then click the ‘x’ button in the corner of the modal to exit the game
- You can also choose to leave the game at any point - a message will be sent to Player 2 if you leave prematurely (if a Player 2 has already joined) and the game will end/be removed from the Browse Games list
- If Player 2 leaves the game prematurely, you will receive a message notifying you and the game will end/be removed from the Browse Games list
- The game will be removed from the ‘Browse Games’ list

---

### User Story 2: Join a Game

- Launch the [covey.town website](https://covey-town-games.netlify.app/) and enter your username. Either create a new town or join an existing town.
- Once inside the town, to find games to join click the ‘Browse Games’ button in the town’s menu bar.
- A modal will show up showing the list of games that have been created by other people in the town. Each listing will show:
  - The type of game created (for our feature, either Hangman or Two Truths and a Lie)
  - The username of the player who created the game
  - A ‘Join’ button
- When you find a game you want to join, click the ‘Join’ button
- You will be asked whether you want to join [Type of Game] with [Player 1 username] - you can either confirm by clicking ‘Join Game’, or click ‘Cancel’ which will take you back to the ‘Browse Games’ list.
  - You can choose to close the ‘Browse Games’ list at any time by clicking the ‘x’ in the corner of the modal
- Once you click ‘Join Game’ your display will change to the game screen:
  - If you have picked a Hangman game, you will see a hangman image (stick figure and gallows) and empty spaces corresponding to a word which you then need to guess (the word has been chosen by Player 1 upon game creation)
    - You will also have a keyboard, which you will use to choose which letter you’d like to guess. Once you choose a letter to guess, whether correct or incorrect, that letter button will grey out and become non-clickable
    - For each letter you guess incorrectly, a body part will be removed from the stick figure. If all body parts are removed, you lose the game
    - Each correct letter will show up in the empty spaces. If you guess all correct letters before all body parts are removed, you win the game
  - If you have picked a Two Truths and a Lie game, you will see three statements on the screen, each with radio buttons (these statements were made by Player 1 upon game creation):
    - Two of these statements will be true, and one will be a lie (Player 1 has made the distinction)
    - You will click the option that you believe is the lie
  - Either game screen will have [Player 1 username] vs. [Player 2 username] at the top of the modal
- Once the game is over:
  - If you lost Two Truths and a Lie, you will see ‘Oops! The lie was actually [lie]’
  - If you won Two Truths and a Lie, you will see ‘You guessed correctly!’
  - If you lost Hangman, you will see ‘[Player 1 username] won the game!’
  - If you won Hangman, you will see ‘[Your/Player 2 username] won the game!’
- You can then click the ‘x’ button in the corner of the modal to exit the game
  - You can also choose to leave the game at any point - a message will be sent to Player 1 if you leave prematurely and the game will end/be removed from the Browse Games list
  - If Player 1 leaves the game prematurely, you will receive a message notifying you and the game will end/be removed from the Browse Games list
- The game will be removed from the ‘Browse Games’ list

---

### User Story 3: Attempt to Join a Closed Game

- Launch the [covey.town website](https://covey-town-games.netlify.app/) and enter your username. Either create a new town or join an existing town.
- Once inside the town, to find games to join click the ‘Browse Games’ button in the town’s menu bar.
- A modal will show up showing the list of games that have been created by other people. Each listing will show:
  - The type of game created (for our feature, either Hangman or Two Truths and a Lie)
  - The username of the player who created the game
  - A ‘Join Button’
- When you find a game you want to join, click the ‘Join’ button
- This game will no longer be available, as another player has joined, so instead of seeing the option to ‘Join Game’ or ‘Cancel’ (as in User Story 2), you will see a message that says ‘Looks like someone else joined this game before you. This game is no longer open.’
- You can then click the ‘x’ in the corner of the modal to exit the message.
- You can then open ‘Browse Games’ again and try joining another game (in the same way as User Story 2).
