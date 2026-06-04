/**
 * modules/newsletter.js — Newsletter form submit handler
 */
$(function () {
  "use strict";

  $(document).on("submit", "#newsletter-form", function (e) {
    e.preventDefault();
    var $form = $(this);
    var $input = $form.find("input[type='email']");
    var $btn = $form.find("button");
    if (!$input.length || !$btn.length || !$input.val()) return;

    $btn.html("✓").css({ backgroundColor: "#A68B5B", pointerEvents: "none" });

    $btn.delay(2000).queue(function (next) {
      $btn.html("→").css("pointerEvents", "");
      $input.val("");
      next();
    });

    $(document).trigger("toast", ["Đăng ký thành công!", "success"]);
  });
});
