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
  constructor(props) {
    super(props);
    this.state = {
      hideHeader: null,
      hideFooter: null
    };
  }

  componentDidMount() {
    window.document.title = this.props.route.title;
    window.addEventListener('hideHeader', this.hideHeader.bind(this));
    window.addEventListener('hideFooter', this.hideFooter.bind(this));
  }

  componentDidUpdate() {
    window.document.title = this.props.route.title;
  }

  hideHeader(event) {
    this.setState({
      hideHeader: event.detail
    });
  }

  hideFooter(event) {
    this.setState({
      hideFooter: event.detail
    });
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Background location={this.props.location} />
        <Container>{this.props.route.body}</Container>
        <Header hide={this.state.hideHeader} location={this.props.location} />
        <Footer hide={this.state.hideFooter} location={this.props.location} />
      </MuiThemeProvider>
    );
  }
}

export default App;
