// Creating map object
var myMap = L.map("map", {
  center: [37.0902, -95.7129],
  zoom: 5
})

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/light-v10',
  accessToken: API_KEY
}).addTo(myMap)

// URL for all earthquakes in the past week from USGS
var USGS = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//convert millseconds since epoch to add date time to popups
var parse = d3.timeParse("%Q"); 

//used below to get the size of the circles based on the magnitude
function circleSize(mag) {
  return mag * 30000; // size of circles was a pain in the neck
}

//used below to get the color of the circles based on the magnitude (and legend)
//this website was cool and useful https://colorbrewer2.org/
function circleColor(mag) {
  return mag > 5 ? '#bd0026' :
         mag > 4 ? '#f03b20' :
         mag > 3 ? '#fd8d3c' :
         mag > 2 ? '#feb24c' :
         mag > 1 ? '#fed976' :
         mag > 0 ? '#ffffb2' :
                   '#FFEDA0' ;
}

// add markers (circles) to map whith size and color based on magnitude
// add popup with magnitude, location, and date/time (I thought date/time was cool with the conversion)
d3.json(USGS).then (function(data) {
  //console.log(data);
  for (var i = 0; i < data.features.length; i++) {
  L.circle([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]], {
    fillOpacity: 0.75,
    stroke: true,
    weight: 0.2,
    fillColor: circleColor(data.features[i].properties.mag),
    radius: circleSize(data.features[i].properties.mag),
}).bindPopup("<center><h3>" + data.features[i].properties.title + "</h3><hr><h3><center>" + parse(data.features[i].properties.time) +"</center></h3>").addTo(myMap);
  }; 
})

//create legend (color and legend adjusted from here: https://leafletjs.com/examples/choropleth/)
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];
        
    // loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + circleColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};
legend.addTo(myMap);