import type { Airport } from "./airports";

export type Cabin = "economy" | "premiumEconomy" | "business" | "first";

export type AirlineFamily = "airChina" | "chinaEastern" | "chinaSouthern";

export type DistanceBand = {
  minKm: number;
  maxKm: number | null;
  miles: Partial<Record<Cabin, number>>;
};

export type SpecialRouteOverride = {
  airlineFamily: AirlineFamily;
  fromCityZh: string;
  toCityZh: string;
  miles: Partial<Record<Cabin, number>>;
};

export const airlineFamilyLabels: Record<
  AirlineFamily,
  { zh: string; en: string }
> = {
  airChina: { zh: "国航系", en: "Air China family" },
  chinaEastern: { zh: "东航系", en: "China Eastern family" },
  chinaSouthern: { zh: "南航系", en: "China Southern family" },
};

export const cabinLabels: Record<Cabin, { zh: string; en: string }> = {
  economy: { zh: "经济舱", en: "Economy" },
  premiumEconomy: { zh: "明珠经济舱", en: "Premium economy" },
  business: { zh: "商务舱", en: "Business" },
  first: { zh: "头等舱", en: "First" },
};

export const awardCharts: Record<AirlineFamily, DistanceBand[]> = {
  airChina: [
    { minKm: 0, maxKm: 800, miles: { economy: 8000, business: 15000, first: 20000 } },
    { minKm: 801, maxKm: 1200, miles: { economy: 12000, business: 21000, first: 25000 } },
    { minKm: 1201, maxKm: 2000, miles: { economy: 15000, business: 26000, first: 30000 } },
    { minKm: 2001, maxKm: null, miles: { economy: 20000, business: 34000, first: 40000 } },
  ],
  chinaEastern: [
    { minKm: 1, maxKm: 600, miles: { economy: 6000, business: 8000, first: 11000 } },
    { minKm: 601, maxKm: 1200, miles: { economy: 12000, business: 16000, first: 21000 } },
    { minKm: 1201, maxKm: 1800, miles: { economy: 16000, business: 20000, first: 28000 } },
    { minKm: 1801, maxKm: 2400, miles: { economy: 20000, business: 25000, first: 35000 } },
    { minKm: 2401, maxKm: null, miles: { economy: 25000, business: 32000, first: 43000 } },
  ],
  chinaSouthern: [
    {
      minKm: 1,
      maxKm: 800,
      miles: { economy: 6000, premiumEconomy: 7000, business: 12000, first: 15000 },
    },
    {
      minKm: 801,
      maxKm: 1700,
      miles: { economy: 12000, premiumEconomy: 14000, business: 24000, first: 30000 },
    },
    {
      minKm: 1701,
      maxKm: 3000,
      miles: { economy: 15000, premiumEconomy: 18000, business: 30000, first: 38000 },
    },
    {
      minKm: 3001,
      maxKm: 5000,
      miles: { economy: 25000, premiumEconomy: 30000, business: 50000, first: 63000 },
    },
  ],
};

const southernOverride = (
  fromCityZh: Airport["cityZh"],
  toCityZh: Airport["cityZh"],
  economy: number,
  premiumEconomy: number,
  business: number,
  first: number,
): SpecialRouteOverride => ({
  airlineFamily: "chinaSouthern",
  fromCityZh,
  toCityZh,
  miles: { economy, premiumEconomy, business, first },
});

export const specialRouteOverrides: SpecialRouteOverride[] = [
  southernOverride("北京", "大连", 8000, 10000, 14000, 18000),
  southernOverride("上海", "武汉", 8000, 11000, 14000, 18000),
  southernOverride("广州", "南昌", 8000, 11000, 14000, 18000),
  southernOverride("海口", "深圳", 9000, 11000, 15000, 18000),
  southernOverride("广州", "贵阳", 9000, 11000, 15000, 18000),
  southernOverride("广州", "海口", 10000, 12000, 16000, 18000),
  southernOverride("北京", "沈阳", 10000, 12000, 16000, 18000),
  southernOverride("广州", "厦门", 10000, 12000, 16000, 18000),
  southernOverride("广州", "福州", 10000, 12000, 16000, 18000),
  southernOverride("广州", "三亚", 10000, 12000, 16000, 18000),
  southernOverride("长春", "上海", 13000, 16000, 24000, 30000),
  southernOverride("广州", "济南", 13000, 16000, 24000, 30000),
  southernOverride("北京", "长沙", 13000, 16000, 24000, 30000),
  southernOverride("深圳", "西安", 13000, 16000, 24000, 30000),
  southernOverride("深圳", "郑州", 13000, 16000, 24000, 30000),
  southernOverride("广州", "上海", 13000, 16000, 24000, 30000),
  southernOverride("深圳", "上海", 13000, 16000, 24000, 30000),
  southernOverride("北京", "成都", 14000, 16000, 24000, 30000),
  southernOverride("北京", "长春", 14000, 16000, 24000, 30000),
  southernOverride("广州", "北京", 17000, 20000, 30000, 38000),
  southernOverride("北京", "深圳", 17000, 20000, 30000, 38000),
  southernOverride("广州", "长春", 17000, 24000, 30000, 38000),
  southernOverride("广州", "哈尔滨", 17000, 24000, 30000, 38000),
  southernOverride("北京", "海口", 17000, 24000, 30000, 38000),
  southernOverride("北京", "乌鲁木齐", 18000, 24000, 30000, 38000),
  southernOverride("北京", "三亚", 18000, 24000, 30000, 38000),
];
