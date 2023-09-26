import { el, setChildren, mount } from 'redom';
import createHeader from './header';

function createSkeletonHeader() {
  return el('header.header.is-loading.is-loading__header');
}
function createSkeletonTitle() {
  return el(
    '.main.is-loading__title',
    el('.is-loading', {
      style: { width: '250px', height: '40px' },
    })
  );
}
function createSkeletonAtms() {
  return el(
    '.main.is-loading__title',
    el('.is-loading', { style: { width: '100%', height: '728px' } })
  );
}

function createPlacemarks(data) {
  let placemarks = '';
  for (let i = 0; i < data.length; i++) {
    if (data[i].lat && data[i].lon) {
      placemarks += `.add(new ymaps.Placemark([${data[i].lat}, ${data[i].lon}]))`;
    }
  }
  return `myMap.geoObjects${placemarks}`;
}

export default function createAtmsPage(data) {
  const url = new URL('/atms', window.location.origin);
  history.pushState(null, '', url);
  document.body.innerHTML = '';

  const header = createHeader('atms');
  const atms = el('h1.login__title', 'Банкоматы');
  const map = el('#map', { style: { width: '100%', height: '728px' } });
  const main = el('.main.atms__main', atms, map);

  const initMap = `ymaps.ready(init);
  function init(){
        var myMap = new ymaps.Map("map", {
          center: [55.76, 37.64],
            zoom: 11
        });
        ${createPlacemarks(data)}
      }`;
  mount(
    document.head,
    el('script', {
      type: 'text/javascript',
      src: 'https://api-maps.yandex.ru/2.1/?apikey=01d17ca9-f095-43be-bc7c-3037c9fd88e8&lang=ru_RU',
    })
  );
  setChildren(document.body, [
    createSkeletonHeader(),
    createSkeletonTitle(),
    createSkeletonAtms(),
  ]);
  setTimeout(() => {
    setChildren(document.body, [header.header, main]);
    // document.querySelector('.spinner-border').remove();
    mount(document.head, el('script', initMap));
  }, 1000);
}
