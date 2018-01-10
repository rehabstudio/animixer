/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import {ApiAiClient} from "api-ai-javascript";

const ENTER_KEY_CODE = 13;

const Container = styled.div`
  height: calc(100vh - 250px);
  height: -o-calc(100vh - 250px); /* opera */
  height: -webkit-calc(100vh - 250px); /* google, safari */
  height: -moz-calc(100vh - 250px); /* firefox */
  overflow-y: auto;
`;

class ChatBox extends React.Component<{}, {}> {

  constructor(props) {
    super(props);
    this.state = {
      client: new ApiAiClient({accessToken: this.props.accessToken})
    };
  }

  componentDidMount() {
    this.inputField.addEventListener("keydown", this.queryInputKeyDown.bind(this));
  }

  componentWillUnmount() {
    this.inputField.removeEventListener("keydown", this.queryInputKeyDown.bind(this));
  }

  queryInputKeyDown(event) {
    if (event.which !== ENTER_KEY_CODE) {
      return;
    }

    let value = this.inputField.value;
    this.inputField.value = "";

    this.createQueryNode(value);
    let responseNode = this.createResponseNode();

    this.sendText(value)
      .then(function(response) {
        let result;
        try {
          result = response.result.fulfillment.speech
        } catch(error) {
          result = "";
        }
        this.setResponseOnNode(result, responseNode);
      }.bind(this))
      .catch(function(err) {
        console.log(err);
        this.setResponseOnNode("Something goes wrong", responseNode);
      }.bind(this));
  }

  sendText(text) {
    return this.state.client.textRequest(text);
  }

  createQueryNode(query) {
    let node = document.createElement('div');
    node.className = "clearfix left-align left card-panel green accent-1";
    node.innerHTML = query;
    this.resultDiv.appendChild(node);
  }

  createResponseNode() {
    let node = document.createElement('div');
    node.className = "clearfix right-align right card-panel blue-text text-darken-2 hoverable";
    node.innerHTML = "...";
    this.resultDiv.appendChild(node);
    this.updateScroll();
    return node;
  }

  setResponseOnNode(response, node) {
    node.innerHTML = response ? response : "[empty response]";
    node.setAttribute('data-actual-response', response);
  }

  updateScroll(){
    this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
  }

  render() {
    return (
      <Container innerRef={(ele) => this.chatDiv = ele} className="container">
          <div id="placeholder">
              <h5>Say "hello" to talk to animxier</h5>
          </div>
          <div id="main-wrapper">
              <div className="row">
                  <div className="col s12">
                      <div ref={(ele) => this.resultDiv = ele} id="result">
                      </div>
                      <div className="input-field">
                          <input ref={(ele) => this.inputField = ele} placeholder="Hey, ask me something..." id="q" type="text" />
                      </div>
                  </div>
              </div>
          </div>
      </Container>
    );
  }
}

export default ChatBox;
