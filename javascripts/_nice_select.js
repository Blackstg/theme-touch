/*****************************
 NiceSelect
 Forked from https://github.com/hernansartorio/jquery-nice-select
 *****************************/
var NiceSelect = (function () {
    var convert = function (select) {
        // Hide native select
        select.hide();

        // Create custom markup
        if (!select.next().hasClass('nice-select__container')) {

            select.after($j('<div></div>')
                .addClass('nice-select__container')
                .html($j('<div></div>')
                    .addClass('nice-select')
                    .addClass(select.attr('class') || '')
                    .addClass(select.attr('disabled') ? 'disabled' : '')
                    .attr('tabindex', select.attr('disabled') ? null : '0')
                    .html('<span class="current"></span><ul class="list"></ul>')
                ));

            var nice_select = select.next();
            var options = select.find('option');
            var selected = select.find('option:selected');

            nice_select.find('.current').html(selected.data('display') || selected.text());

            options.each(function (i) {
                var option = $j(this);
                var display = option.data('display');

                nice_select.find('ul').append($j('<li></li>')
                    .attr('data-value', option.val())
                    .attr('data-display', (display || null))
                    .addClass('option' +
                        (option.is(':selected') ? ' selected' : '') +
                        (option.is(':disabled') ? ' disabled' : ''))
                    .html(option.text())
                );

            });
        }
    };

    var initListeners = function () {
        // Unbind existing events in case that the plugin has been initialized before
        $j(document).off('.nice_select');

        // Open/close
        $j(document).on('click.nice_select', '.nice-select', function (event) {
            var nice_select = $j(this);

            $j('.nice-select').not(nice_select).removeClass('open');
            nice_select.toggleClass('open');

            if (nice_select.hasClass('open')) {
                nice_select.find('.option');
                nice_select.find('.focus').removeClass('focus');
                nice_select.find('.selected').addClass('focus');
            } else {
                nice_select.focus();
            }
        });

        // Close when clicking outside
        $j(document).on('click.nice_select', function (event) {
            if ($j(event.target).closest('.nice-select').length === 0) {
                $j('.nice-select').removeClass('open').find('.option');
            }
        });

        // Option click
        $j(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function (event) {
            var option = $j(this),
                nice_select = option.closest('.nice-select__container');

            nice_select.find('.selected').removeClass('selected');
            option.addClass('selected');

            var text = option.data('display') || option.text();
            nice_select.find('.current').text(text);

            nice_select.prev('select').val(option.data('value')).trigger('change');
        });

        // Keyboard events
        $j(document).on('keydown.nice_select', '.nice-select', function (event) {
            var nice_select = $j(this),
                focused_option = $j(nice_select.find('.focus') || nice_select.find('.list .option.selected'));

            if (event.keyCode == 32 || event.keyCode == 13) {
                // Space or Enter
                if (nice_select.hasClass('open')) {
                    focused_option.trigger('click');
                } else {
                    nice_select.trigger('click');
                }
                return false;
            } else if (event.keyCode == 40) {
                // Down
                if (!nice_select.hasClass('open')) {
                    nice_select.trigger('click');
                } else {
                    var next_option = focused_option.nextAll('.option:not(.disabled)').first();
                    if (next_option.length > 0) {
                        nice_select.find('.focus').removeClass('focus');
                        next_option.addClass('focus');
                    }
                }
                return false;
            } else if (event.keyCode == 38) {
                // Up
                if (!nice_select.hasClass('open')) {
                    nice_select.trigger('click');
                } else {
                    var prev_option = focused_option.prevAll('.option:not(.disabled)').first();
                    if (prev_option.length > 0) {
                        nice_select.find('.focus').removeClass('focus');
                        prev_option.addClass('focus');
                    }
                }
                return false;
            } else if (event.keyCode == 27) {
                // Esc
                if (nice_select.hasClass('open')) {
                    nice_select.trigger('click');
                }
            } else if (event.keyCode == 9) {
                // Tab
                if (nice_select.hasClass('open')) {
                    return false;
                }
            }
        });
    };

    var ie10Fix = function () {
        // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
        var style = document.createElement('a').style;
        style.cssText = 'pointer-events:auto';
        if (style.pointerEvents !== 'auto') {
            $j('html').addClass('no-csspointerevents');
        }
    };

    return {
        init: function () {
            var nice_selects = $j('[data-nice-select]');
            if (nice_selects.length > 0) {
                initListeners();
                ie10Fix();
                nice_selects.each(function () {
                    convert($j(this));
                });
            }
        }
    }
}());
