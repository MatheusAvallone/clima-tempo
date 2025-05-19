import { WeatherAPI } from './services/weather-api.js';
import { WeatherCard } from './components/weather-card.js';
import { FavoritesManager } from './components/favorites.js';
import { WeatherDetails } from './components/weather-details.js';
import { TemperatureChart } from './components/temperature-chart.js';

class App {
    constructor() {
        this.weatherAPI = new WeatherAPI();
        this.favoritesManager = new FavoritesManager();
        this.weatherDetails = new WeatherDetails();
        this.temperatureChart = new TemperatureChart();
        
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.locationButton = document.getElementById('locationButton');
        this.toggleThemeButton = document.getElementById('toggleTheme');
        this.toggleFavoritesButton = document.getElementById('toggleFavorites');
        
        this.initializeEventListeners();
        this.loadFavorites();
    }
    
    initializeEventListeners() {
        this.searchButton.addEventListener('click', () => this.searchWeather());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        this.locationButton.addEventListener('click', () => this.getLocationWeather());
        this.toggleThemeButton.addEventListener('click', () => this.toggleTheme());
        this.toggleFavoritesButton.addEventListener('click', () => this.toggleFavorite());
    }
    
    async searchWeather() {
        const city = this.searchInput.value.trim();
        if (!city) return;
        
        try {
            const weatherData = await this.weatherAPI.getWeatherByCity(city);
            const forecastData = await this.weatherAPI.getForecastByCity(city);
            
            this.updateWeatherDisplay(weatherData, forecastData);
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async getLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocalização não suportada pelo seu navegador');
            return;
        }
        
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            const { latitude, longitude } = position.coords;
            const weatherData = await this.weatherAPI.getWeatherByCoords(latitude, longitude);
            const forecastData = await this.weatherAPI.getForecastByCoords(latitude, longitude);
            
            this.updateWeatherDisplay(weatherData, forecastData);
        } catch (error) {
            this.showError('Erro ao obter sua localização');
        }
    }
    
    updateWeatherDisplay(weatherData, forecastData) {
        // Atualizar card principal
        const weatherCard = new WeatherCard(document.getElementById('weatherResult'));
        weatherCard.createWeatherCard(weatherData);
        
        // Atualizar detalhes
        this.weatherDetails.updateDetails(weatherData);
        
        // Atualizar gráfico
        this.temperatureChart.updateChart(forecastData);
        
        // Atualizar botão de favoritos
        this.updateFavoriteButton(weatherData.name);
    }
    
    toggleFavorite() {
        const cityName = this.searchInput.value.trim();
        if (!cityName) return;
        
        if (this.favoritesManager.isFavorite(cityName)) {
            this.favoritesManager.removeFavorite(cityName);
        } else {
            this.favoritesManager.addFavorite(cityName);
        }
        
        this.updateFavoriteButton(cityName);
        this.loadFavorites();
    }
    
    updateFavoriteButton(cityName) {
        const isFavorite = this.favoritesManager.isFavorite(cityName);
        this.toggleFavoritesButton.classList.toggle('active', isFavorite);
    }
    
    loadFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        const favorites = this.favoritesManager.getFavorites();
        
        favoritesList.innerHTML = favorites.map(city => `
            <div class="favorite-card">
                <div class="city-name">${city}</div>
                <button class="remove-favorite" data-city="${city}">×</button>
            </div>
        `).join('');
        
        // Adicionar event listeners para remover favoritos
        favoritesList.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const city = e.target.dataset.city;
                this.favoritesManager.removeFavorite(city);
                this.loadFavorites();
                if (city === this.searchInput.value.trim()) {
                    this.updateFavoriteButton(city);
                }
            });
        });
    }
    
    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isDark = !document.body.classList.contains('light-theme');
        this.toggleThemeButton.textContent = isDark ? '🌓' : '☀️';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.getElementById('weatherResult').innerHTML = '';
        document.getElementById('weatherResult').appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 