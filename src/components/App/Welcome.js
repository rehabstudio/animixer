import React from 'react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Start = styled.div`
  background-color: #517363;
  background-image: url('/static/img/waves.png');
  background-size: cover;
  height: 59px;
  width: 325px;
  margin: auto;
  border-radius: 30px;
  cursor: pointer;

  @media (max-width: 600px) {
    width: 250px;
    height: 45px;
  }
`;

const StartText = styled.span`
  font-family: 'Nanum Gothic';
  font-size: 16px;
  line-height: 19px;
  color: #ecf2dc;
  margin-right: auto;
  width: 252px;
`;

const MicIcon = styled.i`
  color: #ecf2dc;
  margin-left: auto;
`;

const Logo = styled.img`
  width: 100%;
  margin: auto;

  @media (max-width: 600px) {
    width: 250px;
  }
`;

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.scrollDown = this.props.scrollDown || function() {};
  }

  render() {
    return (
      <WelcomeContainer
        className="row valign-wrapper"
        style={{ marginBottom: '0px' }}
      >
        <div className="col s10 offset-s1 m6 offset-m3 l4 offset-l4 center-align">
          <Logo
            className="center-align"
            src="/static/img/safari_mixer_logo.png"
          />
          <Start
            innerRef={ele => (this.startDiv = ele)}
            onClick={this.scrollDown}
            className="valign-wrapper"
          >
            <MicIcon className="small material-icons">mic_none</MicIcon>
            <StartText className="center-align">START YOUR SAFARI</StartText>
          </Start>
        </div>
      </WelcomeContainer>
    );
  }
}

export default Welcome;
