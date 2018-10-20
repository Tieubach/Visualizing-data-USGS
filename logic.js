const earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// creating blank map
let myMap =  L.map("map", {
    center: [40.809730, -110],
    zoom: 5
});

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
}).addTo(myMap);

// set color scale
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


// fetch data and plot layer on map
d3.json(earthquake_url).then(successHandle, errorHandle);

function errorHandle(error) {
    console.log(error)
};

function successHandle(data) {
    var geoJsonLayer = L.geoJson(data, {
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
    })
    geoJsonLayer.addTo(myMap)
    console.log(geoJsonLayer)
    // setting up legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [1,2,3,4,5,5.1];
        var colors = limits.map(d=>setColorScale(d));
        console.log(limits)
        console.log(colors)
        // Add legend text (min and max)
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
    legend.addTo(myMap);
};








