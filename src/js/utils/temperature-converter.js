export function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

export function formatTemperature(temp, unit = 'C') {
    const roundedTemp = Math.round(temp);
    return `${roundedTemp}°${unit}`;
}

export function getTemperatureColor(temp) {
    if (temp <= 0) return '#7eb2ff'; // Azul frio
    if (temp <= 15) return '#a5d8ff'; // Azul claro
    if (temp <= 25) return '#ffd93d'; // Amarelo
    if (temp <= 35) return '#ff9f43'; // Laranja
    return '#ff6b6b'; // Vermelho
} 