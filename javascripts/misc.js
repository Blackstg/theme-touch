/*******************
 Off canvas menus
 *******************/
$j(document).ready(function () {

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

    $j(window).resize(function () {
        $j.sidr('close', 'main-menu-ofc');
        $j.sidr('close', 'sidebar-ofc');
    });

});


/****************************************
 Off canvas menus: submenu fold/unfold
 ****************************************/

function ofc_submenu() {
    $j('.off-canvas .mobile-menu__section_has-submenu > .mobile-menu__section-link').click(function (e) {
        e.preventDefault();
        var parent = $j(this).closest('.mobile-menu__section_has-submenu');
        if (parent.hasClass('mobile-menu__section_unfolded')) {
            parent.removeClass('mobile-menu__section_unfolded');
        } else {
            $j('.mobile-menu__section_has-submenu.mobile-menu__section_unfolded').removeClass('mobile-menu__section_unfolded');
            parent.addClass('mobile-menu__section_unfolded');
        }
    });
}

$j(document).ready(ofc_submenu);


/*************************
 Scroll page top button
 *************************/

function scroll_page_top() {
    var btn = $j('.scroll-up');
    var shown = false;

    function scroll_level() {
        return ($j(window).scrollTop() > 200);
    }

    function show_btn() {
        if (shown) return;
        btn.addClass('scroll-up_show');
        shown = true;
    }

    function hide_btn() {
        if (!shown) return;
        btn.removeClass('scroll-up_show');
        shown = false;
    }

    function set_btn() {
        if (scroll_level()) {
            show_btn();
            return;
        }
        hide_btn();
    }

    function init() {
        $j('.scroll-up').on('click', function (e) {
            e.preventDefault();
            $j(window).scrollTo(0, 100);
        });
        $j(window).on('scroll', set_btn);
    }

    return {init: init};
}

$j(document).ready(function () {
    var st = scroll_page_top();
    st.init();
});

/****************************************************
 Stick Footer to the screen bottom for short pages
 ****************************************************/

function footer_fix() {
    var page = $j('.page'),
        footer = $j('.page__footer'),
        content = $j('.page__content'),
        hSet = false,
        wH, err, fH, cTop, newH;

    function set_height() {
        if (hSet) {
            content.css('min-height', '');
            hSet = false;
        }
        wH = $j(window).height();

        if (page.height() >= wH) return;

        fH = footer.outerHeight(true);
        cTop = content.offset().top;
        newH = wH - (cTop + fH);

        content.css('min-height', newH);
        hSet = true;

// If there's browser's calculation bias
        err = page.height() - wH;
        if (err > 0) {
            content.css('min-height', newH - err);
        }
    }

    function init() {
        set_height();
        $j(window).on('load resize', set_height);
    }

    return {
        init: init,
        set_height: set_height
    };
}

var ft_fix;

$j(document).ready(function () {
    ft_fix = new footer_fix();
    ft_fix.init();
});
