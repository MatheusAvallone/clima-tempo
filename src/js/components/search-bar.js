export class SearchBar {
    constructor(onSearch) {
        this.onSearch = onSearch;
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.locationButton = document.getElementById('locationButton');
        
        this.init();
    }

    init() {
        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        if (this.locationButton) {
            this.locationButton.addEventListener('click', () => this.handleLocationSearch());
        }
    }

    handleSearch() {
        const city = this.searchInput.value.trim();
        if (city) {
            this.onSearch(city);
        }
    }

    async handleLocationSearch() {
        try {
            const position = await this.getCurrentPosition();
            this.onSearch(null, position);
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            // Aqui você pode adicionar uma notificação de erro para o usuário
        }
    }

    getCurrentPosition() {
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
                    reject(error);
                }
            );
        });
    }

    setLoading(isLoading) {
        this.searchButton.disabled = isLoading;
        this.searchInput.disabled = isLoading;
        if (this.locationButton) {
            this.locationButton.disabled = isLoading;
        }
    }

    clear() {
        this.searchInput.value = '';
    }
} 