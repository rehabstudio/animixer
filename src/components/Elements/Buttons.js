import styled from 'styled-components';

function TitleLink(width, height, margin, css) {
  width = width || '252px';
  height = height || '50px';
  margin = margin || '0px 10px 10px 0px';
  css = css || '';

  return styled.div`
    background-color: #517363;
    background-image: url('/static/img/waves.png');
    background-size: cover;
    background-repeat: repeat-x;
    width: ${width};
    height: ${height};
    border-radius: 30px;
    cursor: pointer;
    z-index: 10;
    margin: ${margin};

    @media (max-width: 600px) {
      width: 150px;
    }

    ${css};
  `;
}

function TitleText() {
  return styled.span`
    font-family: 'Nanum Gothic';
    font-size: 20px;
    line-height: 23px;
    color: #ecf2dc;
    margin: auto;
  `;
}

export default {
  TitleLink,
  TitleText
};
