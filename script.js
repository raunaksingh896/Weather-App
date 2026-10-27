
const API_KEY = "d7d55a8279051254dc18a2409faedff9";

// Select the HTML elements.
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weather-card");

const cityName = document.getElementById("city-name");
const dateText = document.getElementById("date");
const conditionShort = document.getElementById("condition-short");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const weatherIcon = document.getElementById("weather-icon");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const updatedAt = document.getElementById("updated-at");

// Run when the user searches for a city.
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        showMessage("Please enter a city name.", "error");
        return;
    }

    if (
        API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE" ||
        API_KEY.trim() === ""
    ) {
        showMessage("Please add your API key in script.js.", "error");
        return;
    }

    getWeather(city);
});

// Get city, state and country using latitude and longitude.
async function getLocationName(lat, lon) {
    try {
        const url =
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            return "";
        }

        const locations = await response.json();

        if (locations.length > 0) {
            const place = locations[0];

            const city = place.name || "";
            const state = place.state || "";
            const country = place.country || "";

            return [city, state, country]
                .filter(Boolean)
                .join(", ");
        }

        return "";
    } catch (error) {
        return "";
    }
}

// Get current weather data from OpenWeatherMap.
async function getWeather(city) {
    searchButton.disabled = true;
    searchButton.textContent = "Loading...";
    weatherCard.classList.add("hidden");
    showMessage("Getting weather data...");

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Check the spelling.");
            } else if (response.status === 401) {
                throw new Error("API key is invalid or not active yet.");
            } else if (response.status === 429) {
                throw new Error("Too many requests. Please try again later.");
            } else {
                throw new Error("Weather service error. Please try again.");
            }
        }

        // Convert JSON data into a JavaScript object.
        const data = await response.json();

        // Get city, state and country name.
        const locationName = await getLocationName(
            data.coord.lat,
            data.coord.lon
        );

        cityName.textContent =
            locationName || `${data.name}, ${data.sys.country}`;

        // Show the current date.
        dateText.textContent = new Intl.DateTimeFormat("en", {
            weekday: "long",
            day: "numeric",
            month: "long"
        }).format(new Date());

        // Show temperature and weather condition.
        conditionShort.textContent = data.weather[0].main;
        temperature.textContent = Math.round(data.main.temp) + "°C";
        description.textContent = data.weather[0].description;

        feelsLike.textContent =
            "Feels like " + Math.round(data.main.feels_like) + "°C";

        // Show the weather icon.
        weatherIcon.src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        weatherIcon.alt = data.weather[0].description;

        // Show humidity, wind, pressure and visibility.
        humidity.textContent = data.main.humidity + "%";

        windSpeed.textContent =
            Number(data.wind.speed).toFixed(1) + " m/s";

        pressure.textContent = data.main.pressure + " hPa";

        visibility.textContent =
            (data.visibility / 1000).toFixed(1) + " km";

        // Show the update time.
        updatedAt.textContent =
            "Updated at " +
            new Intl.DateTimeFormat("en", {
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date()) +
            " (device time)";

        weatherCard.classList.remove("hidden");
        showMessage("Weather loaded successfully.", "success");

    } catch (error) {
        weatherCard.classList.add("hidden");

        showMessage(
            error.message ||
            "Check your internet connection and try again.",
            "error"
        );

    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search →";
    }
}

// Display a message on the page.
function showMessage(text, type = "") {
    message.textContent = text;
    message.className = "message";

    if (type !== "") {
        message.classList.add(type);
    }
}
