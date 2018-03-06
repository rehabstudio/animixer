# Safari Mixer

Safari Mixer is a Voice Experiment for Google Assistant that lets you combine animals to create new ones.

https://animixer.beta.rehab/

**Setting up:**

```
$ make setup
```

**Running:**

```
$ make run
```

**Deploying:**

```
$ make deploy
```

> NOEL this is the new content for you to look at

## Technology

Mystery Animal is built on [Actions on Google](https://developers.google.com/actions/), the platform that allows you to make things for the Google Assistant and the Google Home. It uses [Dialogflow](https://dialogflow.com/) to handle understanding what the player says, [Firebase Cloud Functions](https://firebase.google.com/docs/functions/) for backend code, and [Firebase Database](https://firebase.google.com/docs/database/) to save data. The project is written in JavaScript, using Actions on Google’s [Node.js client library](https://developers.google.com/actions/nodejs-client-library-release-notes).

This repo contains a pre-built Dialogflow Agent you can import into your own project. It contains all the Intents and Entities for Mystery Animal. This is all in the `dialogflow_agent` folder.

Everything in the `functions` folder is used in Firebase Cloud Functions, which hosts the webhook code for Dialogflow. The webhook handles all the response logic for Mystery Animal. The bulk of the code is in `index.js`.

### Importing the Dialogflow Agent

Go to the [Actions on Google developer console](https://actions-console.corp.google.com/), and create a new project.

Click “BUILD” on the Dialogflow card, and follow the flow to create a new Dialogflow agent.

When your agent is created, click on the gear icon to get to the “Export and Import” tab. You can then compress the `dialogflow_agent` folder from this repo into a zip file, and then import it. You should then see all of Mystery Animal’s Intents and Entities in your project.

[Here](https://dialogflow.com/docs/getting-started/basics)’s some more info about how Dialogflow works in general.

### Setting up the webhook

**Install the Firebase CLI.**

**Go to the `functions` folder**:

`cd functions`

**Install dependencies by going to the running either**

`yarn` or `npm install`

**Initialize Firebase**

`firebase init`

Select “functions” and optionally “database” if you’d also like to save the questions and responses.
Select your Google Project ID as your default project. (This can be found in your Dialogflow agent settings.)

**Deploy your webhook**

`firebase deploy`

**Get your webhook URL and put it in Dialogflow**

Once you’ve successfully deployed your webhook, your terminal should give you a url called “Function URL.” In Dialogflow, click the “Fulfillment” tab and toggle the “Enable” switch for the webhook. Paste that url into the text field.

**You can read more documentation about using Firebase Cloud Functions for Dialogflow fulfillment [here](https://dialogflow.com/docs/how-tos/getting-started-fulfillment).**

### Testing your app

You should now be able to test your app in the Dialogflow test console. You can also go to Dialogflow’s Integration tab, and try it on the Actions on Google simulator, where you can also hear it on a Google Home or Assistant device.

### Playing with response logic

The bulk of the response logic is in `index.js` with some custom classes in the `module` folder. You can read the docs about the Actions on Google Node SDK, which is called in with `const App = require("actions-on-google").DialogflowApp;`

The Actions library’s built in `app.data` object is very useful for storing data within a session.

### Saving queries and responses to a Firebase Database

The repo contains a module called `FirebaseDatabase.js`, which allows you to save info about what happens in a game to a Firebase Database. If you want to do this, you’ll have to set up your own service account. If you don’t want to use it, you can remove all the Firebase Database code from `index.js`.

> NOEL this is the end of the new content for you to look at

## Authentication

For deploying this sounds and GIFs this project uses a service private generated from:
https://console.cloud.google.com/apis/credentials?project=animixer-1d266

save the key at the root of this project with the name:
`animixer-pk.json`

The Makefiles in generateGif and generateSound have commands with the env vars required which will need to be updated.

## Overview

This project contains the following components

- Sound Generation

Python3 script that generates mixed animal sounds using Tensor Flow, Highly recommend
setting up GPU processing to reduce the time it takes to generate sound from 24hours ->
a few hours.

- GIF Generation

A .jsx AfterEffects script that will automate generation of .tif images from this AE
scene: https://drive.google.com/file/d/1T84PRjxq8eqHTxoyzsaFqBLzBU7p5NP9/view?usp=sharing

A Python file to generate .gif files from the .tifs, (After Effects 2018 has no native GIF generation) and upload them to a Google storage bucket that the dialog service and webapp will link to.

- React Static Page

The web app is a static page that is hosted on firebase and this project is built using a
popular starter template (Linked below), the commands above generate the static content and uploads it to
firebase.

### Dialog service

- Dialogflow

The dialog service uses Dialogflow:

https://console.dialogflow.com/api-client/#/agent/2e0fe896-f947-4f7f-a252-8da8889f316f

- Firebase Functions

Dialog flow will use webhooks that point to the firebase functions endpoints:

https://console.firebase.google.com/project/animixer-1d266/functions/list

These are contained in the functions folder which is the backend of this project. The
functions have their own dependancies and process input from dialog flow to return json
data to it for the chatbot to respond to input from the user.

This used the actions-on-google SDK.

## Firebase starter project

Built using the react firebase starter project: https://github.com/kriasoft/react-firebase-starter

# TODO:

Feedback after reviewing project:

generateGif / generateSound - python

- Use std libraries to handle OS separators
- Add docstrings
- Add arguments for command Linked

generateGif - animixer.jsx

- Break up into smaller files
- Bad naming change renderComp -> buildComp
- Break up functions so each does one thing

react app

- Write tests

functions

- Write tests
