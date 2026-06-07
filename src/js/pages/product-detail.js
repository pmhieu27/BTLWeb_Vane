/**
 * pages/product-detail.js — Product detail page logic
 */
$(function () {
  "use strict";

  var productId = new URLSearchParams(window.location.search).get("id");
  var currentProduct = null;

  var categoryNames = {
    rings: "Nhẫn",
    necklaces: "Dây Chuyền",
    bracelets: "Vòng Tay",
    earrings: "Hoa Tai",
  };

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("vi-VN") + "₫";
  }

  function getSelectedSize() {
    return $(".size-btn.border-primary").attr("data-size") || null;
  }

  function getSelectedQty() {
    var value = parseInt($("#qty-input").val(), 10) || 1;
    return Math.min(10, Math.max(1, value));
  }

  function syncQtyInput() {
    $("#qty-input").val(getSelectedQty());
  }

  function validateSizeSelection() {
    var size = getSelectedSize();

    if ($("#size-selector").is(":visible") && !size) {
      $(document).trigger("toast", [
        "Bạn chưa chọn size. Vui lòng chọn size trước khi tiếp tục.",
        "error",
      ]);
      $(".size-btn").addClass("error");
      return false;
    }

    return true;
  }

  function renderProduct(product, products) {
    var priceHtml =
      '<span class="font-serif text-2xl text-primary">' +
      formatPrice(product.price) +
      "</span>";

    currentProduct = product;
    document.title = product.name_vi + " | Vane Vietnam";
    $("#breadcrumb-product").text(product.name_vi);
    $("#product-name").text(product.name_vi);
    $("#product-category").text(
      categoryNames[product.category] || product.category,
    );
    $("#product-material").text(product.material || "—");
    $("#product-gemstone").text(product.gemstone || "Không có");
    $("#product-description").text(
      "Sản phẩm " +
        product.name_vi +
        " được chế tác từ " +
        (product.material || "chất liệu cao cấp") +
        (product.gemstone ? ", đính " + product.gemstone + " tuyển chọn" : "") +
        ". Thiết kế tinh xảo, phù hợp cho mọi dịp đặc biệt.",
    );

    if (product.originalPrice) {
      var percent = Math.round(
        (1 - product.price / product.originalPrice) * 100,
      );
      priceHtml +=
        ' <span class="font-ui text-sm text-muted line-through ml-2">' +
        formatPrice(product.originalPrice) +
        '</span><span class="font-ui text-[10px] text-gold ml-2">-' +
        percent +
        "%</span>";
    }

    $("#product-price").html(priceHtml);

    if (product.images && product.images.length) {
      var thumbnailsHtml = "";

      $("#main-product-img")
        .attr("src", product.images[0])
        .attr("alt", product.name_vi);

      $.each(product.images, function (index, source) {
        thumbnailsHtml +=
          '<button type="button" class="product-thumb overflow-hidden border-2 ' +
          (index === 0 ? "border-gold" : "border-transparent") +
          ' cursor-pointer transition-all hover:border-gold/50" data-index="' +
          index +
          '">' +
          '<img src="' +
          source +
          '" alt="' +
          product.name_vi +
          " " +
          (index + 1) +
          '" class="w-full aspect-square object-cover">' +
          "</button>";
      });

      $("#product-thumbnails").html(thumbnailsHtml);
    }

    if (product.sizes && product.sizes.length) {
      var sizeHtml = "";

      $("#size-selector").removeClass("hidden");

      $.each(product.sizes, function (_, size) {
        sizeHtml +=
          '<button type="button" class="size-btn font-ui text-[11px] px-4 py-2 border border-silver-light hover:border-primary transition-colors cursor-pointer text-muted" data-size="' +
          size +
          '">' +
          size +
          "</button>";
      });

      $("#size-options").html(sizeHtml);
    }

    $("#add-to-cart-detail").attr("data-id", product.id);
    $("#toggle-wishlist-detail").attr("data-id", product.id);

    var related = products
      .filter(function (item) {
        return item.category === product.category && item.id !== product.id;
      })
      .slice(0, 4);

    if (related.length) {
      var relatedHtml = "";

      $.each(related, function (_, item) {
        relatedHtml +=
          '<a href="product-detail.html?id=' +
          item.id +
          '" class="group block" data-reveal="scale">' +
          '<div class="overflow-hidden bg-white mb-3">' +
          '<img src="' +
          item.images[0] +
          '" alt="' +
          item.name_vi +
          '" class="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105">' +
          "</div>" +
          '<p class="font-ui text-[10px] uppercase tracking-wider text-gold mb-1">' +
          (categoryNames[item.category] || "") +
          "</p>" +
          '<h3 class="font-serif text-base text-primary group-hover:text-gold transition-colors mb-1">' +
          item.name_vi +
          "</h3>" +
          '<p class="font-ui text-[11px] text-charcoal">' +
          formatPrice(item.price) +
          "</p>" +
          "</a>";
      });

      $("#related-products").html(relatedHtml);
    }
  }

  function addProductToCart() {
    if (!currentProduct || typeof window.VaneCart === "undefined") {
      return false;
    }

    if (!validateSizeSelection()) {
      return false;
    }

    window.VaneCart.addToCart(
      currentProduct,
      getSelectedSize(),
      getSelectedQty(),
    );
    return true;
  }

  $.getJSON("src/data/products.json")
    .done(function (products) {
      var product = null;

      $.each(products, function (_, item) {
        if (String(item.id) === String(productId)) {
          product = item;
          return false;
        }
      });

      if (!product) {
        document.title = "Sản phẩm không tìm thấy | Vane Vietnam";
        $("#product-name").text("Sản phẩm không tìm thấy");
        $("#product-description").text(
          "Liên kết này không còn hợp lệ hoặc sản phẩm đã được cập nhật.",
        );
        return;
      }

      renderProduct(product, products);
    })
    .fail(function () {
      document.title = "Không thể tải sản phẩm | Vane Vietnam";
      $("#product-name").text("Không thể tải sản phẩm");
    });

  $(document).on("click", ".product-thumb", function () {
    var source = $(this).find("img").attr("src");

    $("#main-product-img").attr("src", source);
    $(".product-thumb")
      .removeClass("border-gold")
      .addClass("border-transparent");
    $(this).removeClass("border-transparent").addClass("border-gold");
  });

  $(document).on("click", ".size-btn", function () {
    $(".size-btn")
      .removeClass("border-primary text-primary error")
      .addClass("text-muted");
    $(this)
      .addClass("border-primary text-primary")
      .removeClass("text-muted error");
  });

  $(document).on("click", "#qty-minus", function () {
    $("#qty-input").val(Math.max(1, getSelectedQty() - 1));
  });

  $(document).on("click", "#qty-plus", function () {
    $("#qty-input").val(Math.min(10, getSelectedQty() + 1));
  });

  $(document).on("input change", "#qty-input", syncQtyInput);

  $(document).on("click", "#add-to-cart-detail", function () {
    addProductToCart();
  });

  $(document).on("click", "#buy-now-detail", function () {
    if (!currentProduct) return;
    if (!validateSizeSelection()) return;

    sessionStorage.setItem(
      "buyNowItem",
      JSON.stringify({
        id: currentProduct.id,
        qty: getSelectedQty(),
        size: getSelectedSize(),
      }),
    );

    window.location.href = "checkout.html";
    if (addProductToCart()) {
      window.location.href = "checkout.html";
    }
  });
});
