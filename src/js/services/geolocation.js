class GeolocationService {
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não é suportada pelo seu navegador'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject(new Error('Permissão de localização negada'));
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject(new Error('Informações de localização indisponíveis'));
                            break;
                        case error.TIMEOUT:
                            reject(new Error('Tempo limite da requisição de localização excedido'));
                            break;
                        default:
                            reject(new Error('Erro desconhecido na geolocalização'));
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }
}

export default new GeolocationService(); 