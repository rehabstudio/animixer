/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import Card from 'material-ui/Card';
import Welcome from '../../components/App/Welcome';
import ChatBox from '../../components/App/ChatBox';

const ScrollDiv = styled.div`
  position: relative;
  bottom: 0vh;
`;

const Container = styled.div`
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0 auto;
`;

const Content = styled(Card)`
  padding: 1em 2em;
  margin: 2em 0;
`;

const token = window.location.href.startsWith('http://localhost')
  ? '1966938d12d44294989f5dae8ceae940' // local
  : '35806a855ec547b28ce01e07815569e4'; // prod

class Home extends React.Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: token,
      startChat: false
    };
  }

  clearAnimation() {
    this.scrollDiv.className = this.scrollDiv.className.replace(
      'scrollDown',
      ''
    );
    this.scrollDiv.className = this.scrollDiv.className.replace('scrollUp', '');
  }

  goToWelcome() {
    this.clearAnimation();
    this.scrollDiv.className += ' scrollDown';
    this.setState({
      startChat: false
    });
  }

  goToChat() {
    this.clearAnimation();
    this.scrollDiv.className += ' scrollUp';
    this.setState({
      startChat: true
    });
  }

  render() {
    return (
      <ScrollDiv innerRef={ele => (this.scrollDiv = ele)}>
        <Welcome scrollDown={this.goToChat.bind(this)} />
        <Container>
          <ChatBox
            startChat={this.state.startChat}
            scrollUp={this.goToWelcome.bind(this)}
            accessToken={this.state.accessToken}
          />
        </Container>
      </ScrollDiv>
    );
  }
}

export default Home;
