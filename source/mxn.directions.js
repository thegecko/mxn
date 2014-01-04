(function(){

	/**
	 * Initialise our provider. This function should only be called 
	 * from within mapstraction code, not exposed as part of the API.
	 * @private
	 */
	var init = function() {
		this.invoker.go('init');
	};

	/**
	 * @name mxn.Directions
	 * @constructor
	 * @param {String} api The API to use
	 * @param {Function} callback The function to call when a route request returns: function({ polyline{}, directions[], distance(meters), duration(seconds)})
	 * @param {Function} error_callback The optional function to call when a route request fails
	 * @exports Directions as mxn.Directions
	 */
	var Directions = mxn.Directions = function (api, callback, error_callback) {
		this.routers = {};
		this.api = api;
		this.callback = callback;
		this.error_callback = error_callback || function() {};
		  
		// set up our invoker for calling API methods
		this.invoker = new mxn.Invoker(this, 'Directions', function(){ return this.api; });
		init.apply(this);
	};

	mxn.addProxyMethods(Directions, [
		
		/**
		 * Gets a route between two textual points.
		 * @name mxn.Routing#getRouteFromQuery
		 * @function
		 * @param {String} origin: origin of route
		 * @param {String} destination: destination of route
		 */
		'getRouteFromQuery',
		
		/**
		 * Gets a route between multiple waypoints.
		 * @name mxn.Routing#getRouteFromWayPoints
		 * @function
		 * @param {Array} wayPoints: list of locations to route between, must be >= 2
		 */
		'getRouteFromWayPoints',
		
		'getRoute_callback',

	]);

	/**
	 * Change the directions API in use
	 * @name mxn.Directions#swap
	 * @param {String} api The API to swap to
	 */
	Directions.prototype.swap = function(api) {
		if (this.api == api) { return; }

		this.api = api;
		if (!this.routers.hasOwnProperty(this.api)) {
			init.apply(this);
		}
	};

})();