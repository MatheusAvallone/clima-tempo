class WeatherAPI {
    constructor() {
        this.apiKey = 'SUA_CHAVE_API_AQUI';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getWeatherByCity(city) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=pt_br`
            );
            
            if (!response.ok) {
                throw new Error('Cidade não encontrada');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getForecastByCity(city) {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric&lang=pt_br`
            );
            
            if (!response.ok) {
                throw new Error('Cidade não encontrada');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=pt_br`
            );
            
            if (!response.ok) {
                throw new Error('Erro ao obter dados do clima');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default new WeatherAPI(); 