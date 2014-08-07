/* globals  Olo */
'use strict';

Olo.Init = function () {
	var ctrl = $('body').data('controller');

	// do any common stuff

	if (ctrl) {
		return new Olo.Controllers[ctrl];
	}
};

Olo.Init();