/**********************
  Homepage slideshows
**********************/

var homepage_slideshow = function() {
    var desktop_slider = $j('#slider-desktop'),
        desktop_active = false,
        desktop_activated = false;
    var mobile_slider = $j('#slider-mobile'),
        mobile_active = false,
        mobile_activated = false;

    function slider_init(slider) {
        slider.unslider({
            autoplay: true,
            infinite: true,
            delay: 7000,
            speed: 500,
            keys: false,
            arrows: false
      });
    }

    function set_active_slider() {
        if (desktop_slider.filter(':visible').length > 0) {
            if (!desktop_activated) {
                slider_init(desktop_slider);
                desktop_activated = true;
            } else if (!desktop_active) {
                desktop_slider.unslider('start');
            }
            if (mobile_active) {
                mobile_slider.unslider('stop');
            }
            desktop_active = true;
            mobile_active = false;
        } else {
            if (!mobile_activated) {
                slider_init(mobile_slider);
                mobile_activated = true;
            } else if (!mobile_active) {
                mobile_slider.unslider('start');
            }
            if (desktop_active) {
                desktop_slider.unslider('stop');
            }
            desktop_active = false;
            mobile_active = true;
        }
    }

    function init(){
      $j(window).on('resize', set_active_slider);
      set_active_slider();
    }

    return { init: init };
}
