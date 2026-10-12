
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function TicketScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{
    id: string;
    title: string;
  }>();

  const [quantity, setQuantity] = useState('1');

  const eventTitle = title || 'Event Ticket';

  const continueToSummary = () => {
    const ticketCount = Number(quantity.trim());
    const eventId = Number(id);

    if (!id || !Number.isInteger(eventId) || eventId <= 0) {
      Alert.alert(
        'Invalid event',
        'The event ID is missing. Please go back and select the event again.'
      );
      return;
    }

    if (
      !quantity.trim() ||
      !Number.isInteger(ticketCount) ||
      ticketCount < 1 ||
      ticketCount > 10
    ) {
      Alert.alert(
        'Invalid quantity',
        'Please enter a whole number between 1 and 10 tickets.'
      );
      return;
    }

    router.push({
      pathname: '/event/summary',
      params: {
        id: String(eventId),
        title: eventTitle,
        quantity: String(ticketCount),
      },
    } as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Get Tickets</Text>

        <Text style={styles.eventTitle}>{eventTitle}</Text>

        <Text style={styles.label}>Number of tickets</Text>

        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          placeholder="Enter quantity (1–10)"
          maxLength={2}
        />

        <Text style={styles.hint}>
          You can book between 1 and 10 tickets.
        </Text>

        <Pressable
          style={styles.button}
          onPress={continueToSummary}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  content: {
    padding: 24,
    paddingTop: 60,
  },
  back: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 40,
    color: '#111111',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 30,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    marginBottom: 10,
    color: '#111111',
  },
  hint: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});
