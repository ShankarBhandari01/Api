// src/utils/dateFormatter.js
import { DateTime } from "luxon";

export function formatFinnishDateTime(isoString) {
  const date = DateTime.fromISO(isoString);

  const time = date.toFormat("HH:mm");

  const formattedDate = date
    .setLocale("fi")
    .toFormat("cccc, d MMMM yyyy");

  return {
    time,
    date: formattedDate,
  };
}
export function getStartdayEndDay() {
  const start = DateTime.now()
    .setZone("Europe/Helsinki")
    .startOf("day")
    .toJSDate();

  const end = DateTime.now()
    .setZone("Europe/Helsinki")
    .endOf("day")
    .toJSDate();

  return {
    start, end
  }
}