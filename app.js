//06-19-2017

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

let getDataFromApi = (searchTerm, query, callback) => {
  query.api_key = apiKeys.MBTA;
  query.format = 'json';
  $.getJSON(searchTerm, query, function(data) {
    displayData(data, callback);
  });
}

let getWUDataFromApi = (searchTerm, lat, lon, callback) => {
  $.ajax({
      url: `${searchTerm}${lat},${lon}.json`,
      method: 'GET'
    })
    .done(function(data) {
      displayData(data, callback);
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
    });
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
          resultElement += `<option value = "${item.route_id}"> ${item.route_name} </option>`;
        }
      });

      $('.bus-list').append(resultElement);
      break;

    case 'BusStopData':

      console.log('displayBusStopData :', data);
      resultElement = '';
      data.direction[busDirection].stop.forEach(item => {
        resultElement += `<li
        data-lat='${item.stop_lat}'
        data-lon='${item.stop_lon}'
        data-stopid='${item.stop_id}'
        >${item.stop_name}</li>`;
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

          resultElement = `Valid as of ${currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds()}`;
          recursiveIteration(data.mode[0].route[i])

          $('.bus-message').html(resultElement);
          break;
        } else {
          resultElement = 'No predictions available for this bus stop at this time 2.'
          $('.bus-message').html(resultElement);
        }
      }
      break;
      // default:
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
      //data.current_observation.forecast_url
      //data.current_observation.icon
      //data.current_observation.icon_url
      //data.current_observation.temp_f
      //data.current_observation.weather

      //  $('.weather-message').html(resultElement)

      break;

    case 'DarkSkyData':

      console.log('DarkSkyData: ', data);

      resultElement = "";
      console.log(data.currently.icon);
      resultElement = `<figure class="icons">
        <canvas id="${data.currently.icon}" width="64" height="64">
        </canvas>
      </figure>`;



      $('.weather-message').html(resultElement);
      console.log('test darksky');
      break;
  }
};

let recursiveIteration = (object) => {
  let resultElement;
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

          //resultElement = `Next Bus in: ${Math.round(object[property] / 60)} min`;
          resultElement = `Next Bus in: ${Math.round(minTime / 60)} min`;

          $('.next-bus-predictions').html(resultElement)
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

  getWUDataFromApi(endPoints.WeatherUnderground, strLat, strLon, 'WUData');
  getDKDataFromApi(endPoints.DarkSky, strLat, strLon, 'DarkSkyData');
  MBTAQuery.direction = busDirection;
  getDataFromApi(endPoints.MBTAPredictionsByStop, MBTAQuery, 'PreditionsByStopData');
};

let getSkyIcons = (event) => {

  let icons = new Skycons();
  switch (event) {
    case 'clear-day':
      icons.set(event, Skycons.CLEAR_DAY);
      break;
    case 'clear-night':
      icons.set(event, Skycons.CLEAR_NIGHT);
      break;
    case 'partly-cloudy-day':
      icons.set(event, Skycons.PARTLY_CLOUDY_DAY);
      break;
    case 'partly-cloudy-night':
      icons.set(event, Skycons.PARTLY_CLOUDY_NIGHT);
      break;
    case 'cloudy':
      icons.set(event, Skycons.CLOUDY);
      break;
    case 'rain':
      icons.set(event, Skycons.RAIN);
      break;
    case 'sleet':
      icons.set(event, Skycons.SLEET);
      break;
    case 'snow':
      icons.set(event, Skycons.SNOW);
      break;
    case 'wind':
      icons.set(event, Skycons.WIND);
      break;
    case 'fog':
      icons.set(event, Skycons.FOG);
      break;
  }

  icons.play();
};

let getBusDirection = event => {
  //console.log(event);
  MBTAQuery.route = $('select').val();
  busRouteID = $('select').val();
  busDirection = $('input:checked').val();

  getDataFromApi(endPoints.MBTABusStop, MBTAQuery, 'BusStopData');
};

let getClearMSG = () => {
  $('.bus-stop-list, .bus-message, .next-bus-predictions, .weather-message ').html("");
};

let createEventListeners = () => {
  $('.bus-stop-list').on('click', 'li', (event) => {
    getBusStopID(event);
  });
  $('.bus-list, input[type="radio"]').on('change', (event) => {
    getClearMSG();
    getBusDirection(event);
  });

  $('.icons').on('change', (event) => {
    getSkyIcons();
  });
};

const renderApp = () => {
  getDataFromApi(endPoints.MBTARoutes, MBTAQuery, 'RoutesData');
  createEventListeners();
};

$(renderApp());
