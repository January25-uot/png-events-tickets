
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Booking,
  deleteBooking,
  getMyBookings,
  updateBooking,
} from '../../services/bookings';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('1');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const results = await getMyBookings();
      setBookings(results);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setErrorMessage(
        'Could not load your bookings. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const startEditing = (booking: Booking) => {
    setEditingId(booking.id);
    setEditQuantity(String(booking.quantity));
  };

  const saveQuantity = async (bookingId: number) => {
    const quantity = Number(editQuantity.trim());

    if (
      !editQuantity.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      Alert.alert(
        'Invalid quantity',
        'Enter a whole number between 1 and 10.'
      );
      return;
    }

    setSavingId(bookingId);

    try {
      await updateBooking(bookingId, quantity);
      setEditingId(null);
      await loadBookings();

      Alert.alert('Updated', 'Your ticket quantity has been updated.');
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert(
        'Update failed',
        'Could not update this booking. Please try again.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = (booking: Booking) => {
    Alert.alert(
      'Delete booking?',
      'This will permanently remove this booking.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSavingId(booking.id);

            try {
              await deleteBooking(booking.id);
              setBookings((current) =>
                current.filter((item) => item.id !== booking.id)
              );
              if (editingId === booking.id) {
                setEditingId(null);
              }
              Alert.alert('Deleted', 'Your booking has been removed.');
            } catch (error) {
              console.error('Error deleting booking:', error);
              Alert.alert(
                'Delete failed',
                'Could not delete this booking. Please try again.'
              );
            } finally {
              setSavingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.subtitle}>
        View and manage your event tickets.
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#64152D" />
          <Text style={styles.message}>Loading your bookings...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.emptyCard}>
          <Text style={styles.message}>{errorMessage}</Text>
          <Pressable style={styles.button} onPress={loadBookings}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.message}>
            When you book an event, it will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {bookings.map((booking) => {
            const eventData = booking.event;
            const event = Array.isArray(eventData)
              ? eventData[0]
              : eventData;

            const eventName = event?.title || `Event #${booking.event_id}`;
            const eventDate = event?.event_date || 'Date unavailable';
            const location = event?.location || 'Location TBA';
            const isSaving = savingId === booking.id;

            return (
              <View key={booking.id} style={styles.card}>
                <View style={styles.cardAccent} />

                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle}>{eventName}</Text>

                  <Text style={styles.detail}>📅 {eventDate}</Text>
                  <Text style={styles.detail}>📍 {location}</Text>

                  {editingId === booking.id ? (
                    <View style={styles.editSection}>
                      <Text style={styles.label}>
                        Ticket quantity (1–10)
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={editQuantity}
                        onChangeText={setEditQuantity}
                        keyboardType="number-pad"
                        maxLength={2}
                        editable={!isSaving}
                      />

                      <View style={styles.actions}>
                        <Pressable
                          style={[
                            styles.button,
                            isSaving && styles.disabledButton,
                          ]}
                          onPress={() => saveQuantity(booking.id)}
                          disabled={isSaving}
                        >
                          <Text style={styles.buttonText}>
                            {isSaving ? 'Saving...' : 'Save'}
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.secondaryButton}
                          onPress={() => setEditingId(null)}
                          disabled={isSaving}
                        >
                          <Text style={styles.secondaryButtonText}>
                            Cancel
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.quantity}>
                        Tickets: {booking.quantity}
                      </Text>
                      <Text style={styles.status}>
                        Status: {booking.status}
                      </Text>

                      <View style={styles.actions}>
                        <Pressable
                          style={[
                            styles.button,
                            isSaving && styles.disabledButton,
                          ]}
                          onPress={() => startEditing(booking)}
                          disabled={isSaving}
                        >
                          <Text style={styles.buttonText}>Edit</Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.deleteButton,
                            isSaving && styles.disabledButton,
                          ]}
                          onPress={() => confirmDelete(booking)}
                          disabled={isSaving}
                        >
                          <Text style={styles.buttonText}>
                            {isSaving ? 'Please wait...' : 'Delete'}
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  content: {
    padding: 24,
    paddingTop: 35,
    paddingBottom: 50,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#64152D',
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#74656A',
    marginTop: 8,
    marginBottom: 28,
  },

  list: {
    gap: 18,
  },

  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },

  cardAccent: {
    height: 5,
    backgroundColor: '#D9AC55',
  },

  cardContent: {
    padding: 22,
  },

  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#35121F',
    marginBottom: 15,
  },

  detail: {
    fontSize: 15,
    color: '#59484E',
    marginBottom: 9,
  },

  quantity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64152D',
    marginTop: 12,
  },

  status: {
    fontSize: 14,
    color: '#74656A',
    marginTop: 6,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#35121F',
  },

  editSection: {
    marginTop: 18,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9AC55',
    borderRadius: 10,
    padding: 13,
    fontSize: 18,
    color: '#35121F',
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },

  button: {
    backgroundColor: '#64152D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#F0E4E7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: '#64152D',
    fontSize: 15,
    fontWeight: '700',
  },

  deleteButton: {
    backgroundColor: '#A52A35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  center: {
    alignItems: 'center',
    paddingVertical: 50,
  },

  emptyCard: {
    padding: 25,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#64152D',
    marginBottom: 8,
  },

  message: {
    fontSize: 15,
    lineHeight: 23,
    color: '#74656A',
    textAlign: 'center',
    marginTop: 10,
  },
});
