export class TemperatureChart {
    constructor() {
        this.chart = null;
        this.ctx = document.getElementById('temperatureChart').getContext('2d');
    }
    
    updateChart(forecastData) {
        const labels = forecastData.list.slice(0, 8).map(item => 
            new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
        
        const temperatures = forecastData.list.slice(0, 8).map(item => item.main.temp);
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: temperatures,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
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
                            color: document.body.classList.contains('light-theme') ? '#333' : '#fff'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: document.body.classList.contains('light-theme') ? '#333' : '#fff'
                        },
                        grid: {
                            color: document.body.classList.contains('light-theme') ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: document.body.classList.contains('light-theme') ? '#333' : '#fff'
                        },
                        grid: {
                            color: document.body.classList.contains('light-theme') ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
} 