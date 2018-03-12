function capitalizeFirstLetter(string) {
  if (!string) {
    return;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function isIEorEDGE() {
  return (
    navigator.appName === 'Microsoft Internet Explorer' ||
    (navigator.appName === 'Netscape' &&
      navigator.appVersion.indexOf('Edge') > -1)
  );
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isChrome() {
  return (
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  );
}

export default {
  capitalizeFirstLetter,
  isChrome,
  isIEorEDGE,
  isSafari
};
