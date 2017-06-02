//06-01-2017
//make it responsible design

let MBTAEndPoint = 'http://realtime.mbta.com/developer/api/v2/routes?';
let WUEndPoint = '';

// let MBTAApiKey = '1VI-9UmYpE64qhHFmhr1ew';//wX9NwuHnZU2ToO7GmGR9uw
let MBTAApiKey = 'wX9NwuHnZU2ToO7GmGR9uw';
let WUApiKey = '682f91fd7c03e86f';

//get all routes
//`http://realtime.mbta.com/developer/api/v2/routes?api_key=${MBTAApiKey}&format=json`


//get google maps location of that specific bus by changing the lat and loc of the link below;
//http://maps.googleapis.com/maps/api/staticmap?center=42.370772,-71.076536&markers=42.370772,-71.076536&zoom=15&size=320x320&sensor=false
let query = {
  api_key: MBTAApiKey,
  format: 'json',

}
//have to remove the & from the api_key to work
let getDataFromApi = (searchTerm, callback) => {
  $.getJSON(MBTAEndPoint, query, callback);
}

let displayData = data => {

  console.log(data);

}

function watchSubmit() {
  getDataFromApi(query, displayData);
}

$(watchSubmit());
