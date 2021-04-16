# Design

## User Story 1:
We added new types such as CoveyUser and CoveyUserProfile as abstraction for entities in covey town.

### Sign up
- Created a React component for signup page, where a user could register their email and password. All authentication requests are handled by Mongo Realm as our frontend database / authentication provider. 

### Log in
- Crated a React component to allow user to log in using their email and password, once they have registered their credentials.

### AuthGuard
- AuthGuard components stores a user's authentication info and serves as a wall that prevents unauthenticated users to access covey town app.
- Current user state is configured as react state. 

![Login Sequence](docs/user-story-1/login-seq.png)

## User Story 2:
- We use three-legged OAuth processing to handle login using Google account.
- A user, as the resource owner, initiates a request to covey town frontend.
- Covey Town sends the resource owner a redirection to the authorization server.
- The resource owner authenticates and optionally authorizes with the authorization server.
- The authorization server presents a form to the resource owner to grant access.
- The resource owner submits the form to allow or to deny access.
- Google authorization server sends a redirect uri with tokens attached
- CoveyTown extract those tokens
- CoveyTown logins to MongoDB Realm user authentication using Google tokens
- MongoDB Realm returns a Realm user
- CoveyTown creates a Covey User using Realm user info and Google user info extracted using extracted Google user tokens
- CoveyTown persists Covey User to MongoDB Atlas for reuse
![Login Google Sequence](docs/user-story-2/google-login.png)
## User Story 3:
### Friend List
- Upon sign in, user's friend list is fetched from the database and populated in the UI.
- Friend list is filtered into an online and an offline list. 
- User can join a friend's room if he/she is currently online and in a room.
  - Joining a friend's room calls the same handler as joining a room.

### Add Friend:
- Upon sign in, user’s friendRequestSocket is connected and ready to listen to incoming friend requests. 
- When user A sends a friend request to user B,
  - A ‘sendRequest’ message is emitted from user A’s friendRequestSocket
    - If User B is online, his socket receives a ‘receiveRequest’ message with user A’s userID.
  - The friend request is saved into the database under user B’s userID (ie. user B has an array of userIDs from users that sent user B a friend request)
    - If User B is offline, the friend request will be fetched from the database upon his next login. 
- User B’s friend requests are populated in a list on the UI along with options to accept or reject the requests. 
  - If user B accepts the request from user A,
    - User A is added to User B’s friend list in UI state and the relationship is saved in the database and vice versa.
    - Both users’ friend lists on UI are updated accordingly. 
    - User A’s userID is removed from user B’s friend request array in the database and UI state (ie. the friend request is removed)
  - If user B rejects the request from user A,
    - User A’s userID is removed from user B’s friend request array in the database and UI state (ie. the friend request is removed)

![Add friend design diagram](docs/user-story-3/Addfrienddiagram.png)

## User Story 4:
### Realm App
- An endpoint that enables interfacing between our app and Mongo Realm. 

### Authentication
- Added an interface IAuth as an abstraction for all authentication operations.
- Created a Singleton RealmAuth class that implements IAuth. Utilizes MongoRealm as the authentication provider for the implementations.

### Database
#### Frontend
- Added an inteface IDBClient as an abstraction for all database operations
- Created a Singleton RealmDBClient class which is an IDBClient implementation that utilizes MongoRealm as the database provider.
- Implements GraphQL as abstraction for MongoDB query and mutation.

#### Backend
- Added an inteface IDBClient as an abstraction for all database operations.
- Created MongoAtlasClient class that opens the connection to cloud provider MongoDB Atlas and implements all IDBClient functions.

### Town Users List
- Upon joining a town, the players currently in the town are already stored and updated in the CoveyAppState, and information about the logged in user from the Auth Info is used to render the town users list and allow other town users to be added as friends from the WorldMap/Town Screen
- The logged in user's persisting profile stores the user's friend list, which allows us to filter who friend requests can be sent to
- Covey.Town players will now have two IDs:
  - An ID generated each time a user joins, used to identify the player in a town
  - A coveyUserID generated once during account creation, and stored in our database used to query user profiles and friends lists
- The coveyUserID for other town users will be used to send friend requests in the same manner done on the Town Selection page
  - (A ready friend request socket will listen for incoming friend requests that are sent from the Town Screen)
