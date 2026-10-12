import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image: any;
};

const events: Event[] = [
  {
    id: 1,
    title: 'Port Moresby Cultural Show',
    date: '2026-09-05',
    location: 'Port Moresby',
    description:
      'A celebration of Papua New Guinean culture, music and dance.',
    image:
      require('../../../assets/images/cultural-show.jpg')
  },
  {
    id: 2,
    title: 'PNG Independence Day Celebration',
    date: '2026-09-16',
    location: 'Port Moresby',
    description:
      'Independence Day celebrations and activities.',
    image:
      require('../../../assets/images/independence-day.jpg')
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const openEvent = (event: Event) => {
    router.push({
      pathname: '/event/[id]',
      params: {
        id: String(event.id),
      },
    } as any);
  };

  const filteredEvents = events.filter((event) => {
    const search = searchText.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      event.title.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search)
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Explore Events</Text>

        <Text style={styles.subtitle}>
          Find events happening across Papua New Guinea
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#888888"
          value={searchText}
          onChangeText={setSearchText}
        />

        <Text style={styles.resultsText}>
          {filteredEvents.length}{' '}
          {filteredEvents.length === 1 ? 'event' : 'events'} found
        </Text>

        <View style={styles.eventsContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Pressable
                key={event.id}
                style={({ pressed }) => [
                  styles.eventCard,
                  pressed && styles.eventCardPressed,
                ]}
                onPress={() => openEvent(event)}
              >
                <Image
                  source={event.image}
                  style={styles.eventImage}
                />

                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>
                    {event.title}
                  </Text>

                  <Text style={styles.eventInfo}>
                    📅 {event.date}
                  </Text>

                  <Text style={styles.eventInfo}>
                    📍 {event.location}
                  </Text>

                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>

                  <Text style={styles.viewEvent}>
                    View Event →
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsTitle}>
                No events found
              </Text>

              <Text style={styles.noResultsText}>
                Try searching for a different event or location.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 22,
    lineHeight: 30,
    color: '#666666',
    marginBottom: 28,
  },

  searchInput: {
    height: 58,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 18,
    color: '#111111',
    backgroundColor: '#f8f8f8',
    marginBottom: 18,
  },

  resultsText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 22,
  },

  eventsContainer: {
    gap: 24,
  },

  eventCard: {
    backgroundColor: '#f4f4f4',
    borderRadius: 24,
    overflow: 'hidden',
  },

  eventCardPressed: {
    opacity: 0.7,
  },

  eventImage: {
    width: '100%',
    height: 190,
  },

  eventContent: {
    padding: 28,
  },

  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 22,
  },

  eventInfo: {
    fontSize: 20,
    color: '#555555',
    marginBottom: 12,
  },

  eventDescription: {
    fontSize: 19,
    lineHeight: 28,
    color: '#555555',
    marginTop: 12,
  },

  viewEvent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 22,
  },

  noResults: {
    backgroundColor: '#f4f4f4',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },

  noResultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },

  noResultsText: {
    fontSize: 17,
    lineHeight: 25,
    color: '#666666',
    textAlign: 'center',
  },
});