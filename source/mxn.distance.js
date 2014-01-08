(function(){

	// Based on code by Bill Chadwick
	// http://www.bdcc.co.uk/Gmaps/BdccGmapBits.htmhttp://www.bdcc.co.uk/Gmaps/BdccGmapBits.htm

	// Code to find the distance in metres between a lat/lng point and a polyline of lat/lng points
	// All in WGS84. Free for any use.
	//
	// Bill Chadwick 2007
		
	// Construct a geo from its latitude and longitude in degrees
	function geo(lat, lon) 
	{
		this.lat = lat;
		this.lon = lon;
		var theta = (lon * Math.PI / 180.0);
		var rlat = geoGeocentricLatitude(lat * Math.PI / 180.0);
		var c = Math.cos(rlat);	
		this.x = c * Math.cos(theta);
		this.y = c * Math.sin(theta);
		this.z = Math.sin(rlat);		
	}
	geo.prototype = new geo();
	
    // Convert from geographic to geocentric latitude (radians).
	function geoGeocentricLatitude(geographicLatitude) 
	{
		var flattening = 1.0 / 298.257223563;//WGS84
	    var f = (1.0 - flattening) * (1.0 - flattening);
		return Math.atan((Math.tan(geographicLatitude) * f));
	}
	
	// Convert from geocentric to geographic latitude (radians)
	function geoGeographicLatitude (geocentricLatitude) 
	{
		var flattening = 1.0 / 298.257223563;//WGS84
	    var f = (1.0 - flattening) * (1.0 - flattening);
		return Math.atan(Math.tan(geocentricLatitude) / f);
	}
	
	// Returns the two antipodal points of intersection of two great
	// circles defined by the arcs geo1 to geo2 and
	// geo3 to geo4. Returns a point as a Geo, use .antipode to get the other point
	function geoGetIntersection( geo1,  geo2,  geo3,  geo4) 
	{
		var geoCross1 = geo1.crossNormalize(geo2);
		var geoCross2 = geo3.crossNormalize(geo4);
		return geoCross1.crossNormalize(geoCross2);
	}
	
	//from Radians to Meters
	function geoRadiansToMeters(rad)
	{
		return rad * 6378137.0; // WGS84 Equatorial Radius in Meters
	}

	//from Meters to Radians
	function geoMetersToRadians(m)
	{
		return m / 6378137.0; // WGS84 Equatorial Radius in Meters
	}
	
	geo.prototype.getLatitudeRadians = function() 
	{
		return (geoGeographicLatitude(Math.atan2(this.z, Math.sqrt((this.x * this.x) + (this.y * this.y)))));
	}

	geo.prototype.getLongitudeRadians = function() 
	{
		return (Math.atan2(this.y, this.x));
	}
	
	geo.prototype.getLatitude = function() 
	{
		return this.getLatitudeRadians()  * 180.0 / Math.PI;
	}

	geo.prototype.getLongitude = function() 
	{
		return this.getLongitudeRadians()  * 180.0 / Math.PI ;
	}

	geo.prototype.getLatLon = function() 
	{
		return new mxn.LatLonPoint(this.getLatitude(), this.getLongitude());
	}

    //Maths
	geo.prototype.dot = function( b) 
	{
		return ((this.x * b.x) + (this.y * b.y) + (this.z * b.z));
	}

    //More Maths
	geo.prototype.crossLength = function( b) 
	{
		var x = (this.y * b.z) - (this.z * b.y);
		var y = (this.z * b.x) - (this.x * b.z);
		var z = (this.x * b.y) - (this.y * b.x);
		return Math.sqrt((x * x) + (y * y) + (z * z));
	}
	
	//More Maths
	geo.prototype.scale = function( s) 
	{
	    var r = new geo(0,0);
	    r.x = this.x * s;
	    r.y = this.y * s;
	    r.z = this.z * s;
		return r;
	}

    // More Maths
	geo.prototype.crossNormalize = function( b) 
	{
		var x = (this.y * b.z) - (this.z * b.y);
		var y = (this.z * b.x) - (this.x * b.z);
		var z = (this.x * b.y) - (this.y * b.x);
		var L = Math.sqrt((x * x) + (y * y) + (z * z));
		var r = new geo(0,0);
		r.x = x / L;
		r.y = y / L;
		r.z = z / L;
		return r;
	}
	
  	// point on opposite side of the world to this point
	geo.prototype.antipode = function() 
	{
		return this.scale(-1.0);
	}

    //distance in radians from this point to point v2
	geo.prototype.distance = function( v2) 
	{
		return Math.atan2(v2.crossLength(this), v2.dot(this));
	}

	//returns in meters the minimum of the perpendicular distance of this point from the line segment geo1-geo2
	//and the distance from this point to the line segment ends in geo1 and geo2 
	geo.prototype.distanceToLineSegMtrs = function(geo1, geo2)
	{	
		//point on unit sphere above origin and normal to plane of geo1,geo2
		//could be either side of the plane
		var p2 = geo1.crossNormalize(geo2); 

		// intersection of GC normal to geo1/geo2 passing through p with GC geo1/geo2
		var ip = geoGetIntersection(geo1,geo2,this,p2); 

		//need to check that ip or its antipode is between p1 and p2
		var d = geo1.distance(geo2);
		var d1p = geo1.distance(ip);
		var d2p = geo2.distance(ip);
		//window.status = d + ", " + d1p + ", " + d2p;
		if ((d >= d1p) && (d >= d2p)) 
			return { point: ip, distance: geoRadiansToMeters(this.distance(ip)) };
		else
		{
			ip = ip.antipode(); 
			d1p = geo1.distance(ip);
			d2p = geo2.distance(ip);
		}
		if ((d >= d1p) && (d >= d2p)) 
			return { point: ip, distance: geoRadiansToMeters(this.distance(ip)) }; 
		else 
		{
			var g1 = geo1.distance(this);
			var g2 = geo2.distance(this);

			if (g1 < g2) return { point: geo1, distance: geoRadiansToMeters(g1) };
			else return { point: geo2, distance: geoRadiansToMeters(g2) };

		}
	}

	mxn.distance = {};
	
    // distance in meters from GLatLng point to GPolyline or GPolygon poly
    mxn.distance.pointFromPolyline = function(poly, point)
    {
        var d = {}
        d.distance = 999999999;
        var i;
        var p = new geo(point.lat,point.lon);
        for(i=0; i<(poly.points.length-1); i++)
             {
                var p1 = poly.points[i];
                var l1 = new geo(p1.lat,p1.lon);
                var p2 = poly.points[i+1];
                var l2 = new geo(p2.lat,p2.lon);
                var dp = p.distanceToLineSegMtrs(l1,l2);
                if(dp.distance < d.distance)
                    d = dp;    
             }
         return { point: d.point.getLatLon(), distance: d.distance };
    };

    // distance in meters from GLatLng point to GPolyline or GPolygon poly
    mxn.distance.pointFromPoint = function(point1, point2)
    {
    	var p1 = new geo(point1.lat,point1.lon);
    	var p2 = new geo(point2.lat,point2.lon);
		return geoRadiansToMeters(p1.distance(p2));
    };

})();