/**
 * modules/wishlist.js — Wishlist toggle + localStorage sync
 * Uses localStorage key "vane_wishlist"
 */
$(function () {
  "use strict";
  var STORAGE_KEY = "vane_wishlist";

  window.VaneWishlist = {
    getWishlist: function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch (e) { return []; }
    },
    saveWishlist: function (list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      $(document).trigger("wishlist:updated");
    },
    toggleWishlist: function (productId) {
      var list = this.getWishlist();
      var idx = $.inArray(productId, list);
      if (idx > -1) { list.splice(idx, 1); } else { list.push(productId); }
      this.saveWishlist(list);
      return idx === -1; // returns true if added
    },
    isInWishlist: function (productId) {
      return $.inArray(productId, this.getWishlist()) > -1;
    }
  };

  // Sync wishlist buttons on page
  function syncButtons() {
    $(".wishlist-btn").each(function () {
      var $btn = $(this);
      var id = parseInt($btn.data("product-id"));
      if (id && VaneWishlist.isInWishlist(id)) {
        $btn.addClass("active");
      } else {
        $btn.removeClass("active");
      }
    });
  }

  // Toggle on click
  $(document).on("click", ".wishlist-btn", function (e) {
    e.preventDefault(); e.stopPropagation();
    var $btn = $(this);
    var id = parseInt($btn.data("product-id"));
    if (!id) return;
    var added = VaneWishlist.toggleWishlist(id);
    $btn.toggleClass("active", added);
    $(document).trigger("toast", [added ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích", "success"]);
  });

  $(document).on("wishlist:updated", syncButtons);
  syncButtons();
});
