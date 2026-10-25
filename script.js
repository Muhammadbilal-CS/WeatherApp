
const API_KEY = "6d1ee112eb9ba9c7cb57de35394ce23f";

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city) {
    getWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
  }
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  message.textContent = "Detecting your location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      getWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
    },
    (error) => {
      const errors = {
        1: "Location permission denied. Please allow location access.",
        2: "Your location could not be determined.",
        3: "Location request timed out."
      };

      message.textContent =
        errors[error.code] || "Unable to access your location.";
    },
    { timeout: 10000 }
  );
});

async function getWeather(url) {
  message.textContent = "Loading weather information...";
  weatherCard.hidden = true;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling.");
      }

      if (response.status === 401) {
        throw new Error("API key is invalid or not active yet.");
      }

      throw new Error(data.message || "Unable to fetch weather.");
    }

    displayWeather(data);
    message.textContent = "";
  } catch (error) {
    message.textContent =
      error.message === "Failed to fetch"
        ? "Network error. Check your internet connection and API key."
        : error.message;

    weatherCard.hidden = true;
  }
}

function displayWeather(data) {
  document.getElementById("cityName").textContent =
    `${data.name}, ${data.sys.country}`;

  document.getElementById("temperature").textContent =
    `${Math.round(data.main.temp)}°C`;

  document.getElementById("description").textContent =
    data.weather[0].description;

  document.getElementById("humidity").textContent =
    `${data.main.humidity}%`;

  document.getElementById("wind").textContent =
    `${data.wind.speed} m/s`;

  const condition = data.weather[0].main.toLowerCase();
  const iconCode = data.weather[0].icon;

  const iconMap = {
    clear: "☀️",
    clouds: "☁️",
    rain: "🌧️",
    drizzle: "🌦️",
    thunderstorm: "⛈️",
    snow: "❄️",
    mist: "🌫️",
    smoke: "🌫️",
    haze: "🌫️",
    dust: "🌪️",
    fog: "🌫️",
    sand: "🌪️",
    ash: "🌋",
    squall: "💨",
    tornado: "🌪️"
  };

  document.getElementById("weatherIcon").textContent =
    iconMap[condition] || "🌤️";

  // Change background according to weather conditions.
  document.body.className = "";

  if (iconCode.endsWith("n")) {
    document.body.classList.add("night");
  } else if (condition === "clear") {
    document.body.classList.add("sunny");
  } else if (condition === "clouds" ||
             condition === "mist" ||
             condition === "fog" ||
             condition === "haze" ||
             condition === "smoke") {
    document.body.classList.add("cloudy");
  } else if (condition === "snow") {
    document.body.classList.add("snowy");
  } else {
    document.body.classList.add("rainy");
  }

  weatherCard.hidden = false;
}
