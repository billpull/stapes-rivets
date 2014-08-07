/* globals Olo:false, Stapes:false, Path:false, store:false, JSON:false */
'use strict';
Olo.Menu = {};

Olo.ViewModels.BasketViewModel = Stapes.subclass({
	constructor: function (model) {
		this.BasketGuid = model.BasketGuid || Olo.Util.generateGuid();
		this.BasketProducts = model.BasketProducts || [];
		this.SubTotal = model.SubTotal || 0;
		this.SalesTax = model.SalesTax || 0;
		this.Tip = model.Tip || 0;
		this.TotalCost = model.TotalCost || 0;
		this.DeliveryCharge = model.DeliveryCharge || 0;
		this.IsDelivery = model.IsDelivery || false;
		this.IsGroupOrder = model.IsGroupOrder || false;
	}
});

Olo.ViewModels.AddressViewModel = Stapes.subclass({
	constructor: function (model) {
		this.street = model.street || '';
		this.streetLineTwo = model.streeetLineTwo || '';
		this.city = model.city || '';
		this.state = model.state || '';
		this.zipCode = model.zipCode || '';
	}
});

Olo.Controllers.BasketController = Stapes.subclass({
	constructor: function () {
		this.model = Olo.Menu.model.Basket || new Olo.ViewModels.BasketViewModel({});

		this.isTipDetailsDisplayed = this.model.IsDelivery ? true : false;
		this.tipOptions = [
			{display: '5%', value: 0.05},
			{display: '10%', value: 0.1},
			{display: '20%', value: 0.2}
		];

		this.orderModes = [
			{display: 'Delivery'},
			{display: 'Pickup'},
			{display: 'Curbside'}
		];

		this.deliveryAddress = null;
		this.addressViewModel = new Olo.ViewModels.AddressViewModel({});

		return new Olo.Views.BaseView('basket', 'menu-app', this, this.model);
	},

	tipButtonText: function () {
		return this.model.Tip ? 'Edit Tip':'Add Tip';
	},

	toggleTipDetails: function (e, obj) {
		e.preventDefault();

		var ctx = obj.controller,
			isTipDetailsDisplayed = ctx.isTipDetailsDisplayed ? false:true;

		ctx.isTipDetailsDisplayed = isTipDetailsDisplayed;
	},

	setTip: function (e, obj) {
		e.preventDefault();

		var ctx = obj.controller,
			tipValue = $(e.target).data('value');

		ctx.model.Tip = ctx.model.SubTotal * tipValue;
		ctx.model.TotalCost = ctx.model.SubTotal + ctx.model.SalesTax + ctx.model.Tip;

		Olo.Menu.storeBasket(ctx.model);
	},

	clearTip: function (e, obj) {
		e.preventDefault();

		var ctx = obj.controller;

		ctx.model.Tip = 0;
		ctx.model.TotalCost = ctx.model.SubTotal + ctx.model.SalesTax;

		Olo.Menu.storeBasket(ctx.model);
	},

	setOrderMode: function (e, obj) {
		e.preventDefault();

		var ctx = obj.controller,
			orderMode = $(e.target).data('value');

		if (orderMode === 'Delivery') {
			ctx.model.IsDelivery = true;
			ctx.isTipDetailsDisplayed = true;
		} else {
			ctx.isTipDetailsDisplayed = false;
		}

		Olo.Menu.storeBasket(ctx.model);
	},

	setDeliveryAddress: function (e, obj) {
		e.preventDefault();

		var ctx = obj.controller;

		ctx.deliveryAddress = ctx.addressViewModel;
	}

});

Olo.Controllers.CategoriesController = Stapes.subclass({
	constructor: function () {
		var model = {
			categories: Olo.Menu.model.Categories
		};

		return new Olo.Views.BaseView('categories', 'menu-app', this, model);
	},

	viewCategory: function (e, obj) {
		e.preventDefault();

		var categoryId = obj.category.Id;

		window.location = '#/category/' + categoryId;
	}
});

Olo.Controllers.CategoryController = Stapes.subclass({
	constructor: function (categoryId) {
		var category,
			products,
			model;

		category = this.findCategory(Olo.Menu.model.Categories, categoryId);
		products = category === undefined ? [] : category.Products;

		model = {
			category: category,
			products: products
		};

		return new Olo.Views.BaseView('products', 'menu-app', this, model);
	},

	findCategory: function (categories, categoryId) {
		for (var c = 0; c < categories.length; c++) {
			var cat = categories[c];

			if (cat.Id === parseInt(categoryId, 10)) {
				return cat;
			}
		}

		return undefined;
	},

	viewProduct: function (e, obj) {
		e.preventDefault();

		var categoryId = obj.product.CategoryId,
			productId = obj.product.Id;

		window.location = '#/' + categoryId + '/product/' + productId;
	}
});

Olo.Controllers.ProductController = Stapes.subclass({
	constructor: function (categoryId, productId) {
		var self = this;

		$.get('/data/product.json', function (data) {
			return new Olo.Views.BaseView('product', 'menu-app', self, data);
		});
	},

	addToCart: function (e, obj) {
		e.preventDefault();

		var product = obj.model.Product;

		if (Olo.Menu.model.Basket === null) {
			Olo.Menu.createBasket(product);
		} else {
			Olo.Menu.addBasketProduct(product);
		}
	}
});

Olo.Controllers.MenuController = Stapes.subclass({
	constructor: function () {
		var self = this,
			basketGuid = Olo.Util.getParameterByName('basket');

		self.isVendorInfoDisplayed = false;

		$.get('/data/menu.json', function (data) {
				self.model = data;

				if (typeof basketGuid !== 'undefined') {
					var basket = store.get(basketGuid);

					if (typeof basket !== 'undefined') {
						self.model.Basket = new Olo.ViewModels.BasketViewModel(basket);
					}
				}

				self.view = new Olo.Views.BaseView('menu', 'app', self, self.model);
				Olo.Menu = self;
				self.initMenuRouter();
			});
	},

	initMenuRouter: function () {
		var $menuApp = $('#menu-app');

		function clearPanelFadeLeft() {
			$menuApp.addClass('animated fade-left-in');
		}

		function clearPanelBounceDown() {
			$menuApp.addClass('animated fade-right-in');
		}

		function exitPanel() {
			$menuApp.removeClass('animated')
					.removeClass('fade-left-in')
					.removeClass('fade-right-in');
		}

		Path.map('#/categories').to(function () {
			return new Olo.Controllers.CategoriesController();
		});

		Path.map('#/category/:category_id').to(function () {
			return new Olo.Controllers.CategoryController(this.params['category_id']);
		}).enter(clearPanelFadeLeft)
			.exit(exitPanel);

		Path.map('#/:category_id/product/:product_id').to(function () {
			return new Olo.Controllers.ProductController(this.params['category_id'], this.params['product_id']);
		}).enter(clearPanelFadeLeft)
			.exit(exitPanel);

		Path.map('#/basket').to(function () {
			return new Olo.Controllers.BasketController();
		}).enter(clearPanelBounceDown)
			.exit(exitPanel);

		Path.root('#/categories');

		Path.listen();
	},

	toggleVendorInfo: function (e, obj) {
		e.preventDefault();

		var isVendorInfoDisplayed = obj.controller.isVendorInfoDisplayed ? false : true;

		obj.controller.isVendorInfoDisplayed = isVendorInfoDisplayed;
	},

	storeBasket: function (basket) {
		Olo.Menu.model.Basket = basket;

		store.set(basket.BasketGuid, basket);
	},

	updateBasket: function (basket) {
		var basketProds = basket.BasketProducts,
			subTotal = 0,
			salesTax = 0,
			total = 0;

		for (var i = 0; i < basketProds.length; i++) {
			var prod = basketProds[i];

			subTotal += prod.BaseCost;
		}

		if (subTotal) {
			salesTax = subTotal * 0.06;
		}

		total = subTotal + salesTax;

		basket.SubTotal = subTotal;
		basket.SalesTax = salesTax;
		basket.TotalCost = total;

		console.log(basket);
		
		Olo.Menu.storeBasket(basket);
	},

	createBasket: function (product) {
		var basket = new Olo.ViewModels.BasketViewModel({}),
			currentProds = basket.BasketProducts;

		currentProds.push(product);

		basket.set('BasketProducts', currentProds);

		Olo.Menu.updateBasket(basket);

		window.location = Olo.Util.updateQueryString('basket', basket.BasketGuid, '#/categories');
	},

	addBasketProduct: function (product) {
		var currentBasketProds = Olo.Menu.model.Basket.BasketProducts;

		currentBasketProds.push(product);

		Olo.Menu.model.Basket.set('BasketProducts', currentBasketProds);

		Olo.Menu.updateBasket(Olo.Menu.model.Basket);

		window.location = '#/categories';
	}
});