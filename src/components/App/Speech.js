import Artyom from 'artyom.js';
import React from 'react';
import AsyncWorkQueue from 'async-work-queue';
import styled from 'styled-components';

const iconSize = '45px';

const SpeakerIcon = styled.div`
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

class Speech extends React.Component<{}> {
  constructor(props) {
    super(props);

    if (!props.artyom) {
      throw new Error('Expecting Artyom instance in props');
    }
    let state = {
      enabled: false
    };
    if (this.props.enabled) {
      state.enabled = true;
    }

    this.artyom = props.artyom || new Artyom();
    this.speakingCallback = props.speakingCallback || function(text) {};
    this.state = state;
    this.queue = new AsyncWorkQueue(this.speechWorker.bind(this));
  }

  /**
   * Emulates google assistant so we can pass stream of input data to component
   * Will play then 1 at a time in order
   * @param  {string} text    text or audio string
   * @param  {function} resolve complete callback function
   */
  speechWorker(text, resolve) {
    let config = {
      onStart: () => {
        this.speakingCallback(true);
      },
      onEnd: () => {
        this.speakingCallback(false);
        resolve();
      }
    };
    let audioData = /src="(.*?)"/g.exec(text);
    if (audioData) {
      this.playAudio(audioData[1], config);
    } else {
      this.artyom.say(text, config);
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.text && newProps.text !== this.props.text) {
      this.speak(newProps.text);
    }
    if (newProps.enabled && newProps.enabled !== this.props.enabled) {
      this.toggleSpeech(newProps.enabled);
    }
  }

  componentDidMount() {
    if (this.state.enabled) {
      this.icon.innerHTML = 'volume_up';
    }
  }

  speak(text) {
    if (!this.state.enabled) {
      return;
    }

    let ssmlData = /<speak>(.*?)<\/speak>/g.exec(text);
    if (ssmlData) {
      let outputFiles = [];
      let ssmlText = ssmlData[1];
      let audioData = /(<audio.*?<\/audio>)/g.exec(ssmlText);
      if (audioData) {
        // Create list of audio outputs
        for (let i = 1; i < audioData.length; i++) {
          let texts = ssmlText.split(audioData[i]);
          outputFiles.push(texts[0]);
          outputFiles.push(audioData[i]);
          if (texts[1] && i == audioData.length - 1) {
            outputFiles.push(texts[1]);
          }
        }
      } else {
        outputFiles.push(ssmlText);
      }
      for (let i = 0; i < outputFiles.length; i++) {
        this.queue.push(outputFiles[i]);
      }
    } else {
      this.queue.push(text);
    }
  }

  playAudio(audioSrc, config) {
    this.audio.src = audioSrc;
    this.audio.onended = config.onEnd;
    if (config.onStart) {
      config.onStart();
    }
    this.audio.play();
  }

  toggleSpeech() {
    if (this.state.enabled) {
      this.icon.innerHTML = 'volume_mute';
      this.setState({ enabled: false });
    } else {
      this.icon.innerHTML = 'volume_up';
      this.setState({ enabled: true });
    }
  }

  render() {
    return (
      <SpeakerIcon
        className="valign-wrapper"
        onClick={this.toggleSpeech.bind(this)}
      >
        <audio ref={ele => (this.audio = ele)} controls className="hidden" />
        <i
          className="center-align small material-icons"
          style={{ width: '100%' }}
          ref={ele => (this.icon = ele)}
        >
          volume_mute
        </i>
      </SpeakerIcon>
    );
  }
}

export default Speech;
