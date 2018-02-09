/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import Artyom from 'artyom.js';
import React from 'react';
import styled from 'styled-components';

const MicIcon = styled.div`
  background-color: #fff;
  border: 4px solid black;
  height: 75px;
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  width: 75px;
  cursor: pointer;
`;

class Dictation extends React.Component<{}> {
  constructor(props) {
    super(props);
    const dictationConfig = {
      continuous: true, // Enable continuous if HTTPS connection
      onResult: this.onResult.bind(this),
      onStart: this.onStart.bind(this),
      onEnd: this.onEnd.bind(this)
    };
    this.artyom = new Artyom();
    this.placeHolderText = 'Click to speak to animixer';
    this.callback = props.callback || function(text) {};
    this.state = {
      dictation: this.artyom.newDictation(dictationConfig),
      text: this.placeHolderText,
      recording: false,
      currentPhrase: ''
    };
  }

  startDictation() {
    this.state.dictation.start();
  }

  stopDictation() {
    this.state.dictation.stop();
  }

  toggleDictation() {
    if (this.state.recording) {
      this.icon.innerHTML = 'mic';
      this.stopDictation();
      this.setState({
        recording: false,
        text: this.placeHolderText
      });
    } else {
      this.icon.innerHTML = 'mic_off';
      this.startDictation();
      this.setState({ recording: true });
    }
  }

  onResult(text) {
    if (this.state.recording) {
      if (text) {
        this.setState({ currentPhrase: text });
      } else {
        let phrase = this.state.currentPhrase;
        this.callback(phrase);
        this.setState({
          text: phrase,
          currentPhrase: ''
        });
      }
    }
  }

  onStart() {
    console.log('Dictation started by the user');
  }

  onEnd() {
    console.log('Dictation stopped by the user');
  }

  render() {
    return (
      <div className="row">
        <div className="col s2 offset-s4">
          <MicIcon
            className="valign-wrapper"
            onClick={this.toggleDictation.bind(this)}
          >
            <i
              className="center-align medium material-icons"
              style={{ width: '100%' }}
              ref={ele => (this.icon = ele)}
            >
              mic
            </i>
          </MicIcon>
        </div>
        <div className="col s4">
          <p>{this.state.text}</p>
        </div>
      </div>
    );
  }
}

export default Dictation;
