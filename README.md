# Safari Mixer

Safari Mixer is a Voice Experiment for Google Assistant that lets you combine animals to create new ones.

https://safarimixer.beta.rehab/

## Web and Firebase functions commands

Setup - Install Web javascript dependancies:

```
$ make setup
```
Setup Functions - Install Firebase functions dependancies:

```
$ make setup-functions
```
Running - Run react scripts to build static website on file changes:

```
$ make run
```
Running Functions - Run function emulator locally:

```
$ make run-functions
```
Deploying - Build & Deploy web app to firebase:

```
$ make deploy
```
Deploying Functions - Deploy functions to firebase:

```
$ make deploy-functions
```

## Generate Gif commands

In the generateGif folder we can run the following commands:

Setup - Install python3 and dependancies:

```
$ make setup
```

Running - Run generate_gifs.py:

```
$ make run
```

## Generate Sounds commands

In the generateSound folder we can run the following commands:

Setup - Install python3 and dependancies for script and Jupyter:

```
$ make setup
```

Running - Run generate_gifs.py:

```
$ make run
```

Jupyter - Start local Jupyter server to experiment and test changes

```
$ make jupyter
```

## Technology

Safari Mixer is built on [Actions on Google](https://developers.google.com/actions/), the platform that allows you to make things for the Google Assistant and the Google Home. It uses [Dialogflow](https://dialogflow.com/) to handle understanding what the player says, [Firebase Cloud Functions](https://firebase.google.com/docs/functions/) for backend code, and [Firebase Database](https://firebase.google.com/docs/database/) to save data. The project is written in JavaScript, using Actions on Google’s [Node.js client library](https://developers.google.com/actions/nodejs-client-library-release-notes).

This repo contains a pre-built Dialogflow Agent you can import into your own project. It contains all the Intents and Entities for Mystery Animal. This is all in the `dialogflow_agent` folder.

Everything in the `functions` folder is used in Firebase Cloud Functions, which hosts the webhook code for Dialogflow. The webhook handles all the response logic for Mystery Animal. The bulk of the code is in `index.js`.

### Importing the Dialogflow Agent

Go to the [Actions on Google developer console](https://actions-console.corp.google.com/), and create a new project.

Click “BUILD” on the Dialogflow card, and follow the flow to create a new Dialogflow agent.

When your agent is created, click on the gear icon to get to the “Export and Import” tab. You can then compress the `dialogflow_agent` folder from this repo into a zip file, and then import it. You should then see all of Mystery Animal’s Intents and Entities in your project.

[Here](https://dialogflow.com/docs/getting-started/basics)’s some more info about how Dialogflow works in general.

### Setting up the webhook

run `make setup` above.

Select “functions” and optionally “database” if you’d also like to save the questions and responses.
Select your Google Project ID as your default project. (This can be found in your Dialogflow agent settings.)

**Get your webhook URL and put it in Dialogflow**

Once you’ve successfully deployed your webhook, your terminal should give you a url called “Function URL.” In Dialogflow, click the “Fulfillment” tab and toggle the “Enable” switch for the webhook. Paste that url into the text field.

**You can read more documentation about using Firebase Cloud Functions for Dialogflow fulfillment [here](https://dialogflow.com/docs/how-tos/getting-started-fulfillment).**

### Testing your app

You should now be able to test your app in the Dialogflow test console. You can also go to Dialogflow’s Integration tab, and try it on the Actions on Google simulator, where you can also hear it on a Google Home or Assistant device.

### Playing with response logic

The bulk of the response logic is in `index.js` with some custom classes in the `module` folder. You can read the docs about the Actions on Google Node SDK, which is called in with `const App = require("actions-on-google").DialogflowApp;`

The Actions library’s built in `app.data` object is very useful for storing data within a session.

### Saving queries and responses to a Firebase Database

The repo contains a module called `config.js` in functions which contains all the account information for interacting with firebase real time database. This will need to be updated to your account credentials. This allows you to save info about which animals are discovered to a Firebase Database.

## Authentication

For deploying the website, sounds and gifs for this project we require a service private key generated from:
https://console.cloud.google.com/apis/credentials?project=animixer-1d266

save the key at the root of this project with the name:
animixer-pk.json

The Makefiles in generateGif and generateSound have commands with the env vars required which will need to be updated to point at the location of this file.


## Overview

This project contains the following components

- Sound Generation

Python3 script that generates mixed animal sounds using Tensor Flow, Highly recommend
setting up GPU processing to reduce the time it takes to generate sound from 24hours ->
a few hours.

- GIF Generation

A .jsx AfterEffects script that will automate generation of .tif images from the AE saved in generateGif/ae_project.

A python file will start an After Effects process to generate the .tifs using the .jsx script and scene mentioned above. The python script will generate .gif files from the .tifs, (After Effects 2018 has no native gif generation) and upload them to a google storage bucket that the chatbot and webapp will
link to.

This script was run on windows but the code to run on Mac is also there, paths will need to be updated in the .jsx file for this script to run on mac.

- React Static Page

The web app is a static page that is hosted on firebase and this project is built using a
popular starter template (Linked below), the commands above generate the static content and uploads it to
firebase.

### Chatbot

- Dialog Flow

The chatbot is setup on dialog flow, we have a simple chat flow, the conversation goes:

Intent flow:

Welcome -> AnimalHead -> AnimalBody -> AnimalLegs (show animal)

or

Welcome -> Animals (show animal)

We also have unknown intent using a webhook which will re-enter the conversation once we have a valid animal.

Welcome -> AnimalHead -> Unknown -> AnimalBody

There is the ability to change an animal body part we can do this mod flow or once an animal has been created.

Welcome -> AnimalHead -> ChangeHead -> AnimalBody

AnimalLegs (show animal) -> ChangeHead -> AnimalLegs (show animal)

dev account:
https://console.dialogflow.com/api-client/#/agent/1bad0b7f-624b-4d96-8b39-68cdbe11cd9f/intents

prod account:
https://console.dialogflow.com/api-client/#/agent/2e0fe896-f947-4f7f-a252-8da8889f316f

- Firebase Functions

Dialog flow will use webhooks that point to the firebase functions endpoints:

https://console.firebase.google.com/project/animixer-1d266/functions/list

These are contained in the functions folder which is the backend of this project. The
functions have their own dependancies and process input from dialog flow to return json
data to it for the chatbot to respond to input from the user.

This has used the actions-on-google SDK.

## Firebase starter project

Built using the react firebase starter project: https://github.com/kriasoft/react-firebase-starter
