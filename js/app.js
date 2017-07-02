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
  MBTAStopsByLocation: 'https://realtime.mbta.com/developer/api/v2/stopsbylocation', //?api_key=wX9NwuHnZU2ToO7GmGR9uw&lat=42.352913&lon=-71.064648&format=json
  MBTARoutesByStop: 'http://realtime.mbta.com/developer/api/v2/routesbystop', //?api_key=wX9NwuHnZU2ToO7GmGR9uw&stop=1425&format=json
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
let toggleMode;

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
  console.log('query:', query);
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
          //console.log("data.mode.route", data.mode[0].route[i]);
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

    case 'StopByLocation':
      console.log('StopByLocationData:', data);
      resultElement = '';
      data.stop.forEach(item => {
        resultElement += `
        <div class="cd-timeline-block">
        <div class="cd-timeline-content">

        <h6>
        <li
        data-lat='${item.stop_lat}'
        data-lon='${item.stop_lon}'
        data-stopid='${item.stop_id}'
        data-distance='${item.distance}'
        >${item.stop_name}</li></h6>

        </div> <!-- cd-timeline-content -->
        </div>
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
          //console.log("Next Bus in: ", (object[property] / 60));

          minTime = (minTime === 0) ? object[property] : Math.min(object[property], minTime);
          console.log('minTime:', minTime);
          //
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
  //change to work only when find by route to pass busDirection
  //console.log('toggleMode:', toggleMode);
  if (toggleMode === 'routes') {
    MBTAQuery.direction = busDirection;
  } else {
    //console.log('busRouteID:', busRouteID);
    getDataFromApi(endPoints.MBTARoutesByStop, MBTAQuery, 'RoutesByStop');
  };

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

let getLocation = () => {
  hideShow([], ['.by-location-opts']);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    $('.bus-message').html("Geolocation is not supported by this browser.");
  }


};

let showPosition = (position) => {
  //console.log('position:', position);
  strLat = position.coords.latitude;
  strLon = position.coords.longitude;
  MBTAQuery.lat = position.coords.latitude;
  MBTAQuery.lon = position.coords.longitude;
  // console.log('user coords:', `Latitude: ${strLat} <br>Longitude: ${strLon}`);
  //$('.bus-message').html(`Latitude: ${strLat} <br>Longitude: ${strLon}`);
  // x.innerHTML = "Latitude: " + position.coords.latitude +
  //   "<br>Longitude: " + position.coords.longitude;
  getDataFromApi(endPoints.MBTAStopsByLocation, MBTAQuery, 'StopByLocation');
  hideShow(['.by-location-opts'], ['.cd-container']);
  MBTAQuery = {};
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
    getClearMSG('all');
    hideShow(['.by-route-opts', '.cd-container'], []);

    getLocation();

  })

  $('.find-bus-by-route').on('click', (event) => {
    toggleMode = 'routes';
    getClearMSG('all');
    hideShow(['.by-location-opts', '.cd-container'], ['.by-route-opts'])

  });

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
    getBusDirection(event);
    hideShow([], ['.cd-container']);
  });

};

const renderApp = () => {
  hideShow(['.by-location-opts', '.by-route-opts', '.cd-container'])
  getDataFromApi(endPoints.MBTARoutes, MBTAQuery, 'RoutesData');
  createEventListeners();
};

$(document).ready(renderApp);
