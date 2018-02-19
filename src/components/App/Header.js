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

const HomeLink = Buttons.TitleLink(
  '50px',
  null,
  null,
  `
  background-image: url('static/img/chatbot_icon.png');
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.5);

  @media (max-width: 992px) {
    width: 50px;
  }

  @media (max-width: 600px) {
    width: 50px;
  }
  `
);

const MixipediaLink = Buttons.TitleLink(
  '50px',
  null,
  null,
  `
  background-image: url('static/img/mixipedia_icon.png');
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.5);

  @media (max-width: 992px) {
    width: 50px;
  }

  @media (max-width: 600px) {
    width: 50px;
  }
  `
);

class Header extends React.Component<{}> {
  goHome() {
    if (this.props.location && this.props.location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('reset', { detail: true }));
    } else {
      history.push('/');
    }
  }

  goMixipedia() {
    history.push('/mixipedia');
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
            <HomeLink
              className="left valign-wrapper"
              innerRef={ele => (this.homeDiv = ele)}
              onClick={this.goHome.bind(this)}
            />
            <MixipediaLink
              className="left valign-wrapper"
              innerRef={ele => (this.mixipediaDiv = ele)}
              onClick={this.goMixipedia.bind(this)}
            />
          </div>
        </RHSContainer>
        <LHSContainer
          innerRef={ele => (this.mixipediaDiv = ele)}
          onClick={this.goHome.bind(this)}
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
