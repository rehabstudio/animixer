import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';
import ErrorPage from '../ErrorPage'

const Container = styled.div`
  height: calc(100vh - 150px);
  height: -o-calc(100vh - 150px); /* opera */
  height: -webkit-calc(100vh - 150px); /* google, safari */
  height: -moz-calc(100vh - 150px); /* firefox */
  overflow-y: auto;
  background-color: white;
`;

const AnimalImg = styled.img``;

const AnimalText = styled.h5`
  margin: 10px auto;
`;

const AnimalContainer = styled.div`
  padding: 10px;
`;

class Animal extends React.Component<{}> {
  constructor(props) {
    super(props);
    const parsed = qs.parse(props.location.search);
    this.state = {
      animalName: parsed.animalName,
      imgUrl: 'https://storage.googleapis.com/animixer-1d266.appspot.com/' + parsed.imageUrl
    };
  }

  componentDidMount() {
    this.animalImg.src = this.state.imgUrl;
  }

  render() {
    if (this.state.animalName && this.state.imgUrl){
      return (
        <Container className="container">
          <div id="main-wrapper">
            <div className="row">
              <div className="col s8 offset-s2">
                <AnimalContainer>
                  <AnimalImg innerRef={ele => (this.animalImg = ele)} className="col s12 responsive-img" />
                  <AnimalText className="center-align">You have discovered the: {this.state.animalName}</AnimalText>
                </AnimalContainer>
              </div>
            </div>
          </div>
        </Container>
      );
    }
    else {
      return <ErrorPage error={{ status: 404 }}/>;
    }
  }
}

export default Animal;
