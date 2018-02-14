import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';
import rp from 'request-promise';

import ErrorPage from '../ErrorPage';
import { default as AnimalComponent } from '../../components/App/Animal';

const APIHost = window.location.href.startsWith('http://localhost')
  ? 'http://localhost:5000/animixer-1d266/us-central1'
  : 'https://us-central1-animixer-1d266.cloudfunctions.net';

class Animal extends React.Component<{}> {
  constructor(props) {
    super(props);
    const parsed = qs.parse(props.location.search);
    const imageUrl = this.generateImageUrl(parsed);
    const audioUrl = this.generateAudio(parsed);
    this.state = {
      qs: parsed,
      animalData: {
        audioUrl: audioUrl,
        imageUrl: imageUrl
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

  getAnimalData(parsedArgs) {
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
        let animalData = JSON.parse(responses[0]);
        animalData.animalDiscoverText = `You have discovered the ${
          animalData.animalName
        }!`;
        let animalFactData = JSON.parse(responses[1]);
        animalData.animalFactText = animalFactData.animalFact;
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
          <div
            className="row"
            style={{
              height: '90vh',
              top: '75px',
              position: 'relative'
            }}
          >
            <AnimalComponent
              animalData={this.state.animalData}
              ref="container"
            />
          </div>
        </div>
      );
    }
  }
}

export default Animal;
