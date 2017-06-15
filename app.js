//06-13-2017
//make it responsible design
//get all routes
//`http://realtime.mbta.com/developer/api/v2/routes?api_key=${MBTAApiKey}&format=json`

//get google maps location of that specific bus by changing the lat and loc of the link below;
//http://maps.googleapis.com/maps/api/staticmap?center=42.370772,-71.076536&markers=42.370772,-71.076536&zoom=15&size=320x320&sensor=false

//http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json

//wunderground
//http://api.wunderground.com/api/281d8cd199da64f2/conditions/q/42.370772,-71.076536.json

//http://realtime.mbta.com/developer/api/v2/predictionsbystop
//?api_key=wX9NwuHnZU2ToO7GmGR9uw
//&stop=1425
//&format=json

let MBTARoutesEndPoint = 'http://realtime.mbta.com/developer/api/v2/routes';
let MBTABusStopEndPoint = 'http://realtime.mbta.com/developer/api/v2/stopsbyroute'; //?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json
let MBTAPredictionsByStopEndPoint = 'http://realtime.mbta.com/developer/api/v2/predictionsbystop'; //?api_key=wX9NwuHnZU2ToO7GmGR9uw&stop=1425&format=json
let WUEndPoint = 'http://api.wunderground.com/api/682f91fd7c03e86f/conditions/q/'; //q/42.370772,-71.076536.json

let MBTAApiKey = '1VI-9UmYpE64qhHFmhr1ew';
let WUApiKey = '682f91fd7c03e86f';

let busRouteID;
let strLat;
let strLon;
let strStopID;
let busDirection = 0;

let minTime = 0;

let MBTARoutesQuery = {
  api_key: MBTAApiKey,
  format: 'json'
};

let MBTABusStopQuery = {
  api_key: MBTAApiKey,
  route: busRouteID,
  format: 'json'
};

let MBtAPreditionsByStopQuery = {
  api_key: MBTAApiKey,
  stop: strStopID,
  direction: busDirection,

  format: 'json'
};

let getDataFromApi = (searchTerm, query, callback) => {
  $.getJSON(searchTerm, query, callback);
}

let getWUDataFromApi = (searchTerm, lat, lon, callback) => {
  $.ajax({
      url: `${searchTerm}${lat},${lon}.json`,
      method: 'GET'
    })
    .done(function(data) {
      //console.log(data.current_observation);
      let resultElement;

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

      $('.weather-info').html(resultElement)
    });
};

let displayRoutesData = data => {
  // console.log(data);
  // console.log(data.mode[3]);
  let resultElement;
  console.log("data.mode:", data.mode);
  //data.mode = 3 is bus
  data.mode[3].route.forEach(item => {
    if (!item.hasOwnProperty('route_hide')) {
      resultElement += `<option value = "${item.route_id}"> ${item.route_name} </option>`;
    }
  });

  $('.bus-list').append(resultElement);
}

let displayBusStopData = data => {
  console.log(data);
  let resultElement = '';
  //add the stop id for the other mbta query
  console.log(busDirection);
  console.log(data.direction);
  data.direction[busDirection].stop.forEach(item => {
    resultElement += `<li
    data-lat='${item.stop_lat}'
    data-lon='${item.stop_lon}'
    data-stopid='${item.stop_id}'
    >${item.stop_name}</li>`;
  });
  $('.bus-stop-list').html(resultElement);
};

let displayWUData = data => {
  console.log(data);
};

let displayPreditionsByStopData = data => {
  // console.log(data.mode[0].route);
  // console.log("RouteID", busRouteID);
  console.log('data: ', data);
  //console.log("dirction: ", data.mode[0].route[0]);
  //console.log('busRouteID: ', busRouteID);
  let resultElement;
  //if there is not mode available for this route then display this message
  if (!data.hasOwnProperty('mode')) {
    console.log('no predictions available for this bus stop at this time 1.');
    resultElement = 'No predictions available for this bus stop at this time 1.';
    $('.bus-message').html(resultElement);
    return;
  }
  //if there is data display pass

  for (let i = 0; i < data.mode[busDirection].route.length; i++) {
    if (data.mode[busDirection].route[i].route_id === busRouteID) {

      let currentTime = new Date();
      console.log(`Valid as of ${currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds()}`);

      resultElement = `Valid as of ${currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds()}`;
      recursiveIteration(data.mode[busDirection].route[i])

      $('.bus-message').html(resultElement);
      break;
    } else {
      console.log('No predictions available for this bus stop at this time 2.');
      resultElement = 'No predictions available for this bus stop at this time 2.'
      $('.bus-message').html(resultElement);
    }
  }


};

let recursiveIteration = (object, routeid = -1, stopid = -1) => {
  let resultElement;
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      if (typeof object[property] == "object") {
        recursiveIteration(object[property]);
      } else {
        //found a property which is not an object, check for your conditions here
        if (property === 'pre_away') {

          console.log("Next Bus in: ", (object[property] / 60));
          //math min is not working because is selecting the mintime but for all the buses available
          minTime = (minTime === 0) ? object[property] : Math.min(object[property], minTime);

          //resultElement = `Next Bus in: ${Math.round(object[property] / 60)} min`;
          resultElement = `Next Bus in: ${Math.round(minTime / 60)} min`;

          $('.next-bus-predictions').html(resultElement)
        }

      }
    }
  }
}


$('.bus-stop-list').on('click', 'li', (event) => {
  console.log(event.currentTarget);
  strLat = event.currentTarget.getAttribute('data-lat');
  strLon = event.currentTarget.getAttribute('data-lon');
  strStopID = event.currentTarget.getAttribute('data-stopid');
  MBtAPreditionsByStopQuery.stop = event.currentTarget.getAttribute('data-stopid');

  getWUDataFromApi(WUEndPoint, strLat, strLon, displayWUData);
  getDataFromApi(MBTAPredictionsByStopEndPoint, MBtAPreditionsByStopQuery, displayPreditionsByStopData);
});

$('.bus-list, input[type="radio"]').on('change', (event) => {
  console.log(event);


  // MBTABusStopQuery.route = event.currentTarget.value;
  MBTABusStopQuery.route = $('select').val();
  busRouteID = $('select').val();
  busDirection = $('input:checked').val();


  getDataFromApi(MBTABusStopEndPoint, MBTABusStopQuery, displayBusStopData);
})

function watchSubmit() {
  getDataFromApi(MBTARoutesEndPoint, MBTARoutesQuery, displayRoutesData);
}

$(watchSubmit());
