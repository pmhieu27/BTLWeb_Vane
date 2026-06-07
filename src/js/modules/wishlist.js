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
    getAll: function () {
      return this.getWishlist();
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
    toggle: function (productId) {
      return this.toggleWishlist(productId);
    },
    isInWishlist: function (productId) {
      return $.inArray(productId, this.getWishlist()) > -1;
    }
  };

  // Sync wishlist buttons on page
  function syncButtons() {
    $(".wishlist-btn, .toggle-wishlist-btn, #toggle-wishlist-detail").each(function () {
      var $btn = $(this);
      var id = parseInt($btn.attr("data-product-id") || $btn.attr("data-id"));
      if (id && VaneWishlist.isInWishlist(id)) {
        $btn.addClass("active");
        if ($btn.is("#toggle-wishlist-detail")) {
          $btn.html('<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-red-500 shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Đã Yêu Thích');
        }
      } else {
        $btn.removeClass("active");
        if ($btn.is("#toggle-wishlist-detail")) {
          $btn.html('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="shrink-0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Yêu Thích');
        }
      }
    });
  }

  // Toggle on click
  $(document).on("click", ".wishlist-btn, .toggle-wishlist-btn, #toggle-wishlist-detail", function (e) {
    e.preventDefault(); e.stopPropagation();
    var $btn = $(this);
    var id = parseInt($btn.attr("data-product-id") || $btn.attr("data-id"));
    if (!id) return;
    var added = VaneWishlist.toggleWishlist(id);
    $btn.toggleClass("active", added);
    $(document).trigger("toast", [added ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích", "success"]);
    syncButtons();
  });

  $(document).on("wishlist:updated", syncButtons);
  syncButtons();
});
