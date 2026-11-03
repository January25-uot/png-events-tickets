
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
          placeholderTextColor="#8B7D81"
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
                  resizeMode="cover"
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
    backgroundColor: '#FAF7F2',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#64152D',
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 19,
    lineHeight: 28,
    color: '#74656A',
    marginBottom: 28,
  },

  searchInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D9AC55',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#35121F',
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
  },

  resultsText: {
    fontSize: 15,
    color: '#74656A',
    marginBottom: 22,
  },

  eventsContainer: {
    gap: 24,
  },

  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },

  eventCardPressed: {
    opacity: 0.8,
  },

  eventImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#F0E4E7',
  },

  eventContent: {
    padding: 22,
  },

  eventTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    color: '#35121F',
    marginBottom: 18,
  },

  eventInfo: {
    fontSize: 16,
    color: '#59484E',
    marginBottom: 12,
  },

  eventDescription: {
    fontSize: 16,
    lineHeight: 25,
    color: '#74656A',
    marginTop: 10,
  },

  viewEvent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64152D',
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0E4E7',
  },

  noResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },

  noResultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64152D',
    marginBottom: 10,
  },

  noResultsText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#74656A',
    textAlign: 'center',
  },
});
