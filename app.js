//06-02-2017
//make it responsible design
//get all routes
//`http://realtime.mbta.com/developer/api/v2/routes?api_key=${MBTAApiKey}&format=json`

//get google maps location of that specific bus by changing the lat and loc of the link below;
//http://maps.googleapis.com/maps/api/staticmap?center=42.370772,-71.076536&markers=42.370772,-71.076536&zoom=15&size=320x320&sensor=false

//http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json


let MBTARoutesEndPoint = 'http://realtime.mbta.com/developer/api/v2/routes';
let MBTABusStopEndPoint = 'http://realtime.mbta.com/developer/api/v2/stopsbyroute'; //?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json
let WUEndPoint = '';

// let MBTAApiKey = '1VI-9UmYpE64qhHFmhr1ew';//wX9NwuHnZU2ToO7GmGR9uw
let MBTAApiKey = 'wX9NwuHnZU2ToO7GmGR9uw';
let WUApiKey = '682f91fd7c03e86f';

let busRoute;

let MBTARoutesQuery = {
  api_key: MBTAApiKey,
  format: 'json'
};

let MBTABusStop1000Query = {
  api_key: MBTAApiKey,
  route: '69',
  format: 'jsonp'
};

let getDataFromApi = (searchTerm, query, callback) => {
  console.log(searchTerm);
  console.log(query);
  console.log(callback);
  $.getJSON(searchTerm, query, callback);
}
//
// function getDataFromApi(searchTerm, query, callback) {
//
// }

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
  //console.log(data.direction[0].stop);
  data.direction[0].stop.forEach(item => {
    resultElement += ``;
  });
  $('.bus-stop-list').append(resultElement);
};




$('.bus-list').on('change', (event) => {
  busRoute = event.currentTarget.value;
  console.log(busRoute);
  getDataFromApi(MBTABusStopEndPoint, MBTABusStop1000Query, displayBusStopData);
})

function watchSubmit() {
  getDataFromApi(MBTARoutesEndPoint, MBTARoutesQuery, displayRoutesData);
}

$(watchSubmit());
