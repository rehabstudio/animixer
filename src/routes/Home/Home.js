/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import Card from 'material-ui/Card';
import Typography from 'material-ui/Typography';
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
  render() {
    return (
      <Container>
        <Content>
          <Typography type="headline" gutterBottom>
            <strong>Animixer</strong>
          </Typography>
          <ChatBox accessToken="35806a855ec547b28ce01e07815569e4" />
        </Content>
      </Container>
    );
  }
}

export default Home;
