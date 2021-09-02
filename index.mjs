import fetch from 'node-fetch';
import moment from 'moment';
import { parse } from 'json2csv';
import {promises as fs} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(path.dirname(import.meta.url));

const lastFmApiKey = 'b4310490f18a21194799918d36441c06';

const getTopArtists = async (username, from, to) => {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${username}&api_key=${lastFmApiKey}&from=${from}&to=${to}&format=json`;
  const response = await fetch(url);
  const json = await response.json();
  return json.weeklyartistchart.artist;
}

/**
 * Get the Unix Timestamp (seconds since the Unix Epoch)
 * for the provided date string in YYYY-MM-DD format (e.g. `2021-12-25`).
 * @param dateString
 */
const unixTimestampSecsForDate = dateString => {
  const date = moment(dateString, "YYYY-MM-DD");
  return date.unix();
}

const getTopArtistsForYears = async (startYear, endYear) => {
  for (let i = startYear; i <= endYear; i++) {
    const artists = await getTopArtists(
      'ericandrewlewis',
      /* from */ unixTimestampSecsForDate(`${i}-01-01`),
      /* to */ unixTimestampSecsForDate(`${i + 1}-01-01`),
    );
    const fields = ['name', 'playcount'];
    const opts = { fields };

    try {
      const csv = parse(artists, opts);
      fs.writeFile(
        path.join(
          __dirname,
          'output',
          `${i}.csv`
        ),
        csv
      );
    } catch (err) {
      console.error(err);
    }
  }
}

(async () => {
  await getTopArtistsForYears(2012, 2021);
})();

