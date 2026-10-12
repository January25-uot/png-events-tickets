
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createBooking } from '../../services/bookings';

export default function SummaryScreen() {
  const router = useRouter();

  const { id, title, quantity } = useLocalSearchParams<{
    id: string;
    title: string;
    quantity: string;
  }>();

  const [saving, setSaving] = useState(false);

  const eventTitle = title || 'Event Ticket';
  const ticketQuantity = Number(quantity);
  const eventId = Number(id);

  const confirmBooking = async () => {
    if (
      !id ||
      !Number.isInteger(eventId) ||
      eventId <= 0 ||
      !Number.isInteger(ticketQuantity) ||
      ticketQuantity < 1 ||
      ticketQuantity > 10
    ) {
      Alert.alert(
        'Invalid booking',
        'Please go back and select a valid event and ticket quantity.'
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      await createBooking(eventId, ticketQuantity);

      Alert.alert(
        'Booking Confirmed!',
        `Your ${ticketQuantity} ticket(s) for ${eventTitle} have been saved successfully.`,
        [
          {
            text: 'Done',
            onPress: () => router.replace('/(tabs)/explore' as any),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Booking failed:', error);

      Alert.alert(
        'Booking Failed',
        'Your booking could not be saved. Please check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Order Summary</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Event</Text>

          <Text style={styles.eventTitle}>{eventTitle}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Number of tickets</Text>

          <Text style={styles.quantity}>
            {Number.isInteger(ticketQuantity) ? ticketQuantity : '—'}
          </Text>
        </View>

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={confirmBooking}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.savingRow}>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.buttonText}>Saving booking...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Confirm Booking</Text>
          )}
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
    marginBottom: 35,
  },
  card: {
    backgroundColor: '#f4f4f4',
    borderRadius: 24,
    padding: 28,
    marginBottom: 30,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 34,
    marginBottom: 25,
  },
  divider: {
    height: 1,
    backgroundColor: '#dddddd',
    marginBottom: 25,
  },
  quantity: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  button: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
