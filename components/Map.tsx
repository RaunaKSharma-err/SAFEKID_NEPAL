// LeafletMap.tsx  // expo install react-native-webview
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export type LeafletMapHandle = {
  addMarker: (id: string, lat: number, lng: number, label: string) => void;
  moveMarker: (id: string, lat: number, lng: number, label: string) => void;
  animateMarker: (id: string, lat: number, lng: number, label: string) => void;
};

const leafletHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
  <style> html,body,#map{height:100%; margin:0;} #map{width:100%;height:100%} </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    var map = L.map('map',{zoomControl: false,attributionControl: false}).setView([27.7172, 85.3240], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var markers = {};

    function addOrMoveMarker(id, lat, lng, label) {
    if (!markers[id]) {
    markers[id] = L.marker([lat, lng]).addTo(map);
    if (label) {
      markers[id].bindPopup(label).openPopup();
    }
    } else {
    markers[id].setLatLng([lat, lng]);
    if (label) {
      markers[id].bindPopup(label).openPopup();
        }
      }
    }


    function animateMarker(id, lat, lng) {
      if (!markers[id]) {
        markers[id] = L.marker([lat, lng]).addTo(map);
        return;
      }
      var start = markers[id].getLatLng();
      var end = L.latLng(lat, lng);
      var steps = 50;
      var i = 0;
      var interval = setInterval(function() {
        i++;
        var newLat = start.lat + (end.lat - start.lat) * (i / steps);
        var newLng = start.lng + (end.lng - start.lng) * (i / steps);
        markers[id].setLatLng([newLat, newLng]);
        if (i >= steps) clearInterval(interval);
      }, 50);
    }

    function handleMessage(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data || !data.type) return;

        if (data.type === "addMarker") {
          addOrMoveMarker(data.id, data.lat, data.lng);
        }

        if (data.type === "moveMarker") {
          addOrMoveMarker(data.id, data.lat, data.lng);
          map.flyTo([data.lat, data.lng], map.getZoom(), { animate: true, duration: 2 });
        }

        if (data.type === "animateMarker") {
          animateMarker(data.id, data.lat, data.lng);
          map.flyTo([data.lat, data.lng], map.getZoom(), { animate: true, duration: 2 });
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Support both Android and iOS message events
    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);
  </script>
</body>
</html>
`;

const LeafletMap = forwardRef<LeafletMapHandle, {}>((_props, ref) => {
  const webviewRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    addMarker(id: string, lat: number, lng: number, label?: string) {
      webviewRef.current?.postMessage(
        JSON.stringify({ type: "addMarker", id, lat, lng, label })
      );
    },
    moveMarker(id: string, lat: number, lng: number, label?: string) {
      webviewRef.current?.postMessage(
        JSON.stringify({ type: "moveMarker", id, lat, lng, label })
      );
    },
    animateMarker(id: string, lat: number, lng: number, label?: string) {
      webviewRef.current?.postMessage(
        JSON.stringify({ type: "animateMarker", id, lat, lng, label })
      );
    },
  }));

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={styles.webview}
      />
    </View>
  );
});

// <-- THIS fixes the ESLint/display-name warning
LeafletMap.displayName = "LeafletMap";

const styles = StyleSheet.create({
  container: { width: "100%", height: "60%" }, //  <- adjust the map size
  webview: { width: "100%", height: "60%" },
});

export default LeafletMap;
