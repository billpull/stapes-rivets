/* globals Stapes:false, rivets:false, Olo:false */
'use strict';

Olo.Views.BaseView = Stapes.subclass({
	constructor: function (tmplId, container, controller, model) {
		this.tmplId = tmplId;
		this.controller = controller;
		this.model = model || {};
		this.appContainer = $('#' + container);

		this.populateView();
		this.bindView();
	},

	populateView: function () {
		var tmplHtml = $('#' + this.tmplId).html();

		this.appContainer.html(tmplHtml);
	},

	bindView: function () {
		rivets.bind(this.appContainer[0], {controller: this.controller, model: this.model});
	}
});