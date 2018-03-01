# Animixer

A google assistant chat bot to combine animals to create new ones.

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

- Gif Generation

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

# TODO:

Feedback after reviewing project:

generateGif / generateSound - python

- Use std libraries to handle OS separators
- Add docstrings
- Add arguments for generate scripts

generateGif - animixer.jsx

- Break up into smaller files
- Bad naming change renderComp -> buildComp
- Break up functions so each does one thing

react app

- Write tests

functions

- Write tests
