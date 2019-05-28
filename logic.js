// USGS urls for earthquake data and tectonic plate data
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
const plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// establish base maps for different color schemes (light, dark, outdoors, satellite)
const outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
})


const satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
})

const darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});

const lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
})

const baseMaps = {
    Light: lightMap,
    Dark: darkMap,
    Outdoors: outdoorsMap,
    Satellite: satelliteMap
}

// tow layer groups - earthquakes and tectonic plates
const layers = {
    earthquakeLayer: new L.layerGroup(),
    tectonicPlateLayer: new L.layerGroup()
};

// initialization of map
const myMap = L.map('map', {
    center: [38.510472, -102.974396],
    zoom: 4.25,
    layers: [
        outdoorsMap,
        layers.earthquakeLayer,
        layers.tectonicPlateLayer
    ]
})

// set up overlays
const overlays = {
    'Earthquakes': layers.earthquakeLayer,
    'Tectonic Plates': layers.tectonicPlateLayer
}

// add all the controls to the top right corner
L.control.layers(baseMaps, overlays, {collapsed: false}).addTo(myMap)

// functions to set up size of the bubble and color of the bubble
function markerSize(mag) {return mag * 40000}
function setColor(mag) {
    return mag >= 5 ? '#7a0177':
           mag >= 4 ? '#bd0026':
           mag >= 3 ? '#ff420e':
           mag >= 2 ? '#f98866':
           mag >= 1 ? '#80bd9e':
           '#89da59';
}

// build markers function => add to earthquake layer
function buildMarker(features) {
    
    features.forEach(feature => {

        let mag = feature.properties.mag;

        let color = '';

        color = setColor(mag);

        L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillColor: color,
            fillOpacity: .55,
            color: color,
            weight: 0.8,
            radius: markerSize(mag)
        }).bindPopup('<h1>Earthquake Site: </h1><h2>' + feature.properties.place + '<hr>Magnitude: ' + mag + '</h2><h3>Date:' + Date(feature.properties.time) + '</h3>')
        .addTo(layers.earthquakeLayer)
    });
}

// build plate function => add to tectonic plate layer
function buildPlate(plateData){
    L.geoJson(plateData, {
        color: 'gray',
        weight: 2.5,
        opacity: .5

    }).addTo(layers.tectonicPlateLayer)
}

// request for responses from USGS API, then process then, add 
(async function(){
    const [data, plateData] = await Promise.all([d3.json(earthquakeUrl), d3.json(plateUrl)]);
    buildMarker(data.features)
    buildPlate(plateData)
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        const labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']
        const colors = ['#89da59', '#80bd9e', '#f98866', '#ff420e', '#bd0026', '#7a0177']
        div.innerHTML = '<strong>Magnitude</strong>';
        for (let i = 0; i < colors.length; i++){
            
            div.innerHTML +=
                '<li style="background-color:' + colors[i] + '">' + labels[i] + '</li>';
        }
        return div;
    }    
    legend.addTo(myMap);
    
})()




