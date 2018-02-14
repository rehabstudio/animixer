/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Gallery from 'react-grid-gallery';
import rp from 'request-promise';

import utils from '../../utils';
import history from '../../history';

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
  top: 100px;
  color: #4e6174;
  font-family: 'Nanum Gothic';
`;

const APIHost = window.location.href.startsWith('http://localhost')
  ? 'http://localhost:5000/animixer-1d266/us-central1'
  : 'https://us-central1-animixer-1d266.cloudfunctions.net';

class Mixipedia extends React.Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      postInProgress: false
    };
  }

  componentDidMount() {
    this.getAnimals();
    this.addScrollListener();
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  removeScrollListener() {
    const container = ReactDOM.findDOMNode(this.refs.container);
    container.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  addScrollListener() {
    const container = ReactDOM.findDOMNode(this.refs.container);
    container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll(event) {
    if (this.isBottom() && !this.state.postInProgress) {
      this.setState({ postInProgress: true });
      this.getAnimals(true).then(resp => {
        this.setState({ postInProgress: false });
      });
    }
  }

  isBottom() {
    const container = ReactDOM.findDOMNode(this.refs.container);
    return (
      container.scrollTop === container.scrollHeight - container.offsetHeight
    );
  }

  getImageUrl(appendImages) {
    let limit = 12;
    let url = APIHost + '/api/mixipedia';
    if (appendImages && this.state.images.length > 0) {
      let lastImage = this.state.images[this.state.images.length - 1];
      url +=
        '?limit=' + (limit + 1) + '&start=' + lastImage.data.date_found_inv;
    } else {
      url += '?limit=' + limit;
    }
    return url;
  }

  /**
   * Get enough found animals to fill the screen
   */
  getAnimals(appendImages) {
    appendImages = appendImages || false;
    let postOptions = {
      uri: this.getImageUrl(appendImages),
      resolveWithFullResponse: true,
      json: true
    };
    // make API call to get animals
    return rp(postOptions).then(resp => {
      let imagesData = resp.body;
      let imageKeys = Object.keys(imagesData);
      let images = imageKeys.map(imageKey => {
        let image = imagesData[imageKey];
        let animalName = utils.capitalizeFirstLetter(image.name);
        return {
          src: image.gif_url,
          thumbnail: image.gif_url,
          thumbnailWidth: 320,
          thumbnailHeight: 174,
          thumbnailCaption: animalName,
          caption: animalName,
          data: image
        };
      });

      if (appendImages) {
        if (images.length > 1) {
          let existingImages = this.state.images;
          images = images.reverse();
          images.shift();
          this.setState({
            images: existingImages.concat(images)
          });
        }
      } else {
        this.setState({
          images: images.reverse()
        });
      }
    });
  }

  clickThumbnail(index) {
    let imageData = this.props.item;
    let url =
      '/animal?animal1=' +
      imageData.data.animal1 +
      '&animal2=' +
      imageData.data.animal2 +
      '&animal3=' +
      imageData.data.animal3;
    history.push(url);
  }

  imageStyle() {
    return {
      width: this.props.item.vwidth,
      height: this.props.height,
      overflow: 'hidden'
    };
  }

  descriptionStyle() {
    return {
      textAlign: 'center'
    };
  }

  render() {
    return (
      <div className="container">
        <Container className="row" ref="container">
          <Title>Mixipedia</Title>
          <Text>See what’s been discovered by others.</Text>
          <Gallery
            background={'rgba(0, 0, 0, 0.0)'}
            images={this.state.images}
            enableImageSelection={false}
            enableLightbox={false}
            onClickThumbnail={this.clickThumbnail}
            ref="gallery"
            tileDescriptionStyle={this.descriptionStyle}
            tileViewportStyle={this.imageStyle}
          />
        </Container>
      </div>
    );
  }
}

export default Mixipedia;
