/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import { MuiThemeProvider } from 'material-ui/styles';

import theme from '../../theme';
import Header from './Header';
import Footer from './Footer';
import Background from './Background';

const Container = styled.div`
  height: 100vh;
  overflow-y: hidden;
`;

class App extends React.Component<{}> {
  componentDidMount() {
    window.document.title = this.props.route.title;
  }

  componentDidUpdate() {
    window.document.title = this.props.route.title;
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Background />
        <Container>{this.props.route.body}</Container>
        <Header />
        <Footer />
      </MuiThemeProvider>
    );
  }
}

export default App;
