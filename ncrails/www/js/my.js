
var map,
    selectFeatureControl,
    selectedFeature;

/*******************    g e t C e n t e r   ********************/
function getCenter() {
    var sourceProjection = new OpenLayers.Projection("EPSG:4326");
    var destinationProjection = new OpenLayers.Projection("EPSG:900913");
    var lon = -79.828377;
    var lat = 35.603719;
    var center = new OpenLayers.LonLat(lon, lat);
    center.transform(sourceProjection, destinationProjection);
    return center;
} // end getCenter

/**********   a d d J s o n L a y e r   *************/
function addJsonLayer(map, layerCode) {

    $.getJSON('json/railroads.json', layerCode, function(data) {
        console.log("In addJsonLayer layerCode = " + layerCode);
        console.log(data[layerCode].url);
        console.log(data[layerCode].layerName);
        console.log(data[layerCode].defaultColor);
        console.log(data[layerCode].selectColor);

        var defaultStyle = new OpenLayers.Style({
            'strokeColor': data[layerCode].defaultColor,
            'strokeWidth': 5,
        });
        var selectStyle = new OpenLayers.Style({
            'strokeColor': data[layerCode].selectColor,
            'strokeWidth': 7,
        });
        var vectorLayerStyleMap = new OpenLayers.StyleMap({
            'default': defaultStyle,
            'select': selectStyle
        });
        var vectorLayer = new OpenLayers.Layer.Vector(
                data[layerCode].layerName, {
            strategies: [new OpenLayers.Strategy.Fixed()],
            projection: "EPSG:4326",
            styleMap: vectorLayerStyleMap,
            protocol: new OpenLayers.Protocol.HTTP({
                url: data[layerCode].url,
                format: new OpenLayers.Format.GeoJSON()
            })
        });
        vectorLayer.setVisibility(data[layerCode].visibility);
        map.addLayer(vectorLayer);

        //Create and add selectFeature control
        selectFeatureControl = new OpenLayers.Control.SelectFeature(
            vectorLayer, {
                hover   : false,
                onSelect: onFeatureSelect, 
                onUnselect: onFeatureUnselect
            }
        );
        map.addControl(selectFeatureControl); 
        map.addControl(new OpenLayers.Control.MousePosition());

        //Activate the control
        selectFeatureControl.activate();

        //Register the event
        vectorLayer.events.register('featureselected', this, selectedFeature);

    }); // end getJSON
} // end addJsonLayer

/***********   o n P o p u p C l o s e   ************/
function onPopupClose(event) {
    selectFeatureControl.unselect(selectedFeature);
}

/************   o n F e a t u r e S e l e c t   ***********/
function onFeatureSelect(feature) {
    var popup = new OpenLayers.Popup.FramedCloud("chicken", 
        feature.geometry.getBounds().getCenterLonLat(),
        null,
        '<div> <p>Owner is ' +  feature.attributes.RROWNER1 + '</p>' +
            '<p>Second owner is ' + feature.attributes.RROWNER2 + '</p>' +
            '<p>Trackage rights to ' + feature.attributes.TRKRGHTS1 + '</p>' +
            '<p>Passenger service by ' + feature.attributes.PASSNGR + '</p>' +
            '</div>',
        null, 
        true, 
        onPopupClose
   );
   feature.popup = popup;
   map.addPopup(popup);
}

/********   o n F e a t u r e u n S e l e c t  ***************/
function onFeatureUnselect(feature) {
    map.removePopup(feature.popup);
    feature.popup.destroy();
    feature.popup = null;
} 

/********************    i n i t   ***************************/
function init() {
    // Place location into local storage
    var center = getCenter();

    //var map = new OpenLayers.Map("mapElement");
    var maxResolution = 156543.0339;
    var bound = 128 * maxResolution;
    map = new OpenLayers.Map('mapElement', {
        maxExtent: new OpenLayers.Bounds (
           -1 * bound,
           -1 * bound,
           bound,
           bound
        ),
        maxResolution: maxResolution,
        units: 'm',
        //projection: new OpenLayers.Projection('EPSG:900913'),
        projection: new OpenLayers.Projection('EPSG:4326'),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    // bing roads layer
    /***
    var bingKey =
    var bingRoadsLayer = new OpenLayers.Layer.Bing({
        name: 'Bing Roads',
        layers: 'basic',
        type: 'Road',
        key: bingKey,
        isBaseLayer: true
    });
    map.addLayer(bingRoadsLayer);
    *****/

    var osmLayer = new OpenLayers.Layer.OSM();
    map.addLayer(osmLayer);

    // Create the railoads layer
    addJsonLayer(map, "nsowner");
    addJsonLayer(map, "nstrackage");
    addJsonLayer(map, "csxtowner");
    addJsonLayer(map, "csxttrackage");
    addJsonLayer(map, "shortlines");
    addJsonLayer(map, "amtrak");

    // center the map
    var zoom=7;
    map.setCenter (center, zoom);

} // end init

$("#homePage").live("pageshow", function() {
    init();
});

