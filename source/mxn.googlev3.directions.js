mxn.register('googlev3', {

Directions: {
        
    init: function() {
        this.routers[this.api] = new google.maps.DirectionsService();
    },

    getRouteFromQuery: function(origin, destination) {
        var self = this;
        var router = this.routers[this.api];

        var request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        }

        router.route(request, function(response) {
            if (!response) {
                self.error_callback("Unknown error occurred");
            } else if (response.status != "OK") {
                self.error_callback(response.status);
            } else if (response.routes.length < 1) {
                self.error_callback("No routes returned");
            } else {
                self.getRoute_callback(response);
            }
        });
    },

    getRouteFromWayPoints: function(wayPoints) {
        var self = this;
        var router = this.routers[this.api];
        var points = [];

        for (var i = 1; i < wayPoints.length-1; i++) {
            points.push({
                location: wayPoints[i].toProprietary(this.api).toUrlValue(6),
                stopover: false
            });
        }

        var request = {
            origin: wayPoints[0].toProprietary(this.api).toUrlValue(6),
            destination: wayPoints[wayPoints.length-1].toProprietary(this.api).toUrlValue(6),
            travelMode: google.maps.TravelMode.DRIVING,
            waypoints: points
        }

        router.route(request, function(response) {
            if (!response) {
                self.error_callback("Unknown error occurred");
            } else if (response.status != "OK") {
                self.error_callback(response.status);
            } else if (response.routes.length < 1) {
                self.error_callback("No routes returned");
            } else {
                self.getRoute_callback(response.routes[0]);
            }
        });
    },

    getRoute_callback: function(route) {

        // Polyline
        var gPoints = route.overview_path;
        var points = [];

        for (var i = 0; i < gPoints.length; i++) {
            var point = new mxn.LatLonPoint();
            point.fromProprietary(this.api, gPoints[i]);
            points.push(point);
        }

        var polyline = new mxn.Polyline(points);

        // Other bits
        var directions = [];
        var distance = 0;
        var duration = 0;

        for (var i = 0; i < route.legs.length; i++) {
            var leg = route.legs[i];
            distance += leg.distance.value;
            duration += leg.duration.value;

            for (var j = 0; j < leg.steps.length; j++) {
                var step = leg.steps[j];
                directions[directions.length] = step.instructions;
            }
        }

        var response = {
            polyline: polyline,
            directions: directions,
            distance: distance,
            duration: duration
        };

        this.callback(response);
    }
}
});