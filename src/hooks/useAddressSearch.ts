import { useState, useRef, useCallback, useEffect } from 'react';

export interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// Google Maps Places Autocomplete API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBsLxokM-gArHjXQYUP1k5f89B_EMY-70c';

// 動態載入 Google Maps Script
let isScriptLoaded = false;
let isScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (isScriptLoaded && window.google?.maps?.places) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    isScriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=zh-TW`;
    script.async = true;
    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      isScriptLoading = false;
      console.error('Google Maps Script 載入失敗');
      resolve(); // 不 reject，讓 fallback 機制運作
    };
    document.head.appendChild(script);
  });
}

export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 載入 Google Maps
  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (window.google?.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        setIsReady(true);
      }
    });
  }, []);

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(() => {
      const service = autocompleteServiceRef.current;

      if (!service) {
        // Google Maps 沒載入成功，用 fallback
        setIsSearching(false);
        setSuggestions([]);
        return;
      }

      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'tw' },
          types: ['address'],
          language: 'zh-TW',
        },
        (predictions, status) => {
          setIsSearching(false);

          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const results: AddressSuggestion[] = predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting.main_text,
              secondaryText: p.structured_formatting.secondary_text || '',
            }));
            setSuggestions(results);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return { suggestions, isSearching, isReady, search, clear };
}
