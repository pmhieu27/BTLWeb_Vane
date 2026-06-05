/**
 * pages/collections.js — Product listing, filtering, sorting with Dynamic Lookbook
 */
$(function () {
  "use strict";

  var allProducts = [];
  var filteredProducts = [];

  // --- URL params ---
  var params = new URLSearchParams(window.location.search);
  var urlCategory = params.get("category");
  var urlNew = params.get("new");

  // --- Kho dữ liệu nội dung Lookbook nghệ thuật riêng của từng danh mục ---
  var lookbookData = {
    rings: {
      quote: '"Biểu tượng của tình yêu vĩnh cửu."',
      img1: "src/images/product-ring-50.png",
      img2: "src/images/product-ring-51.png"
    },
    necklaces: {
      quote: '"Vẻ đẹp tỏa sáng trên xương quai xanh."',
      img1: "src/images/product-necklace-621.png",
      img2: "src/images/product-necklace-371.png"
    },
    bracelets: {
      quote: '"Điểm nhấn tinh tế cho mỗi cử động."',
      img1: "src/images/banner-bracelets-621.png",
      img2: "src/images/banner-bracelets-371.png"
    },
    earrings: {
      quote: '"Điểm xuyết dịu dàng cho vẻ đẹp tinh khôi."',
      img1: "src/images/banner-earrings-1.png",
      img2: "src/images/banner-earrings-2.png"
    }
  };

  // --- Helpers ---
  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  }

  // Hàm bổ trợ điều khiển ẩn/hiện và nạp nội dung cho Lookbook
  function updateLookbookContent(category) {
    var $lookbookBanner = $("#dynamic-lookbook-banner");
    var $plainTitleRow = $("#plain-title-row");

    if (category && lookbookData[category]) {
      var data = lookbookData[category];
      
      // Thay ruột dữ liệu chữ và ảnh tương ứng danh mục
      $("#lookbook-quote").text(data.quote);
      $("#lookbook-img-1").attr("src", data.img1);
      $("#lookbook-img-2").attr("src", data.img2);
      
      // Hiện khung nghệ thuật lớn, ẩn tiêu đề trơn
      $lookbookBanner.css("display", "grid");
      $plainTitleRow.css("display", "none");
    } else {
      // Nếu chọn "Tất Cả" hoặc trang "Sản Phẩm Mới" -> Ẩn banner ảnh, hiện hàng tiêu đề trơn gọn gàng
      $lookbookBanner.css("display", "none");
      $plainTitleRow.css("display", "flex");
    }
  }

  function renderProductCard(p) {
    var badge = "";
    if (p.isNew) badge = '<span class="absolute top-3 left-3 bg-primary text-white font-ui text-[9px] uppercase tracking-wider px-2.5 py-1 z-10">Mới</span>';
    if (p.originalPrice) badge = '<span class="absolute top-3 left-3 bg-gold text-white font-ui text-[9px] uppercase tracking-wider px-2.5 py-1 z-10">Giảm giá</span>';

    var priceHtml = "";
    if (p.originalPrice) {
      priceHtml = '<span class="text-gold font-ui text-[12px]">' + formatPrice(p.price) + '</span> <span class="text-muted/50 line-through font-ui text-[10px]">' + formatPrice(p.originalPrice) + '</span>';
    } else {
      priceHtml = '<span class="text-charcoal font-ui text-[12px]">' + formatPrice(p.price) + '</span>';
    }

    return '<a href="product-detail.html?id=' + p.id + '" class="product-card group block" data-reveal="scale">' +
      '<div class="relative overflow-hidden bg-white mb-4">' +
        badge +
        '<img src="' + p.images[0] + '" alt="' + p.name_vi + '" class="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105">' +
        (p.images[1] ? '<img src="' + p.images[1] + '" alt="' + p.name_vi + '" class="product-img-secondary absolute inset-0 w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105">' : '') +
       '<div class="absolute bottom-0 inset-x-0 p-3 flex justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-400">' +
        '<button class="add-to-cart-btn bg-primary text-white font-ui text-[9px] uppercase tracking-wider px-4 py-2 hover:bg-gold transition-colors cursor-pointer flex items-center justify-center" data-id="' + p.id + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
        '</button>' +
        '<button class="toggle-wishlist-btn bg-white text-primary font-ui text-[9px] uppercase tracking-wider px-3 py-2 hover:text-gold transition-colors cursor-pointer" data-id="' + p.id + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '</button>' +
        '</div>' +
      '</div>' +
      '<p class="font-ui text-[10px] uppercase tracking-wider text-gold mb-1">' + (p.category === "rings" ? "Nhẫn" : p.category === "necklaces" ? "Dây Chuyền" : p.category === "bracelets" ? "Vòng Tay" : "Hoa Tai") + '</p>' +
      '<h3 class="font-serif text-lg text-primary mb-1.5 group-hover:text-gold transition-colors">' + p.name_vi + '</h3>' +
      '<div>' + priceHtml + '</div>' +
    '</a>';
  }

  function renderGrid(products) {
    var $grid = $("#products-grid");
    var $empty = $("#products-empty");
    var $count = $("#product-count");

    if (!products.length) {
      $grid.hide();
      $empty.removeClass("hidden");
      $count.text("0 sản phẩm");
      return;
    }

    $empty.addClass("hidden");
    $grid.show();
    $count.text(products.length + " sản phẩm");

    var html = "";
    $.each(products, function (i, p) {
      html += renderProductCard(p);
    });
    $grid.html(html);
  }

  // --- Filter logic ---
  function getActiveFilters() {
    var categories = [];
    var materials = [];
    var statuses = [];
    var maxPrice = parseInt($("#price-range").val()) || 50000000;

    // Category pills ở trên top
    var activePill = $(".filter-pill.active").attr("data-category");
    if (activePill && activePill !== "all") {
      categories.push(activePill);
    }

    // Quét toàn bộ Checkbox (gộp cả sidebar PC lẫn Drawer Mobile)
    $("#filter-sidebar .filter-group, #mobile-filter-panel .filter-group").each(function () {
      var title = $(this).find(".filter-group-title").text().trim().toLowerCase();
      
      $(this).find("input:checked").each(function () {
        var val = $(this).val();
        if (title.includes("danh mục")) categories.push(val);
        else if (title.includes("chất liệu")) materials.push(val);
        else if (title.includes("trạng thái")) statuses.push(val);
      });
    });

    return { categories: categories, materials: materials, statuses: statuses, maxPrice: maxPrice };
  }

  function applyFilters() {
    var f = getActiveFilters();

    filteredProducts = allProducts.filter(function (p) {
      if (f.categories.length && f.categories.indexOf(p.category) === -1) return false;
      if (f.materials.length && f.materials.indexOf(p.material) === -1) return false;
      if (p.price > f.maxPrice) return false;
      if (f.statuses.length) {
        var match = false;
        if (f.statuses.indexOf("new") !== -1 && p.isNew) match = true;
        if (f.statuses.indexOf("sale") !== -1 && p.originalPrice) match = true;
        if (f.statuses.indexOf("bestseller") !== -1 && p.isBestSeller) match = true;
        if (!match) return false;
      }
      return true;
    });

    applySorting();
    renderGrid(filteredProducts);
  }

  function applySorting() {
    var sort = $("#sort-select").val();
    filteredProducts.sort(function (a, b) {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name_vi.localeCompare(b.name_vi);
      if (sort === "new") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return a.id - b.id;
    });
  }

  // --- Update page title and controls lookbook ---
  function updatePageTitle(category) {
    var titles = {
      rings: "Nhẫn",
      necklaces: "Dây Chuyền",
      bracelets: "Vòng Tay",
      earrings: "Hoa Tai",
    };

    var currentCat = category || urlCategory;

    if (currentCat && titles[currentCat]) {
      $("#collection-title").text(titles[currentCat]);
      $("#plain-collection-title").text(titles[currentCat]);
      $("#breadcrumb-current").text(titles[currentCat]);
      document.title = titles[currentCat] + " | Vane Vietnam";
      $(".filter-pill").removeClass("active");
      $('.filter-pill[data-category="' + currentCat + '"]').addClass("active");
    } else if (urlNew === "true" && !category) {
      $("#collection-title").text("Sản Phẩm Mới");
      $("#plain-collection-title").text("Sản Phẩm Mới");
      $("#breadcrumb-current").text("Sản Phẩm Mới");
      document.title = "Sản Phẩm Mới | Vane Vietnam";
    } else {
      $("#collection-title").text("Tất Cả Sản Phẩm");
      $("#plain-collection-title").text("Tất Cả Sản Phẩm");
      $("#breadcrumb-current").text("Bộ Sưu Tập");
      document.title = "Bộ Sưu Tập | Vane Vietnam";
    }

    updateLookbookContent(currentCat);
  }

  // --- Events ---

  // Category pills click switching
  $(document).on("click", ".filter-pill", function () {
    $(".filter-pill").removeClass("active");
    $(this).addClass("active");
    
    var selectedCategory = $(this).attr("data-category");
    if (selectedCategory === "all") {
      updatePageTitle(null);
    } else {
      updatePageTitle(selectedCategory);
    }
    applyFilters();
  });

  // Lắng nghe thay đổi của TẤT CẢ các checkbox (bao gồm cả PC lẫn Mobile)
  $(document).on("change", "input[type='checkbox']", applyFilters);

  // Price range slider thay đổi giá
  $(document).on("input", "#price-range", function () {
    var val = parseInt($(this).val());
    $("#price-range-value").text(formatPrice(val));
    applyFilters();
  });

  // Thay đổi kiểu sắp xếp (Sort)
  $(document).on("change", "#sort-select", applyFilters);

  // Nhấn nút xóa bộ lọc (Reset)
  $(document).on("click", "#filter-reset", function () {
    $("input[type='checkbox']").prop("checked", false);
    $("#price-range").val(50000000);
    $("#price-range-value").text("50.000.000₫");
    $(".filter-pill").removeClass("active");
    $(".filter-pill[data-category='all']").addClass("active");
    updatePageTitle(null);
    applyFilters();
  });

  // Đóng/Mở cụm bộ lọc
  $(document).on("click", ".filter-group-title", function () {
    $(this).closest(".filter-group").toggleClass("collapsed");
  });

  // Click nút Thêm vào giỏ hàng
  $(document).on("click", ".add-to-cart-btn", function (e) {
    e.preventDefault();
    e.stopPropagation();

    var id = parseInt($(this).attr("data-id"), 10);
    var product = allProducts.find(function (p) { return p.id === id; });
    if (!product || typeof window.VaneCart === "undefined") return;

    window.VaneCart.addToCart(product, null, 1);
  });

  // Mobile filter drawer (Đóng mở túi lọc trên điện thoại)
  $(document).on("click", "#filter-toggle-btn", function () {
    $("#mobile-filter-overlay").addClass("active");
    $("body").css("overflow", "hidden");
  });
  $(document).on("click", "#mobile-filter-close, #mobile-filter-apply", function () {
    $("#mobile-filter-overlay").removeClass("active");
    $("body").css("overflow", "");
  });
  $(document).on("click", "#mobile-filter-overlay", function (e) {
    if ($(e.target).is("#mobile-filter-overlay")) {
      $(this).removeClass("active");
      $("body").css("overflow", "");
    }
  });

  // --- Init: Gọi Ajax nạp dữ liệu từ products.json ---
  $.getJSON("src/data/products.json")
    .done(function (data) {
      allProducts = data;

      if (urlCategory) {
        filteredProducts = allProducts.filter(function (p) { return p.category === urlCategory; });
      } else if (urlNew === "true") {
        filteredProducts = allProducts.filter(function (p) { return p.isNew; });
      } else {
        filteredProducts = allProducts.slice();
      }

      updatePageTitle(urlCategory);
      renderGrid(filteredProducts);
    })
    .fail(function () {
      $("#products-grid").html('<p class="col-span-full text-center text-muted py-10">Không thể tải sản phẩm.</p>');
    });
});