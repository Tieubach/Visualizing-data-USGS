const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
const plateBoundryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// color scale
var setColorScale = function(mag) {
    switch(true) {
        case(mag>0 && mag<=1): return "#ffffb2";
        break;
        case(mag>1 && mag<=2): return "#fed976";
        break;
        case(mag>2 && mag<=3): return "#feb24c";
        break;
        case(mag>3 && mag<=4): return "#fd8d3c";
        break;
        case(mag>4 && mag<=5): return "#f03b20";
        break;
        case(mag>5): return "#bd0026"
    }
};

// creating empty layergroup for later adding to map
var geoJsonLayer = new L.layerGroup();
var plateBoundryLayer = new L.layerGroup() ;

// creating promise chain for fetching data first and then creating map
d3.json(earthquakeUrl).then(successHandle, errorHandle)
    .then(secondFunc(), errorHandle)
    .then(createMap(geoJsonLayer, plateBoundryLayer), errorHandle);
    
// error handle function
function errorHandle(error) {
    console.log(error)
};

// successhandle function for earthquake data
function successHandle(data) {
    L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h2>"+feature.properties.place+"</h2><hr><h3>"+new Date(feature.properties.time)+"</h3><hr><h3>"+
                            "Earthquake Intensity "+feature.properties.mag+"</h3>")
        },
        pointToLayer: function (feature, latlng) {
            return new L.circleMarker(latlng, {
                radius: feature.properties.mag*5,
                fillColor: setColorScale(feature.properties.mag),
                color: "black",
                weight: .5,
                fillOpacity: 0.9,
                opacity: 1
            })
        }
    }).addTo(geoJsonLayer)
};

// function for reading tectonic plate data
function secondFunc() {
    d3.json(plateBoundryUrl).then(fulfilled, error);
    function error(err) {
        console.log(err)
    }
    function fulfilled(data) {
        // console.log(data);
        var features = data.features;
        // console.log(features)
        L.geoJson(data)
            .addTo(plateBoundryLayer);
        
    }
    
}

//  third function in promise chain for creating map and adding layers
function createMap(geoJsonLayer, plateBoundryLayer) {
    // Define variable for base layer
    var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });
    var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Create an overlay object
    var overlayMaps = {
        "earthquake": geoJsonLayer,
        "Tectonic Plates": plateBoundryLayer
    };
    // create basemap object
    var baseMaps = {
        "light map": lightMap,
        "dark map": darkMap
    };
    // creating blank map
    let myMap =  L.map("map", {
        center: [40.809730, -110],
        zoom: 4,
        layers: [darkMap, geoJsonLayer, plateBoundryLayer]
    });

    // legend.addTo(myMap);
    // geoJsonLayer.addTo(myMap)
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

        // setting up legend
        var legend = L.control({position: "bottomright"});
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = [1,2,3,4,5,5.1];
            var colors = limits.map(d=>setColorScale(d));
            // console.log(limits)
            // console.log(colors)
            var legendInfo = "<h1>Earthquake Intensity</h1>"+
                "<div class=\"label\">" +
                "<div class=\"min\">"+"<" + limits[0].toFixed(1)+ "</div>" +
                "<div class=\"max\">"+">"+limits[limits.length-2].toFixed(1) +"</div>"+
                "</div>"
          
            div.innerHTML = legendInfo;
            // set up legend color bar
            labels=[];
            limits.forEach(function(limit, index) { 
                labels.push("<li style=\"background-color: " + colors[index] + "\"></li>"); 
            })
            div.innerHTML += "<ul>"+ labels.join("") + "</ul>";
            return div;
        };
        console.log(legend)
        legend.addTo(myMap);
    

}







