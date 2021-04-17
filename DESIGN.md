# Design

**Changes to Existing Covey.Town Code:**
Backend:

- towns.ts:
  - Added endpoints for games within the towns
  - app.post : create a new game session (line 117)
  - app.patch : updates game session as players make moves in the game and when player 2 joins (line 141)
  - app.get : retrieves data for all game sessions (line 166)
  - app.delete : deletes game session from server (line 183)
- CoveyTownsREST.test.ts: Added tests for game data

Frontend:

- CoveyTypes.ts: Added gamesClient property in CoveyAppState type
  - Affects App.tsx and VideoOverlay.tsx (which pass current user props to the Menu bar via the app state) as well as frontend test files
- MenuBar.tsx: Added “Create Game” and “Browse Open Games” buttons
- Index.css: Added styles used in game modals

---

**Additions to Backend _(Note: some files are present both in the services/roomServices folder as well as the frontend/src folder for accessibility purposes):_**

- src:

  - requestHandlers:
    - GameRequestHandler.ts : handles game requests from server to create, update, and delete a game session, as well as find a game session by ID and find all game sessions
  - games:
    - IGame.ts _(this class is also found in frontend/src/components/Games/gamesClient/IGame.ts for frontend accessibility purposes) :_
      - model interface for game functionality. Includes methods to initializeGame, move, isGameOver, finishGame, and playerJoin. Implemented by TTLGame and HangmanGame model classes
    - TTLGame.ts _(this class is also found in frontend/src/components/Games/gamesClient/TTLGame.ts for frontend accessibility purposes):_
      - model class for a Two Truths and a Lie game; includes:
      - An initializeGame method telling the player what the three statements are (two truths, one lie)
      - A playerJoin method which adds Player 2’s ID and username upon them joining the game
      - A move method which keeps track of which statements the player has already guessed to be the lie, and continuously checks if the game is over
    - HangmanGame.ts _(this class is also found in frontend/src/components/Games/gamesClient/HangmanGame.ts for frontend accessibility purposes):_
      - model class for a Hangman game; includes:
      - An initializeGame method prompting Player 2 to choose a letter
      - A playerJoin method which adds Player 2’s ID and username upon them joining the game
      - A move method which keeps track of what letters the player has already guessed and checks them against the letters of the hangman word (the word the player is trying to guess)
    - GameController.ts:
      - Contains a list of active game objects
      - Allows games to be retrievable (by ID) for use of service client
      - Logic for list of games (model class objects, getter/setter) to find or remove a specific game in the games list
    - GamesREST.test.ts: Tests CRUD operations in the GameServiceClient
    - IGamesClasses.test.ts: Tests methods of each model class
    - GameController.test.ts: Tests GameController

- client:
  - GameServiceClient.ts (this class is also found in frontend/src/components/Games/gamesClient/GameServiceClient.ts for frontend accessibility purposes):
    - service client for game implementation with methods to create, update, delete, and list games
  - GameTypes.ts (this class is also found in frontend/src/components/Games/gamesClient/GameTypes.ts for frontend accessibility purposes):
    - Establishes types to be used in the game model classes, including the word to be guessed in Hangman, the choices for Two Truths and a Lie, moves for each player in the different games (TTLPlayer1Move, TTLPlayer2Move, HangmanMovePlayer1Move, HangmanPlayer2Move), a list of games, and a Limb enum for each limb that can be removed in the Hangman game
  - GameRequestTypes.ts (this class is also found in frontend/src/components/Games/gamesClient/GameRequestTypes.ts for frontend accessibility purposes):
    - Contains interfaces and types for GameRequests/Responses (for creating, updating, deleting, and listing games)

---

**Additions to Frontend:**

- src/components/Games:
  - GameDisplays:
    - HangmanAssets: collection of images to be used for hangman
    - Hangman/HangmanDisplay.tsx: This is the gameplay display for the Hangman game. It includes a keyboard where the player will choose letters and keeps track of/shows which letters have already been guessed correctly/incorrectly. If Player 1 ends game before it’s finished, shows Player 2 a message saying that.
    - Hangman/HangmanLetter.tsx: This contains the functionality to grey out letters on the keyboard that have already been guessed
    - Hangman/HangmanFigure.tsx: This controls the Hangman images to show up on incorrect guesses
    - TTLDisplay.tsx: This is the gameplay display for the TTL Game. It shows the three statements (two truths, one lie) and has radio buttons for each so that the player can choose which one they think is the lie. It displays a message to the player depending on if they guessed correctly or not. If Player 1 ends game before it’s finished, shows Player 2 a message saying that.
  - GameModals:
    - CreateGameModalDialog.tsx: This is the modal that Player 1 will see when they choose to create a new game and when another player joins and they proceed to gameplay. It gives Player 1 the game creation options and prompts them to input the information needed for the game, and then displays a ‘Waiting for Player 2 to join’ message until another player in the town joins the game. Once a player joins, the modal changes to display to show the gameplay. Once the game is over the display switches to show a message saying which player won.
    - BrowseOpenGamesModal.tsx: This is the modal that any player will see when they choose the ‘Browse Games’ button in the town menu bar. This how Player 2 will join a game, as when they open this modal they will see a list of games that have been created by players in the town. Each listing will have the game type, the username of the player who created it, and a button to join the game. When a player clicks a join button, this will connect to the JoinGameModalDialog.
    - JoinGameModalDialog.tsx: This is the modal Player 2 will see after they confirm joining a game, and will be where their gameplay is. Depending on which game they join, they will either be taken to a TTL or Hangman game display and will be able to go through the game. Once the game is over the display switches to show a message saying which player won.
