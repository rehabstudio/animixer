import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';
import rp from 'request-promise';

import ErrorPage from '../ErrorPage';

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
    const imageUrl =
      'https://storage.googleapis.com/animixer-1d266.appspot.com/' +
      parsed.animal1 +
      '_' +
      parsed.animal2 +
      '_' +
      parsed.animal3 +
      '_render.gif';
    this.state = {
      animalName: '',
      imageUrl: imageUrl,
      animalExists: null
    };

    this.getAnimalName(parsed);
  }

  componentDidMount() {
    if (this.animalImg) {
      this.animalImg.src = this.state.imageUrl;
    }
  }

  handleImageLoaded() {
    this.setState({ animalExists: true });
  }

  handleImageErrored() {
    this.setState({ animalExists: false });
  }

  getAnimalName(parsedArgs) {
    let animalNameUrl =
      'https://us-central1-animixer-1d266.cloudfunctions.net/animalName/?animal1=' +
      `${parsedArgs.animal1}&animal2=${parsedArgs.animal2}&animal3=${
        parsedArgs.animal3
      }`;
    return rp(animalNameUrl)
      .then(
        function(animalNameResp) {
          let animalNameData = JSON.parse(animalNameResp);
          this.setState(animalNameData);
        }.bind(this)
      )
      .catch(
        function(err) {
          console.log('Error: Unable to retrieve animal name.');
          this.setState({ animalExists: false });
        }.bind(this)
      );
  }

  render() {
    if (this.state.animalExists === false) {
      return <ErrorPage error={{ status: 404 }} />;
    } else {
      return (
        <Container className="container">
          <div
            id="main-wrapper"
            className={!this.state.animalExists ? 'hidden' : ''}
          >
            <div className="row">
              <div className="col s12 m8 offset-m2">
                <AnimalContainer>
                  <AnimalImg
                    innerRef={ele => (this.animalImg = ele)}
                    className="col s12 responsive-img"
                    style={{ 'max-height': '70vh' }}
                    onLoad={this.handleImageLoaded.bind(this)}
                    onError={this.handleImageErrored.bind(this)}
                  />
                  <AnimalText className="center-align">
                    You have discovered the {this.state.animalName}!
                  </AnimalText>
                </AnimalContainer>
              </div>
            </div>
          </div>
        </Container>
      );
    }
  }
}

export default Animal;
