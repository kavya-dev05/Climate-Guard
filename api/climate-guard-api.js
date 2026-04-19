// ── CLIMATE GUARD API & WEATHER UTILITIES ──

class ClimateGuardAPI {
  // Use Open-Meteo (free, no key needed) as primary weather source
  static WEATHER_GEO = 'https://geocoding-api.open-meteo.com/v1/search';
  static WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
  static PLANTS_DB = '/data/plants-database.json';

  // Fetch weather data for a city using Open-Meteo (no API key required)
  static async getWeather(city) {
    try {
      // Geo lookup
      const geoUrl = `${this.WEATHER_GEO}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error(`Geo API error: ${geoRes.status}`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }
      
      const location = geoData.results[0];
      
      // Weather fetch
      const weatherUrl = `${this.WEATHER_API}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
      const weatherData = await weatherRes.json();
      const current = weatherData.current;
      
      return {
        city: location.name,
        country: location.country || 'India',
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        max_temp: current.temperature_2m_max,
        min_temp: current.temperature_2m_min,
        weather_code: current.weather_code,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: weatherData.timezone
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new Error(`Weather data unavailable: ${error.message}`);
    }
  }

  // Determine climate zone from temperature and humidity
  static determineClimateZone(temp, humidity) {
    if (temp >= 20 && temp <= 35 && humidity > 60) {
      return 'tropical';
    } else if (temp >= 15 && temp <= 30 && humidity >= 40) {
      return 'subtropical';
    } else if (temp >= 5 && temp <= 25) {
      return 'temperate';
    } else if (temp < 5) {
      return 'boreal';
    } else if (temp > 35 && humidity < 40) {
      return 'arid';
    } else if (temp > 30 && humidity < 50) {
      return 'semi-arid';
    }
    return 'subtropical'; // Default fallback
  }

  // Load plants database with error handling
  static async getPlantsDatabase() {
    try {
      const response = await fetch(this.PLANTS_DB);
      if (!response.ok) throw new Error(`DB fetch failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Database load error:', error);
      return null;
    }
  }

  // Filter plants by climate zone with validation
  static filterPlantsByClimate(plants, climateZone) {
    if (!plants || !Array.isArray(plants)) return [];
    return plants.filter(plant => 
      plant.climate_zones && 
      plant.climate_zones.includes(climateZone)
    );
  }

  // Get suitable plants for a city with error handling
  static async getSuitablePlants(city) {
    try {
      const weather = await this.getWeather(city);
      const climateZone = this.determineClimateZone(weather.temperature, weather.humidity);
      const database = await this.getPlantsDatabase();
      
      if (!database) {
        throw new Error('Plant database unavailable');
      }
      
      const suitablePlants = this.filterPlantsByClimate(database.plants, climateZone);
      
      return {
        weather,
        climateZone,
        plants: suitablePlants,
        database,
        success: true
      };
    } catch (error) {
      console.error('Error getting suitable plants:', error);
      return {
        error: error.message,
        success: false
      };
    }
  }

  // Process image with AI (placeholder for future integration)
  static async processImageWithAI(imageData) {
    try {
      // TODO: Integrate with Gemini Vision API or OpenAI Vision API
      // For now, return simulated results
      return {
        suggestion: "AI analysis in development. Using simulated recommendations.",
        confidence: 0.75,
        recommendedPlants: [],
        needsBackendIntegration: true
      };
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  }
}

// Export for use in HTML scripts (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClimateGuardAPI;
}

  // Process image with AI (using placeholder for demo)
  static async processImageWithAI(imageData) {
    try {
      // Placeholder for AI processing - in production, connect to actual AI service
      // Could use: OpenAI Vision, Google Cloud Vision, or Hugging Face API
      return {
        suggestion: "Based on the image analysis, this space would be perfect for shade-loving plants like Ferns, Pothos, or Peace Lilies.",
        confidence: 0.85,
        recommendedPlants: [9, 12, 14] // Plant IDs
      };
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  }

  // Store user state in sessionStorage
  static setUserState(state) {
    sessionStorage.setItem('cgUserState', JSON.stringify(state));
  }

  static getUserState() {
    const state = sessionStorage.getItem('cgUserState');
    return state ? JSON.parse(state) : null;
  }

  static clearUserState() {
    sessionStorage.removeItem('cgUserState');
  }
}

// ── EXPORT FOR USE ──
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClimateGuardAPI;
}
