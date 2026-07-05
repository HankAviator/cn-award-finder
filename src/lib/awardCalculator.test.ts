import { describe, expect, it } from "vitest";
import { isAirportServedByAirlineFamily } from "@/data/airlineDestinations";
import { getAirportByIata, type Airport } from "@/data/airports";
import { getAwardMiles, getFurthestDestinations } from "@/lib/awardCalculator";
import { getDistanceKm } from "@/lib/distance";

function airport(iata: string): Airport {
  const result = getAirportByIata(iata);
  if (!result) {
    throw new Error(`Missing airport ${iata}`);
  }
  return result;
}

const testOrigin: Airport = {
  iata: "AAA",
  nameEn: "Test Origin Airport",
  cityEn: "Test Origin",
  cityZh: "测试甲",
  countryCode: "CN",
  latitude: 0,
  longitude: 0,
};

const testDestination: Airport = {
  iata: "BBB",
  nameEn: "Test Destination Airport",
  cityEn: "Test Destination",
  cityZh: "测试乙",
  countryCode: "CN",
  latitude: 0,
  longitude: 1,
};

describe("distance", () => {
  it("returns a reasonable PEK to CAN airport-to-airport distance", () => {
    const distance = getDistanceKm(airport("PEK"), airport("CAN"));
    expect(distance).toBeGreaterThan(1850);
    expect(distance).toBeLessThan(1950);
  });

  it("calculates PEK to PKX from airport coordinates", () => {
    const distance = getDistanceKm(airport("PEK"), airport("PKX"));
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(80);
  });

  it("calculates SHA to PVG from airport coordinates", () => {
    const distance = getDistanceKm(airport("SHA"), airport("PVG"));
    expect(distance).toBeGreaterThan(40);
    expect(distance).toBeLessThan(55);
  });

  it("excludes the origin airport from search results", () => {
    const results = getFurthestDestinations({
      originAirportIata: "PEK",
      airlineFamily: "airChina",
      cabin: "economy",
      availableMiles: 30000,
    });

    expect(results.some((result) => result.destinationAirport.iata === "PEK")).toBe(
      false,
    );
  });
});

describe("award chart boundaries", () => {
  it("uses 8000 Air China economy miles at 800 km", () => {
    expect(
      getAwardMiles({
        airlineFamily: "airChina",
        cabin: "economy",
        originAirport: testOrigin,
        destinationAirport: testDestination,
        distanceKm: 800,
      }),
    ).toBe(8000);
  });

  it("uses 12000 Air China economy miles at 801 km", () => {
    expect(
      getAwardMiles({
        airlineFamily: "airChina",
        cabin: "economy",
        originAirport: testOrigin,
        destinationAirport: testDestination,
        distanceKm: 801,
      }),
    ).toBe(12000);
  });

  it("uses 6000 China Eastern economy miles at 600 km", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaEastern",
        cabin: "economy",
        originAirport: testOrigin,
        destinationAirport: testDestination,
        distanceKm: 600,
      }),
    ).toBe(6000);
  });

  it("uses 12000 China Eastern economy miles at 601 km", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaEastern",
        cabin: "economy",
        originAirport: testOrigin,
        destinationAirport: testDestination,
        distanceKm: 601,
      }),
    ).toBe(12000);
  });

  it("uses 6000 China Southern economy miles at 800 km", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaSouthern",
        cabin: "economy",
        originAirport: testOrigin,
        destinationAirport: testDestination,
        distanceKm: 800,
      }),
    ).toBe(6000);
  });

  it("uses 12000 China Southern economy miles at 801 km", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaSouthern",
        cabin: "economy",
        originAirport: testOrigin,
        destinationAirport: testDestination,
        distanceKm: 801,
      }),
    ).toBe(12000);
  });
});

describe("special routes", () => {
  it("uses the Beijing to Guangzhou China Southern override for PEK-CAN", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaSouthern",
        cabin: "economy",
        originAirport: airport("PEK"),
        destinationAirport: airport("CAN"),
        distanceKm: getDistanceKm(airport("PEK"), airport("CAN")),
      }),
    ).toBe(17000);
  });

  it("uses the Beijing to Guangzhou China Southern override for PKX-CAN", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaSouthern",
        cabin: "economy",
        originAirport: airport("PKX"),
        destinationAirport: airport("CAN"),
        distanceKm: getDistanceKm(airport("PKX"), airport("CAN")),
      }),
    ).toBe(17000);
  });

  it("uses the same China Southern override in reverse for CAN-PEK", () => {
    expect(
      getAwardMiles({
        airlineFamily: "chinaSouthern",
        cabin: "economy",
        originAirport: airport("CAN"),
        destinationAirport: airport("PEK"),
        distanceKm: getDistanceKm(airport("CAN"), airport("PEK")),
      }),
    ).toBe(17000);
  });

  it("keeps airport-specific displayed distances when the route is served", () => {
    const pkxCan = getFurthestDestinations({
      originAirportIata: "PKX",
      airlineFamily: "chinaSouthern",
      cabin: "economy",
      availableMiles: 20000,
    }).find((result) => result.destinationAirport.iata === "CAN");

    expect(pkxCan?.distanceKm).toBe(Math.round(getDistanceKm(airport("PKX"), airport("CAN"))));
  });
});

describe("filtering and sorting", () => {
  it("only includes affordable destinations", () => {
    const results = getFurthestDestinations({
      originAirportIata: "PEK",
      airlineFamily: "airChina",
      cabin: "economy",
      availableMiles: 8000,
    });

    expect(results.every((result) => result.requiredMiles <= 8000)).toBe(true);
  });

  it("sorts furthest destinations by distance descending", () => {
    const results = getFurthestDestinations({
      originAirportIata: "PEK",
      airlineFamily: "airChina",
      cabin: "economy",
      availableMiles: 30000,
    });

    expect(results[0].distanceKm).toBeGreaterThanOrEqual(results[1].distanceKm);
  });

  it("sorts best-value destinations by score descending", async () => {
    const { getBestValueDestinations } = await import("@/lib/awardCalculator");
    const results = getBestValueDestinations({
      originAirportIata: "PEK",
      airlineFamily: "airChina",
      cabin: "economy",
      availableMiles: 30000,
    });

    expect(results[0].valueScore).toBeGreaterThanOrEqual(results[1].valueScore);
  });

  it("calculates value score as distance divided by required miles", () => {
    const [result] = getFurthestDestinations({
      originAirportIata: "PEK",
      airlineFamily: "airChina",
      cabin: "economy",
      availableMiles: 30000,
    });

    expect(result.valueScore).toBe(result.distanceKm / result.requiredMiles);
  });

  it("excludes destinations not served by the selected airline family", () => {
    expect(isAirportServedByAirlineFamily("airChina", "ACF")).toBe(false);

    const results = getFurthestDestinations({
      originAirportIata: "PEK",
      airlineFamily: "airChina",
      cabin: "economy",
      availableMiles: 30000,
    });

    expect(results.some((result) => result.destinationAirport.iata === "ACF")).toBe(
      false,
    );
  });

  it("returns no destinations when the selected airline family does not serve the origin", () => {
    expect(isAirportServedByAirlineFamily("chinaSouthern", "PEK")).toBe(false);

    expect(
      getFurthestDestinations({
        originAirportIata: "PEK",
        airlineFamily: "chinaSouthern",
        cabin: "economy",
        availableMiles: 30000,
      }),
    ).toHaveLength(0);
  });
});
