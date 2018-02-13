import Artyom from 'artyom.js';
import React from 'react';
import styled from 'styled-components';

const iconSize = '45px';

const MicIcon = styled.div`
  background-color: #587b14;
  color: #ecf2dc;
  height: ${iconSize};
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  width: ${iconSize};
  cursor: pointer;
  flex-shrink: 0;
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

    this.artyom = props.artyom || new Artyom();
    this.placeHolderText = 'Click to speak to animixer';
    this.userInput = props.userInput || function(text) {};
    this.awaitingInput = props.awaitingInput || function(text) {};
    this.state = {
      dictation: this.artyom.newDictation(dictationConfig),
      text: this.placeHolderText,
      recording: false,
      currentPhrase: ''
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.disable !== this.props.disable) {
      if (newProps.disable && this.state.recording) {
        this.stopDictation();
      } else if (!newProps.disable && this.state.recording) {
        this.startDictation();
      }
    }
  }

  componentWillUnmount() {
    if (this.state.recording) {
      this.state.dictation.stop();
    }
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
        // callback to let chatbox know we're receiving input
        this.awaitingInput();
        this.setState({ currentPhrase: text });
      } else {
        // Once a user stops talking we send text
        let phrase = this.state.currentPhrase;
        this.userInput(phrase);
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
      <MicIcon
        className="valign-wrapper"
        onClick={this.toggleDictation.bind(this)}
      >
        <i
          className="center-align small material-icons"
          style={{ width: '100%' }}
          ref={ele => (this.icon = ele)}
        >
          mic
        </i>
      </MicIcon>
    );
  }
}

export default Dictation;
