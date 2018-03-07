import Artyom from 'artyom.js';
import React from 'react';
import styled from 'styled-components';
import utils from './../../utils';

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
    this.artyom = props.artyom || new Artyom();
    this.placeHolderText = 'Click to speak to safarimixer';
    this.userInput = props.userInput || function(text) {};
    this.awaitingInput = props.awaitingInput || function(text) {};

    let dictationConfig = {
      continuous: true, // Enable continuous if HTTPS connection
      onResult: this.onResult.bind(this),
      onStart: this.onStart.bind(this),
      onEnd: this.onEnd.bind(this)
    };

    if (this.artyom.Device.isMobile) {
      dictationConfig.onResult = this.onResultMobileWrapper.bind(this);
    }

    let dictation;
    if (this.artyom.Device.isChrome) {
      dictation = this.artyom.newDictation(dictationConfig);
    }

    this.state = {
      dictation: dictation,
      text: this.placeHolderText,
      recordOn: false,
      recording: false,
      recordPause: false,
      currentPhrase: '',
      recievingData: false
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.recordPause !== this.props.recordPause) {
      if (newProps.recordPause && this.state.recordOn) {
        this.stopDictation();
      } else if (!newProps.recordPause && this.state.recordOn) {
        this.setState({ recordPause: false }, this.startDictation.bind(this));
      } else if (newProps.recordPause) {
        this.setState({ recordPause: true });
      }
    }
  }

  componentWillUnmount() {
    if (this.state.recording) {
      this.stopDictation();
      // Will stop any callbacks from restarting after page changes
      this.setState({ recordPause: true });
    }
  }

  startDictation() {
    try {
      if (!this.state.recording && !this.state.recordPause) {
        this.state.dictation.start();
        this.setState({ recording: true });
      }
    } catch (e) {
      console.log(e);
    }
  }

  stopDictation() {
    if (this.state.recording) {
      this.state.dictation.stop();
      this.setState({ recording: false });
    }
  }

  toggleDictation() {
    if (this.state.recordOn) {
      this.icon.innerHTML = 'mic_off';
      this.stopDictation();
      this.setState({
        text: this.placeHolderText,
        recordOn: false
      });
    } else {
      this.icon.innerHTML = 'mic';
      this.startDictation();
      this.setState({
        recordOn: true
      });
    }
  }

  /**
   * There is a bug on artyom for mobile which sends duplicate
   * values this will wrap the onResult function on mobile and
   * stop duplicate values
   *
   * @param  {string} text     First text string from artyom
   * @param  {string} tempText Temporary text string from artyom not
   *                           normally used
   */
  onResultMobileWrapper(text, tempText) {
    if ((text || tempText) && !this.state.recievingData) {
      this.setState({
        recievingData: true
      });

      this.onResult(text, tempText);

      setTimeout(() => {
        this.setState({
          recievingData: false
        });
      }, 2000);
    }
  }

  onResult(text, tempText) {
    if (this.state.recording) {
      if (text) {
        // callback to let chatbox know we're receiving input
        this.awaitingInput();
        this.setState({ currentPhrase: text });
      } else if (tempText) {
        this.userInput(tempText);
        this.setState({
          text: tempText,
          currentPhrase: ''
        });
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
        className={utils.isChrome() ? 'valign-wrapper' : 'hidden'}
        onClick={this.toggleDictation.bind(this)}
      >
        <i
          className="center-align small material-icons"
          style={{ width: '100%' }}
          ref={ele => (this.icon = ele)}
        >
          mic_off
        </i>
      </MicIcon>
    );
  }
}

export default Dictation;
