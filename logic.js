// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
//     "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-10-01&endtime=" +
//   "2018-10-07&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place, time and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Location: " + feature.properties.place +
      "</h3><hr><p>Time: " + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 5 * feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        weight: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions)
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Create a getColor function for fillColor and legend
function getColor(color) {
  return color <= 1 ? '#25E500' :
    color <= 2 ? '#6FDD00' :
    color <= 3 ? '#B4D500' :
    color <= 4 ? '#CEA800' :
    color <= 5 ? '#C65E00' :
    '#BF1900' ;
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: "pk.eyJ1Ijoia2VubnlqYWkiLCJhIjoiY2ptc2kxNjR2MmJ3ODN3bGI1czR5cGVjcyJ9.VlEu3ZoNoFMY6JJfpSr6NA"
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: "pk.eyJ1Ijoia2VubnlqYWkiLCJhIjoiY2ptc2kxNjR2MmJ3ODN3bGI1czR5cGVjcyJ9.VlEu3ZoNoFMY6JJfpSr6NA"
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: "pk.eyJ1Ijoia2VubnlqYWkiLCJhIjoiY2ptc2kxNjR2MmJ3ODN3bGI1czR5cGVjcyJ9.VlEu3ZoNoFMY6JJfpSr6NA"
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend'),
      levels = [0, 1, 2, 3, 4, 5],
      labels = [];
  
      // loop through magnitude ranges to generate legend
      for (var i = 0; i < levels.length; i++) {
          div.innerHTML +=
          labels.push(
            '<i style="background:' + getColor(levels[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp&nbsp</i> ' + 
            levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+'));
    }
    div.innerHTML = '<h3>Magnitudes</h3><br>' + labels.join('<br>');

    return div;

  };

  // Adding legend to the map
  legend.addTo(myMap);
}
