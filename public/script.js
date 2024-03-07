const searchButton = document.getElementById("search-button");

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
        const forecastData = await forecastResponse.json();
        const weatherData = await weatherResponse.json();

        // Now you have the forecastData and weatherData stored in variables
        console.log("Forecast Data:", forecastData);
        console.log("Weather Data:", weatherData);
        console.log(typeof weatherData);
        const currentWeatherItemsEl = document.getElementById(
          "current-weather-items"
        );

        function CurrentWeatherFillUp() {
          const divs = currentWeatherItemsEl.querySelectorAll(".weather-item");
          divs.forEach((div, index) => {
            const params = div.querySelector(".data");
            console.log(weatherData.arr[index]);
            if (index === 0)
              params.innerHTML = `${weatherData.arr[index]}&#176; C`;
            else params.innerHTML = `${weatherData.arr[index]}`;
          });
        }

        CurrentWeatherFillUp();

        function populateDivs() {
          const divs = document.querySelectorAll(".weather-forecast-item");

          // Loop through each div and populate with corresponding data
          divs.forEach((div, index) => {
            const DayData = forecastData.date_min_max[index]; // Get the corresponding data object
            const date = div.querySelector(".day");
            date.innerHTML = `${DayData.dt}`;
            const min_temp = div.querySelector(".min_temp");
            min_temp.innerHTML = `${DayData.temp_min}&#176; C`;
            const max_temp = div.querySelector(".max_temp");
            max_temp.innerHTML = `${DayData.temp_max}&#176; C`;
          });
        }

        populateDivs();

        const avg_temp = document.querySelector(".avg_temp");
        avg_temp.innerHTML = `${forecastData.avgTemp}&#176; C`;
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
