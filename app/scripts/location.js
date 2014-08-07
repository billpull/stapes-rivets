/* globals Stapes:false, Olo:false */
'use strict';

var locationData = [
	{
	    name: 'Five Guys Brooklyn - Brooklyn Heights',
	    streetAddress: '138 Montague St',
	    city: 'Brooklyn',
	    state: 'NY',
	    zipCode: '11201',
	    hours: 'Open today, 24hrs',
	    hasDelievery: false,
	    distance: 1.3
	},
	{
	    name: 'Five Guys Fulton St',
	    streetAddress: '19 Fulton St',
	    city: 'New York',
	    state: 'NY',
	    zipCode: '10038',
	    hours: 'Open today, 24hrs',
	    hasDelievery: true,
	    distance: 1
	},
	{
	    name: 'Five Guys NYC - Bleecker St',
	    streetAddress: '296 Bleecker St',
	    city: 'New York',
	    state: 'NY',
	    zipCode: '10038',
	    hours: 'Open today, 24hrs',
	    hasDelievery: false,
	    distance: 1
	},
	{
	    name: 'Five Guys Jersey City',
	    streetAddress: '286 Washington St',
	    city: 'Jersey City',
	    state: 'NJ',
	    zipCode: '07302',
	    hours: 'Open today, 24hrs',
	    hasDelievery: true,
	    distance: 2
	}
];

Olo.Controllers.LocationController = Stapes.subclass({
	constructor: function () {
		this.originalLocations = locationData;
		this.zipCode = '';
		this.errorText = '';

		var model = {
			locations: this.originalLocations
		};

		this.view = new Olo.Views.BaseView('locations', 'app', this, model);
	},

	filterZipCode: function (e, obj) {
		e.preventDefault();

		var ctx = obj.controller,
			model = obj.model,
			zipCode = ctx.zipCode,
			filteredLocations = [];

		if (zipCode === '') {
			model.locations = [];
			ctx.errorText = 'Please Enter Zip Code';
		} else {
			for (var i = 0; i < ctx.originalLocations.length; i++) {
				var loc = ctx.originalLocations[i];

				if (loc.zipCode === zipCode) {
					filteredLocations.push(loc);
				}
			}

			if (filteredLocations.length > 0) {
				ctx.errorText = '';
				model.locations = filteredLocations;
			} else {
				ctx.errorText = 'No Locations Found';
				model.locations = [];
			}
		}
	},

	filterOrderMode: function (e, obj) {
		e.preventDefault();

		var orderMode = $(e.target).data('order-mode'),
			locations = obj.model.locations,
			filteredLocations = [];

		if (orderMode === 'Delivery') {
			for (var i = 0; i < locations.length; i++) {
				var loc = locations[i];

				if (loc.hasDelievery) {
					filteredLocations.push(loc);
				}
			}
		} else {
			filteredLocations = locations;
		}

		obj.model.locations = filteredLocations;
	}
});