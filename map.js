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

//======================================================Layers

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
// const masterLayer = L.featureGroup().addTo(map);

//============================================== MASTERlAYER
/* // Try to load from localStorage
let masterLayer;

const storedLayer = localStorage.getItem('masterLayer');
if (storedLayer) {
  try {
    // Parse the stored GeoJSON and create a feature group
    const geojson = JSON.parse(storedLayer);
    masterLayer = L.geoJSON(geojson).addTo(map);
  } catch (e) {
    console.error('Failed to parse stored layer:', e);
    // Fallback to empty feature group
    masterLayer = L.featureGroup().addTo(map);
  }
} else {
  // Create new feature group if nothing is stored
  masterLayer = L.featureGroup().addTo(map);
}

//Store masterLayer in the localstorage
function saveMasterLayer() {
  if (masterLayer) {
    const geojson = masterLayer.toGeoJSON();
    localStorage.setItem('masterLayer', JSON.stringify(geojson));
  }
} */
let masterLayer;

const storedLayer = localStorage.getItem('masterLayer');
if (storedLayer) {
  try {
    const geojson = JSON.parse(storedLayer);
    
    // Function to apply styles from feature properties
    const style = (feature) => {
      return {
        color: feature.properties.color || '#3388ff', // Default color if none specified
        weight: feature.properties.weight || 3,
        opacity: feature.properties.opacity || 0.7,
        fillOpacity: feature.properties.fillOpacity || 0.4,
        // Add any other style properties you want to support
      };
    };

    // Create the GeoJSON layer with custom styling
    masterLayer = L.geoJSON(geojson, {
      style: style,
      pointToLayer: (feature, latlng) => {
        // Special handling for point features
        return L.circleMarker(latlng, style(feature));
      }
    }).addTo(map);
    
  } catch (e) {
    console.error('Failed to parse stored layer:', e);
    masterLayer = L.featureGroup().addTo(map);
  }
} else {
  masterLayer = L.featureGroup().addTo(map);
}

// Function to save the layer with all properties
function saveMasterLayer() {
  if (masterLayer) {
    const geojson = masterLayer.toGeoJSON();
    localStorage.setItem('masterLayer', JSON.stringify(geojson));
  }
}
//======================================================LAYER CONTROL
var baseMaps = {
    "CartoDB_DarkMatter": CartoDB_DarkMatter,
    "OpenStreetMap": osm,
    "Google Sat": googleSat
  };

var layerControl = L.control.layers(baseMaps).addTo(map);

//======================================================Add scalebar to map
L.control.scale({metric: true, imperial: false, maxWidth: 100, position: 'bottomright'}).addTo(map);

//======================================================Initialize CodeMirror editor
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

//======================================================SEARCH LOCATION 
new L.Control.Geocoder({position: 'topleft'}).addTo(map);

//=======================================================PRINT MAP
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
//======================================================Mousemove coordinates
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

//======================================================Draw new features
// Get the color picker element
const colorPicker = document.getElementById('color-picker');

// Initialize draw controls with dynamic color (later)
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
    color: colorPicker.value, // Use selected color
    fillColor: colorPicker.value, // Same for fill (adjust if needed)
    fillOpacity: 0.4,
  },
});

// Disable drawing mode for circles and markers by default (if needed)
map.pm.disableDraw('Circle');
map.pm.disableDraw('Marker');
// Update color when a new color is picked
colorPicker.addEventListener('input', function() {
  map.pm.setPathOptions({
    color: this.value,
    fillColor: this.value, // Optional: Use a different fill color
    fillOpacity: 0.4,
  });
});
// Create a layer group for drawn shapes
//var drawLayer = L.layerGroup().addTo(map);
//console.log(masterLayer)
// Listen for when a new shape is created
map.on('pm:create', function(e) {
  const layer = e.layer;
  
  // Store the current color in the layer's properties
  layer.feature = layer.feature || { type: 'Feature', properties: {}, geometry: null };
  layer.feature.properties.color = colorPicker.value;
  layer.feature.properties.fillOpacity = 0.4; // Optional: Store opacity too
  
  // Add the layer to masterLayer (if not already done automatically)
  masterLayer.addLayer(layer);
  
  // Update the GeoJSON editor
  updateEditorFromMasterLayer();
});
// Define debounce function (if not already defined)
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

//======================================================Convert Features to Geojson
function updateEditorFromMasterLayer() {
    try {
        // Convert FeatureGroup to GeoJSON
        const geoJsonData = masterLayer.toGeoJSON();
        
        // Format as a pretty-printed JSON string
        const geoJsonString = JSON.stringify(geoJsonData, null, 2);
        
        // Update CodeMirror editor content
        editor.setValue(geoJsonString);       
    } catch (err) {
        console.error("Failed to export GeoJSON:", err);
        editor.setValue("Error: Could not generate GeoJSON");
    }
}

// Initialize editor with current masterLayer content
updateEditorFromMasterLayer();

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
                
                importedLayer = L.geoJSON(geojsonData, {
                    // Apply style based on GeoJSON properties
                    style: function(feature) {
                        return {
                            fillColor: feature.properties.color || '#3388ff', // Default blue if no color
                            weight: 2,          // Border width
                            opacity: 1,        // Border opacity
                            color: feature.properties.color || '#3388ff',     // Border color
                            fillOpacity: feature.properties.fillOpacity || 0.7 // Default fill opacity
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        if (feature.properties) {
                            addFeatures(layer);
                            updateEditorFromMasterLayer();
                            saveMasterLayer()
                            // Create popup content
                            let popupContent = "<div>";
                            for (const key in feature.properties) {
                                popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                            }
                            popupContent += "</div>";
                            layer.bindPopup(popupContent);
                        }
                    }
                }).addTo(map);
                map.fitBounds(importedLayer.getBounds());
            } catch (error) {
                console.error("Error loading GeoJSON:", error);
                alert("Invalid GeoJSON file. Please check the format.");
            }
        };
        reader.readAsText(file);
    }
});

//======================================================Edit Events
function addFeatures(layer){
                                  masterLayer.addLayer(layer);
                                  saveMasterLayer()
                                  console.log(masterLayer);
}
function removeFeatures(layer){
                                  masterLayer.removeLayer(layer);
                                  saveMasterLayer()

}

map.on('pm:create', function(e) {      
                                  addFeatures(e.layer)
                                  updateEditorFromMasterLayer()

                                }); 

map.on('pm:remove', function(e) { 
                                  drawLayer.removeLayer(e.layer);
                                  removeFeatures(e.layer)
                                  updateEditorFromMasterLayer()
  });
map.on('pm:globaldragmodetoggled', function(e) { 
                                   updateEditorFromMasterLayer()
});

map.on('pm:globaleditmodetoggled', function(e) {  
                                  updateEditorFromMasterLayer()
})
map.on('pm:globalrotatemodetoggled', function(e) {  
  updateEditorFromMasterLayer()                                 
})

//======================================================Download Data
function downloadMasterLayer() {
          if (!masterLayer || masterLayer.getLayers().length === 0) {
      alert('No elements to download!');
      return;
    }
  try {
    // Convert FeatureGroup to GeoJSON
    const geoJsonData = masterLayer.toGeoJSON();
    
    // Convert to formatted JSON string
    const geoJsonString = JSON.stringify(geoJsonData, null, 2);
    
    // Create download link
    const blob = new Blob([geoJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `map_data_${new Date().toISOString().slice(0,10)}.geojson`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (err) {
    console.error("Download failed:", err);
    alert("⚠️ Failed to export GeoJSON\n" + err.message);
  }
}

//======================================================Copy Json
function copyJSON() {
  try {
    // Get the current editor content
    const content = editor.getValue();
    
    // Copy to clipboard
    navigator.clipboard.writeText(content).then(() => {
      
      // Optional: Visual selection feedback
      editor.execCommand("selectAll");
      setTimeout(() => editor.execCommand("singleSelection"), 500);
    }).catch(err => {
      console.error("Copy failed:", err);
      alert("❌ Failed to copy. Please try again or check console.");
    });
    
  } catch (err) {
    console.error("Copy error:", err);
    alert("⚠️ Copy operation failed: " + err.message);
  }
}

//======================================================Remove all layers (masterLayer)
function removeAllLayers() {
  masterLayer.clearLayers();
  localStorage.removeItem('masterLayer');
  updateEditorFromMasterLayer()
}
