import { useState, useRef, useCallback } from 'react';

export interface AddressSuggestion {
  displayName: string;
  city: string;
  district: string;
  road: string;
  lat: string;
  lon: string;
}

// 從 Nominatim 回傳的地址中解析台灣地址結構
function parseAddress(item: any): AddressSuggestion {
  const addr = item.address || {};
  const displayName: string = item.display_name || '';

  // Nominatim 的台灣地址通常在這些欄位
  const city =
    addr.city || addr.county || addr.state || '';
  const district =
    addr.suburb || addr.town || addr.village || addr.city_district || '';
  const road = [
    addr.road || '',
    addr.house_number ? addr.house_number + '號' : '',
  ]
    .filter(Boolean)
    .join('');

  return {
    displayName,
    city,
    district,
    road,
    lat: item.lat,
    lon: item.lon,
  };
}

export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    // 清除上一次的 debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 太短不搜尋
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(query);
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&countrycodes=tw&limit=6&addressdetails=1&accept-language=zh-TW`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'HOA-LINE-App/1.0',
          },
        });

        if (!res.ok) throw new Error('搜尋失敗');

        const data = await res.json();
        const parsed = data
          .map(parseAddress)
          .filter((s: AddressSuggestion) => s.city || s.district || s.road);

        setSuggestions(parsed);
      } catch (err) {
        console.error('地址搜尋失敗:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return { suggestions, isSearching, search, clear };
}
