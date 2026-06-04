/**
 * modules/tabs.js — Tab switching component
 */
$(function () {
  "use strict";

  $(document).on("click", ".tab-btn", function () {
    var $btn = $(this);
    var target = $btn.attr("data-tab");
    var $container = $btn.closest(".tab-component");

    // Update buttons
    $container.find(".tab-btn").removeClass("active");
    $btn.addClass("active");

    // Update panels
    $container.find(".tab-content").removeClass("active");
    $container.find('.tab-content[data-tab-panel="' + target + '"]').addClass("active");
  });
});
