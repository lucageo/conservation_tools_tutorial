
//Initialise map
var pixel_ratio = parseInt(window.devicePixelRatio) || 1;

var max_zoom = 16;
var tile_size = 512;

var map = L.map('map', {
}).setView([-7, 38], 6);



var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
 attribution: 'October 2017 version of the World Database on Protected Areas (WDPA)'
});
var light  = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
  subdomains: 'abcd',
  opacity: 1,
  attribution: 'October 2017 version of the World Database on Protected Areas (WDPA)',
  maxZoom: 19
}).addTo(map);
var topLayer =  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', {
  subdomains: 'abcd',
  opacity: 1,
  maxZoom: 19
}).addTo(map);





// on click function
map.on('click', function(e) {
	 if (map.hasLayer(wdpa)) {
		var latlng= e.latlng;
		var url = getFeatureInfoUrl(
					map,
					wdpa,
					e.latlng,
					{
							'info_format': 'text/javascript',  
							'propertyName': ' name,wdpaid',
							'query_layers': 'foss4g:wdpa ',
							'format_options':'callback:getJson'
					}
			);
			 $.ajax({
							 jsonp: false,
							 url: url,
							 dataType: 'jsonp',
							 jsonpCallback: 'getJson',
							 success: handleJson_featureRequest
						 });
					function handleJson_featureRequest(data)
					{
						 if (typeof data.features[0]!=='undefined')
								 {
										var prop=data.features[0].properties;
										var filter="wdpaid='"+prop['wdpaid']+"'";
										wdpa_hi.setParams({CQL_FILTER:filter});
										hi_highcharts_wdpa(prop,latlng);
							}
							else {}
						}
				 }
				 else {
			 }
});

// wdpa layer
var url = 'http://localhost:8082/geoserver/foss4g/wms';
var wdpa=L.tileLayer.wms(url, {
		layers: 'foss4g:wdpa',
		transparent: true,
		format: 'image/png',
		opacity:'1',
		zIndex: 33
	}).addTo(map);


	// get feature info function
	function getFeatureInfoUrl(map, layer, latlng, params) {

	    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
	        size = map.getSize(),
	        bounds = map.getBounds(),
	        sw = bounds.getSouthWest(),
	        ne = bounds.getNorthEast();

	    var defaultParams = {
	        request: 'GetFeatureInfo',
	        service: 'WMS',
	        srs: 'EPSG:4326',
	        styles: '',
	        version: layer._wmsVersion,
	        format: layer.options.format,
	        bbox: bounds.toBBoxString(),
	        height: size.y,
	        width: size.x,
	        layers: layer.options.layers,
	        info_format: 'text/javascript'
	    };

	    params = L.Util.extend(defaultParams, params || {});
	    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
	    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
	    return layer._url + L.Util.getParamString(params, layer._url, true);
	}

// wdpa HIGLIGHTED
	var url = 'http://localhost:8082/geoserver/foss4g/wms';
	var wdpa_hi=L.tileLayer.wms(url, {
		  layers: 'foss4g:wdpa',
			transparent: true,
			format: 'image/png',
			opacity:'1',
			styles: 'protected_areas_selected ',
			zIndex: 44
	 }).addTo(map);
wdpa_hi.setParams({CQL_FILTER:"wdpaid LIKE ''"});

	// charts function
function hi_highcharts_wdpa(info,latlng){
 var name=info['name'];
 var wdpaid=info['wdpaid'];
 var popupContent = '<center><h5>'+name+'</h5></center>';
 var popup = L.popup()
	.setLatLng([latlng.lat, latlng.lng])
	.setContent(popupContent)
	.openOn(map);
	$( "#wdpa_plot_1995" ).show();
	$( "#wdpa_plot_2015" ).show();
	$( "#wdpa_plot_1995_title" ).show();
	$( "#wdpa_plot_2015_title" ).show();

// Land Cover Change (1995-2015)
var url_wdpaid_lcc = 'http://localhost:8888/rest.py?type=fun&schema=public&obj=get_pa_lc_1995_2015&params=(wdpaid:'+wdpaid+')';
  $.ajax({
	      url: url_wdpaid_lcc,
	      dataType: 'json',
	      success: function(d) {
  		             var _1995_man;
  		             var _1995_nat;
  		             var _1995_wat;
  		             var _1995_cul;
                             var _2015_man;
  		             var _2015_nat;
  		             var _2015_wat;
  		             var _2015_cul;
                             var name;

                   $(d).each(function(i, data) {
                    _1995_man = parseFloat(data._1995_man);
                    _1995_nat = parseFloat(data._1995_nat);
                    _1995_wat = parseFloat(data._1995_wat);
                    _1995_cul = parseFloat(data._1995_cul);
                    _2015_man = parseFloat(data._2015_man);
                    _2015_nat = parseFloat(data._2015_nat);
                    _2015_wat = parseFloat(data._2015_wat);
                    _2015_cul = parseFloat(data._2015_cul);
                    name = data.name;
                 });
                 
    // Land Cover 1995
     $('#wdpa_plot_1995').highcharts({
    	 chart: {type:'bar', height: 300,
    	 backgroundColor:'rgba(255, 255, 255, 0)',
    	 legend: {enabled: false}
       },
    	 title: {text: null},
    	 subtitle: {text: null},
    	 credits: {
	 enabled: false,
	 text: '© DOPA Services',
	 href: 'http://dopa.jrc.ec.europa.eu/en/services'
    	 },
	xAxis: {
	categories: [name]
    	 },
    	 yAxis: {
	 title: { text: null },
	 labels: {overflow: 'justify'}
    	 },
    	 series:[{
		name: 'Cultivated / managed land',
		color: '#d07a41',
		data: [_1995_cul]
		},{
		name: 'Mosaic natural / managed land',
		color: '#cca533',
		data: [_1995_man]
		},{
		name: 'Natural / semi-natural land',
		color: '#759a5d',
		data: [_1995_nat]
		},{
		name: 'Water / snow and ice',
		color: '#5976ab',
		data: [_1995_wat]
		}]
     });

     // Land Cover 2015
     $('#wdpa_plot_2015').highcharts({
    	 chart: {type:'bar', height: 300,
    	 backgroundColor:'rgba(255, 255, 255, 0)',
    	 legend: {enabled: false}
    	 },
    	 title: {text: null},
    	 subtitle: {text: null},
    	 credits: {
	 enabled: false,
	 text: '© DOPA Services',
	 href: 'http://dopa.jrc.ec.europa.eu/en/services'
    	 },
	xAxis: {
	categories: [name]
	},
    	 yAxis: {
	 title: { text: null },
	 labels: {overflow: 'justify'}
    	 },
       series:[{
	name: 'Cultivated / managed land',
	color: '#d07a41',
	data: [_2015_cul]
	},{
	name: 'Mosaic natural / managed land',
	color: '#cca533',
	data: [_2015_man]
	},{
	name: 'Natural / semi-natural land',
	color: '#759a5d',
	data: [_2015_nat]
	},{
	name: 'Water / snow and ice',
	color: '#5976ab',
	data: [_2015_wat]
	}]
     });

   },
	  
 });

}

map.on('popupclose', function (){ //map is the name of map you gave to your leaflet map
	$( "#wdpa_plot_1995" ).hide();
	$( "#wdpa_plot_2015" ).hide();
});


//Available Layers
var baseMaps = {"White" : light, "Esri_WorldImagery":Esri_WorldImagery};
var overlayMaps = {'wdpa': wdpa};

//Add Layer Control
layerControl = L.control.layers(baseMaps, overlayMaps, null,  {position: 'bottomleft'}).addTo(map);
