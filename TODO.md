TODO:

- css / stylistic changes to saveUser button (+ call api to save username)
  - profile display page
- prefill use audio/ use video (figure out where this would happen)
- load most recent position
  - in town join handler when creating a player, if they're logged in AND if they've already been in the town they're trying to join, set the location to their previous location (from getUserByID call)
- call API's instead of using mocks in Login.tsx, TownSelection.tsx, handleJoin?
- make sure it deploys, make sure Auth0 works with deploy
- clean up code diagram to reflect most recent design (for writeup)
- documentation

TODO for the others

- backend testing
- reformat repositories (try to combine all update/ get queries into one each time)
  - need to have a join across maps table too
- save last position in town (on disconnect handler)
  - will need to find player's location, then call API
-

TA Q's
- deployment / deployment issue
- how to use Auth0 with Heroku??
- prefill useAudio/ useVideo (understanding that code)
- figure out how to load most recent position