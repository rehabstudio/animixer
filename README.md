# Safari Mixer

![image alt text](https://storage.googleapis.com/animixer-1d266.appspot.com/Docs/image_5.png)

## Overview

[Safari Mixer](https://safarimixer.beta.rehab/) is a Voice Experiment for the Google Assistant that lets you combine animals to create new ones. Built on [Actions on Google](https://developers.google.com/actions/), the platform that allows you to build Actions for the Google Assistant on Android phones, iPhones, voice-activated speakers like Google Home and other types of devices. It uses [Dialogflow](https://dialogflow.com/) to handle understanding what the player says, [Firebase Cloud Functions](https://firebase.google.com/docs/functions/) for backend code, and [Firebase Database](https://firebase.google.com/docs/database/) to save data. The project is written in JavaScript, using the Actions on Google [Node.js client library](https://developers.google.com/actions/nodejs-client-library-release-notes).

This repo contains a pre-built Dialogflow Agent you can import into your own project. It contains all the Intents and Entities for [Safari Mixer](https://safarimixer.beta.rehab/). This is all in the dialogflow_agent folder.

Everything in the functions folder is used in Firebase Cloud Functions, which hosts the webhook code for Dialogflow. The webhook handles all the response logic for [Safari Mixer](https://safarimixer.beta.rehab/). The bulk of the code is in the functions/actions/ folder.

[Safari Mixer](https://safarimixer.beta.rehab/) has a [React](https://reactjs.org/) web app that is hosted on Firebase Hosting as a static web app, this uses [React firebase starter](https://github.com/kriasoft/react-firebase-starter) boilerplate project which is great for setting up quick reliable websites on Firebase.

The web app is powered by an API which is also hosted on Firebase Cloud Functions the code for this can be found in the functions/api/ folder.

To generate the sounds [Python3](https://www.python.org/downloads/) is used with [TensorFlow](https://www.tensorflow.org/) and [Magenta](https://magenta.tensorflow.org/) to synthesize new sounds, this is detailed below and the code can be found in the generateSound folder.

To generate animal gifs Python3 is used to manage [AfterEffects CC 2018](https://www.adobe.com/uk/products/aftereffects.html) to render all combinations of animals, The generateGif folder contains the AfterEffects scene as well as AfterEffects scripts which are .jsx files, this is detailed below and the code can be found in the generateGif folder.

## Project Requirements

* A Firebase account

* npm & yarn installed

* Python3 installed

* AfterEffects CC 2018 installed

* ExtendScript Toolkit CC (AfterEffects scripting tool)

* (Optional) [A CUDA GPU](https://developer.nvidia.com/cuda-gpus) for faster sound generation

## Web and Firebase functions commands

Below are the commands to get the project up and running on Mac OS or Unix based OS using make commands.

Setup - Install Web javascript dependencies:

```
$ make setup
```
Setup Functions - Install Firebase functions dependencies:

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
Deploying - Build & Deploy web app to Firebase:

```
$ make deploy
```
Deploying Functions - Deploy functions to Firebase:

```
$ make deploy-functions
```

## Generate Gif commands

In the generateGif folder you can run the following commands:

Setup - Install Python3 and dependencies:

```
$ make setup
```

Running - Run generate_gifs.py:

```
$ make run
```

## Generate Sounds commands

In the generateSound folder we can run the following commands:

Setup - Install Python3 and dependencies for script and Jupyter:

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

### Importing the Dialogflow Agent

Go to the [Actions on Google developer console](https://actions-console.corp.google.com/), and create a new project.

Click "BUILD" on the Dialogflow card, and follow the flow to create a new Dialogflow agent.

When your agent is created, click on the gear icon to get to the "Export and Import" tab. You can then compress the dialogflow_agent folder from this repo into a zip file, and then import it. You should then see all of Safari Mixer’s Intents and Entities in your project.

[Here](https://dialogflow.com/docs/getting-started/basics) is some more info about how Dialogflow works in general.

### Setting up the webhook

run `make setup` above.

Select "functions" and optionally “database” if you’d also like to save the questions and responses. Select your Google Project ID as your default project. (This can be found in your Dialogflow agent settings).

Get your webhook URL and put it in Dialogflow

Once you’ve successfully deployed your webhook, your terminal should give you a url called "Function URL." In Dialogflow, click the “Fulfillment” tab and toggle the “Enable” switch for the webhook. Paste that url into the text field.

You can read more documentation about using Firebase Cloud Functions for Dialogflow fulfillment [here](https://dialogflow.com/docs/how-tos/getting-started-fulfillment).

### Testing your Action

You should now be able to test your Action in the Dialogflow test console. You can also go to Dialogflow’s Integration tab, and try it on the Actions on Google simulator, where you can also hear it on a Google Home or Assistant device.

### Playing with response logic

The bulk of the response logic is in `index.js` with some custom classes in the module folder. You can read the docs about the Actions on Google Node SDK, which is called in with `const App = require("actions-on-google").DialogflowApp;`

The Actions library’s built in app.data object is very useful for storing data within a session.

### Saving queries and responses to a Firebase Database

The repo contains a module called `config.js` in functions which contains all the account information for interacting with Firebase real time database. This will need to be updated to your account credentials. This allows you to save info about which animals are discovered to a Firebase Database.

## Authentication

For deploying the website, sounds and gifs for this project we require a service private key generated from:

[https://console.cloud.google.com/apis/credentials?project=<your_project_id>](https://console.cloud.google.com/apis/credentials?project=animixer-1d266)

save the key at the root of this project with the name: animixer-pk.json

The Makefiles in generateGif and generateSound setup env vars required which will need to be updated to point at the location of this file on your machine.

## Sound Generation

### Jupyter Experimentation

In order to make new sounds we can experiment in a jupyter notebook, to start-up the notebook navigate to the generateSound folder we will need to install the jupyter, Tensorflow and Magenta libraries which is done by running:

`$ make setup`

And to start the notebook run:

`$ make jupyter`

This should start the notebook at: [http://localhost:8888/notebooks/NSynth.ipynb](http://localhost:8888/notebooks/NSynth.ipynb)

![image alt text](https://storage.googleapis.com/animixer-1d266.appspot.com/Docs/image_0.png)

In this notebook are full explanation of how to generate and merge sounds using TensorFlow and Magenta.

### Generating sounds

To generate sounds simply run in the generateSounds folder:

`$ make run`

By default this will start the process of sampling the audio input files and will start to generate new sounds. This will use CPU processing by default which is very slow we highly recommend setting up GPU processing to reduce the time it takes to generate sounds from 24 hours to a few hours. This process can be setup here for [Windows](https://www.tensorflow.org/install/install_windows), [Mac](https://www.tensorflow.org/install/install_mac) and for [Ubuntu](https://www.tensorflow.org/install/install_linux), although the support Mac is limited so I’d recommend setting up on a Windows or Ubuntu machine.

## GIF Generation

To install Python dependencies to manage AfterEffects navigate to the generateGif folder and run:

`$ make setup`

To start the process of generating GIFs in the terminal run:

`$ make run`

![image alt text](https://storage.googleapis.com/animixer-1d266.appspot.com/Docs/image_1.png)

This will start a Python process that will batch create animations starting and stopping AfterEffects.

A .jsx AfterEffects script that will automate generation of .png images from the AE saved scene in generateGif/ae_project. The location of where these files will be saved will need to be updated in generateGif/generate_gifs.py by the Global variable ROOT_DIR.

A Python file will start an After Effects process to generate the .gifs from the .png files, (After Effects 2018 has no native gif generation) and upload them to a google storage bucket that the Assistant app and webapp will link to.

## Creating new animals

![image alt text](https://storage.googleapis.com/animixer-1d266.appspot.com/Docs/image_2.png)

Animals are created in components, head, body, tail and legs these are given suffixes to identify them by the .jsx script e.g.

giraffe_head

giraffe_body

giraffe_legs

giraffe_tail

The components are combined into a composition called "animalName_walk", e.g.

giraffe_walk.

The script will build new animals importing components into new compositions then using markers attached to the animal body to place the head and legs in the correct place. Markers are just custom crosses  to make it easy to see and hide them during rendering, markers are prefixed with "x_" e.g.

"x_giraffe_head"

![image alt text](https://storage.googleapis.com/animixer-1d266.appspot.com/Docs/image_3.png)

The script will run and it takes hours to generate all 24,000 animals but this will be managed by the Python3 generate_gif.py script whick will create them in batches and restart creation of a batch if it fails.

### **Action**

The Action is setup on Dialogflow, we have a simple chat flow, the conversation goes:

Intent flow:

Welcome -> AnimalHead -> AnimalBody -> AnimalLegs (show animal)

or

Welcome -> Animals (show animal)

We also have unknown intent using a webhook which will re-enter the conversation once we have a valid animal.

Welcome -> AnimalHead -> Unknown -> AnimalBody

There is the ability to change an animal body part we can do this mod flow or once an animal has been created.

Welcome -> AnimalHead -> ChangeHead -> AnimalBody

AnimalLegs (show animal) -> ChangeHead -> AnimalLegs (show animal)

This flow is controlled by the setting of context variables either in the webhook or in Dialogflow, we use the context "StartAnimal" when we expect our first animal. Once the first animal has been retrieved we remove that context by setting it’s lifespan to 0 and set a new context “HeadComplete”. These context variables stop us repeating ourselves and continue from the correct point if the user enters invalid input.

![image alt text](https://storage.googleapis.com/animixer-1d266.appspot.com/Docs/image_4.png)

dev account: [https://console.dialogflow.com/api-client/#/agent/1bad0b7f-624b-4d96-8b39-68cdbe11cd9f/intents](https://console.dialogflow.com/api-client/#/agent/1bad0b7f-624b-4d96-8b39-68cdbe11cd9f/intents)

prod account: [https://console.dialogflow.com/api-client/#/agent/2e0fe896-f947-4f7f-a252-8da8889f316f](https://console.dialogflow.com/api-client/#/agent/2e0fe896-f947-4f7f-a252-8da8889f316f)

## Firebase Functions

Dialogflow will use webhooks that point to the Firebase functions endpoints:

[https://console.firebase.google.com/project/animixer-1d266/functions/list](https://console.firebase.google.com/project/animixer-1d266/functions/list)

These are contained in the functions folder which is the backend of this project. The functions have their own dependencies and process input from Dialogflow to return json data to it for the Assistant app to respond to input from the user.

This has used the actions-on-google SDK.

### Account setup

To setup Firebase functions with your account, you will need to update the config file in functions/config.js. Your account will then be used to deploy the app to your Firebase functions / hosting and to access your realtime database.

Your API key can be found at:

https://console.firebase.google.com/project/<your-project-id>/settings/general/

messagingSenderId can be found at:

[https://console.firebase.google.com/project/](https://console.firebase.google.com/project/)<your-project-id>/settings/cloudmessaging/

For the rest replace "animixer-1d266" with <your-project-id>
