/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';

const RHSContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 24px;
  color: rgba(0, 0, 0, 1);
`;

const LHSContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 24px;
  color: rgba(0, 0, 0, 1);
`;

const Copyright = styled.span`
  padding-right: 0.5em;
`;

const ExtLink = styled.a`
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

const Separator = styled.span`
  padding-right: 0.5em;
  padding-left: 0.5em;
`;

class Footer extends React.Component<{}> {
  render() {
    return (
      <div className={this.props.hide ? 'hidden' : ''}>
        <LHSContainer>
          <img src="/static/img/voice_experiment.png" />
        </LHSContainer>
        <RHSContainer>
          <Copyright css="padding-right: 0.5em">&copy; 2018-present</Copyright>
          <ExtLink href="https://beta.rehab/">Rehab</ExtLink>
          <Separator>|</Separator>
          <ExtLink href="http://beta.rehab/terms">Terms & Conditions</ExtLink>
        </RHSContainer>
      </div>
    );
  }
}

export default Footer;
