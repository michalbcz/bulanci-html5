/**
 * Map Registry
 * Defines all available maps with their themes and visual properties
 * 
 * @class MapRegistry
 * @constructor
 * @author Michal Vlcek <mychalvlcek@gmail.com>
 */
BULANCI.MapRegistry = function() {
    this.maps = {
        'kitchen': {
            name: 'Kitchen Table',
            id: 'kitchen',
            type: 'gradient',
            gradient: {
                colors: ['#8B4513', '#D2691E', '#CD853F'],
                type: 'radial' // wooden table surface
            }
        },
        'startrek': {
            name: 'Star Trek',
            id: 'startrek',
            type: 'gradient',
            gradient: {
                colors: ['#000033', '#000066', '#0000CC', '#3366FF'],
                type: 'linear' // space background
            }
        },
        'southpark': {
            name: 'South Park',
            id: 'southpark',
            type: 'gradient',
            gradient: {
                colors: ['#87CEEB', '#B0E0E6', '#87CEEB'],
                type: 'linear' // sky blue
            }
        },
        'garden': {
            name: 'Garden',
            id: 'garden',
            type: 'gradient',
            gradient: {
                colors: ['#228B22', '#32CD32', '#90EE90'],
                type: 'radial' // grass green
            }
        },
        'venus': {
            name: 'Venus',
            id: 'venus',
            type: 'gradient',
            gradient: {
                colors: ['#FFA500', '#FF8C00', '#FF6347', '#FFD700'],
                type: 'radial' // orange/yellow planet surface
            }
        }
    };
    
    this.currentMap = this.loadSelectedMap();
};

BULANCI.MapRegistry.prototype.getMapIds = function() {
    return Object.keys(this.maps);
};

BULANCI.MapRegistry.prototype.getMap = function(mapId) {
    return this.maps[mapId] || this.maps['garden'];
};

BULANCI.MapRegistry.prototype.getCurrentMap = function() {
    return this.getMap(this.currentMap);
};

BULANCI.MapRegistry.prototype.setCurrentMap = function(mapId) {
    if (this.maps[mapId]) {
        this.currentMap = mapId;
        this.saveSelectedMap(mapId);
    }
};

BULANCI.MapRegistry.prototype.getAllMaps = function() {
    return this.maps;
};

BULANCI.MapRegistry.prototype.saveSelectedMap = function(mapId) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("bulanci_selected_map", mapId);
    }
};

BULANCI.MapRegistry.prototype.loadSelectedMap = function() {
    if (typeof(Storage) !== "undefined") {
        var savedMap = localStorage.getItem("bulanci_selected_map");
        if (savedMap && this.maps[savedMap]) {
            return savedMap;
        }
    }
    return 'garden'; // default map
};
