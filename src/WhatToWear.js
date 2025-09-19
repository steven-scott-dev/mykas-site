import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WhatToWear() {
  const [forecast, setForecast] = useState(null);
  const [activity, setActivity] = useState("");
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const API_KEY = "YOUR_API_KEY_HERE"; // 🔑 Replace with your OpenWeatherMap key

  // Effect to get user's location on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getForecast(latitude, longitude);
      },
      (error) => {
        setLocationError("Unable to retrieve your location.");
        setLoading(false);
        console.error("Geolocation error:", error);
      }
    );
  }, []);

  async function getForecast(lat, lon) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );
      const data = await res.json();
      if (data.cod !== "200") throw new Error(data.message);

      // Only keep next 8 intervals (24 hours)
      const todayForecast = data.list.slice(0, 8).map((entry) => ({
        time: new Date(entry.dt * 1000).toLocaleTimeString([], {
          hour: "numeric",
        }),
        temp: entry.main.temp,
        condition: entry.weather[0].main,
      }));

      setForecast({ city: data.city.name, timeline: todayForecast });
    } catch (err) {
      setLocationError("Error fetching forecast: " + err.message);
      console.error("Weather API error:", err);
    } finally {
      setLoading(false);
    }
  }

  function getSuggestion() {
    if (!forecast || !activity) {
      setOutfit("✨ Please choose an activity once forecast loads!");
      return;
    }

    const now = forecast.timeline[0]; // use current interval
    let suggestion = "";

    if (activity === "school") {
      if (now.temp < 45) suggestion = "🧥 Thick coat, hoodie, jeans, and boots.";
      else if (now.temp < 70) suggestion = "👖 Jeans + sweater + sneakers.";
      else suggestion = "👚 Tee + shorts/jeans + sneakers.";
    } else if (activity === "church") {
      if (now.temp < 45) suggestion = "👗 Midi dress, tights, coat, flats.";
      else if (now.temp < 70) suggestion = "👗 Dress + cardigan + flats.";
      else suggestion = "👗 Sundress + sandals.";
    } else if (activity === "date") {
      if (now.temp < 45) suggestion = "👖 Sweater, jeans, coat + boots.";
      else if (now.temp < 70) suggestion = "👖 Jeans, blouse + ankle boots.";
      else suggestion = "👗 Cute dress + light jacket.";
    } else if (activity === "casual") {
      if (now.temp < 45) suggestion = "🧋 Hoodie, joggers + beanie.";
      else if (now.temp < 70) suggestion = "👖 Mom jeans + sweater.";
      else suggestion = "👚 Tee + leggings + slides.";
    }

    if (now.condition === "Rain") suggestion += " ☔ Umbrella!";
    if (now.condition === "Snow") suggestion += " ❄ Gloves + scarf.";

    setOutfit(
      `Currently ${Math.round(now.temp)}°F (${now.condition}) in ${
        forecast.city
      }. Suggested for ${activity}: ${suggestion}`
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white/90 rounded-3xl shadow-xl p-8 border-4 border-purple-300">
      <h2 className="text-2xl font-extrabold text-pink-700 mb-6 text-center flex items-center justify-center">
        👗 What to Wear Advisor
      </h2>

      {loading && (
        <div className="text-center text-purple-700 font-semibold mb-4">
          📍 Getting your weather forecast...
        </div>
      )}

      {locationError && (
        <div className="text-center text-red-500 font-semibold mb-4">
          {locationError}
        </div>
      )}

      {forecast && (
        <>
          {/* Weather Timeline Graph */}
          <div className="mb-6 p-4 bg-gradient-to-r from-red-100 via-yellow-100 to-blue-100 rounded-2xl border-4 border-black">
            <h3 className="text-lg font-bold text-black mb-3 text-center">
              Next 24 Hours in {forecast.city}
            </h3>
            <Bar
              data={{
                labels: forecast.timeline.map((x) => x.time),
                datasets: [
                  {
                    label: "Temp (°F)",
                    data: forecast.timeline.map((x) => x.temp),
                    backgroundColor: forecast.timeline.map((x, i) => {
                      // Colorful rotation
                      const colors = [
                        "#FF0000", // Bright Red
                        "#FFD700", // Bright Yellow  
                        "#0066CC", // Bright Blue
                        "#00CC00", // Bright Green
                        "#FF6600", // Bright Orange
                        "#9933CC", // Purple
                        "#FF1493", // Hot Pink
                        "#00CCCC", // Cyan
                      ];
                      return colors[i % colors.length];
                    }),
                    borderColor: "#000000", // Black outlines
                    borderWidth: 3,
                    borderRadius: {
                      topLeft: 8,
                      topRight: 8,
                      bottomLeft: 0,
                      bottomRight: 0,
                    },
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#FFFF00",
                    titleColor: "#000",
                    bodyColor: "#000",
                    borderColor: "#000",
                    borderWidth: 3,
                    padding: 12,
                    displayColors: false,
                    titleFont: { weight: "bold", size: 14 },
                    bodyFont: { weight: "bold", size: 12 },
                    callbacks: {
                      label: function (context) {
                        const temp = Math.round(context.parsed.y);
                        return `${temp}°F`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: "#000",
                      font: { weight: "bold", size: 12 },
                    },
                  },
                  y: {
                    grid: {
                      color: "rgba(0,0,0,0.2)",
                      borderDash: [8, 8],
                      lineWidth: 2,
                    },
                    ticks: {
                      color: "#000",
                      font: { weight: "bold", size: 12 },
                      callback: function (value) {
                        return value + "°F";
                      },
                    },
                  },
                },
                animation: {
                  duration: 1500,
                  easing: "easeOutBounce",
                },
              }}
            />
          </div>

          {/* Activity Selector */}
          <label className="block mb-3 font-bold text-purple-900">
            What are you doing today?
            <select
              className="w-full mt-1 p-3 rounded-xl border-4 border-black bg-yellow-100 font-bold text-black"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              <option value="">Select your activity...</option>
              <option value="school">📚 School</option>
              <option value="church">⛪ Church</option>
              <option value="date">❤️ Date Night</option>
              <option value="casual">☀️ Casual Day</option>
            </select>
          </label>

          <button
            onClick={getSuggestion}
            className="w-full mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white font-extrabold text-lg border-4 border-black shadow-lg hover:shadow-xl transition-all"
            style={{
              textShadow: "2px 2px 0px #000",
            }}
          >
            Suggest My Outfit! ✨
          </button>
        </>
      )}

      {outfit && (
        <div className="mt-6 p-5 bg-gradient-to-r from-yellow-200 to-orange-200 border-4 border-black rounded-xl text-lg font-bold text-black shadow-lg">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">✨</span>
            <span className="font-extrabold">Outfit Suggestion:</span>
          </div>
          {outfit}
        </div>
      )}
    </div>
  );
}