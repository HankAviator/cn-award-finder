import { airports, getAirportByIata, type Airport } from "@/data/airports";
import { isAirportServedByAirlineFamily } from "@/data/airlineDestinations";
import {
  awardCharts,
  specialRouteOverrides,
  type AirlineFamily,
  type Cabin,
  type SpecialRouteOverride,
} from "@/data/awardCharts";
import { getDistanceKm } from "@/lib/distance";

export type AwardMilesParams = {
  airlineFamily: AirlineFamily;
  cabin: Cabin;
  originAirport: Airport;
  destinationAirport: Airport;
  distanceKm: number;
};

export type AwardSearchParams = {
  originAirportIata: string;
  airlineFamily: AirlineFamily;
  cabin: Cabin;
  availableMiles: number;
};

export type AwardResult = {
  originAirport: Airport;
  destinationAirport: Airport;
  airlineFamily: AirlineFamily;
  cabin: Cabin;
  distanceKm: number;
  requiredMiles: number;
  remainingMiles: number;
  valueScore: number;
  usedSpecialOverride: boolean;
};

export function findSpecialRouteOverride({
  airlineFamily,
  originAirport,
  destinationAirport,
}: Pick<
  AwardMilesParams,
  "airlineFamily" | "originAirport" | "destinationAirport"
>): SpecialRouteOverride | undefined {
  return specialRouteOverrides.find((override) => {
    if (override.airlineFamily !== airlineFamily) {
      return false;
    }

    const forward =
      override.fromCityZh === originAirport.cityZh &&
      override.toCityZh === destinationAirport.cityZh;
    const reverse =
      override.fromCityZh === destinationAirport.cityZh &&
      override.toCityZh === originAirport.cityZh;

    return forward || reverse;
  });
}

export function getAwardMiles({
  airlineFamily,
  cabin,
  originAirport,
  destinationAirport,
  distanceKm,
}: AwardMilesParams): number | null {
  const override = findSpecialRouteOverride({
    airlineFamily,
    originAirport,
    destinationAirport,
  });

  if (override) {
    return override.miles[cabin] ?? null;
  }

  const roundedDistance = Math.round(distanceKm);
  const band = awardCharts[airlineFamily].find((distanceBand) => {
    const underMax =
      distanceBand.maxKm === null || roundedDistance <= distanceBand.maxKm;
    return roundedDistance >= distanceBand.minKm && underMax;
  });

  return band?.miles[cabin] ?? null;
}

export function getAffordableDestinations({
  originAirportIata,
  airlineFamily,
  cabin,
  availableMiles,
}: AwardSearchParams): AwardResult[] {
  const originAirport = getAirportByIata(originAirportIata);

  if (!originAirport || !Number.isFinite(availableMiles) || availableMiles <= 0) {
    return [];
  }

  if (!isAirportServedByAirlineFamily(airlineFamily, originAirport.iata)) {
    return [];
  }

  return airports
    .filter(
      (destinationAirport) =>
        destinationAirport.iata !== originAirport.iata &&
        isAirportServedByAirlineFamily(airlineFamily, destinationAirport.iata),
    )
    .map((destinationAirport) => {
      const distanceKm = getDistanceKm(originAirport, destinationAirport);
      const requiredMiles = getAwardMiles({
        airlineFamily,
        cabin,
        originAirport,
        destinationAirport,
        distanceKm,
      });

      if (requiredMiles === null || requiredMiles > availableMiles) {
        return null;
      }

      const roundedDistance = Math.round(distanceKm);

      return {
        originAirport,
        destinationAirport,
        airlineFamily,
        cabin,
        distanceKm: roundedDistance,
        requiredMiles,
        remainingMiles: availableMiles - requiredMiles,
        valueScore: roundedDistance / requiredMiles,
        usedSpecialOverride:
          findSpecialRouteOverride({
            airlineFamily,
            originAirport,
            destinationAirport,
          }) !== undefined,
      };
    })
    .filter((result): result is AwardResult => result !== null);
}

export function getFurthestDestinations(params: AwardSearchParams): AwardResult[] {
  return [...getAffordableDestinations(params)].sort(
    (a, b) => b.distanceKm - a.distanceKm,
  );
}

export function getBestValueDestinations(params: AwardSearchParams): AwardResult[] {
  return [...getAffordableDestinations(params)].sort(
    (a, b) => b.valueScore - a.valueScore,
  );
}
