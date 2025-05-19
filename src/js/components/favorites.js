export class FavoritesManager {
    constructor() {
        this.storageKey = 'weatherFavorites';
    }
    
    getFavorites() {
        const favorites = localStorage.getItem(this.storageKey);
        return favorites ? JSON.parse(favorites) : [];
    }
    
    addFavorite(city) {
        const favorites = this.getFavorites();
        if (!favorites.includes(city)) {
            favorites.push(city);
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
        }
    }
    
    removeFavorite(city) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(city);
        if (index > -1) {
            favorites.splice(index, 1);
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
        }
    }
    
    isFavorite(city) {
        const favorites = this.getFavorites();
        return favorites.includes(city);
    }
} 