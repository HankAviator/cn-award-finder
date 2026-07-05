"use client";

import { FormEvent, useMemo, useState } from "react";
import { airports, getAirportByIata } from "@/data/airports";
import { airlineServedAirportIatas } from "@/data/airlineDestinations";
import {
  airlineFamilyLabels,
  cabinLabels,
  type AirlineFamily,
  type Cabin,
} from "@/data/awardCharts";
import {
  getBestValueDestinations,
  getFurthestDestinations,
  type AwardResult,
} from "@/lib/awardCalculator";
import { searchAirports } from "@/lib/search";

type Language = "zh" | "en";

const copy = {
  zh: {
    tagline: "估算中国大陆机场之间，里程可以飞多远。",
    origin: "出发机场",
    originHelp: "按城市、机场名称或 IATA 三字码搜索",
    airlineFamily: "航司体系",
    cabin: "舱位",
    miles: "可用里程 / 积分",
    tripType: "行程类型",
    servedAirports: "航点过滤",
    servedAirportsHelp: "当前航司服务 {count} 个中国大陆机场；结果仅显示该航司可飞目的地。",
    oneWay: "单程",
    search: "查询可兑换目的地",
    summary: "结果摘要",
    departureAirport: "出发机场",
    affordable: "可兑换目的地",
    furthestAirport: "最远机场",
    bestValueAirport: "最高价值机场",
    furthestTitle: "最远可兑换目的地机场",
    bestValueTitle: "最高价值目的地机场",
    empty: "在当前规则和里程余额下，没有可兑换的目的地机场。",
    validationOrigin: "请选择出发机场。",
    validationMiles: "请输入大于 0 的可用里程 / 积分。",
    disclaimer:
      "结果为估算值：按机场到机场大圆距离和静态兑换表规则计算。实际航司航线里程、经停/中转路径和奖励票余位可能不同。",
    special: "特殊航线规则",
    tableHeaders: [
      "目的地",
      "估算机场距离",
      "所需里程\n剩余里程",
      "价值分",
      "规则",
    ],
  },
  en: {
    tagline: "Estimate how far mainland China airline miles can take you.",
    origin: "Origin airport",
    originHelp: "Search by city, airport name, or IATA code",
    airlineFamily: "Airline family",
    cabin: "Cabin",
    miles: "Available miles / points",
    tripType: "Trip type",
    servedAirports: "Route filter",
    servedAirportsHelp:
      "This airline serves {count} mainland China airports; results only include served destinations.",
    oneWay: "One-way",
    search: "Find destination airports",
    summary: "Results summary",
    departureAirport: "Departure airport",
    affordable: "Affordable destinations",
    furthestAirport: "Furthest airport",
    bestValueAirport: "Best-value airport",
    furthestTitle: "Furthest affordable destination airports",
    bestValueTitle: "Best-value destination airports",
    empty:
      "No destination airports are affordable with this mileage balance under the selected rules.",
    validationOrigin: "Choose an origin airport.",
    validationMiles: "Enter available miles / points greater than 0.",
    disclaimer:
      "Results are estimates: calculated from airport-to-airport great-circle distance and static award chart rules. Actual airline route mileage, routings, and award availability may differ.",
    special: "Special route rule",
    tableHeaders: [
      "Destination",
      "Estimated airport distance",
      "Required miles\nRemaining miles",
      "Value score",
      "Rule",
    ],
  },
} satisfies Record<Language, Record<string, unknown>>;

function airportLabel(result: AwardResult["originAirport"], language: Language) {
  const city = language === "zh" ? result.cityZh : result.cityEn;
  const name = language === "zh" ? result.nameZh ?? result.nameEn : result.nameEn;
  return `${city} · ${name}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function TableHeader({ header }: { header: string }) {
  const [primary, secondary] = header.split("\n");

  if (!secondary) {
    return primary;
  }

  return (
    <>
      <span className="block">{primary}</span>
      <span className="block text-[11px] font-medium leading-4 text-slate-400">
        {secondary}
      </span>
    </>
  );
}

function ResultTable({
  title,
  results,
  language,
}: {
  title: string;
  results: AwardResult[];
  language: Language;
}) {
  const labels = copy[language];

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-[16px] font-semibold text-slate-950">{title}</h2>
        <span className="text-[16px] text-slate-500">{results.length}</span>
      </div>
      <div>
        <table className="award-results-table w-full border-collapse text-left text-[15px]">
          <thead className="bg-slate-50 text-[14px] font-semibold uppercase text-slate-500">
            <tr>
              {(labels.tableHeaders as string[]).map((header) => (
                <th className="px-4 py-3" key={header}>
                  <TableHeader header={header} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((result, index) => (
              <tr
                className={index === 0 ? "bg-teal-50/70" : "bg-white"}
                key={`${result.destinationAirport.iata}-${title}`}
              >
                <td className="px-4 py-4 align-top" data-label={(labels.tableHeaders as string[])[0]}>
                  <div className="font-semibold text-slate-950">
                    {result.destinationAirport.iata}
                  </div>
                  <div className="max-w-48 text-[13px] leading-5 text-slate-500">
                    {airportLabel(result.destinationAirport, language)}
                  </div>
                </td>
                <td className="px-4 py-4 align-top font-medium" data-label={(labels.tableHeaders as string[])[1]}>
                  {formatNumber(result.distanceKm)} km
                </td>
                <td className="px-4 py-4 align-top" data-label={(labels.tableHeaders as string[])[2]}>
                  <div>
                    <div className="font-medium text-slate-950">
                      {formatNumber(result.requiredMiles)}
                    </div>
                    <div className="mt-1 text-[13px] leading-4 text-slate-400">
                      {formatNumber(result.remainingMiles)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top" data-label={(labels.tableHeaders as string[])[3]}>
                  {result.valueScore.toFixed(4)}
                </td>
                <td className="px-4 py-4 align-top" data-label={(labels.tableHeaders as string[])[4]}>
                  {result.usedSpecialOverride ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[13px] font-semibold text-red-700 ring-1 ring-red-100">
                      {labels.special as string}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("zh");
  const [originAirportIata, setOriginAirportIata] = useState("PKX");
  const [airportQuery, setAirportQuery] = useState("");
  const [airlineFamily, setAirlineFamily] =
    useState<AirlineFamily>("chinaSouthern");
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [availableMiles, setAvailableMiles] = useState("20000");
  const [errors, setErrors] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(true);

  const labels = copy[language];
  const servedAirportCount = airlineServedAirportIatas[airlineFamily].length;

  const filteredAirports = useMemo(
    () => searchAirports(airports, airportQuery),
    [airportQuery],
  );
  const originAirport = useMemo(
    () => getAirportByIata(originAirportIata),
    [originAirportIata],
  );

  const numericMiles = Number(availableMiles);
  const validSearch =
    Boolean(originAirportIata) && Number.isFinite(numericMiles) && numericMiles > 0;

  const searchParams = {
    originAirportIata,
    airlineFamily,
    cabin,
    availableMiles: numericMiles,
  };

  const furthestResults = validSearch
    ? getFurthestDestinations(searchParams).slice(0, 12)
    : [];
  const bestValueResults = validSearch
    ? getBestValueDestinations(searchParams).slice(0, 12)
    : [];
  const allAffordable = validSearch
    ? getFurthestDestinations(searchParams)
    : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: string[] = [];

    if (!originAirportIata) {
      nextErrors.push(labels.validationOrigin as string);
    }

    if (!Number.isFinite(numericMiles) || numericMiles <= 0) {
      nextErrors.push(labels.validationMiles as string);
    }

    setErrors(nextErrors);
    setHasSearched(true);
  }

  return (
    <main className="min-h-screen px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              CN Award Finder
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {labels.tagline as string}
            </p>
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(["zh", "en"] as const).map((item) => (
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  language === item
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                key={item}
                onClick={() => setLanguage(item)}
                type="button"
              >
                {item === "zh" ? "中文" : "English"}
              </button>
            ))}
          </div>
        </header>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form
            className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  {labels.origin as string}
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setAirportQuery(event.target.value)}
                  placeholder={labels.originHelp as string}
                  value={airportQuery}
                />
              </label>

              <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
                {filteredAirports.map((airport) => (
                  <button
                    className={`block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm transition last:border-b-0 ${
                      originAirportIata === airport.iata
                        ? "bg-teal-50 text-teal-900"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    key={airport.iata}
                    onClick={() => setOriginAirportIata(airport.iata)}
                    type="button"
                  >
                    <span className="font-semibold">{airport.iata}</span>
                    <span className="ml-2">
                      {language === "zh"
                        ? `${airport.cityZh} · ${airport.nameZh}`
                        : `${airport.cityEn} · ${airport.nameEn}`}
                    </span>
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  {labels.airlineFamily as string}
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) =>
                    setAirlineFamily(event.target.value as AirlineFamily)
                  }
                  value={airlineFamily}
                >
                  {(Object.keys(airlineFamilyLabels) as AirlineFamily[]).map(
                    (family) => (
                      <option key={family} value={family}>
                        {airlineFamilyLabels[family][language]}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  {labels.cabin as string}
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setCabin(event.target.value as Cabin)}
                  value={cabin}
                >
                  {(Object.keys(cabinLabels) as Cabin[]).map((item) => (
                    <option key={item} value={item}>
                      {cabinLabels[item][language]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  {labels.miles as string}
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  min="1000"
                  onChange={(event) => setAvailableMiles(event.target.value)}
                  step="1000"
                  type="number"
                  value={availableMiles}
                />
              </label>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                <div className="font-semibold text-slate-800">
                  {labels.servedAirports as string}
                </div>
                <div className="mt-1 leading-5">
                  {(labels.servedAirportsHelp as string).replace(
                    "{count}",
                    formatNumber(servedAirportCount),
                  )}
                </div>
              </div>

              <div className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">
                  {labels.tripType as string}:
                </span>{" "}
                {labels.oneWay as string}
              </div>

              {errors.length > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                  {errors.join(" ")}
                </div>
              )}

              <button
                className="w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                type="submit"
              >
                {labels.search as string}
              </button>
            </div>
          </form>

          <div className="min-w-0 space-y-5">
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    {labels.summary as string}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {labels.disclaimer as string}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    {labels.departureAirport as string}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {originAirport?.iata ?? "-"}
                  </div>
                  <div className="mt-1 text-sm leading-5 text-slate-600">
                    {originAirport
                      ? language === "zh"
                        ? `${originAirport.cityZh} · ${originAirport.nameZh}`
                        : `${originAirport.cityEn} · ${originAirport.nameEn}`
                      : ""}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    {labels.affordable as string}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {allAffordable.length}
                  </div>
                </div>
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <div className="text-xs font-semibold uppercase text-teal-700">
                    {labels.furthestAirport as string}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-teal-950">
                    {furthestResults[0]?.destinationAirport.iata ?? "-"}
                  </div>
                  <div className="mt-1 text-sm text-teal-800">
                    {furthestResults[0]
                      ? `${formatNumber(furthestResults[0].distanceKm)} km`
                      : ""}
                  </div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="text-xs font-semibold uppercase text-red-700">
                    {labels.bestValueAirport as string}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-red-950">
                    {bestValueResults[0]?.destinationAirport.iata ?? "-"}
                  </div>
                  <div className="mt-1 text-sm text-red-800">
                    {bestValueResults[0]
                      ? bestValueResults[0].valueScore.toFixed(4)
                      : ""}
                  </div>
                </div>
              </div>
            </section>

            {hasSearched && allAffordable.length === 0 ? (
              <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                {labels.empty as string}
              </section>
            ) : (
              <ResultTable
                language={language}
                results={bestValueResults}
                title={labels.bestValueTitle as string}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
