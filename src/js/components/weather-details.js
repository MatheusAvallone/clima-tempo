export class WeatherDetails {
    constructor() {
        this.detailsContainer = document.querySelector('.weather-details');
    }
    
    updateDetails(weatherData) {
        // Atualizar pressão
        document.getElementById('pressure').innerHTML = `
            <p>Pressão <span class="value">${weatherData.main.pressure} hPa</span></p>
        `;
        
        // Atualizar visibilidade
        const visibility = (weatherData.visibility / 1000).toFixed(1);
        document.getElementById('visibility').innerHTML = `
            <p>Visibilidade <span class="value">${visibility} km</span></p>
        `;
        
        // Atualizar nascer do sol
        const sunrise = new Date(weatherData.sys.sunrise * 1000);
        document.getElementById('sunrise').innerHTML = `
            <p>Nascer do Sol <span class="value">${sunrise.toLocaleTimeString()}</span></p>
        `;
        
        // Atualizar pôr do sol
        const sunset = new Date(weatherData.sys.sunset * 1000);
        document.getElementById('sunset').innerHTML = `
            <p>Pôr do Sol <span class="value">${sunset.toLocaleTimeString()}</span></p>
        `;
        
        // Atualizar nuvens
        document.getElementById('clouds').innerHTML = `
            <p>Cobertura <span class="value">${weatherData.clouds.all}%</span></p>
        `;
        
        // Atualizar índice UV (se disponível)
        const uvi = weatherData.uvi || 'N/A';
        document.getElementById('uvi').innerHTML = `
            <p>Índice UV <span class="value">${uvi}</span></p>
        `;
        
        // Mostrar a seção de detalhes
        this.detailsContainer.classList.remove('hidden');
    }
} 