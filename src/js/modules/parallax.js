/**
 * modules/parallax.js — Multi-layer parallax scroll effect
 * Elements with [data-parallax] will translateY based on scroll with smooth lerp
 */
$(function () {
  "use strict";
  if ("ontouchstart" in window) return; // Disable on mobile for performance

  var $elements = $("[data-parallax]");
  if (!$elements.length) return;

  var ticking = false;
  var currentTransforms = {};

  // Initialize transforms map
  $elements.each(function (i) {
    currentTransforms[i] = 0;
  });

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function updateParallax() {
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();

    $elements.each(function (i) {
      var $el = $(this);
      var speed = parseFloat($el.attr("data-parallax-speed")) || 0.3;
      var elTop = $el.offset().top;
      var elHeight = $el.outerHeight();

      // Only apply when element is in or near viewport
      if (scrollTop + windowHeight + 200 > elTop && scrollTop < elTop + elHeight + 200) {
        var targetY = (scrollTop - elTop + windowHeight / 2) * speed;
        var currentY = currentTransforms[i] || 0;
        var smoothY = lerp(currentY, targetY, 0.1);
        currentTransforms[i] = smoothY;

        $el.css("transform", "translateY(" + smoothY.toFixed(2) + "px)");
      }
    });

    ticking = false;
    // Continue animation loop for smooth lerp
    if (isAnyVisible(scrollTop, windowHeight)) {
      requestAnimationFrame(updateParallax);
    }
  }

  function isAnyVisible(scrollTop, windowHeight) {
    var visible = false;
    $elements.each(function () {
      var elTop = $(this).offset().top;
      var elHeight = $(this).outerHeight();
      if (scrollTop + windowHeight + 200 > elTop && scrollTop < elTop + elHeight + 200) {
        visible = true;
        return false; // break
      }
    });
    return visible;
  }

  $(window).on("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  updateParallax();
});
