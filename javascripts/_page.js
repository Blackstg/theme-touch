/*****************************
 Page
 *****************************/
var Page = (function () {
    var changeDeliveryMethod = function (delivery_method) {
        Basket.showBusy();
        window.location = Util.addKeyValueToURL(window.location.href, 'delivery_method', delivery_method);
    };

    var changeTime = function (order_time) {
        Basket.showBusy();
        window.location = Util.addKeyValueToURL(window.location.href, 'sc_order_time', order_time);
    };

    var changeDate = function (order_day, format) {
        Basket.showBusy();
        var params = "sc_order_day=" + encodeURIComponent(order_day);
        if (format) {
            params += "&order_day_format=" + encodeURIComponent(format);
        }
        window.location = Util.addParametersToURL(window.location.href, params);
    };

    var changeDateAndDeliveryMethod = function (order_day, delivery_method) {
        Basket.showBusy();
        window.location = Util.addParametersToURL(window.location.href, "sc_order_day=" + order_day + "&delivery_method=" + delivery_method);
    };

    var changeDeliveryMethodInStepBasket = function (delivery_method) {
        Basket.showBusy();
        $j.ajax({
            url: "/step_basket?delivery_method=" + delivery_method + "&page=basket",
            type: 'get'
        }).done(function (data) {
            Basket.updateContent(data);
        });
    };

    var equalizeProducts = function () {
        var category_products = $j('.category__products:visible');
        if (category_products.length == 0) return;

        category_products.find('.product__top').height('');

        var first_product = $j('.product').first(),
            nb_columns = Math.floor(category_products.width() / first_product.width());
        if (nb_columns <= 1) return;

        category_products.each(function () {
            var product_tops = $j(this).find('.product__top');

            for (var i = 0; i < product_tops.length; i += nb_columns) {
                var row_product_tops = product_tops.slice(i, i + nb_columns),
                    heights = row_product_tops.map(function (i, e) {
                        return $j(e).height()
                    }),
                    max_height = Math.max.apply(Math, heights);
                row_product_tops.height(max_height);
            }
        });
    };

    return {
        // Date/time
        changeDeliveryMethod: changeDeliveryMethod,
        changeDeliveryMethodInStepBasket: changeDeliveryMethodInStepBasket,
        changeTime: changeTime,
        changeDate: changeDate,
        changeDateAndDeliveryMethod: changeDateAndDeliveryMethod,

        // Layout
        equalizeProducts: function () {
            equalizeProducts();
            $j(window).on('resize', equalizeProducts);
        }
    }
}());
