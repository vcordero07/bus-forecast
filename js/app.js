//06-23-2017
//
const apiKeys = {
  MBTA: '1VI-9UmYpE64qhHFmhr1ew',
  WeatherUnderground: '682f91fd7c03e86f',
  DarkSky: '93ee5f3d7542687660862c09d91dbb09',
};

const endPoints = {
  MBTARoutes: 'https://realtime.mbta.com/developer/api/v2/routes',
  MBTABusStop: 'https://realtime.mbta.com/developer/api/v2/stopsbyroute',
  MBTAPredictionsByStop: 'https://realtime.mbta.com/developer/api/v2/predictionsbystop',
  WeatherUnderground: `https://api.wunderground.com/api/${apiKeys.WeatherUnderground}/conditions/q/`,
  DarkSky: `https://api.darksky.net/forecast/${apiKeys.DarkSky}/`,
  // gglMaps: `http://maps.googleapis.com/maps/api/staticmap/`,
};

let busRouteID;
let strLat;
let strLon;
let strStopID;
let busDirection = 0;
let minTime = 0;

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

let getDataFromApi = (searchTerm, query, callback) => {
  query.api_key = apiKeys.MBTA;
  query.format = 'json';
  $.getJSON(searchTerm, query, function(data) {
      displayData(data, callback);
    })
    .fail(function(data) {
      console.log('error data:', data);
      if (data.status === 404) {
        $('.bus-message').html(`${data.responseText}`);
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
  //center=${strLat},${strLon}&markers={strLat},${strLon}&zoom=15&size=320x320&sensor=false
  //make this just an url with the dynamic lat and lon
  let resultElement = `http://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&markers=${lat},${lon}&zoom=15&size=320x320&sensor=false`;

  $('.bus-stop-location').html(`
  <img src = "${resultElement}" alt = "bus stop location" height="320" width="320" >
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

let displayData = (data, display) => {
  let resultElement;
  switch (display) {

    case 'RoutesData':

      console.log("displayRoutesData: ", data);
      resultElement = '';
      //data.mode = 3 is bus
      data.mode[3].route.forEach(item => {
        if (!item.hasOwnProperty('route_hide')) {
          resultElement += `<option val="${item.route_id}">${item.route_name}</option>`;
        }
      });
      $('.selectpicker').append(resultElement);
      // $('.selectpicker').selectpicker('render');
      $('.selectpicker').selectpicker({
        // style: 'btn-selector',
      });

      break;

    case 'BusStopData':

      console.log('displayBusStopData :', data);
      resultElement = '';
      data.direction[busDirection].stop.forEach(item => {
        resultElement += `
        <div class="cd-timeline-block">
        <div class="cd-timeline-content">

        <h6>
        <li
        data-lat='${item.stop_lat}'
        data-lon='${item.stop_lon}'
        data-stopid='${item.stop_id}'
        >${item.stop_name}</li></h6>

        </div> <!-- cd-timeline-content -->
        </div>
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
        $('.bus-message').html(resultElement);
        return;
      }
      //if there is data display pass
      for (let i = 0; i < data.mode[0].route.length; i++) {
        if (data.mode[0].route[i].route_id === busRouteID) {

          let currentTime = new Date();

          resultElement = `Valid as of ${getCurrentTime()}`;
          // console.log("data.mode.route", data.mode[0].route[i]);
          recursiveIteration(data.mode[0].route[i])

          $('.bus-message').html(resultElement);
          break;
        } else {
          resultElement = 'No predictions available for this bus stop at this time 2.'
          $('.bus-message').html(resultElement);
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
      <div data-icon='${data.currently.icon}>'
      data-summary='${data.currently.summary}'
      data-time='${data.currently.time}'
      data-temperature='${data.currently.temperature}'>
      Current Weather: ${data.currently.summary} <br/>
      Current Temp: ${data.currently.temperature} <br/>
      </div>

      <figure class="icons">
        <canvas id="${data.currently.icon}" width="64" height="64">
        </canvas>
      </figure>

      `;

      $('.weather-message').html(resultElement);
      getSkyIcons(data.currently.icon);
      break;

    case 'MapsData':
      console.log('MapsData', data);


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
          //console.log("Next Bus in: ", (object[property] / 60));
          //math min is not working because is selecting the mintime but for all the buses available
          minTime = (minTime === 0) ? object[property] : Math.min(object[property], minTime);
          console.log('minTime:', minTime);
          //resultElement = `Next Bus in: ${Math.round(object[property] / 60)} min`;
          resultElement = `Next Bus in: ${Math.round(minTime / 60)} min`;

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

  //getWUDataFromApi(endPoints.WeatherUnderground, strLat, strLon, 'WUData');
  getDKDataFromApi(endPoints.DarkSky, strLat, strLon, 'DarkSkyData');
  MBTAQuery.direction = busDirection;
  getDataFromApi(endPoints.MBTAPredictionsByStop, MBTAQuery, 'PreditionsByStopData');

  getMapsData(strLat, strLon);
};

let getSkyIcons = (event) => {
  let keyEvent = event.toUpperCase().replace(/-/g, '_')
  let icons = new Skycons();

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
      $('.bus-stop-list, .bus-message, .next-bus-predictions, .weather-message, .bus-stop-location').html("");
      break;
    case 'msg-only':
      $('.bus-message, .next-bus-predictions, .weather-message, .bus-stop-location').html("");
      break;
  }
};

let createEventListeners = () => {
  $('.bus-stop-list').on('click', 'li', (event) => {
    getClearMSG('msg-only');
    getBusStopID(event);

    $('li.selected').removeClass('selected');
    $(event.currentTarget).addClass('selected');

    $(event.currentTarget).closest('.cd-timeline-block').siblings().hide();
    $(event.currentTarget).closest('.cd-timeline-block').prepend(`
      <div class="cd-timeline-block">
      <div class="cd-timeline-content">

      <h6>
      <li>Back</li><br><br></h6>

      </div> <!-- cd-timeline-content -->
      </div>
      `);
    minTime = 0;
    MBTAQuery = {};
  });

  $('.selectpicker, input[type="radio"]').on('change', (event) => {
    getClearMSG('all');
    $('#bus-info').show();
    getBusDirection(event);
  });
};

const renderApp = () => {
  $('#bus-info').hide();
  getDataFromApi(endPoints.MBTARoutes, MBTAQuery, 'RoutesData');
  createEventListeners();
};

$(document).ready(renderApp);
