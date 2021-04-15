# Design

## User Story 1:

## User Story 2:

## User Story 3:
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
TODO
