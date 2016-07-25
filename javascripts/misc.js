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
