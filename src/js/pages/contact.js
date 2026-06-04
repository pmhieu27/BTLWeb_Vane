/**
 * pages/contact.js — Contact form handler
 */
$(function () {
  "use strict";

  $(document).on("submit", "#contact-form", function (e) {
    e.preventDefault();

    var $form = $(this);
    var $btn = $form.find("button[type='submit']");

    // Disable button
    $btn.prop("disabled", true).text("Đang gửi...");

    // Simulate sending (UI only)
    setTimeout(function () {
      $form[0].reset();
      $btn.prop("disabled", false).text("Gửi Tin Nhắn");

      if (typeof window.VaneToast !== "undefined") {
        window.VaneToast.show("Tin nhắn đã được gửi thành công!", "success");
      }
    }, 1500);
  });
});
