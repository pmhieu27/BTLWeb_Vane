/**
 * core/scroll-reveal.js — Scroll reveal animation engine
 * Uses IntersectionObserver for performant scroll-triggered reveals
 */
$(function () {
  "use strict";

  // Use IntersectionObserver for better performance
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var $el = $(entry.target);
            $el.addClass("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    function observeElements() {
      $("[data-reveal]:not(.revealed)").each(function () {
        observer.observe(this);
      });
    }

    observeElements();

    // Re-observe when dynamic content loads
    $(document).on("contentLoaded", observeElements);
    setTimeout(observeElements, 500);
    setTimeout(observeElements, 1500);
  } else {
    // Fallback for older browsers
    function checkReveal() {
      var windowHeight = $(window).height();
      var scrollTop = $(window).scrollTop();
      var triggerPoint = scrollTop + windowHeight - 40;

      $("[data-reveal]:not(.revealed)").each(function () {
        var $el = $(this);
        if ($el.offset().top < triggerPoint) {
          $el.addClass("revealed");
        }
      });
    }

    $(window).on("scroll", checkReveal);
    checkReveal();
    setTimeout(checkReveal, 500);
    setTimeout(checkReveal, 1500);

    $(document).on("contentLoaded", checkReveal);
  }
});
