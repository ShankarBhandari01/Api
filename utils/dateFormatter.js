// src/utils/dateFormatter.js
import { DateTime } from "luxon";

export function formatFinnishDateTime(jsDate) {
  const date = DateTime.fromJSDate(jsDate, { zone: "utc" });

  return {
    time: date.toFormat("HH:mm"), 
    date: date
      .setZone("Europe/Helsinki")
      .setLocale("fi")
      .toFormat("cccc, d MMMM yyyy"),
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