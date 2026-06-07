/**
 * pages/wishlist-page.js — Wishlist page rendering (List View)
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
      
      // Table Header for Desktop
      html += '<div class="hidden md:flex items-center justify-between border-b border-silver-light/60 pb-5 mb-2 text-muted font-ui text-[11px] uppercase tracking-[0.2em] font-bold px-4">' +
        '<div class="flex-1">Sản phẩm</div>' +
        '<div class="w-[150px] text-right">Giá tiền</div>' +
        '<div class="w-[220px] text-right">Thao tác</div>' +
      '</div>';

      $.each(items, function (i, p) {
        var catName = p.category === "rings" ? "Nhẫn" : p.category === "necklaces" ? "Dây Chuyền" : p.category === "bracelets" ? "Vòng Tay" : "Hoa Tai";
        
        // Formatted Price HTML
        var priceHtml = "";
        var priceMobileHtml = "";
        if (p.originalPrice) {
          priceHtml = '<span class="text-gold font-ui font-semibold text-sm md:text-base">' + formatPrice(p.price) + '</span><span class="text-muted/50 line-through font-ui text-xs ml-2">' + formatPrice(p.originalPrice) + '</span>';
          priceMobileHtml = '<span class="text-gold font-ui font-semibold text-xs">' + formatPrice(p.price) + '</span><span class="text-muted/50 line-through font-ui text-[10px] ml-2">' + formatPrice(p.originalPrice) + '</span>';
        } else {
          priceHtml = '<span class="text-primary font-ui text-sm md:text-base">' + formatPrice(p.price) + '</span>';
          priceMobileHtml = '<span class="text-primary font-ui text-xs">' + formatPrice(p.price) + '</span>';
        }

        html += '<div class="flex items-center justify-between bg-white py-6 px-2 md:px-4 border-b border-silver-light/30 last:border-none hover:bg-ivory/20 transition-all duration-300 gap-6 md:gap-10">' +
          // Left: Image + Name & Category
          '<div class="flex items-center gap-4 md:gap-6 flex-1 min-w-0">' +
            '<a href="product-detail.html?id=' + p.id + '" class="block shrink-0">' +
              '<img src="' + p.images[0] + '" alt="' + p.name_vi + '" class="w-16 h-20 md:w-20 md:h-26 object-cover border border-silver-light/20 transition-transform duration-500 hover:scale-105">' +
            '</a>' +
            '<div class="min-w-0">' +
              '<p class="font-ui text-[9px] md:text-[10px] uppercase tracking-widest text-gold mb-1">' + catName + '</p>' +
              '<a href="product-detail.html?id=' + p.id + '" class="block">' +
                '<h3 class="font-serif text-base md:text-lg text-primary hover:text-gold transition-colors truncate leading-tight">' + p.name_vi + '</h3>' +
              '</a>' +
              // Mobile Price
              '<div class="mt-1 md:hidden">' + priceMobileHtml + '</div>' +
            '</div>' +
          '</div>' +
          // Middle: Desktop Price
          '<div class="hidden md:flex items-center justify-end shrink-0 w-[150px]">' +
            '<div>' + priceHtml + '</div>' +
          '</div>' +
          // Right: Action buttons
          '<div class="flex items-center justify-end gap-3 md:gap-5 shrink-0 w-[220px]">' +
            '<button class="add-to-cart-from-wishlist btn-primary py-2.5 px-4 md:px-6 text-[10px] md:text-xs font-semibold tracking-widest uppercase cursor-pointer" data-id="' + p.id + '">' +
              'Thêm Vào Giỏ' +
            '</button>' +
            '<button class="remove-wishlist-btn text-muted hover:text-red-500 transition-colors p-2 cursor-pointer" data-id="' + p.id + '" title="Xóa khỏi yêu thích">' +
              '<svg class="w-5 h-5 md:w-5.5 md:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>' +
            '</button>' +
          '</div>' +
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

  // Add to cart from wishlist
  $(document).on("click", ".add-to-cart-from-wishlist", function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));
    
    $.getJSON("src/data/products.json").done(function (products) {
      var product = products.find(function (p) { return p.id === id; });
      if (product && typeof window.VaneCart !== "undefined") {
        window.VaneCart.addToCart(product, null, 1);
      }
    });
  });

  renderWishlist();
});
