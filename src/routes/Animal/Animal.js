import React from 'react';
import styled from 'styled-components';
import Card from 'material-ui/Card';
import Typography from 'material-ui/Typography';

const Container = styled.div`
  height: calc(100vh - 180px);
  height: -o-calc(100vh - 180px); /* opera */
  height: -webkit-calc(100vh - 180px); /* google, safari */
  height: -moz-calc(100vh - 180px); /* firefox */
  overflow-y: auto;
`;

class Animal extends React.Component<{}> {
  render() {
    return (
      <Container innerRef={ele => (this.chatDiv = ele)} className="container">
        <div id="main-wrapper">
          <div className="row">
            <div className="col s12">
              <img src="https://storage.googleapis.com/animixer-1d266.appspot.com/elephant_chicken_crocodile_render.gif" />
            </div>
          </div>
        </div>
      </Container>
    );
  }
}

export default Animal;
