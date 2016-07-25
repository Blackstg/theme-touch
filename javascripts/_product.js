/***************************
 Product
 ***************************/

var Product = (function () {
    var WARNING_PRICING_NOT_INITIALIZED = 'Product library not initialized. Call Product.setPricing(...) first.';

    // Ex.: EUR
    var currency;

    // Ex.: fr-FR
    var locale;

    // null, '1_by_1' or 'charge_difference'
    var swap_toppings;

    // 'average', 'most_expensive' or 'most_expensive_incl_toppings'
    var multiside_side_pricing;

    // 'split', 'once' or 'full'
    var multiside_topping_pricing;

    // product handle -> 'sku_handles' -> sku key -> sku handle
    //                -> 'skus' -> sku handle -> price
    //                -> 'nb_free_toppings'
    var basePricing = {};

    // product handle -> sku handle -> 'options' -> HMTL id -> price
    //                              -> 'toppings' -> HMTL id -> price
    //                              -> 'multiside_toppings' -> HMTL id -> price
    //                              -> 'ingredients' -> HMTL id -> price
    //                              -> 'enums' -> HTML id -> price
    var optionPricing = {};

    var checkInit = function () {
        if (!currency) console.warn(WARNING_PRICING_NOT_INITIALIZED);
    };

    var moneyToString = function (cents) {
        return Money.toString(cents, currency, locale);
    };

    var updateQuantity = function (field, action) {
        var maxlength = parseInt(field.attr('maxlength')),
            limit = Math.pow(10, maxlength) - 1,
            value = Math.max(parseInt(field.val()), 0);
        if (action == '+') {
            value = Math.min(value + 1, limit);
        } else if (action == '-') {
            value = Math.max(value - 1, 0);
        }
        field.val(value);
    };

    var useGlobalSkus = function (form) {
        return form.find("[data-sku-part]").length == 0;
    };

    var useSelect = function (form) {
        if (useGlobalSkus(form)) {
            return $j("select[data-grouped-sku-part], [data-grouped-sku-part] select").length > 0;
        } else {
            return form.find("select[data-sku-part], [data-sku-part] select").length > 0;
        }
    };

    var sortedSkuParts = function (form) {
        if (useGlobalSkus(form)) {
            return $j(
                [$j("[data-grouped-sku-part=0]")[0], $j("[data-grouped-sku-part=1]")[0]].filter(function (n) {
                    return n !== undefined;
                }));
        } else {
            return $j(
                [form.find("[data-sku-part=0]")[0], form.find("[data-sku-part=1]")[0]].filter(function (n) {
                    return n !== undefined;
                }));

        }
    };

    var skuHandle = function (form) {
        // If there is no sku part selector (ie when a multi sku product has only one available sku), return the sku hardcoded in the form
        if (!useGlobalSkus(form) && form.find('[data-sku-part]').length == 0) return form.attr('data-sku');

        var product_handle = form.attr('data-product'),
            use_select = useSelect(form),
            sku_key = sortedSkuParts(form).map(function (i, e) {
                return $j(e).find(use_select ? "option:selected" : "input:checked").val();
            }).get().join('$');
        return basePricing[product_handle]['sku_handles'][sku_key];
    };

    var updateSkus = function (form) {
        var product_handle = form.attr('data-product'),
            sorted_sku_parts = sortedSkuParts(form);

        // Hide/show sku parts based on availability
        if (useSelect(form)) {
            sorted_sku_parts.each(function (sku_part_index, sku_part) {
                var options = $j(sku_part).find("option");

                options.each(function (option_index, option) {
                    var sub = sorted_sku_parts.slice(0, sku_part_index).map(function (i, e) {
                            return $j(e).find("option:selected").val();
                        }).get().concat([option.value]).join('$'),
                        is_available = false;

                    for (var sku in basePricing[product_handle]['sku_handles']) {
                        if (sku.indexOf(sub) >= 0) {
                            is_available = true;
                        }
                    }
                    $j(option).toggle(is_available);
                    $j(option).prop('disabled', !is_available);
                });

                var selected_option = options.filter(':selected');
                if (selected_option.is(':disabled')) {
                    options.prop('selected', false);
                    options.filter(':enabled:first').prop('selected', true);
                }
            });
        } else {
            sorted_sku_parts.each(function (sku_part_index, sku_part) {
                var inputs = $j(sku_part).find("input");

                inputs.each(function (input_index, input) {
                    var sub = sorted_sku_parts.slice(0, sku_part_index).map(function (i, e) {
                            return $j(e).find("input:checked").val();
                        }).get().concat([input.value]).join('$'),
                        is_available = false;

                    for (var sku in basePricing[product_handle]['sku_handles']) {
                        if (sku.indexOf(sub) >= 0) {
                            is_available = true;
                        }
                    }
                    $j(input).prop('disabled', !is_available);
                });

                var selected_input = inputs.filter(':checked');
                if (selected_input.is(':disabled')) {
                    inputs.prop('checked', false);
                    inputs.filter(':enabled:first').prop('checked', true);
                }
            });
        }

        // Update data-sku
        var sku_handle = skuHandle(form);
        if (sku_handle !== undefined) {
            form.attr('data-sku', sku_handle);
        }
    };

    var updatePrice = function (form) {
        var product_handle = form.attr('data-product'),
            sku_handle = skuHandle(form),
            price = basePricing[product_handle]['skus'][sku_handle],
            nb_free_toppings = basePricing[product_handle]['nb_free_toppings'] || 0;

        if (price) {
            var toppings = [],
                ingredients = [];

            form.find('[data-option] input, input[data-option]').each(function (i, e) {
                var input = $j(e),
                    is_checked = input.is(':checked'),
                    data_option = input.closest('[data-option]'),
                    html_id = data_option.attr('data-option'),
                    quantity = input.attr('data-quantity') || 1,
                    force_ingredient = data_option.is('[data-option-ingredient]'),
                    sku_options = optionPricing[product_handle][sku_handle],
                    topping_price = (sku_options['toppings'] || {})[html_id],
                    ingredient_value = (sku_options['ingredients'] || {})[html_id],
                    option_price = (sku_options['options'] || {})[html_id],
                    enum_price = sku_options['enums'] && sku_options['enums'][html_id] ? sku_options['enums'][html_id][1] : null;
                if (topping_price && is_checked) {
                    if (force_ingredient) quantity--;
                    for (var i = 0; i < quantity; ++i) toppings.push(topping_price);
                } else if (ingredient_value && !is_checked) {
                    ingredients.push(ingredient_value);
                } else if ((option_price || enum_price) && is_checked) {
                    price += (option_price || enum_price) * quantity;
                }
            });

            toppings.sort(function (a, b) {
                return a - b
            });

            ingredients.sort(function (a, b) {
                return a - b
            });

            if (swap_toppings == '1_by_1') {
                $j.each(toppings.reverse(), function (i, topping_value) {
                    var topping_index = toppings.findIndex(function (_topping_value) {
                        return topping_value == _topping_value;
                    });
                    var ingredient_index = ingredients.findIndex(function (ingredient_value) {
                        return ingredient_value >= topping_value;
                    });
                    if (ingredient_index >= 0) {
                        toppings.splice(topping_index, 1);
                        ingredients.splice(ingredient_index, 1);
                    }
                });
            }

            toppings = toppings.slice(nb_free_toppings);
            var toppings_price = 0;
            $j.each(toppings, function () {
                toppings_price += this;
            });

            if (swap_toppings == 'charge_difference') {
                $j.each(ingredients, function () {
                    toppings_price = Math.max(0, toppings_price - this);
                });
            }
            price += toppings_price;

            // Display the price
            form.find('[data-product-price]').html(moneyToString(price));
        }
    };

    var updateOptions = function (_form) {
        var form = $j(_form),
            product_handle = form.attr('data-product'),
            sku_handle = skuHandle(form);

        if (!optionPricing[product_handle]) return;

        // Disable unavailable set options and update their price
        $j.each(['toppings', 'ingredients', 'options'], function (i, set_type) {
            $j.each(optionPricing[product_handle][sku_handle][set_type], function (html_id, price) {
                var option = $j('[data-option=' + html_id + ']');
                option.toggle(price !== null);
                option.find('[data-option-price]').html(moneyToString(price));
            });
        })

        $j.each(optionPricing[product_handle][sku_handle]['multiside_toppings'], function (html_id, price) {
            var option = $j('[data-option=' + html_id + ']');
            option.toggle(price !== null);
            if (multiside_topping_pricing == 'split') price = Math.floor(price / 2);
            option.find('[data-option-price]').html(moneyToString(price));
        });

        // Disable unavailable enum options and update their price
        $j.each(optionPricing[product_handle][sku_handle]['enums'], function (html_id, value) {
            var name_with_price = value[0],
                price = value[1],
                option = $j('[data-option=' + html_id + ']');
            option.toggle(price !== null);
            if (price === null) {
                option.removeAttr("selected");
            }
            option.html(name_with_price);
        });
    };

    var updateForm = function (form) {
        updateSkus(form);
        updatePrice(form);
        updateOptions(form);
    };

    var setupHandlers = function () {
        // Sku handlers
        $j('[data-sku-part]').each(function () {
            var data_sku_part = $j(this),
                form = data_sku_part.closest('form');
            data_sku_part.find('select, input[type=radio]').addBack('select').change(function () {
                Product.updateForm(form);
            });
        });

        // Global sku handlers
        $j('[data-grouped-sku-part]').each(function () {
            var data_grouped_sku_part = $j(this);
            data_grouped_sku_part.find('select, input[type=radio]').addBack('select').change(function () {
                Product.updateGroup();
            });
        });

        // Option handlers
        $j('[data-option]').find('input').addBack('input').each(function () {
            var option = $j(this),
                form = option.closest('form');
            option.change(function () {
                Product.updatePrice(form);
            });
        });
    };

    return {
        init: function (options) {
            currency = options['currency'];
            locale = options['locale'];
            swap_toppings = options['swap_toppings'];
            multiside_side_pricing = options['multiside_side_pricing'];
            multiside_topping_pricing = options['multiside_topping_pricing'];
            setupHandlers();
        },

        setBasePricing: function (product_handle, base_pricing) {
            basePricing[product_handle] = base_pricing;
        },

        setOptionsPricing: function (product_handle, option_pricing) {
            optionPricing[product_handle] = option_pricing;
        },

        decQuantity: function (field) {
            updateQuantity(field, '-');
        },

        incQuantity: function (field) {
            updateQuantity(field, '+');
        },

        updatePrice: function (_form) {
            checkInit();
            var form = $j(_form);
            updatePrice(form);
        },

        updateForm: function (_form) {
            checkInit();
            var form = $j(_form);
            updateForm(form);
        },

        updateGroup: function () {
            checkInit();
            $j('form[data-product]').each(function () {
                var form = $j(this);
                updateSkus(form);
                updatePrice(form);
            })
        }
    }
})();