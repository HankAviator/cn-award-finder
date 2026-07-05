import type { Airport } from "@/data/airports";

function isLatinQuery(query: string) {
  return /^[a-z0-9\s'-]+$/i.test(query);
}

function byAirportCodePriority(query: string) {
  const normalizedQuery = query.toUpperCase();

  return (a: Airport, b: Airport) => {
    const aCode = a.iata.toUpperCase();
    const bCode = b.iata.toUpperCase();

    const aExact = aCode === normalizedQuery;
    const bExact = bCode === normalizedQuery;
    if (aExact !== bExact) {
      return aExact ? -1 : 1;
    }

    const aPrefix = aCode.startsWith(normalizedQuery);
    const bPrefix = bCode.startsWith(normalizedQuery);
    if (aPrefix !== bPrefix) {
      return aPrefix ? -1 : 1;
    }

    const aIndex = aCode.indexOf(normalizedQuery);
    const bIndex = bCode.indexOf(normalizedQuery);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    return aCode.localeCompare(bCode);
  };
}

export function searchAirports(airports: Airport[], query: string): Airport[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return airports;
  }

  if (isLatinQuery(normalizedQuery)) {
    const codeMatches = airports
      .filter((airport) => airport.iata.toLowerCase().includes(normalizedQuery))
      .sort(byAirportCodePriority(normalizedQuery));

    if (codeMatches.length > 0) {
      return codeMatches;
    }

    return airports.filter((airport) =>
      airport.nameEn.toLowerCase().includes(normalizedQuery),
    );
  }

  return airports.filter((airport) => {
    const haystack = [
      airport.nameZh,
      airport.cityZh,
      airport.province,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
