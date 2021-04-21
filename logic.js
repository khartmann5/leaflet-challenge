// Store API query variables
const baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grab the data with d3
d3.json(baseURL).then(data => {

  // console.log(data);
  // console.log(d3.extent(data.features.map(d => d.geometry.coordinates)))
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// create a function to choose a different color based on depth of earthquake
function chooseColor(depth){
  switch (true){
    case depth < 10: return "#c7ea46";
    case depth < 30: return "#fce205";
    case depth < 50: return "#ffbf00";
    case depth < 70: return "#fda50f";
    case depth < 90: return "#f64a8a";
    case depth > 90: return "#b90f0a";
  };
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the earthquake

  function onEachFeature(feature, layer) {
      layer.bindPopup(`<p> Magnitude: ${feature.properties.mag}</p><p> Depth: ${feature.geometry.coordinates[2]}</p><p> Location: ${feature.properties.place}</p>`);
    }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  const mags = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        radius: feature.properties.mag*100000,
        // change the fillColor to change with the depth
        // fillColor: "red",
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        stroke: true,
        weight: 0.5 
      });
    }
  });

  // Tectonic plates overlayMap
  var faultline = new L.layerGroup();

  var faultlineurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(faultlineurl).then(tectonic_data => {

    console.log(tectonic_data)});

    d3.json(faultlineurl).then( data => {
      L.geoJSON(data, {
        style: {color: "orange"}
      }).addTo(faultline)
    })
    .catch(function (e) {
      console.log(e);
    });

  // Sending our earthquakes layer to the createMap function
  // createMap(faultline, mags);
  createMap(faultline, mags);
}


// function createMap(earthquakes, mags) {
function createMap(faultline, mags) {  

  const lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  const outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });

  const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  

  // Define a baseMaps object to hold our base layers
  const baseMaps = {
    "Light Map": lightmap,
    "Outdoor": outdoor,
    "Satellite": satellite
  };

  // Create overlay object to hold our overlay layer
  const overlayMaps = {
    "Tectonic Plates": faultline,
    "Earthquakes": mags
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  const myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 2.5,
    layers: [lightmap, faultline, mags]
  });

  // create a legend in the bottom right corner (with the help of my tutor David Pecot)
  var legend = L.control({
    position: 'bottomright',
    fillColor: 'white'
  });

  legend.onAdd = function(){
    var div = L.DomUtil.create("div", "info legend");
    var grades = [-10,10,30,50,70,90];
    var color = ['#c7ea46','#fce205','#ffbf00','#fda50f','#f64a8a','#b90f0a'];

    div.innerHTML += "<div style='font-weight: 600; text-align:center;'>Depth</div>";
    for (var i = 0; i < grades.length; i++){
      div.innerHTML +=
      "<div style='background: " + color[i] + "; text-align: center; padding: 1; border: 1px solid grey; min-width: 80px;'>"
      + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "</div>" : "+</div>");
    }
    return div;

  }

  legend.addTo(myMap)

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
