//06-02-2017
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
let WUEndPoint = 'http://api.wunderground.com/api/281d8cd199da64f2/conditions/q/'; //q/42.370772,-71.076536.json

let MBTAApiKey = '1VI-9UmYpE64qhHFmhr1ew';
let WUApiKey = '682f91fd7c03e86f';

let busRouteID;
let strLat;
let strLon;
let strStopID;

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
  direction: 0,
  format: 'json'
};

let getDataFromApi = (searchTerm, query, callback) => {
  // console.log(searchTerm);
  // console.log(query);
  // console.log(callback);
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

  data.mode[3].route.forEach(item => {
    if (!item.hasOwnProperty('route_hide')) {
      resultElement += `<option value = "${item.route_id}"> ${item.route_name} </option>`;
    }
  });

  $('.bus-list').append(resultElement);
}

let displayBusStopData = data => {
  console.log(data);
  let resultElement;
  //add the stop id for the other mbta query
  data.direction[0].stop.forEach(item => {
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
  console.log(data);
  //
  recursiveIteration(data)
};
//this is caling the wrong bus prediction but it is close
let recursiveIteration = (object) => {
  let resultElement;
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      if (typeof object[property] == "object") {
        recursiveIteration(object[property]);
      } else {
        //found a property which is not an object, check for your conditions here
        if (property === 'pre_away') {
          console.log("Next Bus in: ", (object[property] / 60));
          resultElement = `Next Bus in: ${Math.round(object[property] / 60)} min`;

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

$('.bus-list').on('change', (event) => {
  MBTABusStopQuery.route = event.currentTarget.value;
  busRouteID = event.currentTarget.value;
  getDataFromApi(MBTABusStopEndPoint, MBTABusStopQuery, displayBusStopData);
})

function watchSubmit() {
  getDataFromApi(MBTARoutesEndPoint, MBTARoutesQuery, displayRoutesData);
}

$(watchSubmit());
