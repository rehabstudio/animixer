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
  }

  /**
   * Get enough found animals to fill the screen
   */
  getAnimals() {
    let images = [
      {
        src: 'https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg',
        thumbnail:
          'https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_n.jpg',
        thumbnailWidth: 320,
        thumbnailHeight: 174,
        thumbnailCaption: 'After Rain (Jeshu John - designerspics.com)',
        caption: 'After Rain (Jeshu John - designerspics.com)'
      },
      {
        src: 'https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_b.jpg',
        thumbnail:
          'https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_n.jpg',
        thumbnailWidth: 320,
        thumbnailHeight: 212,
        thumbnailCaption: 'Boats (Jeshu John - designerspics.com)',
        caption: 'Boats (Jeshu John - designerspics.com)'
      },
      {
        src: 'https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_b.jpg',
        thumbnail:
          'https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_n.jpg',
        thumbnailWidth: 320,
        thumbnailHeight: 212,
        thumbnailCaption: '8H',
        caption: '8H'
      }
    ];
    // make API call to get animals
    this.setState({
      images: images
    });
  }

  render() {
    return (
      <Container>
        <Title>Discovered Animals</Title>
        <Gallery images={this.state.images} />
      </Container>
    );
  }
}

export default Mixipedia;
