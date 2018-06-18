import React from 'react';
import qs from 'query-string';
import rp from 'request-promise';
import styled from 'styled-components';

import ErrorPage from '../ErrorPage';
import { default as AnimalComponent } from '../../components/App/Animal';
import utils from '../../utils';

const AnimalContainer = styled.div`
  height: 90vh;
  top: 50px;
  position: relative;

  @media (max-width: 600px) {
    top: 100px;
  }

  @media (max-height: 600px) {
    top: 55px;
  }
`;

class Animal extends React.Component {
  constructor(props) {
    super(props);
    const parsed = qs.parse(props.location.search);
    const imageUrl = this.generateGifUrl(parsed);
    const audioUrl = this.generateAudio(parsed);
    this.state = {
      qs: parsed,
      animalData: {
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        shareUrl: window.location.href
      },
      animalExists: null
    };
  }

  componentDidMount() {
    // Get animal name from API
    this.getAnimalData(this.state.qs);

    // If we have an image url load it
    if (this.animalImg) {
      this.animalImg.src = this.state.imageUrl;
    }
  }

  generateAudio(qs) {
    let animal;
    if (qs.animal1 === qs.animal2 && qs.animal2 === qs.animal3) {
      animal = qs.animal1;
    } else {
      animal = [qs.animal1, qs.animal2].sort().join('');
    }

    return (
      'https://storage.googleapis.com/animixer-1d266.appspot.com/sounds/' +
      animal +
      '.wav'
    );
  }

  generateGifUrl(qs) {
    return (
      'https://storage.googleapis.com/animixer-1d266.appspot.com/gifs/' +
      qs.animal1 +
      '_' +
      qs.animal2 +
      '_' +
      qs.animal3 +
      '_render.gif'
    );
  }

  getAnimalData(parsedArgs) {
    let animalDataUrl = utils.getAnimalUrl(
      parsedArgs.animal1,
      parsedArgs.animal2,
      parsedArgs.animal3
    );
    let shareUrl = utils.getShareUrl(
      parsedArgs.animal1,
      parsedArgs.animal2,
      parsedArgs.animal3
    );

    let animalPromise = rp(animalDataUrl);
    return Promise.all([animalPromise])
      .then(responses => {
        let animalData = JSON.parse(responses[0]);
        animalData.name = animalData.name;
        animalData.animalDiscoverText = `You have discovered the ${
          animalData.name
        }!`;
        animalData.animalFactText = animalData.animalFact;
        animalData.shareUrl = shareUrl;
        this.setState({
          animalData: animalData,
          animalExists: true
        });
      })
      .catch(err => {
        console.log('Error: Unable to retrieve animal name.');
        this.setState({ animalExists: false });
      });
  }

  render() {
    if (this.state.animalExists === false) {
      return <ErrorPage error={{ status: 404 }} />;
    } else {
      return (
        <div className={!this.state.animalExists ? 'hidden' : 'container'}>
          <AnimalContainer className="row">
            <AnimalComponent
              animalData={this.state.animalData}
              ref="container"
            />
          </AnimalContainer>
        </div>
      );
    }
  }
}

export default Animal;
