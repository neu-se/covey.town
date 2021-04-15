1. At the top of our updated Covey.Town interface, you'll see a Log In or Sign Up button
   a. This button will connect you to auth0 where you'll be able to login to a preexisting account or register a new one (User story 2)
   I. These accounts will be saved in the database so that once you have an account all future saved settings will be recoverable through the account
   II. You can also edit email/password as well as recover password through our auth0 interface (User story 3)
   b. Auth0 does password checking and security so that your data is safe
   c. Once signed in, your UI will change
   I. Your username will appear at the top of the page showing which user is logged in
   II. saved media check boxes as well as a save button will appear near the mute/unmute and start/stop video buttons.
   III. A save and saved name button will appear next to the username box so that you can have a username saved on record and refresh it whenever desired
   IV. Towns that were joined(and are active) while you were previously logged in will show up in the Existing Towns section

2. How to use audio and video saved settings:
   a. Set your audio to muted or unmuted (whichever you prefer)
   b. Set your video to on or off
   c. Click the grey "Save" button to the bottom right under the video
   d. Now you can change the settings to anything else and return to what they were when you clicked save by clicking the "saved media" checkbox
   I: Use case: if you want to have saved both off you set audio to muted and video to off, then click "save", then whenever you want both turned off click "saved media"
   e. Note: you can join a server with any settings and return them to whatever is saved on your account through the checkbox at any time

3. How to use username saved settings:
   a. Set your username to whatever you want it to default to
   b. Click the grey "Save" button to the bottom right under the video
   c. You can now set your username to whatever you want for a specific server and then return it to the default at any time by clicking the "saved name" checkbox
   I: Use case: if you have a default username you want most of the time to have saved type it into the box, then click "save", then whenever you want it to return click "saved media"

4. In the "Join an Existing Town" section of Covey.Town:
   a. Any servers you joined while logged in (that can be connected to) will show up in the list with the public towns
   b. If you join a server that you moved around in and is still running the same map you will be placed in the location that you logged off at (User story 1)

5. User Stories:

   - To exercise user stories follow the below instructions:
     User Story 1 (recovering where you left off on a server): 1. Log in to an account through the "Log in or Sign Up" button at the top 2. Move in a server 3. Disconnect from the server 4. Reconnect to the server and you'll be in the same location you were when you logged off

     User Story 2 (registering for an account): 1. Click the "Log in or Sign Up" button at the top 2. Where it says "Don't have an account? Sign up" click the blue sign up text 3. Follow the instructions to set an email and password as well as enter in a security question 4. Covey.Town will now show you as logged in (with your account name easily visible at the top)
     I. Where the log in or sign up button was will now be a sign out button
     II. At the top right will be a profile icon and will allow you to edit account details

     User Story 3 (Changing and updating account info): 1. Log in to an account through the "Log in or Sign Up" button at the top 2. At the top right will be a profile icon click that to edit account details 3. You'll be taken to a portal where you can see your current details 4. In that portal you will be able to change your current password 5. If you forget your password and are not logged in, Click the "Log in or Sign Up" button
     I. Then click the blue "Forgot Password?" text to enter your email and security question and have the password sent to you
