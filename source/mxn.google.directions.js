mxn.register('google', {

Directions: {
        
    init: function() {
        var self = this;
        var router = new GDirections();

        // Error event
        GEvent.addListener(router, "error", function() {

            // Google geocoding status messages
            var reasons = [];
            reasons[G_GEO_SUCCESS] = "Success";
            reasons[G_GEO_MISSING_ADDRESS] = "Missing Address: The address was either missing or had no value.";
            reasons[G_GEO_UNKNOWN_ADDRESS] = "Unknown Address:  No corresponding geographic location could be found for the specified address.";
            reasons[G_GEO_UNAVAILABLE_ADDRESS] = "Unavailable Address:  The geocode for the given address cannot be returned due to legal or contractual reasons.";
            reasons[G_GEO_BAD_KEY] = "Bad Key: The API key is either invalid or does not match the domain for which it was given";
            reasons[G_GEO_TOO_MANY_QUERIES] = "Too Many Queries: The daily geocoding quota for this site has been exceeded.";
            reasons[G_GEO_SERVER_ERROR] = "Server error: The geocoding request could not be successfully processed.";

            var code = router.getStatus().code;
            var response = "Error: " + (reasons[code] || "Unknown error returned (" + code + ")");

            self.error_callback(response);
        });

        // Directions returned event
        GEvent.addListener(router, "load", function() {
            self.getRoute_callback();
        });

        this.routers[this.api] = router;
    },

    getRouteFromQuery: function(origin, destination) {
        var router = this.routers[this.api];
        router.load(origin + " to " + destination, { getPolyline: true, getSteps: true });
    },

    getRouteFromWayPoints: function(waypoints) {
        var router = this.routers[this.api];
        var points = new Array();

        for (var i = 0; i < wayPoints.length; i++) {
            points.push(wayPoints[i].toProprietary(this.api).toUrlValue(6));
        }

        router.loadFromWaypoints(points, { getPolyline: true, getSteps: true });
    },

    getRoute_callback: function() {
        var router = this.routers[this.api];
        
        // Polyline
        var gPolyline = router.getPolyline();
        var points = [];

        for (var i = 0; i < gPolyline.getVertexCount(); i++) {
            var point = new mxn.LatLonPoint();
            point.fromProprietary(this.api, gPolyline.getVertex(i));
            points.push(point);
        }

        var polyline = new mxn.Polyline(points);

        // Directions
        var directions = [];

        if (router.getNumRoutes() > 0) {
            for (var i = 0; i < router.getRoute(0).getNumSteps(); i++) {
                directions[i] = router.getRoute(0).getStep(i).getDescriptionHtml();
            }
        }

        var response = {
            polyline: polyline,
            directions: directions,
            distance: router.getDistance().meters,
            duration: router.getDuration().seconds
        };

        this.callback(response);
    }
}
});