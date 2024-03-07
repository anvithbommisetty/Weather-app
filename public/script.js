const searchButton = document.getElementById("search-button");
let isCelsius = true; // Variable to track the current temperature unit

let forecastData, weatherData;

// Add event listener to the toggle button
const toggleButton = document.getElementById("toggleButton");
toggleButton.addEventListener("click", toggleTemperature);

searchButton.addEventListener("click", async function (event) {
  event.preventDefault(); // Prevent default form submission

  const input = document.getElementById("search-input");
  const cityName = input.value.trim();
  console.log(cityName);

  if (cityName !== "") {
    try {
      const weatherResponse = await fetch(
        `/CurrentWeather?q=${encodeURIComponent(cityName)}`
      );
      const forecastResponse = await fetch(
        `/Forecast?q=${encodeURIComponent(cityName)}&`
      );
      // Check if both responses are successful
      if (forecastResponse.ok && weatherResponse.ok) {
        forecastData = await forecastResponse.json();
        weatherData = await weatherResponse.json();

        // Now you have the forecastData and weatherData stored in variables
        // console.log("Forecast Data:", forecastData);
        // console.log("Weather Data:", weatherData);

        CurrentWeatherFillUp(weatherData.C);
        ForecastWeatherFillUp(forecastData.C);
        isCelsius = true;
        toggleButton.innerText = "Farenheit";
      } else {
        console.error("Invalid city name");
        alert("Please enter a valid cityname");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  } else {
    alert("Please enter a city name");
  }
});

// Function to toggle temperature between celcius and farheniet
function toggleTemperature() {
  if (isCelsius) {
    CurrentWeatherFillUp(weatherData.F, "F");
    ForecastWeatherFillUp(forecastData.F, "F");
    toggleButton.innerText = "Celcius";
  } else {
    ForecastWeatherFillUp(forecastData.C, "C");
    CurrentWeatherFillUp(weatherData.C, "C");
    toggleButton.innerText = "Farenheit";
  }
  isCelsius = !isCelsius;
}

//Function to fill current weather data
function CurrentWeatherFillUp(data, unit = "C") {
  const currentWeatherItemsEl = document.getElementById(
    "current-weather-items"
  );
  const divs = currentWeatherItemsEl.querySelectorAll(".weather-item");
  divs.forEach((div, index) => {
    const params = div.querySelector(".data");
    console.log(data.arr);
    if (index === 0) params.innerHTML = `${data.arr[index]}&#176; ${unit}`;
    else params.innerHTML = `${data.arr[index]}`;
  });
}

//base url for weather description images
const ImgSrc = "http://openweathermap.org/img/wn/";

//Function to fill 5 day forecast
function ForecastWeatherFillUp(data, unit = "C") {
  const divs = document.querySelectorAll(".weather-forecast-item");
  // Loop through each div and populate with corresponding data
  divs.forEach((div, index) => {
    const DayData = data.date_min_max[index]; // Get the corresponding data object
    const date = div.querySelector(".day");
    date.innerHTML = `${DayData.dt}`;
    const min_temp = div.querySelector(".min_temp");
    min_temp.innerHTML = `${DayData.temp_min}&#176; ${unit}`;
    const max_temp = div.querySelector(".max_temp");
    max_temp.innerHTML = `${DayData.temp_max}&#176; ${unit}`;
    const image = div.querySelector(".w-icon");
    image.src = `${ImgSrc + DayData.icon}@2x.png`;
  });

  //To fill avg temperature of 5 day forecast
  const avg_temp = document.querySelector(".avg_temp");
  avg_temp.innerHTML = `${data.avgTemp}&#176; ${unit}`;
}
