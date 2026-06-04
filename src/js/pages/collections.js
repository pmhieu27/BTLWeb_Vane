/**
 * pages/collections.js — Product listing, filtering, sorting
 */
$(function () {
  "use strict";

  var allProducts = [];
  var filteredProducts = [];

  // --- URL params ---
  var params = new URLSearchParams(window.location.search);
  var urlCategory = params.get("category");
  var urlNew = params.get("new");

  // --- Helpers ---
  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
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
        '<div class="absolute bottom-0 inset-x-0 p-3 flex justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-400">' +
          '<button class="add-to-cart-btn bg-primary text-white font-ui text-[9px] uppercase tracking-wider px-4 py-2 hover:bg-gold transition-colors cursor-pointer" data-id="' + p.id + '">Thêm Giỏ</button>' +
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

    // Category pills
    var activePill = $(".filter-pill.active").attr("data-category");
    if (activePill && activePill !== "all") {
      categories.push(activePill);
    }

    // Sidebar checkboxes
    $("#filter-sidebar .filter-group").each(function () {
      var title = $(this).find(".filter-group-title").text().trim();
      $(this).find("input:checked").each(function () {
        var val = $(this).val();
        if (title.includes("Danh Mục")) categories.push(val);
        else if (title.includes("Chất Liệu")) materials.push(val);
        else if (title.includes("Trạng Thái")) statuses.push(val);
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
      return 0;
    });
  }

  // --- Update page title based on URL category ---
  function updatePageTitle() {
    var titles = {
      rings: "Nhẫn",
      necklaces: "Dây Chuyền",
      bracelets: "Vòng Tay",
      earrings: "Hoa Tai",
    };
    if (urlCategory && titles[urlCategory]) {
      $("#collection-title").text(titles[urlCategory]);
      $("#breadcrumb-current").text(titles[urlCategory]);
      document.title = titles[urlCategory] + " | Vane Vietnam";
      // Activate the matching pill
      $(".filter-pill").removeClass("active");
      $('.filter-pill[data-category="' + urlCategory + '"]').addClass("active");
    }
    if (urlNew === "true") {
      $("#collection-title").text("Sản Phẩm Mới");
      $("#breadcrumb-current").text("Sản Phẩm Mới");
      document.title = "Sản Phẩm Mới | Vane Vietnam";
    }
  }

  // --- Events ---

  // Category pills
  $(document).on("click", ".filter-pill", function () {
    $(".filter-pill").removeClass("active");
    $(this).addClass("active");
    applyFilters();
  });

  // Sidebar checkboxes
  $(document).on("change", "#filter-sidebar input[type='checkbox']", applyFilters);

  // Price range
  $(document).on("input", "#price-range", function () {
    var val = parseInt($(this).val());
    $("#price-range-value").text(formatPrice(val));
    applyFilters();
  });

  // Sort
  $(document).on("change", "#sort-select", applyFilters);

  // Reset
  $(document).on("click", "#filter-reset", function () {
    $("#filter-sidebar input[type='checkbox']").prop("checked", false);
    $("#price-range").val(50000000);
    $("#price-range-value").text("50.000.000₫");
    $(".filter-pill").removeClass("active");
    $(".filter-pill[data-category='all']").addClass("active");
    applyFilters();
  });

  // Filter group collapse
  $(document).on("click", ".filter-group-title", function () {
    $(this).closest(".filter-group").toggleClass("collapsed");
  });

  // Mobile filter drawer
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

  // --- Init: Fetch products ---
  $.getJSON("src/data/products.json")
    .done(function (data) {
      allProducts = data;

      // Apply URL-based pre-filter
      if (urlCategory) {
        filteredProducts = allProducts.filter(function (p) { return p.category === urlCategory; });
      } else if (urlNew === "true") {
        filteredProducts = allProducts.filter(function (p) { return p.isNew; });
      } else {
        filteredProducts = allProducts.slice();
      }

      updatePageTitle();
      renderGrid(filteredProducts);
    })
    .fail(function () {
      $("#products-grid").html('<p class="col-span-full text-center text-muted py-10">Không thể tải sản phẩm.</p>');
    });
});
