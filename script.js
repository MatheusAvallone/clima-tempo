const apiKey = "0cedcfc57557fc77369360ae08091726";
let map;
let marker;
let tempChart;
let useMetric = true;

// Gerenciamento de tema
const toggleThemeButton = document.getElementById("toggleTheme");
let isDarkTheme = true;

// Carregar tema salvo
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme");
    toggleThemeButton.textContent = "☀️";
    isDarkTheme = false;
}

// Carregar preferências salvas
if (localStorage.getItem("units") === "imperial") {
    useMetric = false;
    document.getElementById("toggleUnits").textContent = "°F";
}

// Inicializar mapa
function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    map.on('click', function(e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
        buscarClimaPorCoordenadas(e.latlng.lat, e.latlng.lng);
        document.getElementById('mapContainer').classList.add('hidden');
    });
}

// Event Listeners
document.getElementById("showMap").addEventListener("click", () => {
    document.getElementById("mapContainer").classList.remove("hidden");
    if (!map) {
        initMap();
    }
});

document.querySelector(".close-map").addEventListener("click", () => {
    document.getElementById("mapContainer").classList.add("hidden");
});

document.getElementById("toggleUnits").addEventListener("click", () => {
    useMetric = !useMetric;
    document.getElementById("toggleUnits").textContent = useMetric ? "°C" : "°F";
    localStorage.setItem("units", useMetric ? "metric" : "imperial");
    if (document.getElementById("weatherResult").innerHTML !== "") {
        buscarClima(); // Atualiza com a nova unidade
    }
});

toggleThemeButton.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("light-theme");
    toggleThemeButton.textContent = isDarkTheme ? "🌙" : "☀️";
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
});

// Notificações
document.getElementById("toggleNotifications").addEventListener("click", async () => {
    if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações!");
        return;
    }

    if (Notification.permission === "granted") {
        document.getElementById("toggleNotifications").textContent = "🔔";
        // Implementar lógica de notificações
    } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            document.getElementById("toggleNotifications").textContent = "🔔";
        }
    }
});

// Funções de clima
async function buscarClimaPorCoordenadas(lat, lon) {
    const unidade = useMetric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unidade}&lang=pt_br`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unidade}&lang=pt_br`;
    
    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(url),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        document.getElementById("cityInput").value = weatherData.name;
        await Promise.all([
            mostrarDadosClima(weatherData),
            mostrarPrevisao(forecastData),
            buscarQualidadeAr(lat, lon),
            criarGraficoTemperatura(forecastData)
        ]);
    } catch (error) {
        mostrarErro(error.message);
    }
}

async function buscarClima() {
    const cidade = encodeURIComponent(document.getElementById("cityInput").value.trim());
    if (!cidade) {
        mostrarErro("Por favor, digite o nome de uma cidade");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("weatherResult").innerHTML = '';
    
    const unidade = useMetric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=${unidade}&lang=pt_br`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(response.status === 404 
                ? "Cidade não encontrada. Verifique o nome e tente novamente."
                : "Erro ao buscar dados do clima. Tente novamente mais tarde.");
        }
        
        const data = await response.json();
        const { lat, lon } = data.coord;
        
        await Promise.all([
            mostrarDadosClima(data),
            buscarPrevisao(lat, lon),
            buscarQualidadeAr(lat, lon)
        ]);
    } catch (error) {
        mostrarErro(error.message);
    }
}

async function buscarPrevisao(lat, lon) {
    const unidade = useMetric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unidade}&lang=pt_br`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        await Promise.all([
            mostrarPrevisao(data),
            criarGraficoTemperatura(data)
        ]);
    } catch (error) {
        console.error("Erro ao buscar previsão:", error);
    }
}

async function buscarQualidadeAr(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        mostrarQualidadeAr(data);
    } catch (error) {
        console.error("Erro ao buscar qualidade do ar:", error);
    }
}

function mostrarDadosClima(data) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("weatherDetails").classList.remove("hidden");

    const timestamp = Date.now();
    const localTime = new Date(timestamp + (data.timezone * 1000));
    const horaLocal = formatarHora(localTime);

    const tempUnit = useMetric ? "°C" : "°F";
    const speedUnit = useMetric ? "km/h" : "mph";
    const speedConversion = useMetric ? 3.6 : 2.237;

    const descricaoClima = data.weather[0].description.charAt(0).toUpperCase() + 
                          data.weather[0].description.slice(1);

    // Corrigindo o cálculo do nascer e pôr do sol
    const nascarSolUTC = new Date(data.sys.sunrise * 1000);
    const porSolUTC = new Date(data.sys.sunset * 1000);
    
    // Ajustando para o fuso horário local da cidade
    const nascarSol = formatarHora(new Date(nascarSolUTC.getTime() + data.timezone * 1000));
    const porSol = formatarHora(new Date(porSolUTC.getTime() + data.timezone * 1000));

    const clima = `
        <div class="weather-card">
            <div class="header">
                <div class="location-info">
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <span>🕒 ${horaLocal}</span>
                </div>
            </div>

            <div class="main-info">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" 
                     alt="Ícone do clima" 
                     class="weather-icon">
                
                <div class="temp-container">
                    <div class="description">${descricaoClima}</div>
                    <div class="main-temp">${Math.round(data.main.temp)}${tempUnit}</div>
                    <div>Sensação térmica: ${Math.round(data.main.feels_like)}${tempUnit}</div>
                </div>
            </div>
            
            <div class="weather-info">
                <div class="info-item">
                    <span class="info-label">Umidade</span>
                    <span class="info-value">💧 ${data.main.humidity}%</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Vento</span>
                    <span class="info-value">🌬️ ${(data.wind.speed * speedConversion).toFixed(1)} ${speedUnit}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Pressão</span>
                    <span class="info-value">📊 ${data.main.pressure} hPa</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Visibilidade</span>
                    <span class="info-value">🌫️ ${(data.visibility / 1000).toFixed(1)} km</span>
                </div>

                <div class="info-item">
                    <span class="info-label">Nascer do Sol</span>
                    <span class="info-value">🌅 ${nascarSol}</span>
                </div>

                <div class="info-item">
                    <span class="info-label">Pôr do Sol</span>
                    <span class="info-value">🌇 ${porSol}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById("weatherResult").innerHTML = clima;

    // Atualizar todas as seções de detalhes
    mostrarCicloSolar(data);
    mostrarDetalhesVento(data);
    mostrarPrecipitacao(data);
    mostrarIndiceUV(data);
    mostrarAlertas(data);
}

function mostrarPrevisao(data) {
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";
    
    const previsoes = data.list.filter((item, index) => index % 8 === 0); // Pega uma previsão por dia
    
    previsoes.forEach(previsao => {
        const data = new Date(previsao.dt * 1000);
        const dia = data.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
        const tempUnit = useMetric ? "°C" : "°F";
        
        const cardHtml = `
            <div class="forecast-card">
                <div class="date">${dia}</div>
                <img src="https://openweathermap.org/img/wn/${previsao.weather[0].icon}.png" 
                     alt="${previsao.weather[0].description}">
                <div class="temp">${Math.round(previsao.main.temp)}${tempUnit}</div>
                <div>${previsao.weather[0].description}</div>
            </div>
        `;
        
        forecastDiv.innerHTML += cardHtml;
    });
}

function mostrarQualidadeAr(data) {
    const qualidadeAr = data.list[0];
    const niveis = {
        1: { texto: "Boa", cor: "#4CAF50" },
        2: { texto: "Moderada", cor: "#FFC107" },
        3: { texto: "Ruim", cor: "#FF9800" },
        4: { texto: "Muito Ruim", cor: "#F44336" },
        5: { texto: "Péssima", cor: "#9C27B0" }
    };

    const nivel = niveis[qualidadeAr.main.aqi];
    
    const content = `
        <p>Índice de Qualidade <span class="value" style="color: ${nivel.cor}">${nivel.texto}</span></p>
        <p>PM2.5 <span class="value">${qualidadeAr.components.pm2_5.toFixed(1)} μg/m³</span></p>
        <p>NO2 <span class="value">${qualidadeAr.components.no2.toFixed(1)} μg/m³</span></p>
        <p>O3 <span class="value">${qualidadeAr.components.o3.toFixed(1)} μg/m³</span></p>
        <p>CO <span class="value">${qualidadeAr.components.co.toFixed(1)} μg/m³</span></p>
    `;
    
    document.querySelector("#airQuality .detail-content").innerHTML = content;
}

function mostrarCicloSolar(data) {
    const nascarSolUTC = new Date(data.sys.sunrise * 1000);
    const porSolUTC = new Date(data.sys.sunset * 1000);
    
    const nascarSol = formatarHora(new Date(nascarSolUTC.getTime() + data.timezone * 1000));
    const porSol = formatarHora(new Date(porSolUTC.getTime() + data.timezone * 1000));
    
    const duracaoDia = calcularDuracaoDia(data.sys.sunrise, data.sys.sunset);
    
    const content = `
        <p>Nascer do Sol <span class="value">🌅 ${nascarSol}</span></p>
        <p>Pôr do Sol <span class="value">🌇 ${porSol}</span></p>
        <p>Duração do Dia <span class="value">⏱️ ${duracaoDia}</span></p>
    `;
    
    document.querySelector("#sunTimes .detail-content").innerHTML = content;
}

function mostrarDetalhesVento(data) {
    const speedUnit = useMetric ? "km/h" : "mph";
    const speedConversion = useMetric ? 3.6 : 2.237;
    const velocidade = (data.wind.speed * speedConversion).toFixed(1);
    const direcao = converterDirecaoVento(data.wind.deg);
    const rajada = data.wind.gust ? (data.wind.gust * speedConversion).toFixed(1) : "N/A";
    
    const content = `
        <p>Velocidade <span class="value">🌬️ ${velocidade} ${speedUnit}</span></p>
        <p>Direção <span class="value">🧭 ${direcao}</span></p>
        <p>Rajadas <span class="value">💨 ${rajada} ${speedUnit}</span></p>
    `;
    
    document.querySelector("#windDetails .detail-content").innerHTML = content;
}

function mostrarPrecipitacao(data) {
    const chuva1h = data.rain?.["1h"] || 0;
    const chuva3h = data.rain?.["3h"] || 0;
    const neve1h = data.snow?.["1h"] || 0;
    
    const content = `
        <p>Última Hora <span class="value">🌧️ ${chuva1h.toFixed(1)} mm</span></p>
        <p>Últimas 3 Horas <span class="value">🌧️ ${chuva3h.toFixed(1)} mm</span></p>
        <p>Neve <span class="value">❄️ ${neve1h.toFixed(1)} mm</span></p>
        <p>Umidade <span class="value">💧 ${data.main.humidity}%</span></p>
    `;
    
    document.querySelector("#rainChance .detail-content").innerHTML = content;
}

function mostrarIndiceUV(data) {
    // Nota: Requer dados adicionais da API ou outra fonte
    const content = `
        <p>Índice UV <span class="value">🌞 Moderado</span></p>
        <p>Proteção Recomendada <span class="value">🧴 Usar protetor solar</span></p>
    `;
    
    document.querySelector("#uvIndex .detail-content").innerHTML = content;
}

function mostrarAlertas(data) {
    const content = data.alerts ? data.alerts.map(alerta => `
        <p class="alert-item">⚠️ ${alerta.event}</p>
        <small>${alerta.description}</small>
    `).join('') : '<p>Sem alertas no momento</p>';
    
    document.querySelector("#weatherAlerts .detail-content").innerHTML = content;
}

function calcularDuracaoDia(nascer, por) {
    const duracaoSegundos = por - nascer;
    const horas = Math.floor(duracaoSegundos / 3600);
    const minutos = Math.floor((duracaoSegundos % 3600) / 60);
    return `${horas}h ${minutos}m`;
}

function converterDirecaoVento(graus) {
    const direcoes = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const indice = Math.round(((graus %= 360) < 0 ? graus + 360 : graus) / 22.5) % 16;
    return direcoes[indice];
}

function criarGraficoTemperatura(data) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    const labels = data.list.slice(0, 8).map(item => 
        new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
    const temperaturas = data.list.slice(0, 8).map(item => item.main.temp);
    
    if (tempChart) {
        tempChart.destroy();
    }
    
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperatura (${useMetric ? '°C' : '°F'})`,
                data: temperaturas,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: isDarkTheme ? '#fff' : '#333'
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: isDarkTheme ? '#fff' : '#333'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDarkTheme ? '#fff' : '#333'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

function compartilhar(plataforma) {
    const cidade = document.getElementById("cityInput").value;
    const temperatura = document.querySelector(".main-temp")?.textContent;
    const descricao = document.querySelector(".description")?.textContent;
    
    const texto = `Clima em ${cidade}: ${temperatura} - ${descricao}`;
    
    const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(texto)}`
    };
    
    window.open(urls[plataforma], '_blank');
}

function formatarHora(data) {
    let horas = data.getUTCHours();
    let minutos = data.getUTCMinutes();

    horas = (horas < 10) ? '0' + horas : horas;
    minutos = (minutos < 10) ? '0' + minutos : minutos;

    return `${horas}:${minutos}`;
}

// Event listeners para tecla Enter e geolocalização
document.getElementById("cityInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        buscarClima();
    }
});

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        document.getElementById("loading").style.display = "block";
        document.getElementById("loading").textContent = "Detectando sua localização...";
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                buscarClimaPorCoordenadas(lat, lon);
            },
            error => {
                document.getElementById("loading").style.display = "none";
                console.log("Erro ao obter localização:", error);
            }
        );
    }
});
