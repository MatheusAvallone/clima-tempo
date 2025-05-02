const apiKey = "0cedcfc57557fc77369360ae08091726";

function buscarClima() {
  const cidade = encodeURIComponent(document.getElementById("cityInput").value.trim());
  if (!cidade) return;

  // Exibe o carregamento
  document.getElementById("loading").style.display = "block";
  document.getElementById("weatherResult").innerHTML = '';

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Cidade não encontrada");
      }
      return response.json();
    })
    .then(data => {
      // Esconde o carregamento
      document.getElementById("loading").style.display = "none";

      // Obter o fuso horário da cidade
      const timezoneOffset = data.timezone; // Fuso horário em segundos

      // Obter a hora UTC
      const utcTime = new Date(); // Hora UTC atual

      // Ajustar a hora local
      const localTime = new Date(utcTime.getTime() + timezoneOffset * 1000); // Ajuste pelo fuso horário

      // Formatar a hora local
      const horaLocal = formatarHora(localTime);

      // Exibir a hora local e os dados do clima
      const clima = `
        <div class="weather-card">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p><strong>🕒 Hora Local: ${horaLocal}</strong></p>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone do clima" class="weather-icon">
            <p>🌡️ Temperatura: ${data.main.temp}°C</p>
            <p>💧 Umidade: ${data.main.humidity}%</p>
            <p>🌬️ Vento: ${data.wind.speed} km/h</p>
            <p>${data.weather[0].description}</p>
            <p>📊 Pressão atmosférica: ${data.main.pressure} hPa</p>
            <p>🌫️ Visibilidade: ${data.visibility / 1000} km</p>
        </div>
      `;
      document.getElementById("weatherResult").innerHTML = clima;
    })
    .catch(error => {
      // Esconde o carregamento
      document.getElementById("loading").style.display = "none";
      document.getElementById("weatherResult").innerHTML = `<p>${error.message}</p>`;
    });
}

// Função para formatar a hora (garantir 2 dígitos para hora e minuto)
function formatarHora(data) {
  let horas = data.getHours();
  let minutos = data.getMinutes();

  // Formatar hora e minutos para ter 2 dígitos (ex: "01", "09", "15")
  horas = (horas < 10) ? '0' + horas : horas;
  minutos = (minutos < 10) ? '0' + minutos : minutos;

  return `${horas}:${minutos}`;  // Exibe hora e minuto
}
