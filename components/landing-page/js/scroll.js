/**
 * Created by Manuel on 21/12/2016.
 */

$(function() {
    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                /*if(target[0].id === 'top'){
                    // Torno all'inizio
                    jQuery('#top_scroll').addClass('scroll_hide').removeClass('scroll_visible');
                } else {
                    // vado a sessione, attivo TOP button
                    jQuery('#top_scroll').addClass('scroll_visible').removeClass('scroll_hide');
                }*/
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    $(document).ready(function(){
        $(window).scroll(function(){
            var scroll = $(window).scrollTop();
            if(scroll > 0)
            {
                jQuery('#top_scroll').addClass('scroll_visible').removeClass('scroll_hide');
            } else {
                jQuery('#top_scroll').addClass('scroll_hide').removeClass('scroll_visible');
            }

        })
    });

});
