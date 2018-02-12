import React from 'react';
import styled from 'styled-components';

const BackgroundContainer = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: -1;
  background: url(/static/img/bg_leaves_fade.png) no-repeat center center fixed;
  background-size: auto 100%;
  background-color: #fff6d7;
`;

const LeftDesign = styled.div`
  height: 100vh;
  background: url(/static/img/lhs_fade.png) no-repeat left center fixed;
  background-size: auto 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
`;

const RightDesign = styled.div`
  height: 100vh;
  background: url(/static/img/rhs_fade.png) no-repeat right center fixed;
  background-size: auto 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
`;

class Background extends React.Component<{}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BackgroundContainer>
        <LeftDesign />
        <RightDesign />
      </BackgroundContainer>
    );
  }
}

export default Background;
