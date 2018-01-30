/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import MuiToolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import styled from 'styled-components';

import history from '../../history';

const Title = styled(Typography)`
  && {
    flex: 1;
    text-align: left;
    cursor: pointer;
  }
`;

function goHome() {
  history.push('/');
}

class Toolbar extends React.Component<{}, {}> {
  state = {};

  render() {
    return (
      <AppBar color="default" position="static">
        <MuiToolbar>
          <Title type="title" color="inherit" onClick={goHome}>
            Animixer
          </Title>
        </MuiToolbar>
      </AppBar>
    );
  }
}

export default Toolbar;
