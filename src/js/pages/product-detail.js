/**
 * pages/product-detail.js — Product detail page logic
 */
$(function () {
  "use strict";

  var productId = new URLSearchParams(window.location.search).get("id");
  if (!productId) {
    $("#product-name").text("Sản phẩm không tìm thấy");
    return;
  }

  var categoryNames = {
    rings: "Nhẫn",
    necklaces: "Dây Chuyền",
    bracelets: "Vòng Tay",
    earrings: "Hoa Tai",
  };

  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  }

  // Fetch products
  $.getJSON("src/data/products.json")
    .done(function (products) {
      var product = null;
      $.each(products, function (i, p) {
        if (p.id == productId) { product = p; return false; }
      });

      if (!product) {
        $("#product-name").text("Sản phẩm không tìm thấy");
        return;
      }

      // --- Populate page ---
      document.title = product.name_vi + " | Vane Vietnam";
      $("#breadcrumb-product").text(product.name_vi);
      $("#product-name").text(product.name_vi);
      $("#product-category").text(categoryNames[product.category] || product.category);
      $("#product-material").text(product.material || "—");
      $("#product-gemstone").text(product.gemstone || "Không có");
      $("#product-description").text(
        "Sản phẩm " + product.name_vi + " được chế tác từ " +
        (product.material || "chất liệu cao cấp") +
        (product.gemstone ? ", đính " + product.gemstone + " tuyển chọn" : "") +
        ". Thiết kế tinh xảo, phù hợp cho mọi dịp đặc biệt."
      );

      // Price
      var priceHtml = '<span class="font-serif text-2xl text-primary">' + formatPrice(product.price) + '</span>';
      if (product.originalPrice) {
        priceHtml += ' <span class="font-ui text-sm text-muted line-through ml-2">' + formatPrice(product.originalPrice) + '</span>';
        var percent = Math.round((1 - product.price / product.originalPrice) * 100);
        priceHtml += ' <span class="font-ui text-[10px] text-gold ml-2">-' + percent + '%</span>';
      }
      $("#product-price").html(priceHtml);

      // Main image
      if (product.images && product.images.length) {
        $("#main-product-img").attr("src", product.images[0]).attr("alt", product.name_vi);

        // Thumbnails
        var thumbHtml = "";
        $.each(product.images, function (i, src) {
          thumbHtml += '<button class="product-thumb overflow-hidden border-2 ' + (i === 0 ? 'border-gold' : 'border-transparent') + ' cursor-pointer transition-all hover:border-gold/50" data-index="' + i + '">' +
            '<img src="' + src + '" alt="' + product.name_vi + ' ' + (i + 1) + '" class="w-full aspect-square object-cover">' +
          '</button>';
        });
        $("#product-thumbnails").html(thumbHtml);
      }

      // Sizes
      if (product.sizes && product.sizes.length) {
        $("#size-selector").removeClass("hidden");
        var sizeHtml = "";
        $.each(product.sizes, function (i, size) {
          sizeHtml += '<button class="size-btn font-ui text-[11px] px-4 py-2 border border-silver-light hover:border-primary transition-colors cursor-pointer' + (i === 0 ? ' border-primary text-primary' : ' text-muted') + '" data-size="' + size + '">' + size + '</button>';
        });
        $("#size-options").html(sizeHtml);
      }

      // --- Related products ---
      var related = products.filter(function (p) {
        return p.category === product.category && p.id !== product.id;
      }).slice(0, 4);

      if (related.length) {
        var relHtml = "";
        $.each(related, function (i, p) {
          relHtml += '<a href="product-detail.html?id=' + p.id + '" class="group block" data-reveal="scale">' +
            '<div class="overflow-hidden bg-white mb-3">' +
              '<img src="' + p.images[0] + '" alt="' + p.name_vi + '" class="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105">' +
            '</div>' +
            '<p class="font-ui text-[10px] uppercase tracking-wider text-gold mb-1">' + (categoryNames[p.category] || "") + '</p>' +
            '<h3 class="font-serif text-base text-primary group-hover:text-gold transition-colors mb-1">' + p.name_vi + '</h3>' +
            '<p class="font-ui text-[11px] text-charcoal">' + formatPrice(p.price) + '</p>' +
          '</a>';
        });
        $("#related-products").html(relHtml);
      }

      // Store product data for cart
      $("#add-to-cart-detail").attr("data-id", product.id);
      $("#toggle-wishlist-detail").attr("data-id", product.id);
    })
    .fail(function () {
      $("#product-name").text("Không thể tải sản phẩm");
    });

  // --- Thumbnail click ---
  $(document).on("click", ".product-thumb", function () {
    var idx = $(this).attr("data-index");
    var src = $(this).find("img").attr("src");
    $("#main-product-img").attr("src", src);
    $(".product-thumb").removeClass("border-gold").addClass("border-transparent");
    $(this).removeClass("border-transparent").addClass("border-gold");
  });

  // --- Size selection ---
  $(document).on("click", ".size-btn", function () {
    $(".size-btn").removeClass("border-primary text-primary").addClass("text-muted");
    $(this).addClass("border-primary text-primary").removeClass("text-muted");
  });

  // --- Quantity ---
  $(document).on("click", "#qty-minus", function () {
    var $input = $("#qty-input");
    var val = parseInt($input.val()) || 1;
    if (val > 1) $input.val(val - 1);
  });
  $(document).on("click", "#qty-plus", function () {
    var $input = $("#qty-input");
    var val = parseInt($input.val()) || 1;
    if (val < 10) $input.val(val + 1);
  });

  // --- Add to cart ---
  $(document).on("click", "#add-to-cart-detail", function () {
    var id = $(this).attr("data-id");
    var qty = parseInt($("#qty-input").val()) || 1;
    var size = $(".size-btn.border-primary").attr("data-size") || null;
    if (typeof window.VaneCart !== "undefined") {
      for (var i = 0; i < qty; i++) {
        window.VaneCart.add(parseInt(id));
      }
    }
  });

  // --- Wishlist ---
  $(document).on("click", "#toggle-wishlist-detail", function () {
    var id = $(this).attr("data-id");
    if (typeof window.VaneWishlist !== "undefined") {
      window.VaneWishlist.toggle(parseInt(id));
    }
  });

  // --- Accordion ---
  $(document).on("click", ".accordion-trigger", function () {
    $(this).closest(".accordion-item").toggleClass("active");
  });
});
