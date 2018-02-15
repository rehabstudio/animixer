/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
import history from '../../history';
import Buttons from '../Elements/Buttons';

const LHSContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  padding: 24px;
`;

const RHSContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  padding: 24px;
`;

const TitleLink = Buttons.TitleLink();
const TitleText = Buttons.TitleText();

class Header extends React.Component<{}> {
  goAnimalMixer() {
    history.push('/');
  }

  goMixipedia() {
    history.push('/mixipedia');
  }

  render() {
    return (
      <div className={this.props.hide ? 'hidden' : ''}>
        <LHSContainer className="row">
          <div>
            <TitleLink
              className="left valign-wrapper"
              innerRef={ele => (this.mixipediaDiv = ele)}
              onClick={this.goMixipedia.bind(this)}
            >
              <TitleText>Mixipedia</TitleText>
            </TitleLink>
          </div>
        </LHSContainer>
        <RHSContainer>
          <TitleLink
            className="right valign-wrapper"
            innerRef={ele => (this.mixipediaDiv = ele)}
            onClick={this.goAnimalMixer.bind(this)}
          >
            <TitleText>Animal Mixer</TitleText>
          </TitleLink>
        </RHSContainer>
      </div>
    );
  }
}

export default Header;
