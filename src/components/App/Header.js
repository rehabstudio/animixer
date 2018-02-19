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
  padding: 10px;
  cursor: pointer;

  @media (max-width: 992px) {
    padding: 10px;
  }
`;

const RHSContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  padding: 15px;
  cursor: pointer;
`;

const AnimixerImg = styled.img`
  width: 150px;

  @media (max-width: 992px) {
    width: 100px;
  }
`;

const TitleLink = Buttons.TitleLink(null, null, null, ``);
const TitleText = Buttons.TitleText();

class Header extends React.Component<{}> {
  goAnimalMixer() {
    if (this.props.location && this.props.location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('reset', { detail: true }));
    } else {
      history.push('/');
    }
  }

  goMixipedia() {
    history.push('/mixipedia');
  }

  goHome() {
    history.push('/');
  }

  visiblity() {
    if (this.props.hide === null) {
      return 'fadeout';
    } else if (this.props.hide) {
      return 'fadeout';
    } else {
      return 'fadein';
    }
  }

  render() {
    return (
      <div className={this.visiblity()}>
        <RHSContainer className="row">
          <div>
            <TitleLink
              className="left valign-wrapper"
              innerRef={ele => (this.mixipediaDiv = ele)}
              onClick={this.goMixipedia.bind(this)}
            >
              <TitleText>Mixipedia</TitleText>
            </TitleLink>
          </div>
        </RHSContainer>
        <LHSContainer
          innerRef={ele => (this.mixipediaDiv = ele)}
          onClick={this.goAnimalMixer.bind(this)}
        >
          <AnimixerImg
            src="/static/img/logo_low_res.png"
            className="right valign-wrapper"
          />
        </LHSContainer>
      </div>
    );
  }
}

export default Header;
