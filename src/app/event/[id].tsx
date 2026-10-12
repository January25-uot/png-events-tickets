
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

type Event = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  image_url: string | null;
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function getEvent() {
      setLoading(true);

      const eventId = Number(id);

      if (!id || !Number.isInteger(eventId) || eventId <= 0) {
        if (active) {
          setEvent(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select(
          'id, title, description, location, event_date, image_url'
        )
        .eq('id', eventId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Error loading event:', error);
        Alert.alert(
          'Could not load event',
          'Please check your internet connection and try again.'
        );
        setEvent(null);
      } else {
        setEvent(data as Event | null);
      }

      setLoading(false);
    }

    getEvent();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Event not found.</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const fallbackImage =
    event.title === 'Port Moresby Cultural Show'
      ? require('../../../assets/images/cultural-show.jpg')
      : require('../../../assets/images/independence-day.jpg');

  const imageSource = event.image_url
    ? { uri: event.image_url }
    : fallbackImage;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      <Image source={imageSource} style={styles.eventImage} />

      <View style={styles.card}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.infoText}>{event.event_date}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.infoText}>
            {event.location || 'Location TBA'}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.description}>
          {event.description || 'More information coming soon.'}
        </Text>

        <Pressable
          style={styles.ticketButton}
          onPress={() => {
            router.push({
              pathname: '/event/ticket',
              params: {
                id: String(event.id),
                title: event.title,
              },
            } as any);
          }}
        >
          <Text style={styles.ticketButtonText}>Get Ticket</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  eventImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  card: {
    margin: 20,
    padding: 25,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    fontSize: 17,
    color: '#444444',
  },
  divider: {
    height: 1,
    backgroundColor: '#dddddd',
    marginVertical: 25,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
  },
  ticketButton: {
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  ticketButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#111111',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
