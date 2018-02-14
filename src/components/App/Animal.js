import React from 'react';
import {
  FacebookShareButton,
  FacebookIcon,
  GooglePlusShareButton,
  GooglePlusIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';
import styled from 'styled-components';

import Buttons from '../Elements/Buttons';
import utils from '../../utils';

const Title = styled.h5`
  text-align: center;
  font-weight: bold;
`;

const Text = styled.p`
  text-align: center;
  margin: 10px auto;
`;

const Container = styled.div`
  height: 90vh;
  overflow: hidden;
  position: relative;
  top: 75px;
  color: #4e6174;
  font-family: 'Nanum Gothic';
`;

const ShareContainer = styled.div`
  margin: auto;
  width: 130px;
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

const AudioButton = Buttons.TitleLink(null, null, 'auto');
const AudioButtonText = Buttons.TitleText();

class Animal extends React.Component<{}> {
  constructor(props) {
    super(props);
    this.shareEnabled = props.shareEnabled || true;
    this.titleEnabled = props.titleEnabled || false;
  }

  componentWillReceiveProps(newProps) {
    for (let param in ['shareEnabled', 'titleEnabled']) {
      if (newProps[param] !== this.props[param]) {
        this.shareEnabled = newProps[param];
      }
    }
  }

  componentDidMount() {
    // If we have an image url load it
    if (this.animalImg && this.props.animalData) {
      this.animalImg.src = this.props.animalData.imageUrl;
    }
  }

  playAnimalSound() {
    this.audio.play();
  }

  handleImageLoaded() {
    this.setState({ animalExists: true });
  }

  handleImageErrored() {
    this.setState({ animalExists: false });
  }

  render() {
    const shareUrl = window.location.href;
    let title =
      this.props.animalData !== {}
        ? this.props.animalData.animalDiscoverText
        : '';

    return (
      <Container className="row">
        <div className={this.titleEnabled ? '' : 'hidden'}>
          <Title>Congratulations</Title>
          <Text>You have just discovered the mysterious</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <AnimalText className="card-panel text-darken-2 hoverable bring-front margins">
            {utils.capitalizeFirstLetter(this.props.animalData.animalName)}
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
                  ref={ele => (this.audio = ele)}
                  controls
                  src={this.props.animalData.audioUrl}
                  style={{
                    width: '100%'
                  }}
                />
              </div>
            </AnimalContainer>
            <AudioButton
              className="valign-wrapper"
              onClick={this.playAnimalSound.bind(this)}
            >
              <AudioButtonText>
                Hear me {this.props.animalData.animalVerb}
              </AudioButtonText>
            </AudioButton>
          </div>
          <div className="row">
            <div className="col s12 m8 offset-m2">
              <Text className="col s12 clearfix center-align">
                {this.props.animalData.animalFactText}
              </Text>
            </div>
          </div>
          <div className={this.shareEnabled ? 'row' : 'hidden'}>
            <ShareContainer>
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
              <GooglePlusShareButton url={shareUrl} className="share-button">
                <GooglePlusIcon size={32} round />
              </GooglePlusShareButton>
            </ShareContainer>
          </div>
        </div>
      </Container>
    );
  }
}

export default Animal;
