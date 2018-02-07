/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import Card from 'material-ui/Card';
import ChatBox from '../../components/App/ChatBox';

const Container = styled.div`
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0 auto;
`;

const Content = styled(Card)`
  padding: 1em 2em;
  margin: 2em 0;
`;

class Home extends React.Component<{}> {
  constructor(props) {
    super(props);
    let prodToken = '35806a855ec547b28ce01e07815569e4';
    let devToken = '1966938d12d44294989f5dae8ceae940';

    this.state = {
      accessToken: devToken
    };
  }

  render() {
    return (
      <Container>
        <Content>
          <ChatBox accessToken={this.state.accessToken} />
        </Content>
      </Container>
    );
  }
}

export default Home;
