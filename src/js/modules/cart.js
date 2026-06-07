/**
 * modules/cart.js — Cart data layer + overlay UI
 * Uses localStorage key "vane_cart"
 */
$(function () {
  "use strict";

  var STORAGE_KEY = "vane_cart";

  function normalizeCartSize(size) {
    if (size === "null" || size === "undefined" || size == null || size === "") {
      return null;
    }

    return String(size);
  }

  function getCartItemKey(id, size) {
    return String(id) + "::" + (normalizeCartSize(size) || "");
  }

  window.VaneCart = {
    getCart: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    },
    saveCart: function (cart) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      $(document).trigger("cart:updated");
    },
    addToCart: function (product, size, qty) {
      var normSize = normalizeCartSize(size);
      var cart = this.getCart();
      var itemKey = getCartItemKey(product.id, normSize);
      var existing = null;

      $.each(cart, function (i, item) {
        if (getCartItemKey(item.id, item.size) === itemKey) {
          existing = i;
          return false;
        }
      });

      if (existing !== null) {
        cart[existing].qty += qty;
      } else {
        cart.push({
          id: product.id,
          name: product.name_vi,
          price: product.price,
          image: (product.images && product.images[0]) || "",
          size: normSize,
          qty: qty,
        });
      }

      this.saveCart(cart);
      $(document).trigger("toast", ["Đã thêm vào giỏ hàng thành công!", "success"]);
      this.openCart();
    },
    removeFromCart: function (id, size) {
      var itemKey = getCartItemKey(id, size);
      var cart = $.grep(this.getCart(), function (item) {
        return getCartItemKey(item.id, item.size) !== itemKey;
      });

      this.saveCart(cart);
      $(document).trigger("toast", ["Đã xóa sản phẩm khỏi giỏ hàng", "info"]);
    },
    updateQty: function (id, size, qty) {
      var itemKey = getCartItemKey(id, size);
      var cart = this.getCart();

      $.each(cart, function (i, item) {
        if (getCartItemKey(item.id, item.size) === itemKey) {
          item.qty = Math.max(1, qty);
          return false;
        }
      });

      this.saveCart(cart);
    },
    clearCart: function () {
      this.saveCart([]);
    },
    getCartCount: function () {
      var count = 0;

      $.each(this.getCart(), function (i, item) {
        count += item.qty;
      });

      return count;
    },
    getCartTotal: function () {
      var total = 0;

      $.each(this.getCart(), function (i, item) {
        total += item.price * item.qty;
      });

      return total;
    },
    openCart: function () {
      openCart();
    },
    closeCart: function () {
      closeCart();
    },
  };

  function renderCart() {
    var cart = VaneCart.getCart();
    var $list = $("#cart-items-list");
    var $empty = $("#cart-empty-state");
    var $footer = $("#cart-overlay-footer");
    var $badge = $("#cart-badge");
    var count = VaneCart.getCartCount();

    if (count > 0) {
      $badge.text(count).show();
    } else {
      $badge.hide();
    }

    if (!cart.length) {
      $empty.show();
      $list.hide();
      $footer.hide();
      return;
    }

    $empty.hide();
    $list.show();
    $footer.show();

    var html = "";

    $.each(cart, function (i, item) {
      var size = normalizeCartSize(item.size);

      html +=
        '<div class="cart-item" data-id="' +
        item.id +
        '" data-size="' +
        (size || "") +
        '">' +
        '<img src="' +
        item.image +
        '" alt="' +
        item.name +
        '" class="cart-item-img">' +
        '<div class="flex-1 flex flex-col justify-between">' +
        "<div>" +
        '<p class="font-ui text-sm font-medium text-primary">' +
        item.name +
        "</p>" +
        '<p class="font-ui text-xs text-muted mt-1">Size: ' +
        (size || "—") +
        "</p>" +
        "</div>" +
        '<div class="flex justify-between items-center">' +
        '<div class="qty-selector">' +
        '<button type="button" class="qty-btn cart-qty-minus">−</button>' +
        '<input type="text" class="qty-input" value="' +
        item.qty +
        '" readonly>' +
        '<button type="button" class="qty-btn cart-qty-plus">+</button>' +
        "</div>" +
        '<span class="font-ui text-sm text-gold">' +
        Number(item.price * item.qty).toLocaleString("vi-VN") +
        "₫</span>" +
        "</div>" +
        "</div>" +
        '<button type="button" class="cart-item-remove text-muted hover:text-primary text-lg leading-none self-start ml-2 cursor-pointer">&times;</button>' +
        "</div>";
    });

    $list.html(html);

    $("#cart-subtotal").text(Number(VaneCart.getCartTotal()).toLocaleString("vi-VN") + "₫");
    $("#cart-total").text(Number(VaneCart.getCartTotal()).toLocaleString("vi-VN") + "₫");
  }

  function openCart() {
    $("#cart-overlay").addClass("active");
    $("#cart-overlay-backdrop").addClass("active");
    $("body").css("overflow", "hidden");
    renderCart();
  }

  function closeCart() {
    $("#cart-overlay").removeClass("active");
    $("#cart-overlay-backdrop").removeClass("active");
    $("body").css("overflow", "");
  }

  $(document).on("click", "#cart-btn", function (e) {
    e.preventDefault();
    openCart();
  });

  $(document).on("click", "#cart-close, #cart-overlay-backdrop, #cart-continue-shopping", function () {
    closeCart();
  });

  $(document).on("click", ".cart-item-remove", function (e) {
    var $item = $(this).closest(".cart-item");

    e.preventDefault();
    e.stopPropagation();

    VaneCart.removeFromCart(parseInt($item.attr("data-id"), 10), $item.attr("data-size"));
  });

  $(document).on("click", ".cart-qty-plus", function (e) {
    var $item = $(this).closest(".cart-item");
    var currentQty = parseInt($item.find(".qty-input").val(), 10) || 1;

    e.preventDefault();
    e.stopPropagation();

    VaneCart.updateQty(parseInt($item.attr("data-id"), 10), $item.attr("data-size"), currentQty + 1);
  });

  $(document).on("click", ".cart-qty-minus", function (e) {
    var $item = $(this).closest(".cart-item");
    var currentQty = parseInt($item.find(".qty-input").val(), 10) || 1;

    e.preventDefault();
    e.stopPropagation();

    if (currentQty > 1) {
      VaneCart.updateQty(parseInt($item.attr("data-id"), 10), $item.attr("data-size"), currentQty - 1);
    }
  });

  $(document).on("cart:updated", renderCart);
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart();
    }
  });
  $(document).on("click", "#cart-checkout-btn", function () {
    sessionStorage.removeItem("buyNowItem");
  });

  renderCart();
});
