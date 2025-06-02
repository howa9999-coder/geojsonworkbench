//======================================================Initialize the map and set the view to Casablanca
var zoom = 6;
var latS = 20;
var lngS = -30;
var map = L.map('map').setView([latS, lngS], zoom); // Default to Casablanca

//======================================================Try to get user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Success - center map on user's location
            latS = position.coords.latitude
            lngS = position.coords.longitude
            zoom = 12
            map.setView([latS, lngS], zoom);

        },
        function(error) {
            // Error - keep default Casablanca view
            console.error("Geolocation error:", error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    // Geolocation not supported - keep default Casablanca view
    console.log("Geolocation is not supported by this browser");
    alert("Geolocation is not supported by this browser")
}

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);
var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

//======================================================LAYER CONTROL
var baseMaps = {
    "CartoDB_DarkMatter": CartoDB_DarkMatter,
    "OpenStreetMap": osm,
    "Google Sat": googleSat
  };

var layerControl = L.control.layers(baseMaps).addTo(map);

//======================================================Add scalebar to map
L.control.scale({metric: true, imperial: false, maxWidth: 100, position: 'bottomright'}).addTo(map);
        // Initialize CodeMirror editor
         const editor = CodeMirror.fromTextArea(document.getElementById('geojson-input'), {
            mode: 'application/json',
            theme: 'dracula',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            gutters: ['CodeMirror-lint-markers'],
            lint: true
        }); 


//======================================================SEARCH LOCATION PLUGIN
new L.Control.Geocoder({position: 'topleft'}).addTo(map);
//PRINT MAP
L.control.bigImage({position: 'topleft'}).addTo(map);
//======================================================Add the measurement control to the map
  var measureControl = new L.Control.PolylineMeasure({
    position: 'topleft',
    unit: 'metres',
    showBearings: true,
    clearMeasurementsOnStop: false,
    showClearControl: true,
    showUnitControl: true,
    measureControlTitleOn: 'Turn on PolylineMeasure',
    measureControlTitleOff: 'Turn off PolylineMeasure',
    measureControlLabel: '&#8614;',
    backgroundColor: 'white',
    cursor: 'crosshair',
    clearControlTitle: 'Clear Measurements',
    unitControlTitle: {
      text: 'Change Units',
      metres: 'Meters',
      kilometres: 'Kilometers',
      feet: 'Feet',
      landmiles: 'Miles (Land)',
      nauticalmiles: 'Nautical Miles',
      yards: 'Yards',
      surveyfeet: 'Survey Feet',
      surveychains: 'Survey Chains',
      surveylinks: 'Survey Links',
      surveymiles: 'Survey Miles'
    }
  });
  
  measureControl.addTo(map);
//======================================================mousemove coordinates
const coordinates = document.getElementById("coordinates")
function onMapMove(e){
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    coordinates.innerHTML = "";
    coordinates.innerHTML = `
    <div>
    <p> <b> Lat: </b> ${lat} / <b> Lng: </b> ${lng} </p>
    </div>
    `;
}
map.on('mousemove', onMapMove)

//======================================================Function to update map with geojson
let geoJsonLayer = null;
const errorElement = document.getElementById('error-message');

function updateMapWithGeoJson() {
  const geojsonInput = editor.getValue();
  
  try {
    const geojsonData = JSON.parse(geojsonInput);
    
    if (!geojsonData.type) {
      throw new Error("Invalid GeoJSON: Missing 'type' property");
    }
    
    // Remove previous layers
    if (geoJsonLayer) {
      map.removeLayer(geoJsonLayer);
    }
    
    // Clear drawLayer and rebuild from GeoJSON
    drawLayer.clearLayers();
    
    geoJsonLayer = L.geoJSON(geojsonData, {
      pointToLayer: function(feature, latlng) {
        const marker = L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
        
        // Store the original feature data
        marker.feature = feature;
        return marker;
      },
      style: function(feature) {
        return {
          color: "#0066ff",
          weight: 2,
          opacity: 1
        };
      },
      onEachFeature: function(feature, layer) {
        // Add to drawLayer for editing
        drawLayer.addLayer(layer);
        
        // Store the original feature data
        layer.feature = feature;
        
        // Bind popup with all properties
        if (feature.properties) {
          // Format properties for display
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<b>${key}:</b> ${value}`)
            .join('<br>');
          
          layer.bindPopup(popupContent);
        }
      }
    }).addTo(map);
    
    // Fit bounds if valid
    if (geoJsonLayer.getBounds().isValid()) {
      map.fitBounds(geoJsonLayer.getBounds());
    }
    
    errorElement.textContent = '';
  } catch (error) {
    errorElement.textContent = 'Error: ' + error.message;
  }
}
//======================================================Draw new features
// Initialize draw controls with dynamic color
var drawControl = map.pm.addControls({
  position: 'topright',
  drawCircle: true,
  drawRectangle: true,
  drawPolygon: true,
  drawMarker: true,
  drawCircleMarker: true,
  drawPolyline: true,
  cutPolygon: true,
  removalMode: true,
  editMode: true,
  dragMode: true,
  pinningOption: true,
  snappingOption: true,
  snapping: {}, // Configure if needed
  tooltips: true,
  templineStyle: {
    color: 'green',
    dashArray: '5,5',
  },
  hintlineStyle: {
    color: 'white',
    dashArray: '1,5',
  },
  pathOptions: {
    color: "green", // Use selected color
    fillColor: "green", // Same for fill (adjust if needed)
    fillOpacity: 0.4,
  },
});

// Disable drawing mode for circles and markers by default (if needed)
map.pm.disableDraw('Circle');
map.pm.disableDraw('Marker');

// Create a layer group for drawn shapes
var drawLayer = L.layerGroup().addTo(map);


// Define debounce function (if not already defined)
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

//======================================================Convert Features to Geojson
function convertToJSON(e) {
  // Only add the layer for create events
  if (e.type === 'pm:create') {
    drawLayer.addLayer(e.layer);
  }
  
  // Convert drawnLayer to JSON format
  const geoJson = {
    type: 'FeatureCollection',
    features: drawLayer.getLayers().map(layer => {
      // For markers
      if (layer instanceof L.Marker) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
          },
          properties: layer.feature?.properties || {}
        };
      }
      
      // For other layers
      const geojson = layer.toGeoJSON();
      if (layer.feature?.properties) {
        geojson.properties = {
          ...geojson.properties,
          ...layer.feature.properties
        };
      }
      return geojson;
    })
  };

  // Stringify GeoJSON with proper formatting
  const geoJsonString = JSON.stringify(geoJson, null, 2);
  
  // Get current editor value
  const currentValue = editor.getValue();
  
  // Only update if different to prevent infinite loops
  if (currentValue !== geoJsonString) {
    errorElement.textContent = '';
    editor.setValue("");
    editor.setValue(geoJsonString);
  }
}



// Real-time updates while editing the text
/* editor.on('change', debounce((instance) => {
  try {
    // Try to parse the current editor content
    const parsedGeoJson = JSON.parse(instance.getValue());
    // You could validate the GeoJSON here or update the map
  } catch (e) {
    console.error("Invalid GeoJSON:", e);
  }
}, 500)); */

//======================================================IMPORT DATA
document.getElementById('import-geojson').addEventListener('click', () => {
document.getElementById('geojson-file').click();
});
let importedLayer = null

document.getElementById('geojson-file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const geojsonData = JSON.parse(e.target.result); 
                console.log(geojsonData)              
                // Display the raw GeoJSON in the textarea
                // Stringify GeoJSON with proper formatting
                const geoJsonString = JSON.stringify(geojsonData, null, 2);  
                    editor.setValue("");
                    editor.setValue(geoJsonString);

                importedLayer = L.geoJSON(geojsonData, {
                    onEachFeature: function (feature, layer) {
                        if (feature.properties) {
                            // Create a popup content string with all properties
                            let popupContent = "<div>";
                            for (const key in feature.properties) {
                                popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                            }
                            popupContent += "</div>";
                            layer.bindPopup(popupContent);
                        }
                    },
                }).addTo(map);
                map.fitBounds(importedLayer.getBounds());
                errorElement.textContent = '';

            } catch (error) {
                console.error("Error loading GeoJSON:", error);
                alert("Invalid GeoJSON file. Please check the format.");
            }
        };
        reader.readAsText(file);
    }
});  

//======================================================Remove all layers
function removeAllLayers() {
    // Store the base tile layers 
    const baseLayers = [];
    
    // Get all layers that are tile layers 
    map.eachLayer(function(layer) {
        if (layer instanceof L.TileLayer) {
            baseLayers.push(layer);
        }
    });
    
    // Clear all layers
    map.eachLayer(function(layer) {
        map.removeLayer(layer);
        drawLayer.clearLayers();
        editor.setValue("");

    });
    
    // Add back the base tile layers
    baseLayers.forEach(function(layer) {
        map.addLayer(layer);
    });
    
    // Reset any layer references
    importedLayer = null;
}
//======================================================Edit Events
map.on('pm:create', function(e) { convertToJSON(e);      errorElement.textContent = '';}); 
map.on('pm:remove', function(e) { 
    drawLayer.removeLayer(e.layer);
    convertToJSON(e); });
map.on('pm:globaldragmodetoggled', function(e) { convertToJSON(e);});
map.on('pm:globaleditmodetoggled', function(e) { convertToJSON(e);})
map.on('pm:globalrotatemodetoggled', function(e) { convertToJSON(e);})

//======================================================Download Data
  function down() {
    if (!drawLayer || drawLayer.getLayers().length === 0) {
      alert('No drawn elements to download!');
      return;
    }
    
    const geoJson = {
      type: 'FeatureCollection',
      features: drawLayer.getLayers().map(layer => {
        // For markers
        if (layer instanceof L.Marker) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
            },
            properties: layer.feature?.properties || {}
          };
        }
        
        // For other layers
        const geojson = layer.toGeoJSON();
        if (layer.feature?.properties) {
          geojson.properties = {
            ...geojson.properties,
            ...layer.feature.properties
          };
        }
        return geojson;
      })
    };
    
    // Create a download link
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'drawn_elements.geojson');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }
