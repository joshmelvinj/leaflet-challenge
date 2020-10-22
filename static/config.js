// Store API endpoint in queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// GET request to query URL
d3.json(queryUrl, function(data) {

  // Response
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  // Define a function with popup feature
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Define function for circle radius based on magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Define function for circle color based on magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#ccff33"
    }
    else if (magnitude < 2) {
      return "#ffff33"
    }
    else if (magnitude < 3) {
      return "#ffcc33"
    }
    else if (magnitude < 4) {
      return "#ff9933"
    }
    else if (magnitude < 5) {
      return "#ff6633"
    }
    else {
      return "#ff3333"
    }
  }

  // GeoJSON layer 
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // Create Map
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // All maps and layers
  
  //   outdoormap
  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  //   satellite map
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  //   grayscale map
  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // faultline layer
  var faultLine = new L.LayerGroup();
  
  // baseMaps object for holding base layers
  var baseMaps = {
    "Outdoor Map": outdoorsmap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satellitemap
  };

  // overlay object for holding our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  // Create Map with streetmap and earthquakes layers 
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [outdoorsmap, earthquakes, faultLine]
  });

  // Pass in our baseMaps and overlayMaps and create layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Query for faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // Faultlines
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "orange", fillOpacity: 0}
      }
    }).addTo(faultLine)
  })

  // Legend color function
  function getColor(d) {
    return d > 5 ? '#ff3333' :
           d > 4  ? '#ff6633' :
           d > 3  ? '#ff9933' :
           d > 2  ? '#ffcc33' :
           d > 1  ? '#ffff33' :
                    '#ccff33';
  }

  // Adding legend
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // Looping through intervals
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}