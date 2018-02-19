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
import history from '../../history';
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
  overflow: hidden;
  position: relative;
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
  font-size: 20px;
  padding: 10px;

  @media (max-width: 600px) {
    padding: 5px 10px;
  }
`;

const TitleContainer = styled.div`
  cursor: pointer;
`;

const AnimalContainer = styled.div`
  padding: 10px;
`;

const ChatDiv = styled.div`
  margin-bottom: 5px;
`;

const buttonMediaCss = `
  @media (max-width: 600px) {
    width: 100px;
    height: 30px;
  }
`;

const AudioButton = Buttons.TitleLink(null, null, 'auto', buttonMediaCss);
const AudioButtonText = Buttons.TitleText();

const ShareButton = Buttons.TitleLink(null, null, 'auto 5px', buttonMediaCss);
const ShareButtonText = Buttons.TitleText();

class Animal extends React.Component<{}> {
  constructor(props) {
    super(props);
    this.shareEnabled =
      props.shareEnabled === undefined ? true : props.shareEnabled;
    this.titleEnabled =
      props.titleEnabled === undefined ? true : props.titleEnabled;
    this.onLoad = props.onLoad || function() {};
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
    this.onLoad();
  }

  handleImageErrored() {
    this.setState({ animalExists: false });
  }

  goAnimalUrl() {
    if (this.props.animalData.animalUrl) {
      history.push(this.props.animalData.animalUrl);
    }
  }

  render() {
    let title =
      this.props.animalData !== {}
        ? this.props.animalData.animalDiscoverText
        : '';

    return (
      <Container>
        <TitleContainer
          className={this.titleEnabled ? '' : 'hidden'}
          onClick={this.goAnimalUrl.bind(this)}
        >
          <div>
            <Title>Congratulations</Title>
            <Text>You have just discovered the mysterious</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <AnimalText className="card-panel text-darken-2 hoverable bring-front margins">
              {utils.capitalizeFirstLetter(this.props.animalData.animalName)}
            </AnimalText>
          </div>
        </TitleContainer>
        <div
          id="main-wrapper"
          className="valign"
          style={{ width: '100%', height: '100%' }}
        >
          <ChatDiv className="row">
            <AnimalContainer className="col s12 m10 offset-m1 image-div">
              <AnimalImg
                innerRef={ele => (this.animalImg = ele)}
                className="col s12 m8 offset-m2"
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
            <div style={{ width: 'fit-content', margin: 'auto' }}>
              <AudioButton
                className="valign-wrapper left"
                onClick={this.playAnimalSound.bind(this)}
              >
                <AudioButtonText>
                  Hear me {this.props.animalData.animalVerb}
                </AudioButtonText>
              </AudioButton>
            </div>
          </ChatDiv>
          <ChatDiv
            className={this.props.animalData.animalFactText ? 'row' : 'hidden'}
          >
            <div className="col s12 m8 offset-m2">
              <Text className="col s12 clearfix center-align">
                {this.props.animalData.animalFactText}
              </Text>
            </div>
          </ChatDiv>
          <ChatDiv className={this.shareEnabled ? 'row' : 'hidden'}>
            <ShareContainer>
              <FacebookShareButton
                url={this.props.animalData.shareUrl}
                quote={title}
                className="share-button"
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton
                url={this.props.animalData.shareUrl}
                title={title}
                className="share-button"
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <GooglePlusShareButton
                url={this.props.animalData.shareUrl}
                className="share-button"
              >
                <GooglePlusIcon size={32} round />
              </GooglePlusShareButton>
            </ShareContainer>
          </ChatDiv>
        </div>
      </Container>
    );
  }
}

export default Animal;
