import { test } from "node:test";
import assert from "node:assert/strict";
import { easter, formatDate, liturgicalDay } from "../web/js/calendar.js";

const day = (iso) => liturgicalDay(iso);

test("Easter dates", () => {
  assert.equal(formatDate(easter(2024)), "2024-03-31");
  assert.equal(formatDate(easter(2025)), "2025-04-20");
  assert.equal(formatDate(easter(2026)), "2026-04-05");
  assert.equal(formatDate(easter(2027)), "2027-03-28");
});

test("Ordinary Time Sundays and weekdays (autumn 2026, Year A, weekday cycle II)", () => {
  const d = day("2026-10-18");
  assert.equal(d.key, "OT29-0-A");
  assert.equal(d.names.en, "29th Sunday in Ordinary Time");
  assert.equal(d.names.pl, "XXIX Niedziela zwykła");
  assert.equal(d.names.it, "XXIX Domenica del Tempo Ordinario");
  assert.equal(d.color, "green");
  assert.deepEqual(d.cycle, { sunday: "A", weekday: "II" });
  assert.equal(day("2026-10-19").key, "OT29-1");
  assert.equal(day("2026-10-24").key, "OT29-6");
  assert.equal(day("2026-10-25").key, "OT30-0-A");
});

test("Sunday outranks a saint's feast; a feast outranks a weekday", () => {
  assert.equal(day("2026-10-18").celebration, undefined); // St Luke falls on a Sunday in 2026
  assert.equal(day("2027-10-18").key, "luke");
  assert.equal(day("2027-10-18").color, "red");
});

test("Solemnities and feasts of the Lord replace Sundays in Ordinary Time", () => {
  assert.equal(day("2026-11-01").key, "all-saints");
  assert.equal(day("2026-11-22").key, "christ-the-king-A");
  assert.equal(day("2025-11-09").key, "lateran");
});

test("Season boundaries", () => {
  assert.equal(day("2026-11-29").key, "ADV1-0-B");
  assert.equal(day("2026-12-13").color, "rose");
  assert.equal(day("2026-12-17").key, "advent-dec-17");
  assert.equal(day("2026-12-25").key, "christmas");
  assert.equal(day("2026-12-27").key, "holy-family-B");
  assert.equal(day("2022-12-30").key, "holy-family-A");
  assert.equal(day("2027-01-01").key, "mary-mother-of-god");
  assert.equal(day("2026-01-11").key, "baptism-A");
  assert.equal(day("2026-01-12").key, "OT1-1");
  assert.equal(day("2026-01-18").key, "OT2-0-A");
  assert.equal(day("2026-02-18").key, "ash-wednesday");
  assert.equal(day("2026-02-22").key, "LENT1-0-A");
  assert.equal(day("2026-03-29").key, "palm-sunday-A");
  assert.equal(day("2026-04-03").key, "good-friday");
  assert.equal(day("2026-04-05").key, "easter-sunday");
  assert.equal(day("2026-04-12").key, "EASTER2-0-A");
  assert.equal(day("2026-05-24").key, "pentecost");
  assert.equal(day("2026-05-25").key, "OT8-1");
  assert.equal(day("2026-05-31").key, "trinity-A");
});

test("Transferred solemnities", () => {
  assert.equal(day("2024-03-25").key, "holy-week-1"); // Monday of Holy Week keeps its place
  assert.equal(day("2024-03-25").names.en, "Monday of Holy Week");
  assert.equal(day("2024-04-08").key, "annunciation");
  assert.equal(day("2027-04-05").key, "annunciation");
  assert.equal(day("2024-12-08").key, "ADV2-0-C");
  assert.equal(day("2024-12-09").key, "immaculate-conception");
});
