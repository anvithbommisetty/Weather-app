import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// async function validateCity(req, res, next) {
//   const cityName = req.query.q;

//   if (!cityName) {
//     return res.status(400).json({ error: "City name is required" });
//   }

//   try {
//     const response = await fetch(
//       `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
//         cityName
//       )}&limit=1&appid=${process.env.CURRENT}`
//     );
//     const data = await response.json();

//     if (Array.isArray(data) && data.length > 0) {
//       // City name is valid, continue to the next middleware or route handler
//       next();
//     } else {
//       return res.status(400).json({ error: "Invalid city name" });
//     }
//   } catch (error) {
//     console.error("Error validating city name:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }
app.get("/CurrentWeather", async (req, res) => {
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
    arr.push(response.data.main.temp);
    arr.push(response.data.main.humidity);
    arr.push(response.data.main.pressure);
    arr.push(response.data.wind.speed);
    res.json({ arr });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Forecast", async (req, res) => {
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
    list.forEach((el) => {
      temp_max = Math.max(temp_max, el.main.temp_max);
      temp_min = Math.min(temp_min, el.main.temp_min);
      sum += el.main.temp;
      if (counter % 8 == 7) {
        date_min_max.push({
          dt: el.dt_txt.split(" ")[0],
          temp_max,
          temp_min,
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

    res.json({
      date_min_max,
      avgTemp,
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
