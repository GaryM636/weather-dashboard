document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cityForm');
    const cityInput = document.getElementById('cityInput');
    const currentWeatherContainer = document.getElementById('currentWeather');
    const forecastContainer = document.getElementById('forecast');
    const searchHistoryContainer = document.getElementById('searchHistory');
    const currentWeatherHeader = document.getElementById('currentWeatherHeader');
    const forecastHeader = document.getElementById('forecastHeader');
    const apiKey = '4c41a2495ed39238f2bc36e60c6bb5cd';

    renderSearchHistory();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const cityName = cityInput.value.trim();
        fetchCityCoordinates(cityName);
    });

    searchHistoryContainer.addEventListener('click', function (event) {
        if (event.target.tagName === 'P') {
            const cityName = event.target.textContent;
            fetchCityCoordinates(cityName);
        }
    });

    // Fetch city coordinates using cityName
    function fetchCityCoordinates(cityName) {
        // Construct the API URL to get city coordinates
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;

        fetch(geoApiUrl)
            .then(response => response.json())
            .then(data => {
                const city = data[0];
                if (city) {
                    fetchWeatherData(city.lat, city.lon, city.name);
                } else {
                    console.error('City not found');
                }
            })
            .catch(error => {
                console.error('Error fetching city coordinates:', error);
            });
    }

    // Fetch current weather data using lat and lon
    function fetchWeatherData(lat, lon, cityName) {
        const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        fetch(currentWeatherApiUrl)
            .then(response => response.json())
            .then(currentWeatherData => {
                console.log(currentWeatherData);
                const iconUrl = `https://openweathermap.org/img/w/${currentWeatherData.weather[0].icon}.png`;
                currentWeatherHeader.innerHTML = `
                    <h2>${cityName}</h2>
                    <h3>${dayjs().format('MMMM D, YYYY')}</h3>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>Temperature: ${currentWeatherData.main.temp}°F</p>
                    <p>Humidity: ${currentWeatherData.main.humidity}%</p>
                    <p>Wind Speed: ${currentWeatherData.wind.speed} mph</p>
                `;

                fetchFiveDayForecast(lat, lon, cityName);
            })
            .catch(error => {
                console.error('Error fetching current weather data:', error);
            });
    }

    // Fetch 5-day forecast data using lat and lon
    function fetchFiveDayForecast(lat, lon, cityName) {
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        fetch(weatherApiUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                forecastHeader.innerHTML = '<h2>5-Day Forecast</h2>';
                const forecastDaysContainer = document.createElement('div');
                forecastDaysContainer.classList.add('forecast-days');
                forecastHeader.appendChild(forecastDaysContainer);

                for (let i = 0; i < data.list.length; i += 8) {
                    const forecast = data.list[i];
                    // Create a container for each day's forecast
                    const forecastDayContainer = document.createElement('div');
                    forecastDayContainer.classList.add('forecast-day');
                    forecastDayContainer.innerHTML = `<h3>${dayjs(forecast.dt_txt).format('MMMM D, YYYY')}</h3>
                        <img src="https://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="Weather Icon">
                        <p>Temperature: ${forecast.main.temp}°F</p>
                        <p>Humidity: ${forecast.main.humidity}%</p>
                        <p>Wind Speed: ${forecast.wind.speed} mph</p>`;
                    forecastDaysContainer.appendChild(forecastDayContainer);
                }

                addToSearchHistory(cityName);
            })
            .catch(error => {
                console.error('Error fetching 5-day forecast data:', error);
            });
    }

    // Add city to search history in localStorage if it's not already there
    function addToSearchHistory(cityName) {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        if (!searchHistory.includes(cityName)) {
            searchHistory.push(cityName);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            renderSearchHistory();
        }
    }

    // Render search history from localStorage
    function renderSearchHistory() {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistoryContainer.innerHTML = '';
        if (searchHistory.length > 0) {
            searchHistoryContainer.innerHTML += '<h2>Search History</h2>';
            searchHistory.forEach(city => {
                searchHistoryContainer.innerHTML += `<p>${city}</p>`;
            });
        }
    }
});
