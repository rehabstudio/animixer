import React from 'react';
import styled from 'styled-components';

const BackgroundContainer = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: -1;
  background: url(/static/img/bg_leaves.png) no-repeat center center fixed;
  background-size: auto 100%;
  background-color: #fff6d7;
`;

const DesignCss = `
  height: 100vh;
  background-size: auto 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
`;

const FadeCss = `
  background: linear-gradient(0deg, rgba(255,247,213,0) 0%, #FFF7D5 100%);
  background-repeat: repeat-x;
  height: 20vh;
  width: 100vw;
  position: fixed;
  z-index: -1;
`;

const LeftDesign = styled.div`
  background: url(/static/img/lhs.png) no-repeat left center fixed;
  ${DesignCss};

  @media (max-width: 992px) {
    background-position: left -50px center;
  }
  @media (max-width: 600px) {
    background-position: left -135px center;
  }
`;

const RightDesign = styled.div`
  background: url(/static/img/rhs.png) no-repeat right center fixed;
  ${DesignCss};

  @media (max-width: 992px) {
    background-position: right -50px center;
  }
  @media (max-width: 600px) {
    background-position: right -135px center;
  }
`;

const FadeTop = styled.div`
  ${FadeCss} -moz-transform: scaleY(-1);
  -o-transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
  transform: scaleY(-1);
  bottom: 0;
`;
const FadeBottom = styled.div`
  ${FadeCss} top: 0;
`;

class Background extends React.Component<{}> {
  render() {
    return (
      <BackgroundContainer>
        <LeftDesign />
        <RightDesign />
        <FadeTop />
        <FadeBottom />
      </BackgroundContainer>
    );
  }
}

export default Background;
