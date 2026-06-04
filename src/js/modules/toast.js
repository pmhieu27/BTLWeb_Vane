/**
 * modules/toast.js — Toast notification system
 * Usage: $(document).trigger("toast", ["message", "success|error|info"])
 */
$(function () {
  "use strict";

  var $container = $("#toast-container");
  if (!$container.length) {
    $container = $('<div id="toast-container" class="toast-container"></div>').appendTo("body");
  }

  $(document).on("toast", function (e, message, type) {
    type = type || "info";
    var $toast = $(
      '<div class="toast toast-' + type + '">' +
        '<span>' + message + '</span>' +
      '</div>'
    );

    $container.append($toast);

    setTimeout(function () {
      $toast.addClass("toast-removing");
      setTimeout(function () { $toast.remove(); }, 300);
    }, 3000);
  });
});
