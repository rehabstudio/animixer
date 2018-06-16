import React from 'react';
import rp from 'request-promise';
import qs from 'query-string';
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
  font-weight: bold;
  text-align: center;
`;

const Text = styled.p`
  margin: 10px auto;
  text-align: center;
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;
  font-family: 'Nanum Gothic';
  color: #4e6174;
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
      this.getTweetImage(newProps.animalData);
    }
  }

  componentDidMount() {
    // If we have an image url load it
    if (this.props.animalData) {
      if (this.animalImg) {
        this.animalImg.src = this.props.animalData.imageUrl;
      }
      this.updateAnimalMessage(this.props.animalData);
      this.getTweetImage(this.props.animalData);
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
      utils.capitalizeFirstLetter(animalData.name) +
      '! ' +
      funFact +
      " Try making your own animal. Say '#HeyGoogle, talk to Safari Mixer'.";

    let rediscoverMessage =
      utils.capitalizeFirstLetter(animalData.animalFact) +
      ' Say ‘#HeyGoogle, talk to Safari Mixer’ to find a new animal.';

    let twitterMessage = message;

    if (animalData.tweetImage) {
      twitterMessage += ' ' + animalData.tweetImage;
    }

    this.setState({
      twitterMessage: twitterMessage,
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

  getTweetImage(animalData) {
    let animal1, animal2, animal3;
    if (animalData.tweetImage) {
      return;
    }

    if (
      this.props.animalData.animal1 &&
      this.props.animalData.animal2 &&
      this.props.animalData.animal3
    ) {
      animal1 = animalData.animal1;
      animal2 = animalData.animal2;
      animal3 = animalData.animal3;
    } else if (animalData.animalUrl) {
      let args = qs.parse(animalData.animalUrl.split('?')[1]);
      animal1 = args.animal1;
      animal2 = args.animal2;
      animal3 = args.animal3;
    }

    if ((animal1, animal2, animal3)) {
      let animalDataUrl = utils.getAnimalUrl(animal1, animal2, animal3);
      let animalPromise = rp(animalDataUrl);
      return Promise.all([animalPromise]).then(responses => {
        let animalData = JSON.parse(responses[0]);
        if (animalData.tweetImage) {
          this.updateAnimalMessage(animalData);
        } else {
          this.getTweetImage(animalData);
        }
      });
    }
  }

  render() {
    let animalName =
      this.props.animalData.prettyName || this.props.animalData.name;
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
              {utils.capitalizeFirstLetter(animalName)}
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
                title={this.state.twitterMessage}
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
