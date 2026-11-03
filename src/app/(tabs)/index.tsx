
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
            <ActivityIndicator
              size="large"
              color="#64152D"
            />

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
                    <Text style={styles.imageText}>
                      PNG EVENT
                    </Text>
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
    backgroundColor: '#FAF7F2',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 50,
  },

  header: {
    marginBottom: 45,
    padding: 22,
    paddingTop: 24,
    borderRadius: 24,
    backgroundColor: '#64152D',
  },

  logoutButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#D9AC55',
    marginBottom: 24,
  },

  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#35121F',
  },

  smallHeading: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#F0D9A3',
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: '#F8EDEF',
    maxWidth: 360,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#64152D',
  },

  eventCount: {
    fontSize: 14,
    color: '#74656A',
  },

  eventsContainer: {
    gap: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },

  cardPressed: {
    opacity: 0.8,
  },

  imagePlaceholder: {
    height: 150,
    backgroundColor: '#F0E4E7',
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
    color: '#64152D',
  },

  cardContent: {
    padding: 22,
  },

  eventTitle: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    color: '#35121F',
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
    color: '#59484E',
  },

  location: {
    flex: 1,
    fontSize: 16,
    color: '#59484E',
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#74656A',
    marginTop: 10,
  },

  viewEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0E4E7',
  },

  viewEvent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64152D',
  },

  arrow: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 8,
    color: '#D9AC55',
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  message: {
    fontSize: 16,
    color: '#74656A',
    marginTop: 15,
    textAlign: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64152D',
  },

  footer: {
    alignItems: 'center',
    marginTop: 35,
    padding: 16,
  },

  footerText: {
    fontSize: 15,
    color: '#74656A',
  },
});
