//06-02-2017
//make it responsible design

let MBTARoutesEndPoint = 'http://realtime.mbta.com/developer/api/v2/routes';
let MBTABusStopEndPoint = 'http://realtime.mbta.com/developer/api/v2/stopsbyroute'; //?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json
let WUEndPoint = '';

// let MBTAApiKey = '1VI-9UmYpE64qhHFmhr1ew';//wX9NwuHnZU2ToO7GmGR9uw
let MBTAApiKey = 'wX9NwuHnZU2ToO7GmGR9uw';
let WUApiKey = '682f91fd7c03e86f';

//get all routes
//`http://realtime.mbta.com/developer/api/v2/routes?api_key=${MBTAApiKey}&format=json`


//get google maps location of that specific bus by changing the lat and loc of the link below;
//http://maps.googleapis.com/maps/api/staticmap?center=42.370772,-71.076536&markers=42.370772,-71.076536&zoom=15&size=320x320&sensor=false


let busRoute;

let MBTARoutesQuery = {
  api_key: MBTAApiKey,
  format: 'json',

};

let MBTABusStopQuery = {
  api_key: MBTAApiKey,
  route: busRoute,
  format: 'json',

};

//have to remove the & from the api_key to work
let getDataFromApi = (searchTerm, query callback) => {
  $.getJSON(searchTerm, query, callback);
}

let displayRoutesData = data => {

  console.log(data);
  console.log(data.mode[3]);
  // console.log(data.mode[3].mode_name);
  let resultElement;

  // <option value = "Value1"> Text1 </option>
  // <option value = "Value2"> Text2 </option>
  // <option value = "Value3"> Text3 </option>
  data.mode[3].route.forEach(item => {
    //console.log(item);
    // if (item.route_hide === false) {
    if (!item.hasOwnProperty('route_hide')) {
      resultElement += `<option value = "${item.route_id}"> ${item.route_name} </option>`;
    }
  });

  $('.bus-list').append(resultElement);
}

let displayBusStopData = data => {
  console.log('test');
};

$('.bus-list').on('change', (event) => {
  //console.log(event.currentTarget.value);
  busRoute = event.currentTarget.value;
  getDataFromApi(MBTABusStopEndPoint, MBTABusStopQuery, displayBusStopData);
})


//http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=69&format=json

function watchSubmit() {
  getDataFromApi(MBTARoutesEndPoint, MBTARoutesQuery, displayRoutesData);
}

$(watchSubmit());
