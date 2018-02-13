/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import history from '../../history';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  padding: 24px;
`;

const TitleLink = styled.div`
  background-color: #517363;
  background-image: url('/static/img/waves.png');
  background-size: cover;
  background-repeat: repeat-x;
  width: 252px;
  height: 50px;
  border-radius: 30px;
  cursor: pointer;
  z-index: 10;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const TitleText = styled.span`
  font-family: 'Nanum Gothic';
  font-size: 20px;
  line-height: 23px;
  color: #ecf2dc;
  margin: auto;
`;

class Header extends React.Component<{}> {
  goAnimalMixer() {
    history.push('/');
  }

  goMixipedia() {
    history.push('/mixipedia');
  }

  render() {
    return (
      <Container className="row">
        <div>
          <TitleLink
            className="left valign-wrapper"
            innerRef={ele => (this.mixipediaDiv = ele)}
            onClick={this.goAnimalMixer.bind(this)}
          >
            <TitleText>Animal Mixer</TitleText>
          </TitleLink>
          <TitleLink
            className="left valign-wrapper"
            innerRef={ele => (this.mixipediaDiv = ele)}
            onClick={this.goMixipedia.bind(this)}
          >
            <TitleText>Mixipedia</TitleText>
          </TitleLink>
        </div>
      </Container>
    );
  }
}

export default Header;
