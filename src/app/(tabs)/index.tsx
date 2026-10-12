import { useRouter } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type Event = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  image_url: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert(
                'Logout failed',
                'Something went wrong while logging out. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const loadEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte(
        'event_date',
        new Date().toISOString().split('T')[0]
      )
      .order('event_date', { ascending: true });

    if (error) {
      console.log('Error loading events:', error);
      setEvents([]);
    } else {
      setEvents(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openEvent = (event: Event) => {
    router.push({
      pathname: '/event/[id]',
      params: {
        id: String(event.id),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome section */}
        <View style={styles.header}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>
              Log Out
            </Text>
          </Pressable>

          <Text style={styles.smallHeading}>
            WELCOME TO
          </Text>

          <Text style={styles.title}>
            PNG Events & Tickets
          </Text>

          <Text style={styles.subtitle}>
            Discover exciting events happening across
            Papua New Guinea.
          </Text>
        </View>

        {/* Upcoming events heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.heading}>
            Upcoming Events
          </Text>

          <Text style={styles.eventCount}>
            {events.length} events
          </Text>
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.message}>
              Loading events...
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No upcoming events
            </Text>

            <Text style={styles.message}>
              Check back later for new events.
            </Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            {events.map((event) => (
              <Pressable
                key={event.id}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => openEvent(event)}
              >
                {event.image_url ? (
  <Image
    source={{ uri: event.image_url }}
    style={styles.imagePlaceholder}
    resizeMode="cover"
  />
) : (
  <View style={styles.imagePlaceholder}>
    <Text style={styles.imageIcon}>🎟️</Text>
    <Text style={styles.imageText}>PNG EVENT</Text>
  </View>
)}

                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle}>
                    {event.title}
                  </Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>
                      📅
                    </Text>

                    <Text style={styles.eventDate}>
                      {event.event_date}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>
                      📍
                    </Text>

                    <Text style={styles.location}>
                      {event.location || 'Location TBA'}
                    </Text>
                  </View>

                  {event.description && (
                    <Text
                      style={styles.description}
                      numberOfLines={2}
                    >
                      {event.description}
                    </Text>
                  )}

                  <View style={styles.viewEventRow}>
                    <Text style={styles.viewEvent}>
                      View Event
                    </Text>

                    <Text style={styles.arrow}>
                      →
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Bottom message */}
        {!loading && events.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              More events coming soon 🇵🇬
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 50,
  },

  header: {
    marginBottom: 45,
  },

  logoutButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },

  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  smallHeading: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#777777',
    marginBottom: 10,
  },

  title: {
    fontSize: 38,
    lineHeight: 45,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 18,
    lineHeight: 27,
    color: '#666666',
    maxWidth: 360,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  heading: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111111',
  },

  eventCount: {
    fontSize: 15,
    color: '#777777',
  },

  eventsContainer: {
    gap: 20,
  },

  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    overflow: 'hidden',
  },

  cardPressed: {
    opacity: 0.75,
  },

  imagePlaceholder: {
    height: 150,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageIcon: {
    fontSize: 42,
    marginBottom: 8,
  },

  imageText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#777777',
  },

  cardContent: {
    padding: 22,
  },

  eventTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  infoIcon: {
    fontSize: 17,
    width: 30,
  },

  eventDate: {
    fontSize: 16,
    color: '#555555',
  },

  location: {
    fontSize: 16,
    color: '#555555',
  },

  description: {
    fontSize: 16,
    lineHeight: 23,
    color: '#666666',
    marginTop: 10,
  },

  viewEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  viewEvent: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },

  arrow: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 8,
    color: '#111111',
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  message: {
    fontSize: 16,
    color: '#777777',
    marginTop: 15,
    textAlign: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },

  footer: {
    alignItems: 'center',
    marginTop: 35,
  },

  footerText: {
    fontSize: 15,
    color: '#888888',
  },
});