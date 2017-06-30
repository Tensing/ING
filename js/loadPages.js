// HTML template strings
formPage = '<!-- Page Heading --> <div class="row"> <div class="col-lg-12"> <!-- <h1 class="page-header"> Form </h1> --> <ol class="breadcrumb"> <li> <i class="fa fa-dashboard"></i> <a href="index.html">Dashboard</a> </li> <li class="active"> <i class="fa fa-edit"></i> Form </li> </ol> </div> </div> <!-- /.row --> <div class="row"> <div class="col-lg-12"> <form role="form" id="formING" name="formING" onsubmit="submitForm()"> <div class="form-group"> <label>Customer</label> <input id="customer" class="form-control"> </div> <div class="form-group"> <label>KVK nummer</label> <input id="kvk" class="form-control"> </div> <div class="form-group"> <label>Adres</label> <input id="address" class="form-control"> </div> <div class="form-group"> <label>Postcode</label> <input id="postcode" class="form-control"> </div> <div class="form-group"> <label>Gemeente</label> <input id="gemeente" class="form-control"> </div> <div class="form-group"> <label>Aangevraagde lening</label> <input id="loan" class="form-control"> </div> <div class="form-group"> <label>Type lening</label> <select id="type" class="form-control"> <option value="restaurant">Restaurant</option> <option value="kantoor">Kantoor</option> </select> </div> <button type="submit" class="btn btn-default">Submit Button</button> <button type="reset" class="btn btn-default">Reset Button</button> </form> </div> </div> <!-- /.row -->'

mapPage = '<!-- <h1 class="page-header"> Map </h1> --> <ol class="breadcrumb"> <li> <i class="fa fa-dashboard"></i>  <a href="index.html">Dashboard</a> </li> <li class="active"> <i class="fa fa-edit"></i> Map </li> </ol> <!-- Page Heading --> <div class="row"> <div class="col-lg-12"> <nav id="menu"></nav> <div id="map"></div> </div> </div> <!-- /.row --><div class="row"><div class="col-lg-4"><div class="panel panel-green"><div class="panel-heading"><h3 class="panel-title" id="leeftijdTitle"><i class="fa fa-long-arrow-right"></i>Leeftijdsverdeling per buurt (%)</h3></div><div class="panel-body"><div class="flot-chart"><div class="flot-chart-content" id="flot-pie-chart"><center>Klik op een buurt</center></div></div></div></div></div><div class="col-lg-4"><div class="panel panel-yellow"><div class="panel-heading"><h3 class="panel-title" id="bagTitle"><i class="fa fa-long-arrow-right"></i> BAG pand informatie</h3></div><div class="panel-body"><div class="flot-chart"><div class="flot-chart-content" id="bagTable"><center>Klik op een BAG pand</center></div></div></div></div></div><div class="col-lg-4"><div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title" id="fmeTitle"><i class="fa fa-long-arrow-right"></i> FME Cloud data</h3></div><div class="panel-body"><div class="flot-chart"><div class="flot-chart-content" id="fmeContent">Data van Martins FME Cloud komt vrijdag</div></div></div></div></div></div>'

// Load HTML template strings
$( document ).ready(function(){
  $("#canvas").html(formPage);
});

$("#formPage").click(function(){
  $("#canvas").html(formPage);
});

$("#mapPage").click(function(){
  $("#canvas").html(mapPage);
  loadMap();
  window.map.on('load', function () {
    loadData();
  });

});

function submitForm() {
  console.log(document.forms["formING"]["customer"].value);
  window.address = document.forms["formING"]["address"].value;
  window.zipcode = document.forms["formING"]["postcode"].value.replace(/\s/g, '');;
  window.municipality = document.forms["formING"]["gemeente"].value;
  var fullAddress = address + ',+' + zipcode + ',+' + municipality;
  console.log(fullAddress);
  $(".container-fluid").html(mapPage);
  var latlng = geocodeAddress(fullAddress);

}

// Function to load map and add data
function loadMap(lat, lng) {
  if (lat === undefined){
    console.log("lat undefined");
    lat=4.951721;
  }
  if (lng === undefined){
    console.log("long undefined");
    lng=52.314182;
  }
  mapboxgl.accessToken = 'pk.eyJ1IjoiaXZvMTEyMzUiLCJhIjoieV82bFVfNCJ9.G8mrfJOA07edDDj6Bep2bQ';
  window.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/ivo11235/cj40zzvy43klk2rozfylmtc5y', //hosted style id
      center: [lat,lng], // starting position
      zoom: 14 // starting zoom
  });
  window.map.addControl(new MapboxGeocoder({
      accessToken: mapboxgl.accessToken
  }));
}

function geocodeAddress(Address){
  var geocodeURL = 'http://nominatim.openstreetmap.org/search?q='+Address+'&polygon=1&addressdetails=1&format=json&limit=1';
  $.ajax({
    url: geocodeURL,
    success: function(result){
      if (result["0"] == undefined) {
        alert("Geen locatie gevonden");
        var lat = 52.314182;
        var lng = 4.951721;
        Address = "ING Bank, Bijlmerplein 888, 1102 MG Amsterdam-Zuidoost"
      } else {
    		console.log(result["0"]);
        var lat = result["0"].lat;
        var lng = result["0"].lon;
      }
      loadMap(lng,lat);
      map.on('load', function () {
        console.log(window.lat+" "+window.lng);
        loadData();
        addMarker(window.lat,window.lng, window.address);
      });
    }
  });
}

function addMarker(lat,long, name) {
  window.map.addLayer({
        "id": name,
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [long,lat]
                    },
                    "properties": {
                        "title": name,
                        "icon": "monument"
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });
}

function loadData() {

  	bounds = window.map.getBounds()
  	ne = [bounds._ne.lat,bounds._ne.lng]
  	sw = [bounds._sw.lat,bounds._sw.lng]
  	bbox = 'bbox='+sw[0]+","+sw[1]+","+ne[0]+","+ne[1];
    bboxReverse = 'bbox='+sw[1]+","+sw[0]+","+ne[1]+","+ne[0];
    // filter = 'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><BBOX><PropertyName>Geometry</PropertyName><Envelope srsName="EPSG:4326" xmlns="http://www.opengis.net/gml"><lowerCorner>'+sw[1]+' '+sw[0]+'</lowerCorner><upperCorner>'+ne[1]+' '+ne[0]+'</upperCorner></Envelope></BBOX></Filter>';
    ratio = (ne[0] - sw[0]) / (ne[1] - sw[1])
  	console.log("load data for "+bbox+" ratio: "+ratio);

    // var bag_url = 'https://geodata.nationaalgeoregister.nl/bag/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=bag:pand&SRSNAME=EPSG:4326&'+bboxReverse+',EPSG:4326&outputFormat=json'
    var bag_url = 'https://geodata.nationaalgeoregister.nl/bag/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=bag:pand&SRSNAME=EPSG:4326&'+bboxReverse+',EPSG:4326&outputFormat=json';
    console.log(bag_url);
    getWFS(bag_url, "BAG", "#E89C0C", 0.8);

    var buurt_url = 'https://geodata.nationaalgeoregister.nl/wijkenbuurten2016/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=wijkenbuurten2016:cbs_buurten_2016&SRSNAME=EPSG:4326&'+bboxReverse+',EPSG:4326&outputFormat=json';
    console.log(buurt_url);
    getWFS(buurt_url, "CBS Buurten", "#088", 0.6);

    var width = 500;
    var height = Math.round(width * ratio);
    var satelliteURL = 'https://geodata.nationaalgeoregister.nl/luchtfoto/wms?request=GetMap&tileMatrixSet=EPSG:4326&crs=EPSG:4326&layers=2016_ortho25&styles=default&format=image/jpeg&url&version=1.3.0&width='+width+'&height='+height+'&'+bbox
    console.log(satelliteURL);
    // window.map.addLayer({
    //     'id': 'wms-satellite-layer',
    //     'type': 'raster',
    //     'source': {
    //         'type': 'raster',
    //         'tiles': [
    //             satelliteURL
    //         ],
    //         'tileSize': 256
    //     },
    //     'paint': {}
    // }, 'satellite');

    var toggleableLayerIds = [ 'BAG', 'CBS Buurten' ];

  for (var i = 0; i < toggleableLayerIds.length; i++) {
      var id = toggleableLayerIds[i];

      var link = document.createElement('a');
      link.href = '#';
      link.className = 'active';
      link.textContent = id;

      link.onclick = function (e) {
          var clickedLayer = this.textContent;
          e.preventDefault();
          e.stopPropagation();

          var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

          if (visibility === 'visible') {
              window.map.setLayoutProperty(clickedLayer, 'visibility', 'none');
              this.className = '';
          } else {
              this.className = 'active';
              window.map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
          }
      };

      var layers = document.getElementById('menu');
      layers.appendChild(link);
    }

    window.map.on('click', 'CBS Buurten', function (e) {
      new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML('<table style="width:100%"><tr><th><center><b>Buurt: '+e.features[0].properties.buurtnaam+'</b></center></th></tr><tr><td>Aantal inwoners:</td><td> '+e.features[0].properties.aantal_inwoners+'</td><td></tr><tr><td>Bevolkingsdichtheid (per km2): </td><td> '+e.features[0].properties.bevolkingsdichtheid_inwoners_per_km2+'</td></tr></table>')
          .addTo(window.map);
          var data = [
            {label: "0-14", data: e.features[0].properties.percentage_personen_0_tot_15_jaar},
            {label: "15-24", data: e.features[0].properties.percentage_personen_15_tot_25_jaar},
            {label: "25-44", data: e.features[0].properties.percentage_personen_25_tot_45_jaar},
            {label: "45-64", data: e.features[0].properties.percentage_personen_45_tot_65_jaar},
            {label: "65 en ouder", data: e.features[0].properties.percentage_personen_65_jaar_en_ouder}
          ];
          $("#leeftijdTitle").html("<i class='fa fa-long-arrow-right'></i> Leeftijdsverdeling in "+e.features[0].properties.buurtnaam);
          $.plot('#flot-pie-chart', data, {
          series: {
              pie: {
                  show: true
              }
          }
      });
    });

    window.map.on('click', 'BAG', function (e) {
      // console.log("click bag");
      // new mapboxgl.Popup()
      //     .setLngLat(e.lngLat)
      //     .setHTML('<b>'+e.features[0].properties.buurtnaam+'</b></br><p>Aantal inwoners: '+e.features[0].properties.aantal_inwoners+'</p><p>Aantal inwoners / km2:'+e.features[0].properties.bevolkingsdichtheid_inwoners_per_km2+'</p>')
      //     .addTo(window.map);

          // $("#bagTitle").html("<i class='fa fa-long-arrow-right'></i> BAG informatie voor "+e.features[0].properties.buurtnaam);
      var htmlTable = '<div class="table-responsive"><table class="table table-hover"><tbody><tr><td>Bouwjaar</td><td>'+e.features[0].properties.bouwjaar+'</td></tr><tr><td>Status</td><td>'+e.features[0].properties.status+'</td></tr><tr><td>Gebruiksdoel</td><td>'+e.features[0].properties.gebruiksdoel+'</td></tr><tr><td>Aantal objecten</td><td>'+e.features[0].properties.aantal_verblijfsobjecten+'</td></tr><tr><td>Oppervlakte (min)</td><td>'+e.features[0].properties.oppervlakte_min+' m2</td></tr><tr><td>Oppervlakte (max)</td><td>'+e.features[0].properties.oppervlakte_max+' m2</td></tr></tbody></table></div></div>';
      $("#bagTable").html(htmlTable);
    });

}

function getWFS(wfs_url, name, color, opacity) {
  $.ajax({url: wfs_url
  , success: function(result){
    console.log(result);

    geojson = {
    'type': 'geojson',
    'data': result
    }
    console.log(geojson);

    window.map.addSource ( "source_"+name, geojson )

    window.map.addLayer({
        "id": name,
        "type": "fill",
        "source": "source_"+name,
        'paint': {
            'fill-color': color,
            'fill-opacity': opacity,
            'fill-outline-color': '#000'
        }
    });
    window.map.moveLayer(name,window.address);
  }});
}
