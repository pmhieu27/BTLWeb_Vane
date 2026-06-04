/**
 * core/header.js — Header scroll behavior, menu overlay, search overlay
 */
$(function () {
  "use strict";

  // --- Header scroll state ---
  function hasHeroSection() {
    return $("#component-hero").length > 0 || $("#hero").length > 0;
  }

  function updateHeaderState() {
    var $header = $("#main-header");
    if (!$header.length) return;
    var scrollTop = $(window).scrollTop();

    if (!hasHeroSection()) {
      $header.addClass("header-scrolled").removeClass("header-transparent");
      return;
    }
    if (scrollTop > 10) {
      $header.addClass("header-scrolled").removeClass("header-transparent");
    } else {
      $header.removeClass("header-scrolled").addClass("header-transparent");
    }
  }

  // --- Full-screen menu overlay ---
  function openMenu() {
    var $overlay = $("#menu-overlay");
    if (!$overlay.length) return;
    $overlay.addClass("active");
    $("body").css("overflow", "hidden");
  }

  function closeMenu() {
    $("#menu-overlay").removeClass("active");
    $("body").css("overflow", "");
  }

  // Menu hover → change preview image
  $(document).on("mouseenter", ".menu-overlay-link", function () {
    var imgSrc = $(this).attr("data-menu-img");
    if (!imgSrc) return;
    var $img = $("#menu-preview-img");
    if (!$img.length) return;
    $img.css("opacity", 0);
    setTimeout(function () {
      $img.attr("src", imgSrc);
      $img.css("opacity", 0.6);
    }, 200);
  });

  $(document).on("mouseleave", ".menu-overlay-link", function () {
    var $img = $("#menu-preview-img");
    if ($img.length) $img.css("opacity", 0.4);
  });

  // --- Search overlay ---
  function openSearch() {
    var $s = $("#search-overlay");
    if (!$s.length) return;
    $s.addClass("active");
    $s.find("input").trigger("focus");
    $("body").css("overflow", "hidden");
  }

  function closeSearch() {
    $("#search-overlay").removeClass("active");
    $("body").css("overflow", "");
  }

  // --- Event delegation ---
  $(document).on("click", function (e) {
    var $t = $(e.target);
    // Menu open
    if ($t.closest("#menu-btn").length) { e.preventDefault(); openMenu(); return; }
    // Menu close
    if ($t.closest("#menu-overlay-close").length || $t.is("#menu-overlay-backdrop")) {
      e.preventDefault(); closeMenu(); return;
    }
    // Search
    if ($t.closest("#search-btn").length) { e.preventDefault(); openSearch(); return; }
    if ($t.closest("#search-close").length) { e.preventDefault(); closeSearch(); return; }
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") { closeSearch(); closeMenu(); }
  });

  // --- Init ---
  updateHeaderState();
  $(window).on("scroll", updateHeaderState);
  setTimeout(updateHeaderState, 300);
  setTimeout(updateHeaderState, 1000);
  $("body").animate({ opacity: 1 }, 100);
});
