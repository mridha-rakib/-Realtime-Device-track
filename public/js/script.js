const socket = io();

// Map initialization
let map;
let userMarkers = {};
let currentLocationMarker;
let watchId;
let isTracking = false;
let currentPosition = null;

function initMap() {
  // create map centered on Bangladesh (you can change this)
  map = L.map("map").setView([23.8103, 90.4125], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
    minZoom: 2,
  }).addTo(map);

  console.log("Map initialized successfully");
}

// create custom marker icon

function createCustomIcon(color = "blue") {}
