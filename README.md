# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.

For our final project, we extended Covey.Town to allow users to sign up to save various user preferences, including Media Settings, username, and their previous positions in different servers. 

You can view the reference deployment of the original app at [app.covey.town](https://app.covey.town/). And the deployment of our extension to the app at [friendly-goldberg-881a1f](https://friendly-goldberg-881a1f.netlify.app/)

The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react).

A backend service (in the `services/roomService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns, as well as tracking user preferences, and connecting to the database.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `services/roomService` directory, setting the values as follows:

| Config Value              | Description                               |
| -----------------------   | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`      | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`      | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET`   | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN`   | Visible on your twilio account dashboard. |

### Configuring the Database
In the `.env` file, add the `DATABASE_CONNECTION_STRING` and set it to `postgres://kisvchxzkztlyx:02c7828881c5e71290f509916361926b80923b88c0dddeaf170cb111cdbb4c51@ec2-18-204-101-137.compute-1.amazonaws.com:5432/d46idgb6list1r` to access my local database connection.

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `services/roomService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `services/roomService/src` directory.

### Configuring the frontend

To run the frontend, you will need an Auth0 account. Auth0 provides new accounts for free. 
To create an account and configure your local environment:

1. Go to [Auth0](https://auth0.com/) and create an account.
2. Create a new application.
3. Create a `.env` file in the `frontend` directory, setting the values as follows:

| Config Value                 | Description                               |
| -----------------------      | ----------------------------------------- |
|`AUTH_0_CLIENT_ID`            | Visible in your Application Settings.     |
|`AUTH_0_DOMAIN`               | Visible in your Application Settings.     |
|`REACT_APP_TOWNS_SERVICE_URL` | `http://localhost:8081`                   |

Then, you need to configure your Allowed Callback URLs, Allowed Logout URLs and Allowed Web Origins all to `http://localhost:3000`

Without these following configurations, AUTH0 will not work.

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.

