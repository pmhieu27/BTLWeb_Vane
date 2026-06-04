/**
 * modules/luxury-scroll.js — Advanced scroll-triggered animations
 * Handles smooth section transitions, stagger grids, and parallax depth
 */
$(function () {
  "use strict";

  // --- Counter Animation ---
  function animateCounter($el) {
    var target = parseInt($el.attr("data-count"), 10);
    var suffix = $el.attr("data-suffix") || "";
    var prefix = $el.attr("data-prefix") || "";
    var duration = 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      $el.text(prefix + current.toLocaleString() + suffix);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        $el.text(prefix + target.toLocaleString() + suffix);
      }
    }

    requestAnimationFrame(step);
  }

  // --- Observe Counters ---
  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter($(entry.target));
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    $("[data-count]").each(function () {
      counterObserver.observe(this);
    });
  }

  // --- Stagger Grid Items ---
  if ("IntersectionObserver" in window) {
    var staggerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var $grid = $(entry.target);
            var $items = $grid.find("[data-stagger-item]");
            $items.each(function (i) {
              var $item = $(this);
              setTimeout(function () {
                $item.addClass("revealed");
              }, i * 120);
            });
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    $("[data-stagger-grid]").each(function () {
      staggerObserver.observe(this);
    });
  }

  // --- Smooth Section Header Parallax (very subtle) ---
  if (!("ontouchstart" in window)) {
    var $sectionHeaders = $("[data-section-float]");
    if ($sectionHeaders.length) {
      $(window).on("scroll", function () {
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();

        $sectionHeaders.each(function () {
          var $el = $(this);
          var elTop = $el.offset().top;
          if (scrollTop + windowHeight > elTop && scrollTop < elTop + $el.outerHeight()) {
            var progress = (scrollTop + windowHeight - elTop) / (windowHeight + $el.outerHeight());
            var yOffset = (progress - 0.5) * -15;
            $el.css("transform", "translateY(" + yOffset.toFixed(1) + "px)");
          }
        });
      });
    }
  }
});
