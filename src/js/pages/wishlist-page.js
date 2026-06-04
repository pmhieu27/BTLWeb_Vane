/**
 * pages/wishlist-page.js — Wishlist page rendering
 */
$(function () {
  "use strict";

  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  }

  function renderWishlist() {
    var ids = (typeof window.VaneWishlist !== "undefined") ? window.VaneWishlist.getAll() : [];

    if (!ids.length) {
      $("#wishlist-grid").hide();
      $("#wishlist-empty").show();
      return;
    }

    $("#wishlist-empty").hide();
    $("#wishlist-grid").show();

    $.getJSON("src/data/products.json").done(function (products) {
      var items = products.filter(function (p) { return ids.indexOf(p.id) !== -1; });

      if (!items.length) {
        $("#wishlist-grid").hide();
        $("#wishlist-empty").show();
        return;
      }

      var html = "";
      $.each(items, function (i, p) {
        html += '<div class="group relative">' +
          '<a href="product-detail.html?id=' + p.id + '" class="block">' +
            '<div class="overflow-hidden bg-white mb-3">' +
              '<img src="' + p.images[0] + '" alt="' + p.name_vi + '" class="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105">' +
            '</div>' +
            '<h3 class="font-serif text-base text-primary group-hover:text-gold transition-colors mb-1">' + p.name_vi + '</h3>' +
            '<p class="font-ui text-[11px] text-charcoal">' + formatPrice(p.price) + '</p>' +
          '</a>' +
          '<button class="remove-wishlist-btn absolute top-2 right-2 w-8 h-8 bg-white/80 flex items-center justify-center text-muted hover:text-red-500 transition-colors cursor-pointer" data-id="' + p.id + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>';
      });
      $("#wishlist-grid").html(html);
    });
  }

  // Remove from wishlist
  $(document).on("click", ".remove-wishlist-btn", function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));
    if (typeof window.VaneWishlist !== "undefined") {
      window.VaneWishlist.toggle(id);
    }
    renderWishlist();
  });

  renderWishlist();
});
