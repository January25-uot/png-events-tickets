
import { supabase } from '../lib/supabase';

export type Booking = {
  id: number;
  user_id: string;
  event_id: number;
  quantity: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  event?: {
    title: string;
    event_date: string;
    location: string | null;
  } | null;
};

export async function getMyBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      user_id,
      event_id,
      quantity,
      status,
      created_at,
      event:events (
        title,
        event_date,
        location
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as unknown as Booking[];
}

export async function createBooking(
  eventId: number,
  quantity: number
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('Please log in to make a booking.');
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      event_id: eventId,
      quantity,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateBooking(
  bookingId: number,
  quantity: number
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ quantity })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteBooking(bookingId: number) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) throw error;
}
