/**
 * Created by CSpan on 30-Jun-17.
 */
/// <reference path="../typings/index.d.ts" />

class Application {
    private _config: Config;
    private _map: mapboxgl.Map;
    private _address: string;
    private _zipcode: string;
    private _municipality: string;
    private _fullAddress: string;
    private _loanAmount: string;
    private _loanType: string;
    constructor() {
        this._config = new Config();
    }

    showMap(): void {
        $(".container-fluid").html(this._config.mapPage);
        this.loadMap(undefined,undefined);
    }

    showForm(): void {
        $(".container-fluid").html(this._config.formPage);
        $("#formING").on("submit", $.proxy(function() {
            this.submitForm();
        },this));
    }

    loadMap(lat, lng): void {
        if (lat === undefined){
            console.log("lat undefined");
            lat=4.951721;
        }
        if (lng === undefined){
            console.log("long undefined");
            lng=52.314182;
        }
        mapboxgl.accessToken = 'pk.eyJ1IjoiaXZvMTEyMzUiLCJhIjoieV82bFVfNCJ9.G8mrfJOA07edDDj6Bep2bQ';
        this._map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/ivo11235/cj40zzvy43klk2rozfylmtc5y', //hosted style id
            center: [lat,lng], // starting position
            zoom: 17 // starting zoom
        });
        // this._map.addControl(mapboxgl.Map({
        //     "accessToken": mapboxgl.accessToken
        // }));

        this._map.on('moveend', $.proxy(function() {
            console.log("move-end");
            this.refreshData();
        }, this));
    }


    submitForm(): void {

        this._loanType = document.forms["formING"]["type"].value;
        console.log(this._loanType);
        this._loanAmount = document.forms["formING"]["loan"].value;
        console.log(this._loanAmount);


        console.log(document.forms["formING"]["customer"].value);
        this._address = document.forms["formING"]["address"].value;
        this._zipcode = document.forms["formING"]["postcode"].value.replace(/\s/g, '');
        this._municipality = document.forms["formING"]["gemeente"].value;
        this._fullAddress = this._address + ',+' + this._zipcode + ',+' + this._municipality;
        console.log(this._fullAddress);

        this.geocodeAddress(this._fullAddress);
        this.showMap();
    }

    geocodeAddress(address: string):void{
        var geocodeURL = this._config.geoCodeUrl + address;
        console.log(geocodeURL);
        $.ajax({
            url: geocodeURL,
            success: $.proxy(function(result){
                var lat:number = 52.314182;
                var lng:number = 4.951721;
                var Address:string = "ING Bank, Bijlmerplein 888, 1102 MG Amsterdam-Zuidoost";
                if (!result["0"]) {
                    alert("Geen locatie gevonden");
                }
                else {
                    console.log(result["0"]);
                    lat = result["0"].lat;
                    lng = result["0"].lon;
                }
                this.loadMap(lng,lat);
                this._map.on('load', $.proxy(function () {
                    this.loadData();
                    this.addMarker(lat,lng,address);
                },this));
            },this)
        });
    }

    addMarker(lat, long, name): void {
        // var geojson = {
        //     "data": {
        //         "type": "FeatureCollection",
        //         "features": [{
        //             "type": "Feature",
        //             "geometry": {
        //                 "type": "Point",
        //                 "coordinates": [long, lat]
        //             },
        //             "properties": {
        //                 "title": name,
        //                 "icon": "monument"
        //             }
        //         }]
        //     }
        // };
        //
        // this._map.addSource("source_" + name, geojson)
        //
        // this._map.addLayer({
        //     "id": name,
        //     "type": "fill",
        //     "source": "source_" + name,
        //     'paint': {
        //         'fill-color': color,
        //         'fill-opacity': opacity,
        //         'fill-outline-color': '#000'
        //     }
        // });

    }



// TW
    refreshData():void {

        var bounds:any = this._map.getBounds();
        var ne = bounds._ne;
        var sw = bounds._sw;
        var bbox = 'bbox=' + sw.lat + "," + sw.lng + "," + ne.lat + "," + ne.lng;
        var bboxReverse = 'bbox=' + sw.lng + "," + sw.lat + "," + ne.lng + "," + ne.lat;
        var ratio = (ne.lat - sw.lat) / (ne.lng - sw.lng);
        console.log("load data for " + bbox + " ratio: " + ratio);

        var bag_url:string  = this._config.bagUrl + '&' + bboxReverse + ',EPSG:4326';
        console.log(bag_url);
        this.refreshWFS(bag_url, "BAG", "#E89C0C", 0.8);
        var buurt_url:string = this._config.buurtUrl + '&' + bboxReverse + ',EPSG:4326';
        console.log(buurt_url);
        this.refreshWFS(buurt_url, "CBS Buurten", "#088", 0.6);

    }

//TW
    refreshWFS(wfs_url, name, color, opacity): void {
        $.ajax({url: wfs_url, success: $.proxy(function(result) {
            console.log(result);
            //debugger;

            var geojson = {
                'type': 'geojson',
                'data': result
            }
            console.log(geojson);


            var o = this._map.getSource( "source_"+name);
            o.setData(result);

            //window.map.addSource ( "source_"+name, geojson )


        },this)});
    }


    loadData() {

        var bounds:any = this._map.getBounds();
        var ne = bounds._ne;
        var sw = bounds._sw;
        var bbox = 'bbox=' + sw.lat + "," + sw.lng + "," + ne.lat + "," + ne.lng;
        var bboxReverse = 'bbox=' + sw.lng + "," + sw.lat + "," + ne.lng + "," + ne.lat;
        var ratio = (ne.lat - sw.lat) / (ne.lng - sw.lng);
        console.log("load data for " + bbox + " ratio: " + ratio);

        var bag_url:string  = this._config.bagUrl + '&' + bboxReverse + ',EPSG:4326';
        console.log(bag_url);
        this.getWFS(bag_url, "BAG", "#E89C0C", 0.8);
        var buurt_url:string = this._config.buurtUrl + '&' + bboxReverse + ',EPSG:4326';
        console.log(buurt_url);
        this.getWFS(buurt_url, "CBS Buurten", "#088", 0.6);


        //TW
        var fme_service_url = this._config.fmeUrl;
        console.log(fme_service_url);
        this.getWFS(fme_service_url, "FME", "#088", 0.6);


        var toggleableLayerIds = ['BAG', 'CBS Buurten'];

        for (let i = 0; i < toggleableLayerIds.length; i++) {
            let id = toggleableLayerIds[i];

            let link = document.createElement('a');
            link.href = '#';
            link.className = 'active';
            link.textContent = id;

            link.onclick = $.proxy(function (e) {
                var clickedLayer = id;
                e.preventDefault();
                e.stopPropagation();

                var visibility = this._map.getLayoutProperty(clickedLayer, 'visibility');

                if (visibility === 'visible') {
                    this._map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    this._map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                }
            },this);

            var layers = document.getElementById('menu');
            layers.appendChild(link);
        }

        this._map.on('click','CBS Buurten', $.proxy(function (e) {

            let popup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('<table style="width:100%"><tr><th><center><b>Buurt: '+e.features[0].properties.buurtnaam+'</b></center></th></tr><tr><td>Aantal inwoners:</td><td> '+e.features[0].properties.aantal_inwoners+'</td><td></tr><tr><td>Bevolkingsdichtheid (per km2): </td><td> '+e.features[0].properties.bevolkingsdichtheid_inwoners_per_km2+'</td></tr></table>')
                .addTo(this._map);
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
        },this));

        this._map.on('click', 'BAG', $.proxy(function (e) {
          console.log("click bag");
          var htmlTable = '<div class="table-responsive"><table class="table table-hover"><tbody><tr><td>Bouwjaar</td><td>'+e.features[0].properties.bouwjaar+'</td></tr><tr><td>Status</td><td>'+e.features[0].properties.status+'</td></tr><tr><td>Gebruiksdoel</td><td>'+e.features[0].properties.gebruiksdoel+'</td></tr><tr><td>Aantal objecten</td><td>'+e.features[0].properties.aantal_verblijfsobjecten+'</td></tr><tr><td>Oppervlakte (min)</td><td>'+e.features[0].properties.oppervlakte_min+' m2</td></tr><tr><td>Oppervlakte (max)</td><td>'+e.features[0].properties.oppervlakte_max+' m2</td></tr></tbody></table></div></div>';
          $("#bagTable").html(htmlTable);
        },this));


    }



    getWFS(wfs_url, name, color, opacity) {
        $.ajax({
            url: wfs_url, success: $.proxy(function (result) {
                console.log(result);
                if(name === "FME"){
                    result = JSON.parse(result);
                }

                var geojson: any = {
                    'type': 'geojson',
                    'data': result
                }
                console.log(geojson);

                this._map.addSource("source_" + name, geojson)
                if(name === "FME"){
                    this._map.addLayer({
                        "id": name,
                        "type": "circle",
                        "source": "source_"+name,
                        "paint": {
                            "circle-radius": 10,
                            "circle-color": "#3887be"
                        }

                    });
                } else {
                    this._map.addLayer({
                        "id": name,
                        "type": "fill",
                        "source": "source_" + name,
                        'paint': {
                            'fill-color': color,
                            'fill-opacity': opacity,
                            'fill-outline-color': '#000'
                        }
                    });
                }
                this._map.moveLayer(name, this._address);
            },this)
        });
    }
}

$(function() {
    var app: Application = new Application();
    app.showMap();

    $("#formPage").click(function() {
        app.showForm();
    });
    $("#mapPage").click(function() {
        app.showMap();
    });

});

