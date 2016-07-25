/*****************************
 Off canvas menus
 *****************************/
var OffCanvas = (function () {
    var initSidr = function () {
        $j('#menu-off-canvas').sidr({
            name: 'main-menu-ofc',
            side: 'left',
            onOpen: function () {
                $j('#main-menu-ofc').addClass('off-canvas_open');
                $j("#page-overlay").show();
                $j("#page-overlay").on('click', function () {
                    $j.sidr('close', 'main-menu-ofc');
                });
            },
            onClose: function () {
                $j("#page-overlay").hide();
                $j('#main-menu-ofc').removeClass('off-canvas_open');
                $j("#page-overlay").off('click');
            }
        });


        $j('#basket-off-canvas').sidr({
            name: 'sidebar-ofc',
            side: 'right',
            onOpen: function () {
                $j('#sidebar-ofc').addClass('off-canvas_open');
                $j("#page-overlay").show();
                $j("#page-overlay").on('click', function () {
                    $j.sidr('close', 'sidebar-ofc');
                });
            },
            onClose: function () {
                $j('#sidebar-ofc').removeClass('off-canvas_open');
                $j("#page-overlay").hide();
                $j("#page-overlay").off('click');
            }
        });
    };

    var onResize = function () {
        if ($j('.header__burger-menu').is(':hidden')) {
            if ($j('body').hasClass('sidebar-ofc-open')) {
                $j.sidr('close', 'sidebar-ofc');
            }
            else if ($j('body').hasClass('main-menu-ofc-open')) {
                $j.sidr('close', 'main-menu-ofc');
            }
        }
    };

    var onMenuSectionClick = function (e) {
        e.preventDefault();
        var parent = $j(this).closest('.mobile-menu__section_has-submenu');
        if (parent.hasClass('mobile-menu__section_unfolded')) {
            parent.removeClass('mobile-menu__section_unfolded');
        } else {
            $j('.mobile-menu__section_has-submenu.mobile-menu__section_unfolded').removeClass('mobile-menu__section_unfolded');
            parent.addClass('mobile-menu__section_unfolded');
        }
    };

    return {
        init: function () {
            $j(document).ready(initSidr);
            $j(window).resize(onResize);
            $j('.off-canvas .mobile-menu__section_has-submenu > .mobile-menu__section-link').click(onMenuSectionClick);
        }
    }
}());
