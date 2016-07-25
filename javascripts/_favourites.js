/*****************************
 Favourites
 *****************************/
var Favourites = (function () {
    var buyer_favourites;

    function init(_buyer_favourites) {
        buyer_favourites = _buyer_favourites;
        $j('[data-favourite-product]').addClass('product__favourite_add').css('display', 'inline-block');

        $j.each(buyer_favourites, function () {
            var product_handle = this[1];
            $j('[data-favourite-product=' + product_handle + ']').removeClass('product__favourite_add').addClass('product__favourite_remove');
        });
    }

    function toggle(link) {
        var product_handle = $j(link).attr('data-favourite-product');
        if (!product_handle) return;

        var buyer_favourite_id;
        $j.each(buyer_favourites, function () {
            if (this[1] == product_handle) buyer_favourite_id = this[0];
        });

        if (buyer_favourite_id) {
            // Remove favourite
            $j.ajax({
                url: '/buyer_favourites/destroy/' + buyer_favourite_id,
                type: 'post',
                data: 'page=favourites_reset',
                dataType: 'script'
            });
            $j(link).removeClass('product__favourite_remove').addClass('product__favourite_add');

            // If we are on the favourites page, hide the product
            if ($j('body.page_favourites').length > 0) {
                setTimeout(function () {
                    $j(link).closest('.product').hide(250);

                    // Show the "no favourite" message if applicable
                    if ($j('[data-favourite-product]').not('[data-favourite-product=' + product_handle + ']').closest('.product:visible').length == 0) {
                        setTimeout(function () {
                            $j('.category__no-favourite').show();
                        }, 350);
                    }
                }, 200);
            }

        } else {
            // Add favourite
            $j.ajax({
                url: '/buyer_favourites/create/' + product_handle,
                type: 'post',
                data: 'page=favourites_reset',
                dataType: 'script'
            });
            $j(link).removeClass('product__favourite_add').addClass('product__favourite_remove');
        }
    }

    return {
        init: init,
        toggle: toggle
    };
}());