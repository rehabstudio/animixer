# Animixer

A google assistant chat bot to combine animals to create new ones.

https://animixer.beta.rehab/

Setup:

```
$ make setup
```
Running:
```
$ make run
```
Deploying:
```
$ make deploy
```


## Overview

This project contains the following components

- Sound Generation

Python3 script that generates mixed animal sounds using Tensor Flow, Highly recommend
setting up GPU processing to reduce the time it takes to generate sound from 24hours ->
a few hours.

- Gif Generation

A .jsx AfterEffects script that will automate generation of .tif images from this AE
scene: https://drive.google.com/file/d/1T84PRjxq8eqHTxoyzsaFqBLzBU7p5NP9/view?usp=sharing

A python file to generate .gif files from the .tifs, (After Effects 2018 has no native gif generation) and upload them to a google storage bucket that the chatbot and webapp will
link to.

- React Static Page

The web app is a static page that is hosted on firebase and this project is built using a
popular starter template (Linked below), the commands above generate the static content and uploads it to
firebase.

### Chatbot

- Dialog Flow

The chatbot is setup on dialog flow:
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
