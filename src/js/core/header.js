/**
 * core/header.js — Header scroll behavior, menu overlay, search overlay
 */
$(function () {
  "use strict";

  // --- Header scroll state ---
  function hasHeroSection() {
    return $("#component-hero").length > 0 || $("#hero").length > 0;
  }

  function updateHeaderState() {
    var $header = $("#main-header");
    if (!$header.length) return;
    var scrollTop = $(window).scrollTop();

    if (!hasHeroSection()) {
      $header.addClass("header-scrolled").removeClass("header-transparent");
      return;
    }
    if (scrollTop > 10) {
      $header.addClass("header-scrolled").removeClass("header-transparent");
    } else {
      $header.removeClass("header-scrolled").addClass("header-transparent");
    }
  }

  // --- Full-screen menu overlay ---
  function openMenu() {
    var $overlay = $("#menu-overlay");
    if (!$overlay.length) return;
    $overlay.addClass("active");
    $("#main-header").css("visibility", "hidden");
    $("body").css("overflow", "hidden");
  }

  function closeMenu() {
    $("#menu-overlay").removeClass("active");
    $("#main-header").css("visibility", "");
    $("body").css("overflow", "");
  }

  // Menu hover → change preview image
  $(document).on("mouseenter", ".menu-overlay-link", function () {
    var imgSrc = $(this).attr("data-menu-img");
    if (!imgSrc) return;
    var $img = $("#menu-preview-img");
    if (!$img.length) return;
    $img.css("opacity", 0);
    setTimeout(function () {
      $img.attr("src", imgSrc);
      $img.css("opacity", 0.6);
    }, 200);
  });

  $(document).on("mouseleave", ".menu-overlay-link", function () {
    var $img = $("#menu-preview-img");
    if ($img.length) $img.css("opacity", 0.4);
  });

  // --- Search overlay ---
  function openSearch() {
    var $s = $("#search-dropdown");
    if (!$s.length) return;
    $s.addClass("active");
    $s.find("input").trigger("focus");
  }

  function closeSearch() {
    $("#search-dropdown").removeClass("active");
    // Clear search input and results on close
    $("#search-input").val("");
    $("#search-results-container").addClass("hidden");
    $("#search-empty-msg").addClass("hidden");
  }

  // --- Dynamic Search Suggestions ---
  var searchProducts = [];
  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  }

  // Load products list for search autocomplete
  $.getJSON("src/data/products.json")
    .done(function (data) {
      searchProducts = data;
    })
    .fail(function () {
      console.error("Failed to load products for search suggestions");
    });

  // Track search typing input
  $(document).on("input", "#search-input", function () {
    var query = $(this).val().trim().toLowerCase();
    var $resultsContainer = $("#search-results-container");
    var $resultsGrid = $("#search-results-grid");
    var $emptyMsg = $("#search-empty-msg");
    var $viewAllBtn = $("#search-view-all");

    if (query.length < 2) {
      $resultsContainer.addClass("hidden");
      $emptyMsg.addClass("hidden");
      return;
    }

    // Filter products (match by Vietnamese name or category)
    var matches = searchProducts.filter(function (p) {
      return p.name_vi.toLowerCase().indexOf(query) !== -1 ||
             p.category.toLowerCase().indexOf(query) !== -1;
    });

    if (matches.length > 0) {
      $emptyMsg.addClass("hidden");
      $resultsContainer.removeClass("hidden");

      // Take first 4 matches for quick preview
      var displayMatches = matches.slice(0, 4);
      var html = "";
      $.each(displayMatches, function (idx, p) {
        var categoryName = p.category === "rings" ? "Nhẫn" : p.category === "necklaces" ? "Dây Chuyền" : p.category === "bracelets" ? "Vòng Tay" : "Hoa Tai";
        var priceText = formatPrice(p.price);

        html += '<a href="product-detail.html?id=' + p.id + '" class="group flex flex-col gap-2">' +
          '<div class="relative overflow-hidden bg-white">' +
            '<img src="' + p.images[0] + '" alt="' + p.name_vi + '" class="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105">' +
          '</div>' +
          '<div class="text-left">' +
            '<p class="font-ui text-[9px] uppercase tracking-wider text-gold mb-0.5">' + categoryName + '</p>' +
            '<h4 class="font-serif text-sm text-primary group-hover:text-gold transition-colors truncate mb-1">' + p.name_vi + '</h4>' +
            '<p class="font-ui text-[11px] text-charcoal">' + priceText + '</p>' +
          '</div>' +
        '</a>';
      });

      $resultsGrid.html(html);
      $viewAllBtn.attr("href", "collections.html?search=" + encodeURIComponent(query));
    } else {
      $resultsContainer.addClass("hidden");
      $emptyMsg.removeClass("hidden");
    }
  });

  // Handle Enter key inside search input
  $(document).on("keypress", "#search-input", function (e) {
    if (e.which === 13) {
      var query = $(this).val().trim();
      if (query.length >= 2) {
        window.location.href = "collections.html?search=" + encodeURIComponent(query);
      }
    }
  });

  // Handle click on Search Submit Button
  $(document).on("click", "#search-submit", function () {
    var query = $("#search-input").val().trim();
    if (query.length >= 2) {
      window.location.href = "collections.html?search=" + encodeURIComponent(query);
    }
  });

  // --- Event delegation ---
  $(document).on("click", function (e) {
    var $t = $(e.target);
    // Menu open
    if ($t.closest("#menu-btn").length) { e.preventDefault(); openMenu(); return; }
    // Menu close
    if ($t.closest("#menu-overlay-close").length || $t.is("#menu-overlay-backdrop")) {
      e.preventDefault(); closeMenu(); return;
    }
    // Search
    if ($t.closest("#search-btn, #search-btn-nav").length) { e.preventDefault(); openSearch(); return; }
    if ($t.closest("#search-close").length) { e.preventDefault(); closeSearch(); return; }

    // Close search dropdown on click outside
    if ($("#search-dropdown").hasClass("active") && 
        !$t.closest("#search-dropdown").length && 
        !$t.closest("#search-btn, #search-btn-nav").length) {
      closeSearch();
    }
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") { closeSearch(); closeMenu(); }
  });
  //--Logout---//
 
  $(function () {
    "use strict";

    const CURRENT_USER_KEY = "currentUser";
    const $logoutBtn = $("#logout-btn");

    // ==========================================
    // 1. KIỂM TRA TRẠNG THÁI ĐỂ ẨN/HIỆN NÚT
    // ==========================================
    function checkLoginStatus() {
        const currentUser = localStorage.getItem(CURRENT_USER_KEY);

        if (currentUser) {
            // Trường hợp 1: Đã đăng nhập
            // Hiện nút Đăng xuất
            $logoutBtn.show(); 
            
            // Đảm bảo icon Tài khoản trỏ đúng về trang cá nhân
            $("a[href='login.html']").attr("href", "account.html");
        } else {
            // Trường hợp 2: Chưa đăng nhập
            // Ẩn hoàn toàn nút Đăng xuất
            $logoutBtn.hide(); 
            
            // MẸO: Đổi link của icon Tài khoản sang trang Login 
            // (Vì chưa đăng nhập thì không thể vào xem account.html được)
            $("a[href='account.html']").attr("href", "login.html");
        }
    }

    // Chạy kiểm tra ngay khi header vừa load xong
    checkLoginStatus();

    // ==========================================
    // 2. BẮT SỰ KIỆN KHI ẤN ĐĂNG XUẤT
    // ==========================================
    $logoutBtn.on("click", function (e) {
        e.preventDefault();

        // Xóa "thẻ bài" khỏi hệ thống
        localStorage.removeItem(CURRENT_USER_KEY);

        // Tùy chọn: Xóa luôn SĐT khôi phục mật khẩu nếu họ đang làm dở
        localStorage.removeItem("resetPhone");

        alert("Bạn đã đăng xuất thành công!");

        // Đẩy khách hàng về lại trang chủ để làm mới lại toàn bộ giao diện
        window.location.href = "index.html";
    });
});
  // --- Init ---
  updateHeaderState();
  $(window).on("scroll", updateHeaderState);
  setTimeout(updateHeaderState, 300);
  setTimeout(updateHeaderState, 1000);
  $("body").animate({ opacity: 1 }, 100);
});
