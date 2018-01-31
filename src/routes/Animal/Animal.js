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
  min-height: 70vh;
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
    const imageUrl = this.generateImageUrl(parsed);
    const audioUrl = this.generateAudio(parsed);
    this.state = {
      animalName: '',
      animalNameText: '',
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      animalExists: null,
      mobile: false,
      qs: parsed
    };
  }

  generateAudio(qs) {
    let animals = [qs.animal1, qs.animal2].sort().join('');
    return (
      'https://storage.googleapis.com/animixer-1d266.appspot.com/' +
      animals +
      '.wav'
    );
  }

  generateImageUrl(qs) {
    return (
      'https://storage.googleapis.com/animixer-1d266.appspot.com/' +
      qs.animal1 +
      '_' +
      qs.animal2 +
      '_' +
      qs.animal3 +
      '_render.gif'
    );
  }

  componentDidMount() {
    // Get animal name from API
    this.getAnimalName(this.state.qs);

    // If we have an image url load it
    if (this.animalImg) {
      this.animalImg.src = this.state.imageUrl;
    }

    // Add check for mobile size for style
    window.addEventListener('resize', this.mobileCheck.bind(this));
    this.mobileCheck();
  }

  mobileCheck() {
    if (window.innerWidth <= 600) {
      this.setState({ mobile: true });
    } else {
      this.setState({ mobile: false });
    }
  }

  handleImageLoaded() {
    this.setState({ animalExists: true });
  }

  handleImageErrored() {
    this.setState({ animalExists: false });
  }

  getAnimalName(parsedArgs) {
    if (
      parsedArgs.animal1 === parsedArgs.animal2 &&
      parsedArgs.animal2 === parsedArgs.animal3
    ) {
      return this.setState({
        animalNameText: `You have discovered the ${parsedArgs.animal1}!`
      });
    }

    let animalNameUrl =
      'https://us-central1-animixer-1d266.cloudfunctions.net/animalName/?animal1=' +
      `${parsedArgs.animal1}&animal2=${parsedArgs.animal2}&animal3=${
        parsedArgs.animal3
      }`;
    return rp(animalNameUrl)
      .then(
        function(animalNameResp) {
          let animalNameData = JSON.parse(animalNameResp);
          animalNameData.animalNameText = `You have discovered the ${
            animalNameData.animalName
          }!`;
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
        <Container className="container valign-wrapper">
          <div
            id="main-wrapper"
            className={!this.state.animalExists ? 'hidden' : 'valign'}
            style={{ width: '100%' }}
          >
            <div className="row">
              <div className="col s12 m10 offset-m1">
                <AnimalContainer>
                  <AnimalImg
                    innerRef={ele => (this.animalImg = ele)}
                    className="col s12 responsive-img"
                    style={{
                      maxHeight: '65vh',
                      marginBottom: '10px'
                    }}
                    onLoad={this.handleImageLoaded.bind(this)}
                    onError={this.handleImageErrored.bind(this)}
                  />
                  <div className="col s8 offset-s2">
                    <audio
                      controls
                      src={this.state.audioUrl}
                      style={{
                        width: '100%'
                      }}
                    />
                  </div>
                  <AnimalText className="clearfix center-align">
                    {this.state.animalNameText}
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
