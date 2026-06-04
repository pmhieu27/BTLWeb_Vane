/**
 * modules/glow.js — Subtle mouse-following gold glow effect
 * Creates a soft radial gradient that follows the cursor (desktop only)
 */
$(function () {
  "use strict";

  // Only on desktop
  if ("ontouchstart" in window || window.innerWidth < 1024) return;

  var $glow = $("#cursor-glow");
  if (!$glow.length) {
    $glow = $('<div id="cursor-glow"></div>');
    $("body").append($glow);
  }

  var mouseX = 0;
  var mouseY = 0;
  var currentX = 0;
  var currentY = 0;
  var isActive = false;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function animate() {
    currentX = lerp(currentX, mouseX, 0.08);
    currentY = lerp(currentY, mouseY, 0.08);

    $glow.css({
      left: currentX + "px",
      top: currentY + "px",
    });

    requestAnimationFrame(animate);
  }

  $(document).on("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isActive) {
      isActive = true;
      $glow.addClass("active");
      animate();
    }
  });

  $(document).on("mouseleave", function () {
    $glow.removeClass("active");
    isActive = false;
  });
});
