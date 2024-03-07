import express from "express";
import axios from "axios";
import cache from "memory-cache"; // Import the memory-cache package
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

//Middleware function for caching
function cacheMiddleware(duration) {
  return (req, res, next) => {
    const key = "__express__" + req.originalUrl || req.url;
    const cachedBody = cache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.put(key, body, duration * 1000); // Cache response for specified duration (in milliseconds)
        res.sendResponse(body);
      };
      next();
    }
  };
}

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

//route to get current weather details
app.get("/CurrentWeather", cacheMiddleware(1 * 60 * 60), async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: req.query.q, // Example city name, you can pass it dynamically from req.query or req.params
          appid: process.env.NEXT, // Replace with your actual API key
          units: "metric", // Units for temperature (metric for Celsius)
        },
      }
    );
    let arr = [];
    let data = response.data;

    arr.push(data.main.temp);
    arr.push(data.main.humidity);
    arr.push(data.main.pressure);
    arr.push(data.wind.speed);

    let Farr = [...arr];
    Farr[0] = ConvertToFarenheit(Farr);

    // console.log(arr, Farr);

    res.json({ C: { arr }, F: { arr: Farr } });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//route to get forecast details
app.get("/Forecast", cacheMiddleware(1 * 60 * 60), async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: req.query.q, // Example city name, you can pass it dynamically from req.query or req.params
          appid: process.env.CURRENT, // Replace with your actual API key
          units: "metric", // Units for temperature (metric for Celsius)
        },
      }
    );

    let data = response.data;
    const list = data.list;
    //console.log(data);
    let counter = 0;
    let temp_min = 100,
      temp_max = -100;

    const date_min_max = [];
    let sum = 0;
    let icon = "";
    list.forEach((el) => {
      temp_max = Math.max(temp_max, el.main.temp_max);
      temp_min = Math.min(temp_min, el.main.temp_min);
      sum += el.main.temp;
      if (counter % 8 === 4) {
        icon = el.weather[0].icon;
      }
      if (counter % 8 == 7) {
        date_min_max.push({
          dt: el.dt_txt.split(" ")[0],
          temp_max,
          temp_min,
          icon,
        });
        // min_array.push(temp_min);
        // max_array.push(temp_max);
        temp_min = 100;
        temp_max = -100;
      }
      counter++;
    });

    const avgTemp = parseFloat((sum / counter).toFixed(2));
    // console.log(min_max);

    const inF = [];

    date_min_max.forEach((el) => {
      inF.push({
        ...el,
        temp_max: ConvertToFarenheit(el.temp_max),
        temp_min: ConvertToFarenheit(el.temp_min),
      });
    });

    res.json({
      C: {
        date_min_max,
        avgTemp,
      },
      F: {
        date_min_max: inF,
        avgTemp: ConvertToFarenheit(avgTemp),
      },
    });

    // res.json(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Function to convert celcius to farheniet
function ConvertToFarenheit(val) {
  const result = 32 + (parseFloat(val) * 9) / 5;

  return Number(result.toFixed(2));
}
