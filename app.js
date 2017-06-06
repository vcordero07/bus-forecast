//06-02-2017
//make it responsible design
//get all routes
//`http://realtime.mbta.com/developer/api/v2/routes?api_key=${MBTAApiKey}&format=json`

//get google maps location of that specific bus by changing the lat and loc of the link below;
//http://maps.googleapis.com/maps/api/staticmap?center=42.370772,-71.076536&markers=42.370772,-71.076536&zoom=15&size=320x320&sensor=false

//http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json

//wunderground
//http://api.wunderground.com/api/281d8cd199da64f2/conditions/q/42.370772,-71.076536.json


let MBTARoutesEndPoint = 'http://realtime.mbta.com/developer/api/v2/routes';
let MBTABusStopEndPoint = 'http://realtime.mbta.com/developer/api/v2/stopsbyroute'; //?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json
let WUEndPoint = 'http://api.wunderground.com/api/281d8cd199da64f2/conditions/q/'; //q/42.370772,-71.076536.json

// let MBTAApiKey = '1VI-9UmYpE64qhHFmhr1ew';//wX9NwuHnZU2ToO7GmGR9uw
let MBTAApiKey = 'wX9NwuHnZU2ToO7GmGR9uw';
let WUApiKey = '682f91fd7c03e86f';

let busRoute;
let strLat;
let strLon;

let MBTARoutesQuery = {
  api_key: MBTAApiKey,
  format: 'json'
};

let MBTABusStopQuery = {
  api_key: MBTAApiKey,
  route: busRoute,
  format: 'json'
};

// let WUConditionsQuery = {
//
//   format: 'json',
// };

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
      console.log(data);
    });
};

let displayRoutesData = data => {

  console.log(data);
  console.log(data.mode[3]);
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
  //console.log('test');

  let resultElement;
  //add the stop id for the other mbta query
  data.direction[0].stop.forEach(item => {
    resultElement += `<li data-lat='${item.stop_lat}' data-lon='${item.stop_lon}'>${item.stop_name}</li>`;
  });
  $('.bus-stop-list').html(resultElement);
};

let displayWUData = data => {
  console.log(data);
};

$('.bus-stop-list').on('click', 'li', (event) => {
  console.log(event.currentTarget);
  strLat = event.currentTarget.getAttribute('data-lat');
  strLon = event.currentTarget.getAttribute('data-lon');
  getWUDataFromApi(WUEndPoint, strLat, strLon, displayWUData);
});



$('.bus-list').on('change', (event) => {
  //busRoute = event.currentTarget.value;
  MBTABusStopQuery.route = event.currentTarget.value;
  //console.log(busRoute);
  getDataFromApi(MBTABusStopEndPoint, MBTABusStopQuery, displayBusStopData);
})

function watchSubmit() {
  getDataFromApi(MBTARoutesEndPoint, MBTARoutesQuery, displayRoutesData);
}

$(watchSubmit());
