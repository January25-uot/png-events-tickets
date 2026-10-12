
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([-9.478, 147.149], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([-9.472, 147.150])
      .addTo(map)
      .bindPopup('<b>Port Moresby Cultural Show</b><br>Approximate event area');

    L.marker([-9.484, 147.160])
      .addTo(map)
      .bindPopup('<b>PNG Independence Day Celebration</b><br>Approximate event area');

    let currentLocationMarker = null;

    function showCurrentLocation(lat, lon) {
      const position = [lat, lon];

      map.setView(position, 15);

      if (currentLocationMarker) {
        currentLocationMarker.setLatLng(position);
      } else {
        currentLocationMarker = L.marker(position)
          .addTo(map)
          .bindPopup('<b>Your current location</b>');
      }

      currentLocationMarker.openPopup();
    }

    function receiveLocation(event) {
      try {
        const coords = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;

        if (
          coords &&
          Number.isFinite(coords.latitude) &&
          Number.isFinite(coords.longitude)
        ) {
          showCurrentLocation(coords.latitude, coords.longitude);
        }
      } catch (error) {
        console.log('Could not read location message');
      }
    }

    document.addEventListener('message', receiveLocation);
    window.addEventListener('message', receiveLocation);

    window.showCurrentLocation = showCurrentLocation;
  </script>
</body>
</html>
`;

export default function LocationsScreen() {
  const mapRef = useRef<WebView>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    'Tap below to find your current location.'
  );

  useEffect(() => {
    if (!location || !mapLoaded) return;

    const coordinates = JSON.stringify({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    mapRef.current?.postMessage(coordinates);
  }, [location, mapLoaded]);

  const findLocation = async () => {
    setLoading(true);
    setMessage('');

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocation(null);
        setMessage(
          'Location permission was denied. You can still view the event map.'
        );
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();

      if (!enabled) {
        setMessage(
          'Phone location services are off. Enable Location in settings and try again.'
        );
        return;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy,
      };

      setLocation(coords);
      setMessage('Your current location was found successfully.');
    } catch (error) {
      console.error('Location error:', error);
      setMessage('Could not get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCoordinates = () => {
    if (!location) return;

    Alert.alert(
      'Your coordinates',
      `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.eyebrow}>DISCOVER PNG</Text>
      <Text style={styles.title}>Event Locations</Text>
      <Text style={styles.subtitle}>
        Explore event areas in Port Moresby and find your current location.
      </Text>

      <Text style={styles.sectionTitle}>Explore the map</Text>

      <View style={styles.mapContainer}>
        <WebView
          ref={mapRef}
          originWhitelist={['*']}
          source={{ html: MAP_HTML }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={() => setMapLoaded(true)}
          onError={() =>
            Alert.alert(
              'Map error',
              'The map could not load. Check your internet connection.'
            )
          }
        />
      </View>

      <Text style={styles.mapNote}>
        Markers show approximate areas in Port Moresby, not confirmed event
        venues. Map tiles require an internet connection.
      </Text>

      <View style={styles.card}>
        <Text style={styles.pin}>📍</Text>
        <Text style={styles.cardTitle}>Your current location</Text>
        <Text style={styles.message}>{message}</Text>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#ffffff" />
            <Text style={styles.buttonText}>Finding location...</Text>
          </View>
        ) : (
          <Pressable style={styles.button} onPress={findLocation}>
            <Text style={styles.buttonText}>
              {location ? 'Refresh Location' : 'Find My Location'}
            </Text>
          </Pressable>
        )}
      </View>

      {location && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Location found</Text>

          <Text style={styles.coordinateLabel}>Latitude</Text>
          <Text style={styles.coordinate}>
            {location.latitude.toFixed(6)}
          </Text>

          <Text style={styles.coordinateLabel}>Longitude</Text>
          <Text style={styles.coordinate}>
            {location.longitude.toFixed(6)}
          </Text>

          {location.accuracy !== null && (
            <Text style={styles.accuracy}>
              Approximate accuracy: {Math.round(location.accuracy)} metres
            </Text>
          )}

          <Pressable
            style={styles.secondaryButton}
            onPress={openCoordinates}
          >
            <Text style={styles.secondaryButtonText}>View Coordinates</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.note}>
        Your location is requested only when you tap the button. You can deny
        permission and still view the event map.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 24, paddingTop: 35, paddingBottom: 50 },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#777777',
    marginBottom: 10,
  },
  title: { fontSize: 34, fontWeight: '800', color: '#111111' },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    marginTop: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  mapContainer: {
    height: 300,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  mapNote: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666666',
    marginTop: 10,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 24,
    borderRadius: 22,
    alignItems: 'flex-start',
  },
  pin: { fontSize: 40, marginBottom: 15 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555555',
    marginBottom: 22,
  },
  button: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  loadingRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'stretch',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 20,
    padding: 22,
    marginTop: 22,
  },
  resultTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 20,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 5,
  },
  coordinate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  accuracy: { fontSize: 13, color: '#666666', marginBottom: 20 },
  secondaryButton: {
    backgroundColor: '#eeeeee',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: '#777777',
    marginTop: 22,
  },
});
