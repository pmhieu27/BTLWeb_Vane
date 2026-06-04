/**
 * modules/cart.js — Cart data layer + overlay UI
 * Uses localStorage key "vane_cart"
 */
$(function () {
  "use strict";
  var STORAGE_KEY = "vane_cart";

  // --- Data Layer ---
  window.VaneCart = {
    getCart: function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch (e) { return []; }
    },
    saveCart: function (cart) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      $(document).trigger("cart:updated");
    },
    addToCart: function (product, size, qty) {
      var cart = this.getCart();
      var existing = null;
      $.each(cart, function (i, item) {
        if (item.id === product.id && item.size === size) { existing = i; return false; }
      });
      if (existing !== null) {
        cart[existing].qty += qty;
      } else {
        cart.push({ id: product.id, name: product.name_vi, price: product.price, image: (product.images && product.images[0]) || "", size: size, qty: qty });
      }
      this.saveCart(cart);
    },
    removeFromCart: function (id, size) {
      var cart = $.grep(this.getCart(), function (item) { return !(item.id === id && item.size === size); });
      this.saveCart(cart);
    },
    updateQty: function (id, size, qty) {
      var cart = this.getCart();
      $.each(cart, function (i, item) {
        if (item.id === id && item.size === size) { item.qty = Math.max(1, qty); return false; }
      });
      this.saveCart(cart);
    },
    clearCart: function () { this.saveCart([]); },
    getCartCount: function () {
      var count = 0;
      $.each(this.getCart(), function (i, item) { count += item.qty; });
      return count;
    },
    getCartTotal: function () {
      var total = 0;
      $.each(this.getCart(), function (i, item) { total += item.price * item.qty; });
      return total;
    }
  };

  // --- UI Layer ---
  function renderCart() {
    var cart = VaneCart.getCart();
    var $list = $("#cart-items-list");
    var $empty = $("#cart-empty-state");
    var $footer = $("#cart-overlay-footer");
    var $badge = $("#cart-badge");
    var count = VaneCart.getCartCount();

    // Badge
    if (count > 0) { $badge.text(count).removeClass("hidden"); }
    else { $badge.addClass("hidden"); }

    if (!cart.length) {
      $empty.removeClass("hidden"); $list.addClass("hidden"); $footer.addClass("hidden");
      return;
    }
    $empty.addClass("hidden"); $list.removeClass("hidden"); $footer.removeClass("hidden");

    var html = "";
    $.each(cart, function (i, item) {
      html += '<div class="cart-item" data-id="' + item.id + '" data-size="' + item.size + '">' +
        '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img">' +
        '<div class="flex-1 flex flex-col justify-between">' +
          '<div>' +
            '<p class="font-ui text-sm font-medium text-primary">' + item.name + '</p>' +
            '<p class="font-ui text-xs text-muted mt-1">Size: ' + (item.size || "—") + '</p>' +
          '</div>' +
          '<div class="flex justify-between items-center">' +
            '<div class="qty-selector">' +
              '<button class="qty-btn cart-qty-minus">−</button>' +
              '<input type="text" class="qty-input" value="' + item.qty + '" readonly>' +
              '<button class="qty-btn cart-qty-plus">+</button>' +
            '</div>' +
            '<span class="font-ui text-sm text-gold">' + Number(item.price * item.qty).toLocaleString("vi-VN") + '₫</span>' +
          '</div>' +
        '</div>' +
        '<button class="cart-item-remove text-muted hover:text-primary text-lg leading-none self-start ml-2 cursor-pointer">&times;</button>' +
      '</div>';
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

  // Events
  $(document).on("click", "#cart-btn", function (e) { e.preventDefault(); openCart(); });
  $(document).on("click", "#cart-close, #cart-overlay-backdrop, #cart-continue-shopping", function () { closeCart(); });
  $(document).on("click", ".cart-item-remove", function () {
    var $item = $(this).closest(".cart-item");
    VaneCart.removeFromCart(parseInt($item.data("id")), $item.data("size"));
  });
  $(document).on("click", ".cart-qty-plus", function () {
    var $item = $(this).closest(".cart-item");
    var currentQty = parseInt($item.find(".qty-input").val());
    VaneCart.updateQty(parseInt($item.data("id")), $item.data("size"), currentQty + 1);
  });
  $(document).on("click", ".cart-qty-minus", function () {
    var $item = $(this).closest(".cart-item");
    var currentQty = parseInt($item.find(".qty-input").val());
    if (currentQty > 1) VaneCart.updateQty(parseInt($item.data("id")), $item.data("size"), currentQty - 1);
  });
  $(document).on("cart:updated", renderCart);
  $(document).on("keydown", function (e) { if (e.key === "Escape") closeCart(); });

  // Init
  renderCart();
});
