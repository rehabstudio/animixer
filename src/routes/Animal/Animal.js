import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';
import rp from 'request-promise';
import {
  FacebookShareButton,
  FacebookIcon,
  GooglePlusShareButton,
  GooglePlusIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';

import ErrorPage from '../ErrorPage';

const Title = styled.h5`
  text-align: center;
`;

const Text = styled.p`
  text-align: center;
`;

const Container = styled.div`
  height: 75vh;
  overflow-y: auto;
  position: relative;
  top: 75px;
  color: #4e6174;
  font-family: 'Nanum Gothic';
`;

const AnimalImg = styled.img``;

const AnimalText = styled.div`
  margin: 10px auto;
  border-radius: 20px;
  text-align: center;
  display: inline-block;
`;

const AnimalContainer = styled.div`
  padding: 10px;
`;

const APIHost = window.location.href.startsWith('http://localhost')
  ? 'http://localhost:5000/animixer-1d266/us-central1'
  : 'https://us-central1-animixer-1d266.cloudfunctions.net';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
      APIHost +
      '/api/animalName?animal1=' +
      `${parsedArgs.animal1}&animal2=${parsedArgs.animal2}&animal3=${
        parsedArgs.animal3
      }`;
    let animalFactUrl =
      APIHost +
      '/api/animalFact?animal1=' +
      `${parsedArgs.animal1}&animal2=${parsedArgs.animal2}&animal3=${
        parsedArgs.animal3
      }`;
    let namePromise = rp(animalNameUrl);
    let factPromise = rp(animalFactUrl);
    return Promise.all([namePromise, factPromise])
      .then(responses => {
        let animalNameData = JSON.parse(responses[0]);
        animalNameData.animalNameText = `You have discovered the ${
          animalNameData.animalName
        }!`;
        let animalFactData = JSON.parse(responses[1]);
        animalNameData.animalFactText = animalFactData.animalFact;
        this.setState(animalNameData);
      })
      .catch(err => {
        console.log('Error: Unable to retrieve animal name.');
        this.setState({ animalExists: false });
      });
  }

  render() {
    const shareUrl = window.location.href;
    const title = this.state.animalNameText;

    if (this.state.animalExists === false) {
      return <ErrorPage error={{ status: 404 }} />;
    } else {
      return (
        <div className={!this.state.animalExists ? 'hidden' : 'container'}>
          <Container className="row" ref="container">
            <Title>Congratulations</Title>
            <Text>You have just discovered the mysterious</Text>
            <div style={{ textAlign: 'center' }}>
              <AnimalText className="card-panel text-darken-2 hoverable bring-front margins">
                {capitalizeFirstLetter(this.state.animalName)}
              </AnimalText>
            </div>
            <div
              id="main-wrapper"
              className="valign"
              style={{ width: '100%', height: '100%' }}
            >
              <div className="row">
                <AnimalContainer className="col s12 m10 offset-m1 image-div">
                  <AnimalImg
                    innerRef={ele => (this.animalImg = ele)}
                    className="col s8 offset-s2"
                    style={{
                      maxHeight: '40vh',
                      marginBottom: '10px'
                    }}
                    onLoad={this.handleImageLoaded.bind(this)}
                    onError={this.handleImageErrored.bind(this)}
                  />
                  <div className="audio-div">
                    <audio
                      controls
                      src={this.state.audioUrl}
                      style={{
                        width: '100%'
                      }}
                    />
                  </div>
                </AnimalContainer>
              </div>
              <div className="row">
                <div className="col s12 m8 offset-m2">
                  <Text className="col s8 clearfix center-align">
                    {this.state.animalFactText}
                  </Text>
                  <div className="col s4">
                    <FacebookShareButton
                      url={shareUrl}
                      quote={title}
                      className="share-button"
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <TwitterShareButton
                      url={shareUrl}
                      title={title}
                      className="share-button"
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <GooglePlusShareButton
                      url={shareUrl}
                      className="share-button"
                    >
                      <GooglePlusIcon size={32} round />
                    </GooglePlusShareButton>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      );
    }
  }
}

export default Animal;
