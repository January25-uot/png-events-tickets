
import {
  loadWeatherCache,
  saveWeatherCache,
} from '@/services/weather-cache';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Place = {
  name: string;
  latitude: number;
  longitude: number;
};

type WeatherData = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

const PLACES: Place[] = [
  { name: 'Port Moresby', latitude: -9.4431, longitude: 147.1956 },
  { name: 'Lae', latitude: -6.73, longitude: 147.0 },
  { name: 'Mount Hagen', latitude: -5.8575, longitude: 144.23 },
];

function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<WeatherData>;

  return (
    !!data.current &&
    typeof data.current.temperature_2m === 'number' &&
    !!data.daily &&
    Array.isArray(data.daily.time) &&
    Array.isArray(data.daily.weather_code) &&
    Array.isArray(data.daily.temperature_2m_max) &&
    Array.isArray(data.daily.temperature_2m_min) &&
    data.daily.time.length > 0 &&
    data.daily.weather_code.length === data.daily.time.length &&
    data.daily.temperature_2m_max.length === data.daily.time.length &&
    data.daily.temperature_2m_min.length === data.daily.time.length
  );
}

function weatherDescription(code: number) {
  if (code === 0) return 'Clear sky';
  if ([1, 2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Weather conditions unavailable';
}

function weatherEmoji(code: number) {
  if (code === 0) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌤️';
}

export default function WeatherScreen() {
  const [place, setPlace] = useState<Place>(PLACES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineMessage, setOfflineMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError('');
    setOfflineMessage('');

    try {
      const url =
        'https://api.open-meteo.com/v1/forecast' +
        `?latitude=${place.latitude}` +
        `&longitude=${place.longitude}` +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
        '&forecast_days=7&timezone=auto';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? 'The weather service is busy. Please wait a little and try again.'
            : `Weather service returned error ${response.status}.`
        );
      }

      const result: unknown = await response.json();

      if (!isWeatherData(result)) {
        throw new Error('The weather service returned invalid or empty data.');
      }

      setWeather(result);

      const updated = new Date().toISOString();
      setLastUpdated(updated);
      await saveWeatherCache(place.name, result);
    } catch (e) {
      const cached = await loadWeatherCache(place.name);

      if (cached && isWeatherData(cached.weather)) {
        setWeather(cached.weather);
        setLastUpdated(cached.savedAt);
        setOfflineMessage(
          'Could not refresh weather. Showing your last saved forecast, which may be out of date.'
        );
      } else {
        setWeather(null);
        setError(
          e instanceof Error
            ? `${e.message} No saved forecast is available offline.`
            : 'Could not load weather. Check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [place]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.eyebrow}>DISCOVER PNG</Text>
      <Text style={styles.title}>Weather Forecast</Text>
      <Text style={styles.subtitle}>
        Check current conditions and the 7-day forecast across Papua New Guinea.
      </Text>

      <Text style={styles.sectionTitle}>Choose a location</Text>

      <View style={styles.placeRow}>
        {PLACES.map((item) => (
          <Pressable
            key={item.name}
            onPress={() => setPlace(item)}
            style={[
              styles.placeButton,
              place.name === item.name && styles.selectedPlace,
            ]}
          >
            <Text
              style={[
                styles.placeText,
                place.name === item.name && styles.selectedPlaceText,
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="large" color="#111111" />
          <Text style={styles.stateText}>Loading weather...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateEmoji}>🌧️</Text>
          <Text style={styles.stateTitle}>Weather unavailable</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable style={styles.button} onPress={loadWeather}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : weather ? (
        <>
          {offlineMessage !== '' && (
            <View style={styles.offlineCard}>
              <Text style={styles.offlineText}>{offlineMessage}</Text>
            </View>
          )}

          <View style={styles.currentCard}>
            <Text style={styles.currentPlace}>{place.name}</Text>
            <Text style={styles.currentEmoji}>
              {weatherEmoji(weather.current.weather_code)}
            </Text>
            <Text style={styles.temperature}>
              {Math.round(weather.current.temperature_2m)}°C
            </Text>
            <Text style={styles.description}>
              {weatherDescription(weather.current.weather_code)}
            </Text>
            <Text style={styles.feelsLike}>
              Feels like {Math.round(weather.current.apparent_temperature)}°C
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricIcon}>💧</Text>
                <Text style={styles.metricValue}>
                  {weather.current.relative_humidity_2m}%
                </Text>
                <Text style={styles.metricLabel}>Humidity</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricIcon}>💨</Text>
                <Text style={styles.metricValue}>
                  {Math.round(weather.current.wind_speed_10m)} km/h
                </Text>
                <Text style={styles.metricLabel}>Wind</Text>
              </View>
            </View>
          </View>

          <View style={styles.forecastCard}>
            <Text style={styles.sectionTitle}>7-day forecast</Text>

            {weather.daily.time.map((day, index) => (
              <View key={day} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>
                  {index === 0
                    ? 'Today'
                    : new Date(`${day}T12:00:00`).toLocaleDateString(
                        'en',
                        { weekday: 'short', day: 'numeric' }
                      )}
                </Text>
                <Text style={styles.forecastEmoji}>
                  {weatherEmoji(weather.daily.weather_code[index])}
                </Text>
                <Text style={styles.forecastDescription}>
                  {weatherDescription(weather.daily.weather_code[index])}
                </Text>
                <Text style={styles.forecastTemps}>
                  {Math.round(weather.daily.temperature_2m_max[index])}° /{' '}
                  {Math.round(weather.daily.temperature_2m_min[index])}°
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.updated}>
            {lastUpdated
              ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
              : 'Showing saved weather data'}
          </Text>

          <Pressable style={styles.button} onPress={loadWeather}>
            <Text style={styles.buttonText}>Refresh Weather</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>No weather data</Text>
          <Text style={styles.stateText}>
            There is no forecast to display right now.
          </Text>
          <Pressable style={styles.button} onPress={loadWeather}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.note}>
        Forecasts are provided by Open-Meteo. Saved forecasts may be outdated.
        An internet connection is needed to refresh weather.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 24, paddingTop: 35, paddingBottom: 50 },
  eyebrow: {
    fontSize: 13, fontWeight: '700', letterSpacing: 2,
    color: '#777777', marginBottom: 10,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#111111' },
  subtitle: {
    fontSize: 16, lineHeight: 24, color: '#666666',
    marginTop: 10, marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: '#111111',
    marginBottom: 12,
  },
  placeRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22,
  },
  placeButton: {
    borderWidth: 1, borderColor: '#dddddd', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  selectedPlace: { backgroundColor: '#111111', borderColor: '#111111' },
  placeText: { fontSize: 13, fontWeight: '600', color: '#333333' },
  selectedPlaceText: { color: '#ffffff' },
  currentCard: {
    backgroundColor: '#f3f5f7', borderRadius: 24, padding: 24,
    alignItems: 'center', marginBottom: 24,
  },
  currentPlace: { fontSize: 18, fontWeight: '700', color: '#444444' },
  currentEmoji: { fontSize: 58, marginTop: 12 },
  temperature: {
    fontSize: 54, fontWeight: '800', color: '#111111', marginTop: 4,
  },
  description: { fontSize: 18, fontWeight: '600', color: '#333333' },
  feelsLike: { fontSize: 14, color: '#666666', marginTop: 8 },
  metricsRow: {
    flexDirection: 'row', alignSelf: 'stretch', marginTop: 26,
    paddingTop: 20, borderTopWidth: 1, borderTopColor: '#dddddd',
  },
  metric: { flex: 1, alignItems: 'center' },
  metricIcon: { fontSize: 22 },
  metricValue: {
    fontSize: 16, fontWeight: '700', color: '#222222', marginTop: 6,
  },
  metricLabel: { fontSize: 13, color: '#666666', marginTop: 4 },
  forecastCard: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 20, padding: 16,
  },
  forecastRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#eeeeee', gap: 8,
  },
  forecastDay: {
    width: 48, fontSize: 13, fontWeight: '700', color: '#333333',
  },
  forecastEmoji: { fontSize: 22 },
  forecastDescription: { flex: 1, fontSize: 12, color: '#666666' },
  forecastTemps: { fontSize: 12, fontWeight: '700', color: '#222222' },
  updated: {
    fontSize: 12, color: '#777777', marginTop: 16, marginBottom: 14,
  },
  stateCard: {
    alignItems: 'center', backgroundColor: '#f4f4f4',
    borderRadius: 20, padding: 24, gap: 14,
  },
  stateEmoji: { fontSize: 42 },
  stateTitle: { fontSize: 20, fontWeight: '700', color: '#111111' },
  stateText: {
    fontSize: 15, lineHeight: 22, color: '#555555', textAlign: 'center',
  },
  offlineCard: {
    backgroundColor: '#fff3cd', borderRadius: 12, padding: 14, marginBottom: 16,
  },
  offlineText: { fontSize: 13, lineHeight: 19, color: '#664d03' },
  button: {
    backgroundColor: '#111111', borderRadius: 12, paddingVertical: 15,
    paddingHorizontal: 20, alignItems: 'center', alignSelf: 'stretch',
    marginTop: 12,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  note: { fontSize: 12, lineHeight: 18, color: '#777777', marginTop: 24 },
});
