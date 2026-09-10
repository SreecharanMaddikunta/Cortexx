import axios from 'axios';

// Default to Pune, Maharashtra for MVP
const DEFAULT_LAT = 18.5204;
const DEFAULT_LON = 73.8567;

export const fetchWeatherData = async (lat = DEFAULT_LAT, lon = DEFAULT_LON) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=1&forecast_days=2&timezone=Asia%2FKolkata`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    // Parse mapping for weather codes to UI states
    const getWeatherState = (code) => {
      if (code <= 3) return { label: 'Clear / Partly Cloudy', key: 'weatherClearCloudy', icon: 'Sun', color: 'blue' };
      if (code >= 51 && code <= 67) return { label: 'Rain', key: 'weatherRain', icon: 'CloudRain', color: 'gray' };
      if (code >= 95) return { label: 'Thunderstorm', key: 'weatherThunderstorm', icon: 'CloudLightning', color: 'purple' };
      return { label: 'Overcast', key: 'weatherOvercast', icon: 'Cloud', color: 'blue' };
    };

    // Extract exactly what we need for the 3-Day Telecast
    // daily.time: ["2026-09-08" (yesterday), "2026-09-09" (today)]
    const yesterday = {
      date: data.daily.time[0],
      maxTemp: data.daily.temperature_2m_max[0],
      minTemp: data.daily.temperature_2m_min[0],
      rain: data.daily.precipitation_sum[0],
      state: getWeatherState(data.daily.weather_code[0])
    };

    const today = {
      date: data.daily.time[1],
      currentTemp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      maxTemp: data.daily.temperature_2m_max[1],
      minTemp: data.daily.temperature_2m_min[1],
      rain: data.daily.precipitation_sum[1],
      state: getWeatherState(data.current.weather_code)
    };

    const tomorrow = {
      date: data.daily.time[2],
      maxTemp: data.daily.temperature_2m_max[2],
      minTemp: data.daily.temperature_2m_min[2],
      rain: data.daily.precipitation_sum[2],
      state: getWeatherState(data.daily.weather_code[2])
    };

    return {
      current: today,
      yesterday,
      tomorrow,
      hourly: data.hourly // Used for charts
    };
  } catch (error) {
    console.error("Failed to fetch weather data from Open-Meteo", error);
    return null;
  }
};
