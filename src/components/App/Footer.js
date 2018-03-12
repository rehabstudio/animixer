/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
  position: relative;

  @media (max-width: 600px) {
    height: 66px;
    background: white;
  }
`;

const RHSContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 24px;
  color: rgba(0, 0, 0, 1);

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const LHSContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 20px;
  color: rgba(0, 0, 0, 1);

  @media (max-width: 600px) {
    display: none;
  }
`;

const linkCss = `
  font-family: Nanum Gothic;
  &,
  &:hover,
  &:active,
  &:visited {
    color: rgba(0, 0, 0, 1);
    text-decoration: none;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const PrivacyLink = styled.a`
  ${linkCss} font-size: 8px;
  position: relative;
  bottom: -40px;
  right: 120px;

  @media (max-width: 600px) {
    left: 0px;
    text-align: left;
  }
`;

const RehabLink = styled.a`
  ${linkCss} display: block;
  font-size: 9px;
  text-align: right;
`;

const RehabImg = styled.img`
  width: 80px;
  display: block;
  margin-left: auto;
`;

class Footer extends React.Component<{}> {
  render() {
    return (
      <FooterContainer className={this.props.hide ? 'hidden' : ''}>
        <LHSContainer>
          <img
            src="/static/img/voice_experiment.png"
            alt="Google voice experiment logo"
          />
        </LHSContainer>
        <RHSContainer>
          <PrivacyLink href="http://beta.rehab/terms">
            PRIVACY & TERMS
          </PrivacyLink>
          <RehabLink href="https://beta.rehab/">
            MADE BY
            <RehabImg src="/static/img/rehab.png" alt="Rehab logo" />
          </RehabLink>
        </RHSContainer>
      </FooterContainer>
    );
  }
}

export default Footer;
