/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import styled from 'styled-components';
//import Gallery from './../../components/Mixipedia/AnimalGallery';
import Gallery from 'react-grid-gallery';
import rp from 'request-promise';
import history from '../../history';

const Title = styled.h5`
  text-align: center;
`;

const Container = styled.div`
  box-sizing: border-box;
  margin: 0 auto;
  background-color: white;
  width: 80vw;
  height: calc(100vh - 180px);
  height: -o-calc(100vh - 180px); /* opera */
  height: -webkit-calc(100vh - 180px); /* google, safari */
  height: -moz-calc(100vh - 180px); /* firefox */
  overflow-y: auto;
`;

class Mixipedia extends React.Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      images: []
    };
  }

  componentDidMount() {
    this.getAnimals();
    this.gallery.addEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = () => {
    if (this.isBottom(this.gallery)) {
      console.log('header bottom reached');
    }
  };

  /**
   * Get enough found animals to fill the screen
   */
  getAnimals() {
    // make API call to get animals
    rp({
      uri:
        'http://localhost:5000/animixer-1d266/us-central1/api/mixipedia?limit=8',
      resolveWithFullResponse: true,
      json: true
    }).then(
      function(resp) {
        let imagesData = resp.body;
        let imageKeys = Object.keys(imagesData);
        let images = imageKeys.map(function(imageKey) {
          let image = imagesData[imageKey];
          return {
            src: image.gif_url,
            thumbnail: image.gif_url,
            thumbnailWidth: 320,
            thumbnailHeight: 174,
            thumbnailCaption: image.name,
            caption: image.name,
            animal1: image.animal1,
            animal2: image.animal2,
            animal3: image.animal3
          };
        });
        this.setState({
          images: images.reverse()
        });
      }.bind(this)
    );
  }

  clickThumbnail(index) {
    let imageData = this.props.item;
    let url =
      '/animal?animal1=' +
      imageData.animal1 +
      '&animal2=' +
      imageData.animal2 +
      '&animal3=' +
      imageData.animal3;
    history.push(url);
  }

  render() {
    return (
      <Container>
        <Title>Discovered Animals</Title>
        <Gallery
          images={this.state.images}
          enableImageSelection={false}
          enableLightbox={false}
          onClickThumbnail={this.clickThumbnail}
          innerRef={ele => (this.gallery = ele)}
        />
      </Container>
    );
  }
}

export default Mixipedia;
