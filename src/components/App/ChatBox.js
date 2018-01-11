/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
// Compiled with babel in node_modules for build process
import { ApiAiClient } from '.lib/api-ai-javascript';

const ENTER_KEY_CODE = 13;

const Container = styled.div`
  height: calc(100vh - 225px);
  height: -o-calc(100vh - 225px); /* opera */
  height: -webkit-calc(100vh - 225px); /* google, safari */
  height: -moz-calc(100vh - 225px); /* firefox */
  overflow-y: auto;
`;

class ChatBox extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
    this.state = {
      client: new ApiAiClient({ accessToken: this.props.accessToken }),
    };
  }

  componentDidMount() {
    this.inputField.addEventListener(
      'keydown',
      this.queryInputKeyDown.bind(this),
    );
  }

  componentWillUnmount() {
    this.inputField.removeEventListener(
      'keydown',
      this.queryInputKeyDown.bind(this),
    );
  }

  queryInputKeyDown(event) {
    if (event.which !== ENTER_KEY_CODE) {
      return;
    }

    let value = this.inputField.value;
    this.inputField.value = '';

    this.createQueryNode(value);
    let responseNode = this.createResponseNode();

    this.sendText(value)
      .then(
        function(response) {
          let result;
          try {
            if (response.result.fulfillment.data !== undefined) {
              result = response.result.fulfillment.data.google.rich_response;
            } else {
              result = response.result.fulfillment.speech;
            }
          } catch (error) {
            result = '';
          }
          this.setResponseOnNode(result, responseNode);
        }.bind(this),
      )
      .catch(
        function(err) {
          console.log(err);
          this.setResponseOnNode('Something goes wrong', responseNode);
        }.bind(this),
      );
  }

  sendText(text) {
    return this.state.client.textRequest(text);
  }

  createQueryNode(query) {
    let node = document.createElement('div');
    node.className =
      'clearfix left-align left card-panel green accent-1 bring-front';
    node.innerHTML = query;
    this.resultDiv.appendChild(node);
  }

  createResponseNode() {
    let node = document.createElement('div');
    node.className =
      'clearfix right-align right card-panel blue-text text-darken-2 hoverable bring-front';
    node.innerHTML = '...';
    this.resultDiv.appendChild(node);
    this.updateScroll();
    return node;
  }

  addImage(imageData, node) {
    let imageNode = document.createElement('div');
    let image = document.createElement('img');
    let title = document.createElement('h3');

    imageNode.className += 'container';
    title.innerHTML = imageData.basic_card.title;
    image.src = imageData.basic_card.image.url;
    image.alt = imageData.basic_card.accessibility_text;

    imageNode.appendChild(title);
    imageNode.appendChild(image);
    node.appendChild(imageNode);
  }

  addTextAudio(textData, node) {
    let speech = textData.simple_response.ssml;
    let text = document.createElement('p');
    let audio = document.createElement('audio');
    let source = document.createElement('source');
    let audioContent = /<audio(.*?)<\/audio>/g.exec(speech)[1];
    let audioSrc = /src="(.*?)"/g.exec(audioContent)[1];
    let audioExt = audioSrc.split('.').pop();

    audio.setAttribute('controls', '');
    source.src = audioSrc;
    source.setAttribute('type', 'audio/' + audioExt);
    text.innerHTML = /<speak>(.*?)<\/speak>/g
      .exec(speech)[1]
      .replace(audio, '');

    audio.appendChild(source);
    node.appendChild(text);
    node.appendChild(audio);
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
    }
    node.setAttribute('data-actual-response', response);
  }

  updateScroll() {
    this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
  }

  render() {
    return (
      <Container innerRef={ele => (this.chatDiv = ele)} className="container">
        <div id="placeholder">
          <h5>Say "hello" to talk to animxier</h5>
        </div>
        <div id="main-wrapper">
          <div className="row">
            <div className="col s12">
              <div ref={ele => (this.resultDiv = ele)} id="result" />
              <div className="input-field">
                <input
                  ref={ele => (this.inputField = ele)}
                  placeholder="Hey, ask me something..."
                  id="q"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }
}

export default ChatBox;
