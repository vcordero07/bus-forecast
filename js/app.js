//06-23-2017
//
const apiKeys = {
  MBTA: '1VI-9UmYpE64qhHFmhr1ew',
  WeatherUnderground: '682f91fd7c03e86f',
  DarkSky: '93ee5f3d7542687660862c09d91dbb09',
  gglMaps: 'AIzaSyDca9-UHxjzg6OwiRMbw6nnSLtJBD4ck88', //'AIzaSyBzwpCEKRqw8gXTUZZ1oVuB3TuMG-aCV1Q',
};

const endPoints = {
  MBTARoutes: 'https://realtime.mbta.com/developer/api/v2/routes',
  MBTABusStop: 'https://realtime.mbta.com/developer/api/v2/stopsbyroute',
  MBTAPredictionsByStop: 'https://realtime.mbta.com/developer/api/v2/predictionsbystop',
  MBTAStopsByLocation: 'https://realtime.mbta.com/developer/api/v2/stopsbylocation',
  MBTARoutesByStop: 'https://realtime.mbta.com/developer/api/v2/routesbystop',
  WeatherUnderground: `https://api.wunderground.com/api/${apiKeys.WeatherUnderground}/conditions/q/`,
  DarkSky: `https://api.darksky.net/forecast/${apiKeys.DarkSky}/`,
  gglMapsGeocode: `https://maps.googleapis.com/maps/api/geocode/json`, //?latlng=40.714224,-73.961452&key=YOUR_API_KEY
};

let busRouteID;
let strLat;
let strLon;
let strStopID;
let busDirection = 0;
let minTime = 0;
let toggleMode;
let geoCity;

let MBTAQuery = {
  // route: busRouteID,
  // stop: strStopID,
  // direction: busDirection,
};
let MapsQuery = {
  zoom: 15,
  size: '320x320',
  sensor: false,
};

let geoQuery = {
  key: apiKeys.gglMaps,
};

let getDataFromApi = (searchTerm, query, callback) => {
  query.api_key = apiKeys.MBTA;
  query.format = 'json';
  console.log('query:', query);
  $.getJSON(searchTerm, query, function(data) {
      displayData(data, callback);
    })
    .fail(function(data) {
      console.log('error data:', data);
      if (data.status === 404) {
        $('.bus-valid-time').html(`${data.responseText}`);
      }
    });
};

let getWUDataFromApi = (searchTerm, lat, lon, callback) => {
  $.ajax({
      url: `${searchTerm}${lat},${lon}.json`,
      method: 'GET'
    })
    .done(function(data) {
      displayData(data, callback);
    })
    .fail(function(data) {
      console.log('error data:', data);
    });
};

let getDKDataFromApi = (searchTerm, lat, lon, callback) => {
  $.ajax({
      url: `${searchTerm}${lat},${lon}`,
      dataType: 'jsonp',
      method: 'GET'
    })
    .done(function(data) {
      displayData(data, callback);
    })
    .fail(function(data) {
      console.log('error data:', data);
    });
};

let getMapsData = (lat, lon) => {
  console.log('lat, lon:', lat, lon);
  let resultElement = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&markers=${lat},${lon}&zoom=15&size=320x320&sensor=false&key=AIzaSyDca9-UHxjzg6OwiRMbw6nnSLtJBD4ck88`;
  $('.bus-stop-location').html(`
  <img src = "${resultElement}" alt = "bus stop location ${lat}, ${lon}" height="320" width="320" >
  `);
}

let getCurrentTime = () => {
  let time = new Date();
  let hours = time.getHours() > 12 ? time.getHours() - 12 : time.getHours();
  let am_pm = time.getHours() >= 12 ? "PM" : "AM";
  hours = hours < 10 ? "0" + hours : hours;
  let minutes = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
  let seconds = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();

  time = hours + ":" + minutes + ":" + seconds + " " + am_pm;
  return time;
};

let generateRoutesData = (data) => {
  resultElement = '';
  //data.mode = 3 is bus
  data.mode[3].route.forEach(item => {
    if (!item.hasOwnProperty('route_hide')) {
      resultElement += `<option val="${item.route_id}">${item.route_name}</option>`;
    }
  });
  $('.selectpicker').append(resultElement);
  $('.selectpicker').selectpicker({});
};

let displayData = (data, display) => {
  let resultElement;
  switch (display) {

    case 'RoutesData':
      console.log("displayRoutesData: ", data);
      generateRoutesData(data);
      break;

    case 'BusStopData':

      console.log('displayBusStopData :', data);
      resultElement = '';
      data.direction[busDirection].stop.forEach(item => {
        resultElement += `
        <li class='list-group-item'
        data-lat='${item.stop_lat}'
        data-lon='${item.stop_lon}'
        data-stopid='${item.stop_id}'
        >${item.stop_name}</li>
        `;
      });
      $('.bus-stop-list').html(resultElement);
      break;

    case 'PreditionsByStopData':

      console.log('displayPreditionsByStop data: ', data);

      resultElement = '';
      //if there is not mode available for this route then display this message
      if (!data.hasOwnProperty('mode')) {

        resultElement = 'No predictions available for this bus stop at this time 1.';
        $('.bus-valid-time').html(resultElement);
        return;
      }
      //if there is data display pass
      for (let i = 0; i < data.mode[0].route.length; i++) {
        if (data.mode[0].route[i].route_id === busRouteID) {

          let currentTime = new Date();

          resultElement = `<h6>Valid as of ${getCurrentTime()}</h6>`;
          //console.log("data.mode.route", data.mode[0].route[i]);
          recursiveIteration(data.mode[0].route[i])

          $('.bus-valid-time').html(resultElement);
          break;
        } else {
          resultElement = 'No predictions available for this bus stop at this time 2.'
          $('.bus-valid-time').html(resultElement);
        }
      }
      break;

    case 'WUData':

      console.log("displayWUData: ", data);
      resultElement = "";

      resultElement = `<p
      data-forecasturl='${data.current_observation.forecast_url}'
      data-icon='${data.current_observation.icon}'
      data-iconurl='${data.current_observation.icon_url}'
      data-tempf='${data.current_observation.temp_f}'
      data-weather='${data.current_observation.weather}'>
      Current Weather: ${data.current_observation.weather} <br/>
      Current Temp:${data.current_observation.temp_f} <br/>
      </p>`;

      break;

    case 'DarkSkyData':

      console.log('DarkSkyData: ', data);
      resultElement = "";

      resultElement = `

      <div class='weather-window'
      data-icon='${data.currently.icon}>'
      data-summary='${data.currently.summary}'
      data-time='${data.currently.time}'
      data-temperature='${data.currently.temperature}'>
      <figure class="icons">
        <canvas id="${data.currently.icon}" width="32" height="32">
        </canvas>
      </figure>
      ${data.currently.temperature}&#176; in ${geoCity}<br/>
      <h6> ${data.currently.summary}</h6>
      </div>
      `;

      // if (data.currently.temperature >= 100) {
      //   //console.log('#C0392D', data.currently.temperature);
      //   $('body').css("background-color", "#C0392D");
      // } else if (data.currently.temperature >= 90 && data.currently.temperature < 100) {
      //   //console.log('#D35400', data.currently.temperature);
      //   $('body').css("background-color", "#D35400");
      // } else if (data.currently.temperature >= 80 && data.currently.temperature < 90) {
      //   //console.log('#E67E22', data.currently.temperature);
      //   $('body').css("background-color", "#E67E22");
      // } else if (data.currently.temperature >= 70 && data.currently.temperature < 80) {
      //   //console.log('#F39C12', data.currently.temperature);
      //   $('body').css("background-color", "#F39C12");
      // } else if (data.currently.temperature >= 60 && data.currently.temperature < 70) {
      //   //console.log('#F1C40F', data.currently.temperature);
      //   $('body').css("background-color", "#F1C40F");
      // } else if (data.currently.temperature >= 50 && data.currently.temperature < 60) {
      //   //console.log('#2ECC71', data.currently.temperature);
      //   $('body').css("background-color", "#2ECC71");
      // } else if (data.currently.temperature >= 40 && data.currently.temperature < 50) {
      //   //console.log('#27AE60', data.currently.temperature);
      //   $('body').css("background-color", "#27AE60");
      // } else if (data.currently.temperature >= 30 && data.currently.temperature < 40) {
      //   //console.log('#3498DB', data.currently.temperature);
      //   $('body').css("background-color", "#3498DB");
      // } else if (data.currently.temperature >= 20 && data.currently.temperature < 30) {
      //   //console.log('#2980D9', data.currently.temperature);
      //   $('body').css("background-color", "#2980D9");
      // } else if (data.currently.temperature >= 10 && data.currently.temperature < 20) {
      //   //console.log('#9B59B6', data.currently.temperature);
      //   $('body').css("background-color", "#9B59B6");
      // } else if (data.currently.temperature >= 0 && data.currently.temperature < 10) {
      //   //console.log('#8E44AD', data.currently.temperature);
      //   $('body').css("background-color", "#8E44AD");
      // } else if (data.currently.temperature >= -10 && data.currently.temperature < 0) {
      //   //console.log('#34495E', data.currently.temperature);
      //   $('body').css("background-color", "#34495E");
      // } else if (data.currently.temperature >= -20 && data.currently.temperature < -10) {
      //   //console.log('#2C3E50', data.currently.temperature);
      //   $('body').css("background-color", "#2C3E50");
      // } else {
      //   console.log('Warning:', "Please don't go outside!");
      // };

      $('.weather-message').html(resultElement);
      getSkyIcons(data.currently.icon);
      break;

    case 'GeocodingData':
      console.log('GeocodingData', data);
      geoCity = '';

      data.results[0].address_components.forEach(item => {
        if (item.types.hasOwnProperty('0')) {
          if (item.types[0] === 'locality') {
            geoCity = item.long_name;
            console.log('geoCity:', geoCity);
            return geoCity;
          }
        }
      });

      break;

    case 'StopByLocation':
      console.log('StopByLocationData:', data);
      resultElement = '';
      data.stop.forEach(item => {
        resultElement += `
        <li class='list-group-item'
        data-lat='${item.stop_lat}'
        data-lon='${item.stop_lon}'
        data-stopid='${item.stop_id}'
        data-distance='${item.distance}'
        >${item.stop_name}</li>
        `;
      });
      $('.bus-stop-list').html(resultElement);

      break;

    case 'RoutesByStop':

      //fix this
      console.log('RoutesByStopData:', data);
      data.mode[0].route.forEach(item => {
        console.log('item.route_id:', item.route_id);
        busRouteID = item.route_id;
      });

      break;
  }
};

let recursiveIteration = (object) => {
  let resultElement;
  // [5, 15, 25]
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      if (typeof object[property] == "object") {
        recursiveIteration(object[property]);
      } else {
        //found a property which is not an object, check for your conditions here
        if (property === 'pre_away') {
          minTime = (minTime === 0) ? object[property] : Math.min(object[property], minTime);
          console.log('minTime:', minTime);
          //
          resultElement = `<h3>${Math.round(minTime / 60)}</h3><h6>min<h6>`;
          $('.next-bus-predictions').html(resultElement);
        }
      }
    }
  }
};

let getBusStopID = event => {
  //  console.log(event.currentTarget);
  strLat = event.currentTarget.getAttribute('data-lat');
  strLon = event.currentTarget.getAttribute('data-lon');
  strStopID = event.currentTarget.getAttribute('data-stopid');
  MBTAQuery.stop = event.currentTarget.getAttribute('data-stopid');

  getDKDataFromApi(endPoints.DarkSky, strLat, strLon, 'DarkSkyData');
  if (toggleMode === 'routes') {
    MBTAQuery.direction = busDirection;
  } else {
    getDataFromApi(endPoints.MBTARoutesByStop, MBTAQuery, 'RoutesByStop');
  };
  geoQuery.latlng = `${strLat}, ${strLon}`;
  getDataFromApi(endPoints.gglMapsGeocode, geoQuery, 'GeocodingData');

  getDataFromApi(endPoints.MBTAPredictionsByStop, MBTAQuery, 'PreditionsByStopData');
  getMapsData(strLat, strLon);
};

let getSkyIcons = (event) => {
  let keyEvent = event.toUpperCase().replace(/-/g, '_')
  let icons = new Skycons({
    'color': 'white'
  });

  icons.set(event, Skycons[keyEvent]);
  icons.play();
};

let getBusDirection = event => {
  //console.log(event);
  MBTAQuery.route = $('select').val();
  busRouteID = $('select').val();
  busDirection = $('input:checked').val();

  getDataFromApi(endPoints.MBTABusStop, MBTAQuery, 'BusStopData');
};

let getClearMSG = (options) => {
  switch (options) {
    case 'all':
      $('.bus-stop-list, .bus-valid-time, .next-bus-predictions, .weather-message, .bus-stop-location').html("");
      break;
    case 'msg-only':
      $('.bus-valid-time, .next-bus-predictions, .weather-message, .bus-stop-location').html("");
      break;
  }
};

let getLocation = () => {
  hideShow([], ['.by-location-opts']);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    $('.bus-valid-time').html("Geolocation is not supported by this browser.");
  }
};

let showPosition = (position) => {
  strLat = position.coords.latitude;
  strLon = position.coords.longitude;
  MBTAQuery.lat = position.coords.latitude;
  MBTAQuery.lon = position.coords.longitude;

  getDataFromApi(endPoints.MBTAStopsByLocation, MBTAQuery, 'StopByLocation');
  hideShow(['.by-location-opts'], ['.cd-container']);
  MBTAQuery = {};
  $('.find-bus-by-route').css('pointer-events', 'auto');
};

let hideShow = (toHide = [], toShow = []) => {
  toHide.forEach(function(item, indx) {
    $(item).hide()
  });
  toShow.forEach(function(item, indx) {
    $(item).show()
  });
};

let createEventListeners = () => {

  $('.find-bus-by-location').on('click', (event) => {
    toggleMode = 'nearby';
    $('.find-bus-by-route').css('pointer-events', 'none');
    getClearMSG('all');
    hideShow(['.by-route-opts', '.cd-container'], []);
    getLocation();
  });

  $('.find-bus-by-route').on('click', (event) => {
    toggleMode = 'routes';
    getClearMSG('all');
    hideShow(['.by-location-opts', '.cd-container'], ['.by-route-opts'])
  });

  $('.bus-stop-list').on('click', 'li', (event) => {
    if ($(event.currentTarget).hasClass('selected-stop')) {
      $(event.currentTarget).closest('li').siblings().show();
      $('li.selected-stop ').removeClass('selected-stop');
      getClearMSG('msg-only');
      hideShow(['.bus-message', '#weather-info', '#map-info'], []);
      return;
    }
    getClearMSG('msg-only');
    getBusStopID(event);

    $('li.selected-stop ').removeClass('selected-stop ');
    $(event.currentTarget).addClass('selected-stop ');
    $(event.currentTarget).closest('li').siblings().hide();
    hideShow([], ['.bus-message', '#weather-info', '#map-info']);
    minTime = 0;
    MBTAQuery = {};
  });

  $('.selectpicker, input[type="radio"]').on('change', (event) => {
    getClearMSG('all');
    getBusDirection(event);
    hideShow([], ['.cd-container']);
  });

};

const renderApp = () => {
  hideShow(['.by-location-opts', '.by-route-opts', '.cd-container', '.bus-message', '#weather-info', '#map-info'], [])
  getDataFromApi(endPoints.MBTARoutes, MBTAQuery, 'RoutesData');
  createEventListeners();
};

$(document).ready(renderApp);
