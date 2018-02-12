import React from 'react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Start = styled.div`
  background-color: #517363;
  height: 59px;
  width: 325px;
  margin: auto;
  border-radius: 30px;
`;

const StartText = styled.span`
  font-family: 'Nanum Gothic';
  font-size: 20px;
  line-height: 23px;
  color: #ecf2dc;
  margin-right: auto;
  width: 252px;
`;

const MicIcon = styled.i`
  color: #ecf2dc;
  margin-left: auto;
`;

class Welcome extends React.Component<{}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <WelcomeContainer className="row valign-wrapper">
        <div className="col s10 offset-s1 m6 offset-m3 l4 offset-l4 center-align">
          <img className="center-align" src="/static/img/logo_low_res.png" />
          <Start className="valign-wrapper">
            <MicIcon className="small material-icons">mic_none</MicIcon>
            <StartText className="center-align">START YOUR SAFARI</StartText>
          </Start>
        </div>
      </WelcomeContainer>
    );
  }
}

export default Welcome;
