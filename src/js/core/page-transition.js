/**
 * core/page-transition.js — Fade-out page transitions + smooth scroll
 */
$(function () {
  "use strict";

  // Fade-out transition for internal links
  $(document).on("click", function (e) {
    var $link = $(e.target).closest("a[href]");
    if (!$link.length) return;

    var href = $link.attr("href") || "";
    var isHash = href.startsWith("#");
    var hasTarget = !!$link.attr("target");
    var noTransition = $link.is("[data-no-transition]");
    var isExternal = href.startsWith("http") || href.startsWith("mailto:");

    if (isHash || hasTarget || noTransition || isExternal) return;

    e.preventDefault();
    $("body").addClass("fade-out");

    $("body").delay(300).queue(function (next) {
      window.location.href = href;
      next();
    });
  });

  // Smooth scroll for scroll-indicator
  $(document).on("click", ".scroll-indicator", function (e) {
    e.preventDefault();
    var $target = $("#featured-collections, #brand-marquee").first();
    if ($target.length) {
      var topPosition = $target.offset().top - 80;
      $("html, body").stop().animate({ scrollTop: topPosition }, 600);
    }
  });

  // Handle back button (bfcache) - remove fade-out so page is not blank on back navigation
  $(window).on("pageshow", function (e) {
    $("body").removeClass("fade-out opacity-0");
    var $loader = $("#loader");
    if ($loader.length && $loader.css("opacity") === "0") {
      $loader.hide();
    }
  });
});
