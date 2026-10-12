
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_CACHE_PREFIX = '@png_events_weather_';

export async function saveWeatherCache(
  location: string,
  weather: unknown
): Promise<void> {
  try {
    const cache = {
      weather,
      savedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      `${WEATHER_CACHE_PREFIX}${location}`,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.warn('Unable to save weather cache.');
  }
}

export async function loadWeatherCache(
  location: string
): Promise<{ weather: unknown; savedAt: string } | null> {
  try {
    const stored = await AsyncStorage.getItem(
      `${WEATHER_CACHE_PREFIX}${location}`
    );

    if (!stored) return null;

    const cache = JSON.parse(stored);

    if (!cache?.weather || typeof cache.savedAt !== 'string') {
      return null;
    }

    return {
      weather: cache.weather,
      savedAt: cache.savedAt,
    };
  } catch (error) {
    return null;
  }
}
