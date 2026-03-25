import { useState, useEffect } from "react";
import "./index.css";

const KEY = "9ed25195e11d4859947102643242211";

function App() {
  const [city, setSity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coord, setCooord] = useState(null);

  function getCoords() {
    if (!navigator.geolocation) {
      setError("Нет такой функции в вашем браузере:(");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        const { latitude, longitude } = position;
        setCooord({ latitude, longitude });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Разрешите доступ к геолокации");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Не удалось определить местоположение.");
            break;
          case err.TIMEOUT:
            setError("Превышено время ожидания местоположения");
            break;
          default:
            setError("Ошибка получения местоположения");
        }
        console.error("Geolocation error:", err.message, "code:", err.code);
      },
    );
  }
  function renderLoading() {
    return <p>Loadind...</p>;
  }
  function renderError() {
    return <p>{error}</p>;
  }
  function renderContent() {
    return (
      <div className="weather-card">
        <h2>{`${weatherData?.location?.name}, ${weatherData?.location?.country}`}</h2>
        <img
          src={`http:${weatherData?.current?.condition?.icon}`}
          alt="icon"
          className="weather-icon"
        />
        <p className="temperature">{weatherData?.current?.temp_c}°C</p>
        <p className="condition">{weatherData?.current?.condition?.text}</p>
        <div className="weather-details">
          <p>Humidity: {weatherData?.current?.humidity}%</p>
          <p>Wind: {weatherData?.current?.wind_kph} km/h</p>
        </div>
      </div>
    );
  }
  async function searchWeather() {
    const controller = new AbortController();
    const signal = controller.signal;
    setError(null);
    if (!city.trim()) {
      setError(null);
      setWeatherData(null);
      return;
    }
    setLoading(true);
    try {
      let query;
      if (city) {
        query = city;
      } else if (coord.latitude) {
        query = `${coord.latitude}, ${coord.longitude}`;
      } else {
        setError("Введите город или разрешите геолокацию");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`,
        { signal },
      );
      // if (!res.ok) {
      //   throw new Error(`${res.status}`);
      // }
      const data = await res.json();
      console.log(data);
      if (data.error) {
        setError(data.error?.message);
        return;
      }
      setWeatherData(data);
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
    return () => {
      controller.abort();
    };
  }

  useEffect(() => {
    getCoords();
  }, []);

  useEffect(() => {
    searchWeather();
  }, [coord]);
  return (
    <div className="app">
      <div className="widget-container">
        <div className="weather-card-container">
          <h1 className="app-title">Weather Widget</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter city name"
              className="search-input"
              onChange={(e) => setSity(e.target.value)}
            />
            {error && renderError()}
            {loading && renderLoading()}
            {weatherData && !error && !loading && renderContent()}
          </div>
          <button className="btn-location" onClick={() => searchWeather()}>
            SEARCH
          </button>
          <button className="btn-location" onClick={() => getCoords()}>
            PUT Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
