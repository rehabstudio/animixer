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

const AnimalImg = styled.img`
  border-radius: 30px;
  width: 100%;
`;

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
    width: 200px;
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
    this.state = {
      shareMessage: '',
      rediscoverMessage: ''
    };
  }

  componentWillReceiveProps(newProps) {
    for (let param in ['shareEnabled', 'titleEnabled']) {
      if (newProps[param] !== this.props[param]) {
        this.shareEnabled = newProps[param];
      }
    }
    if (newProps.animalData && newProps !== this.props) {
      this.updateShareMetaTags(newProps.animalData);
      this.updateAnimalMessage(newProps.animalData);
    }
  }

  componentDidMount() {
    // If we have an image url load it
    if (this.props.animalData) {
      if (this.animalImg) {
        this.animalImg.src = this.props.animalData.imageUrl;
      }
      this.updateAnimalMessage(this.props.animalData);
    }
  }

  updateShareMetaTags(animalData) {
    let shareData = {
      'meta[property="og:image"]': animalData.image_url,
      'meta[property="og:image:secure_url"]': animalData.image_url,
      'meta[name="twitter:image"]': animalData.image_url,
      'meta[name="twitter:card"]': animalData.image_url
    };
    let keys = Object.keys(shareData);

    for (let i = 0; i < keys.length; i++) {
      document
        .querySelector(keys[i])
        .setAttribute('content', shareData[keys[i]]);
    }
  }

  updateAnimalMessage(animalData) {
    let funFact = animalData.animalFact
      ? ' Here’s a fun fact - ' + animalData.animalFact
      : '';
    let message =
      'I discovered the ' +
      utils.capitalizeFirstLetter(animalData.animalName) +
      '! ' +
      funFact +
      " Try making your own animal. Say '#HeyGoogle, talk to Safari Mixer'.";

    let rediscoverMessage =
      utils.capitalizeFirstLetter(animalData.animalFact) +
      ' Say ‘#HeyGoogle, talk to Safari Mixer’ to find a new animal.';

    this.setState({
      shareMessage: message,
      rediscoverMessage: rediscoverMessage
    });
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
              <div
                className="col s12 m8 offset-m2"
                style={{ marginBottom: '10px' }}
              >
                <AnimalImg
                  innerRef={ele => (this.animalImg = ele)}
                  onLoad={this.handleImageLoaded.bind(this)}
                  onError={this.handleImageErrored.bind(this)}
                />
              </div>
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
                className="valign-wrapper"
                onClick={this.playAnimalSound.bind(this)}
              >
                <AudioButtonText>Hear me</AudioButtonText>
              </AudioButton>
            </div>
          </ChatDiv>
          <ChatDiv
            className={this.props.animalData.animalFactText ? 'row' : 'hidden'}
          >
            <div className="col s12 m8 offset-m2">
              <Text className="col s12 clearfix center-align">
                {this.state.rediscoverMessage}
              </Text>
            </div>
          </ChatDiv>
          <ChatDiv className={this.shareEnabled ? 'row' : 'hidden'}>
            <ShareContainer>
              <FacebookShareButton
                url={this.props.animalData.shareUrl}
                quote={this.state.shareMessage}
                className="share-button"
                hashtag="#HeyGoogle"
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton
                url={this.props.animalData.shareUrl}
                title={this.state.shareMessage}
                className="share-button"
                hashtag="#HeyGoogle"
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
