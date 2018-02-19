/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */
import Artyom from 'artyom.js';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
// Compiled with babel in node_modules for build process
import { ApiAiClient } from '.lib/api-ai-javascript';

import Animal from './Animal';
import Dictation from './Dictation';
import Speech from './Speech';

const ENTER_KEY_CODE = 13;
const Host = 'https://animixer.beta.rehab';

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

  @media (max-width: 992px) {
    height: calc(100% - 100px);
  }

  @media (max-width: 600px) {
    height: calc(100% - 40px);
  }
`;

const Chevron = styled.div`
  @media (max-width: 992px) {
    visibility: hidden;
  }
`;

const InputContainer = styled.div`
  position: relative;

  @media (max-width: 992px) {
    bottom: 100px;
  }

  @media (max-width: 600px) {
    position: absolute;
    bottom: 20px;
    left: 0.75rem;
    right: 0.75rem;
    margin: 10px;
  }
`;

const ChatBoxContainer = styled.div`
  height: 70vh;

  @media (max-width: 992px) {
    margin-bottom: 0px;
    height: calc(100vh - 130px);
  }
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
      startChat: false,
      audioUrl: null
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
    } else if (
      newProps.startChat !== this.props.startChat &&
      !newProps.startChat &&
      this.state.startChat
    ) {
      this.stopChat();
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
    console.log('User input:', value);
    if (this.state.currentQuery) {
      this.updateNode(this.state.currentQuery, value);
    } else {
      this.createQueryNode(value);
    }
    this.setState({
      currentQuery: null
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

  addAnimal(cardData, node) {
    let shareUrl;
    let animalUrl;
    if (cardData.basic_card.buttons.length > 0) {
      shareUrl = cardData.basic_card.buttons[0].open_url_action.url;
      animalUrl = shareUrl.replace(Host, '');
    }
    let animalNode = document.createElement('div');
    let animalData = {
      animalName: cardData.basic_card.title,
      imageUrl: cardData.basic_card.image.url,
      audioUrl: this.state.audioUrl,
      shareUrl: shareUrl,
      animalUrl: animalUrl
    };
    node.appendChild(animalNode);
    ReactDOM.render(
      <Animal
        shareEnabled={true}
        titleEnabled={true}
        animalData={animalData}
        onLoad={this.updateScroll.bind(this)}
      />,
      animalNode
    );
  }

  addTextAudio(textData, node) {
    let speech =
      textData.simple_response.ssml || textData.simple_response.text_to_speech;
    let text = document.createElement('p');
    let audioContent = /<audio(.*?)<\/audio>/g.exec(speech);
    let outputText = /<speak>(.*?)<\/speak>/g.exec(speech)[1];

    if (audioContent) {
      let audioSrc = /src="(.*?)"/g.exec(audioContent[1])[1];
      outputText = outputText.replace(audioContent[0], '');
      this.setState({ audioUrl: audioSrc });
    }

    text.innerHTML = outputText;
    node.appendChild(text);

    this.setState({ speak: text.innerHTML });
  }

  setResponseOnNode(response, node) {
    if (typeof response === 'object') {
      node.innerHTML = '';

      for (let i = 0; i < response.items.length; i++) {
        let item = response.items[i];
        if (item.basic_card !== undefined) {
          this.addAnimal(item, node);
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
    if (this.scrollDiv) {
      this.scrollDiv.scrollTop = this.scrollDiv.scrollHeight;
    }
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

  stopChat() {
    this.setState({
      startChat: false
    });
    setTimeout(() => {
      this.resultDiv.innerHTML = '';
    }, 500);
  }

  render() {
    return (
      <Container
        innerRef={ele => (this.chatDiv = ele)}
        className={
          this.state.startChat ? 'container fadein' : 'container fadeout'
        }
      >
        <div className="row" onClick={this.scrollUp}>
          <Chevron className="col s4 offset-s4" style={{ height: '50px' }} />
        </div>
        <ChatBoxContainer className="row">
          <ScrollChat
            className="col s12"
            innerRef={ele => (this.scrollDiv = ele)}
          >
            <div ref={ele => (this.resultDiv = ele)} id="result" />
          </ScrollChat>
        </ChatBoxContainer>
        <InputContainer className="row">
          <div className="col s12">
            <InputField>
              <div style={{ width: '100%' }}>
                <Input
                  innerRef={ele => (this.inputField = ele)}
                  placeholder="Ask me something..."
                  id="q"
                  type="text"
                  style={{
                    marginBottom: '0px',
                    borderBottom: 'none',
                    marginLeft: '5px'
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
                    recordPause={this.state.speaking}
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
        </InputContainer>
      </Container>
    );
  }
}

export default ChatBox;
