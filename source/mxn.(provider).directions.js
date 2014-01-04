mxn.register('{{api_id}}', {

Directions: {
        
    init: function() {
        // TODO: Add provider code
        // this.routers[this.api] = new <directions object>;
    },

    getRouteFromQuery: function(origin, destination) {
        // TODO: Add provider code
    },

    getRouteFromWayPoints: function(wayPoints) {
        // TODO: Add provider code
    },

    getRoute_callback: function(route) {
        var response = {};

        // TODO: Add provider code
        // response.polyline = polyline;
        // response.directions = directions;
        // response.distance = distance;
        // response.duration = duration;

        this.callback(response);
    }
}
});