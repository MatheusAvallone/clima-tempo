import { formatDateTime, formatTemperature } from '../utils/date-formatter.js';
import { getTemperatureColor } from '../utils/temperature-converter.js';

export class WeatherCard {
    constructor(container) {
        this.container = container;
    }

    createWeatherCard(weatherData) {
        const card = document.createElement('div');
        card.className = 'weather-card';
        
        card.innerHTML = `
            <div class="header">
                <div class="location-info">
                    <h2>${weatherData.name}</h2>
                    <span>${formatDateTime(weatherData.dt)}</span>
                </div>
            </div>
            
            <div class="main-info">
                <div class="temp-container">
                    <div class="main-temp" style="color: ${getTemperatureColor(weatherData.main.temp)}">
                        ${formatTemperature(weatherData.main.temp)}
                    </div>
                    <div class="description">
                        ${weatherData.weather[0].description}
                    </div>
                </div>
                <img 
                    class="weather-icon" 
                    src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" 
                    alt="${weatherData.weather[0].description}"
                >
            </div>
            
            <div class="weather-info">
                <div class="info-item">
                    <span class="info-label">Sensação Térmica</span>
                    <span class="info-value">${formatTemperature(weatherData.main.feels_like)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Umidade</span>
                    <span class="info-value">${weatherData.main.humidity}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Velocidade do Vento</span>
                    <span class="info-value">${weatherData.wind.speed} m/s</span>
                </div>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(card);
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="loading">
                Carregando...
            </div>
        `;
    }
} 