/**
 * modules/accordion.js — Accordion/FAQ toggle
 */
$(function () {
  "use strict";

  $(document).on("click", ".accordion-trigger", function () {
    var $item = $(this).closest(".accordion-item");
    var isActive = $item.hasClass("active");

    // Close siblings (optional single-open mode)
    // $item.siblings(".accordion-item").removeClass("active");

    $item.toggleClass("active", !isActive);
  });
});
