/*****************************
 DropdownMenu
 *****************************/
var DropdownMenu = (function () {
    var active;

    var set_events = function () {
        $j('a[data-toggle]').each(function () {
            // Dropdown body should not react to click
            var dropdown_id = $j(this).attr('data-toggle');
            $j('#' + dropdown_id).click(function (e) {
                e.stopPropagation();
            });

            $j(this).on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var dropdown_menu = $j(this).closest('.dropdown-menu');
                if ($j(dropdown_menu).hasClass('dropdown-menu_open')) {
                    $j(dropdown_menu).removeClass('dropdown-menu_open');
                    active = null;
                    $j('body').off('click', close);
                } else {
                    close();
                    $j(dropdown_menu).addClass('dropdown-menu_open');
                    active = $j(dropdown_menu);
                    $j('body').on('click', close);
                }
                ;
            });
        });
        $j('body').on('click', close);
    }

    var close = function () {
        if (active) active.removeClass('dropdown-menu_open');
        active = null;
        $j('body').off('click', close);
    }

    return {
        init: function () {
            set_events();
        }
    }
}());
