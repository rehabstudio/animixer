/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */
import Artyom from 'artyom.js';
import React from 'react';
import styled from 'styled-components';
// Compiled with babel in node_modules for build process
import { ApiAiClient } from '.lib/api-ai-javascript';

import Animal from './Animal';
import Dictation from './Dictation';
import Speech from './Speech';

const ENTER_KEY_CODE = 13;

const Container = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
`;

const InputField = styled.div`
  border: 1px solid #587b14;
  border-radius: 34px;
  background-color: #ffffff;
  display: flex;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 2.5px;
  padding-bottom: 2.5px;
`;

const Input = styled.input`
  font-family: 'Nanum Gothic';
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const ScrollChat = styled.div`
  overflow-y: scroll;
  height: 100%;
`;

class ChatBox extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
    this.state = {
      client: new ApiAiClient({ accessToken: this.props.accessToken }),
      artyom: new Artyom(),
      speak: '',
      speaking: false,
      currentQuery: null,
      startChat: false
    };
    this.scrollUp = this.props.scrollUp || function() {};
  }

  componentDidMount() {
    this.inputField.addEventListener(
      'keydown',
      this.queryInputKeyDown.bind(this)
    );
  }

  componentWillUnmount() {
    this.inputField.removeEventListener(
      'keydown',
      this.queryInputKeyDown.bind(this)
    );
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.startChat !== this.props.startChat &&
      newProps.startChat &&
      !this.state.startChat
    ) {
      this.startChat();
    }
  }

  queryInputKeyDown(event) {
    if (event.which !== ENTER_KEY_CODE) {
      return;
    }

    let value = this.inputField.value;
    this.inputField.value = '';
    this.userInput(value);
  }

  userInput(value) {
    if (this.state.currentQuery) {
      this.updateNode(this.state.currentQuery, value);
    } else {
      this.createQueryNode(value);
    }
    this.setState({
      currentQuery: null,
      startChat: false
    });

    return this.getResponse(value);
  }

  sendText(text) {
    return this.state.client.textRequest(text);
  }

  getResponse(value) {
    let responseNode = this.createResponseNode();

    return this.sendText(value)
      .then(
        function(response) {
          let result;
          try {
            if (
              response.result.fulfillment.data !== undefined &&
              response.result.fulfillment.data.google.rich_response
            ) {
              result = response.result.fulfillment.data.google.rich_response;
            } else {
              result = response.result.fulfillment.speech;
            }
          } catch (error) {
            result = '';
          }
          this.setResponseOnNode(result, responseNode);
        }.bind(this)
      )
      .catch(
        function(err) {
          console.log(err);
          this.setResponseOnNode('Something went wrong', responseNode);
        }.bind(this)
      );
  }

  createQueryNode(query) {
    let node = document.createElement('div');
    node.className =
      'query clearfix left-align right white-text card-panel bring-front margins';
    node.innerHTML = query;
    this.resultDiv.appendChild(node);
    return node;
  }

  createResponseNode() {
    let node = document.createElement('div');
    node.className =
      'response clearfix left-align left card-panel text-darken-2 hoverable bring-front margins';
    node.innerHTML = '...';
    this.resultDiv.appendChild(node);
    this.updateScroll();
    return node;
  }

  updateNode(node, text) {
    node.innerHTML = text;
    if (this.state.currentQuery === node) {
      this.setState({ currentQuery: null });
    }
    return node;
  }

  addImage(imageData, node) {
    let imageNode = document.createElement('div');
    let image = document.createElement('img');
    let title = document.createElement('h3');

    imageNode.className += 'container';
    title.innerHTML = imageData.basic_card.title;
    image.className += 'image-size';
    image.src = imageData.basic_card.image.url;
    if (imageData.basic_card.image.accessibility_text) {
      image.alt = imageData.basic_card.image.accessibility_text;
    }
    image.addEventListener('load', this.updateScroll.bind(this));

    imageNode.appendChild(title);
    imageNode.appendChild(image);
    node.appendChild(imageNode);
  }

  addTextAudio(textData, node) {
    let speech =
      textData.simple_response.ssml || textData.simple_response.text_to_speech;
    let text = document.createElement('p');
    let audioDiv = document.createElement('div');
    let audio = document.createElement('audio');
    let source = document.createElement('source');
    let audioContent = /<audio(.*?)<\/audio>/g.exec(speech);
    let outputText = /<speak>(.*?)<\/speak>/g.exec(speech)[1];

    if (audioContent) {
      let audioSrc = /src="(.*?)"/g.exec(audioContent[1])[1];
      let audioExt = audioSrc.split('.').pop();
      audio.setAttribute('controls', '');
      audio.style.width = '100%';
      source.src = audioSrc;
      source.setAttribute('type', 'audio/' + audioExt);
      audioDiv.className = 'col s8 offset-m2';

      outputText = outputText.replace(audioContent[0], '');
    }

    text.innerHTML = outputText;

    audioDiv.appendChild(audio);
    audio.appendChild(source);
    node.appendChild(text);
    node.appendChild(audioDiv);

    this.setState({ speak: text.innerHTML });
  }

  setResponseOnNode(response, node) {
    if (typeof response === 'object') {
      node.innerHTML = '';

      for (let i = 0; i < response.items.length; i++) {
        let item = response.items[i];
        if (item.basic_card !== undefined) {
          this.addImage(item, node);
        } else if (item.simple_response !== undefined) {
          this.addTextAudio(item, node);
        }
      }
    } else {
      node.innerHTML = response ? response : '[empty response]';
      this.setState({ speak: response });
    }
    node.setAttribute('data-actual-response', response);
    this.updateScroll();
  }

  updateScroll() {
    this.scrollDiv.scrollTop = this.scrollDiv.scrollHeight;
  }

  awaitingInput() {
    if (!this.state.currentQuery) {
      let node = this.createQueryNode('...');
      this.setState({ currentQuery: node });
    }
  }

  disableDictation(disable) {
    this.setState({ speaking: disable });
  }

  startChat() {
    this.getResponse('hello');
    this.setState({
      startChat: true
    });
  }

  render() {
    return (
      <Container innerRef={ele => (this.chatDiv = ele)} className="container">
        <div className="row" onClick={this.scrollUp}>
          <img
            className="col s4 offset-s4"
            src="/static/img/icon-up.png"
            style={{ height: '50px' }}
          />
        </div>
        <div className="row" style={{ height: '70vh' }}>
          <ScrollChat
            className="col s12"
            innerRef={ele => (this.scrollDiv = ele)}
          >
            <div ref={ele => (this.resultDiv = ele)} id="result" />
          </ScrollChat>
        </div>
        <div className="row">
          <div className="col s12">
            <InputField>
              <div className="col l10 m8 s6">
                <Input
                  innerRef={ele => (this.inputField = ele)}
                  placeholder="Ask me something..."
                  id="q"
                  type="text"
                  style={{
                    marginBottom: '0px',
                    borderBottom: 'none'
                  }}
                />
              </div>
              <div
                className="col l2 m4 s6 valign-wrapper"
                style={{ paddingRight: '0px' }}
              >
                <div style={{ marginLeft: 'auto', marginRight: '5px' }}>
                  <Dictation
                    artyom={this.state.artyom}
                    userInput={this.userInput.bind(this)}
                    awaitingInput={this.awaitingInput.bind(this)}
                    disable={this.state.speaking}
                  />
                </div>
                <Speech
                  artyom={this.state.artyom}
                  text={this.state.speak}
                  speakingCallback={this.disableDictation.bind(this)}
                  enabled={true}
                />
              </div>
            </InputField>
          </div>
        </div>
      </Container>
    );
  }
}

export default ChatBox;
