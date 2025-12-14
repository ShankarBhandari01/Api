import { DateTime } from "luxon";

/**
 * Returns a start and end Date for the given range string (e.g., "30d")
 */
export const getDateRange = (range = "30d") => {
  const days = parseInt(range.replace(/\D/g, ""), 10) || 30;

  const end = DateTime.now().setZone("Europe/Helsinki").endOf("day");
  const start = end.minus({ days }).startOf("day");

  return {
    start: start.toJSDate(),
    end: end.toJSDate(),
  };
};


/**
 * Fills missing dates in a dataset with default value 0
 */

export function fillMissingDates(data, days, valueKey = "total") {
  const map = new Map(
    data.map((d) => [DateTime.fromJSDate(d.date, { zone: "utc" }).toISODate(), d[valueKey]]),
  );
  // day in 30d
  const indays = parseInt(days.replace(/\D/g, ""), 10) || 30;
  const result = [];
  const today = DateTime.now().setZone("utc").startOf("day");

  for (let i = indays - 1; i >= 0; i--) {
    const date = today.minus({ days: i });
    const key = date.toISODate();

    result.push({
      date: date.toISO(), // full ISO string
      [valueKey]: map.get(key) || 0,
    });
  }

  return result;
}