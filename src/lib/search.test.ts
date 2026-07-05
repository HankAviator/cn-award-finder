import { describe, expect, it } from "vitest";
import { airports } from "@/data/airports";
import { searchAirports } from "@/lib/search";

describe("searchAirports", () => {
  it("prioritizes airport code matches for latin-letter queries", () => {
    const results = searchAirports(airports, "sha");

    expect(results.map((airport) => airport.iata)).toEqual(["SHA"]);
  });

  it("sorts code matches by exact match, prefix match, then contained match", () => {
    const results = searchAirports(airports, "pe").map((airport) => airport.iata);

    expect(results[0]).toBe("PEK");
    expect(results).toContain("BPE");
  });

  it("falls back to pinyin-style english airport names when no code matches", () => {
    const results = searchAirports(airports, "beijing").map(
      (airport) => airport.iata,
    );

    expect(results).toContain("PEK");
    expect(results).toContain("PKX");
  });

  it("keeps chinese text matching for chinese queries", () => {
    const results = searchAirports(airports, "北京").map((airport) => airport.iata);

    expect(results).toContain("PEK");
    expect(results).toContain("PKX");
  });
});
