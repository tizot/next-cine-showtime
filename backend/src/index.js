import cors from "cors";
import express from "express";
import process from "process";
import { CronJob } from "cron";
import { toString as cronToString } from "cronstrue";
import { parseJSON } from "date-fns";

import auth from "./sens-critique/auth.js";
import {
  allMoviesSorted,
  fetchMovies,
  findTheaterId,
  getAllCinemas,
} from "./allocine.js";
import { search } from "./sens-critique/index.js";

const app = express();
const port = process.env.PORT ?? 4500;

const cronTime = "0 0 8 * * *";
const dailyCacheEviction = new CronJob(
  cronTime,
  () => {
    console.log("Daily cache eviction");
    search.evictAll();
    fetchMovies.evictAll();
  },
  null,
  false,
  "Europe/Paris"
);

app.use(cors());
app.use(express.json());
app.use("/", express.static("src/public"));

app.post("/api/movies", async (req, res) => {
  const { cinemas, date: dateStr } = req.body;

  let date;
  try {
    date = parseJSON(dateStr);
  } catch (err) {
    res.status(400).send({ message: err.message });
    return;
  }

  const scAuthToken = await auth.getToken();
  const movies = await allMoviesSorted(cinemas, date, scAuthToken);
  res.status(200).send(movies);
});

app.get("/api/cinemas", async (_req, res) => {
  res.status(200).send(getAllCinemas());
});

app.post("/api/find-cinema-id", async (req, res) => {
  const { name } = req.body;
  const results = await findTheaterId(name);
  res.status(200).send(results);
});

app.post("/api/reset-caches", (_req, res) => {
  console.warn("Resetting caches");
  search.evictAll();
  fetchMovies.evictAll();
  res.status(200).send();
});

const ensureEnvVariable = (name) => {
  if (!process.env[name]) {
    console.error(`Missing env variable '${name}'`);
    process.exit(1);
  }
};

app.listen(port, () => {
  ensureEnvVariable("SC_PASSWORD");
  ensureEnvVariable("ALLOCINE_TOKEN");

  console.log(`Server listening at http://localhost:${port}`);

  dailyCacheEviction.start();
  console.log(
    `Daily cache eviction setup ${cronToString(cronTime, {
      use24HourTimeFormat: true,
      verbose: true,
    }).toLowerCase()} (Paris time)`
  );
});

// so that Ctrl-C terminates the docker container:
process.on("SIGINT", function () {
  process.exit();
});
