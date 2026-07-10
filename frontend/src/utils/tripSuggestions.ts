export interface TripSuggestion {
  id: string;
  destination: string;
  pickupArea: string;
  estimatedTimeOfArrival: string;
  maxSeats: number;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
}

const TRIP_SUGGESTIONS_STORAGE_KEY = 'trip_suggestions';

export function loadTripSuggestions(): TripSuggestion[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(TRIP_SUGGESTIONS_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue) as TripSuggestion[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error('Failed to load trip suggestions:', error);
    return [];
  }
}

export function saveTripSuggestions(suggestions: TripSuggestion[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TRIP_SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
}

export function addTripSuggestion(suggestion: TripSuggestion) {
  const suggestions = loadTripSuggestions();
  const nextSuggestions = [suggestion, ...suggestions];
  saveTripSuggestions(nextSuggestions);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('trip-suggestions-changed'));
  }
  return nextSuggestions;
}

export function removeTripSuggestion(id: string) {
  const suggestions = loadTripSuggestions();
  const nextSuggestions = suggestions.filter((suggestion) => suggestion.id !== id);
  saveTripSuggestions(nextSuggestions);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('trip-suggestions-changed'));
  }
  return nextSuggestions;
}

export function getTripSuggestion(id: string) {
  return loadTripSuggestions().find((suggestion) => suggestion.id === id);
}
