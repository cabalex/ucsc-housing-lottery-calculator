// May 2024 data
const DATA = {
  c9: { students: 459, beds: 209 },
  cowell: { students: 410, beds: 245 },
  crown: { students: 476, beds: 325 },
  jrl: { students: 425, beds: 47 },
  kresge: { students: 308, beds: 104 },
  merrill: { students: 475, beds: 216 },
  oakes: { students: 399, beds: 298 },
  porter: { students: 499, beds: 180 },
  rcc: { students: 443, beds: 314 },
  stevenson: { students: 398, beds: 225 },
  utc: { students: 91, beds: 55 },
  village: { students: 176, beds: 135 },
};

const DATE_START_TIME = 7.5; // 8:30 AM
const DATE_END_TIME = 15; // 3:00 PM
const HOUSING_DATES = 8;

function getNextHousingDate() {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() >= 5) {
    year += 1;
  }

  // second wednesday in april
  const april = new Date(year, 3, 1);
  let wednesdayCount = 0;
  for (let day = 1; day <= 14; day++) {
    const date = new Date(year, 3, day);
    if (date.getDay() === 3) {
      wednesdayCount += 1;
      if (wednesdayCount === 2) {
        return date;
      }
    }
  }
  return null;
}

function calculateChances(college, startDate) {
  const data = DATA[college];
  if (!data) {
    throw new Error("College not found");
  }

  if (college === "jrl" || college === "c9") {
    // JRL and C9 housing stock are combined
    data = {
      students: DATA["jrl"].students + DATA["c9"].students,
      beds: DATA["jrl"].beds + DATA["c9"].beds,
    }
  }

  const chance = data.beds / data.students;
  const result = Math.random();
  const accepted = result < chance;

  // calculate lottery time based on random
  let date = new Date(startDate);
  for (let i = 0; i < HOUSING_DATES; i++) {
    if (date.getDay() === 0 || date.getDay() === 6) {
      // skip weekends
      i--;
    } else {
      if (i / HOUSING_DATES > result) {
        const percentThroughDay =
          (result - (i - 1) / HOUSING_DATES) / (1 / HOUSING_DATES);
        const dayTime =
          DATE_START_TIME +
          (DATE_END_TIME - DATE_START_TIME) * percentThroughDay;
        date.setHours(
          Math.round(dayTime),
          Math.round(((dayTime % 1) * 60) / 15) * 15,
          0,
          0
        );
        break;
      }
    }
    date.setDate(date.getDate() + 1);
  }

  let fromTime = new Date(startDate);
  fromTime.setHours(
    Math.round(DATE_START_TIME),
    (DATE_START_TIME % 1) * 60,
    0,
    0
  );
  let toTime = new Date(startDate);
  for (let i = 0; i < HOUSING_DATES; i++) {
    if (toTime.getDay() === 0 || toTime.getDay() === 6) {
      // skip weekends
      i--;
    }
    toTime.setDate(toTime.getDate() + 1);
  }
  toTime.setHours(Math.round(DATE_END_TIME), (DATE_END_TIME % 1) * 6, 0, 0);

  return {
    accepted,
    chance,
    result,
    lotteryTime: date,
    fromTime: fromTime,
    toTime: toTime,
    students: data.students,
    beds: data.beds,
  };
}
