/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';

class ChatBox extends React.Component<{}, {}> {

  constructor(props) {
    super(props);
    this.state = {
      client = new ApiAi.ApiAiClient({accessToken: this.props.accessToken});
    };
  }

  render() {
    return (
      <div class="container">
          <div class="row">
              <div class="input-field col s10">
                  <input id="access_token" type="text" />
                  <label for="access_token">Access token</label>
              </div>
              <div class="col s2 input-field">
                  <a class="waves-effect waves-light btn" id="set_access_token">Set</a>
              </div>
          </div>
          <div id="placeholder">
              <h5>Please, fill access token before start</h5>
          </div>
          <div id="main-wrapper">
              <div class="row">
                  <div class="col s10">
                      <div id="result">
                      </div>
                      <div class="input-field">
                          <input placeholder="Hey, ask me something..." id="q" type="text" />
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
  }
}

export default ChatBox;
