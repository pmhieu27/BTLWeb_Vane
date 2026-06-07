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
      subDesc: 'Mỗi chiếc nhẫn là một câu chuyện được gìn giữ, mang ngôn ngữ của sự gắn kết trọn đời.',
      img1: "src/images/product-ring-banner2.png",
      img2: "src/images/product-ring-banner1.png",
    },
    necklaces: {
      quote: '"Vẻ đẹp tỏa sáng trên xương quai xanh."',
      subDesc: 'Tuyệt tác hòa quyện giữa kỹ nghệ tinh hoa và thiết kế đương đại, nâng tầm phong cách thượng lưu.',
      img1: "src/images/product-necklace-banner1.png",
      img2: "src/images/product-necklace-banner2.png"
    },
    bracelets: {
      quote: '"Điểm nhấn tinh tế cho mỗi cử động."',
      subDesc: 'Ôm lấy cổ tay bằng ánh kim rực rỡ, khơi gợi nét duyên dáng thầm lặng trong từng cử chỉ nhỏ nhất.',
      img1: "src/images/product-bracelet-banner1.png",
      img2: "src/images/product-bracelet-banner2.png"
    },
    earrings: {
      quote: '"Điểm xuyết dịu dàng cho vẻ đẹp tinh khôi."',
      subDesc: 'Ánh sáng tinh xảo lấp lánh theo từng bước đi, mỗi khoảnh khắc đều trở thành nghệ thuật.',
      img1: "src/images/product-earrings-banner1.png",
      img2: "src/images/product-earrings-banner2.png"
    }
  };

  // --- Helpers ---
  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  }

  // Hàm bổ trợ điều khiển ẩn/hiện và nạp nội dung cho Lookbook
  // Hàm điều khiển ẩn/hiện và nạp nội dung cho Lookbook
  function updateLookbookContent(category) {
    var $lookbookBanner = $("#dynamic-lookbook-banner");
    var $plainTitleRow = $("#plain-title-row");

    // Nếu chọn danh mục cụ thể (Nhẫn, Dây chuyền, Vòng tay, Hoa tai)
    if (category && lookbookData[category]) {
      var data = lookbookData[category];
      
      // Thay ruột dữ liệu chữ và ảnh tương ứng danh mục
      $("#lookbook-quote").text(data.quote);
      $("#lookbook-bottom-desc").text(data.subDesc);
      $("#lookbook-img-1").attr("src", data.img1);
      $("#lookbook-img-2").attr("src", data.img2);
      
      // Hiện khung nghệ thuật lớn, ẩn tiêu đề trơn
      $lookbookBanner.css("display", "grid");
      $plainTitleRow.css("display", "none");

      // HIỆN lại tiêu đề, THANH TOOLBAR, và lưới sản phẩm cho khách mua hàng
      $("#shop-header-filter").show();
      $("#shop-toolbar-filter").show(); // <-- Hiện lại thanh toolbar khi vào mục con
      $("#shop-products-container").show();
      $("#lookbook-design-space").hide();

    } else {
      // NẾU LÀ TRANG BỘ SƯU TẬP CHÍNH (Chọn "Tất Cả" hoặc không có category)
      $lookbookBanner.css("display", "none");
      $plainTitleRow.css("display", "none");
      
      // ẨN TOÀN BỘ bộ lọc tiêu đề, THANH TOOLBAR, và danh sách sản phẩm lỉnh kỉnh đi
      $("#shop-header-filter").hide();
      $("#shop-toolbar-filter").hide(); // <-- Ẩn dứt điểm thanh toolbar ở trang BST chính
      $("#shop-products-container").hide();

      // HIỆN không gian trắng tinh để cậu tự do thiết kế câu chuyện thương hiệu
      $("#lookbook-design-space").removeClass("hidden").show();
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
'<button class="diamond-btn add-to-cart-btn" data-id="' + p.id + '">' +
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
'</button>' +
'<button class="diamond-btn toggle-wishlist-btn wishlist-btn" data-id="' + p.id + '" data-product-id="' + p.id + '">' +
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
'</button>' +
        '</div>' +
      '</div>' +
      '<p class="font-ui text-[10px] uppercase tracking-wider text-gold mb-1">' + (p.category === "rings" ? "Nhẫn" : p.category === "necklaces" ? "Dây Chuyền" : p.category === "bracelets" ? "Vòng Tay" : "Hoa Tai") + '</p>' +
      '<h3 class="font-serif text-lg text-primary mb-1.5 group-hover:text-gold transition-colors">' + p.name_vi + '</h3>' +
      '<div>' + priceHtml + '</div>' +
    '</a>';
  }
 function initScrollReveal() {
    // 1. Tạo "Bộ giám sát"
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Khi phần tử lọt vào màn hình (10%)
            if (entry.isIntersecting) {
                // Thêm class revealed -> CSS tự chạy hiệu ứng
                entry.target.classList.add('revealed');
                // Xong rồi thì không cần quét nó nữa
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // 2. Gom tất cả các thẻ data-reveal lại (cả cũ lẫn mới)
    document.querySelectorAll('[data-reveal]').forEach(el => {
        // Chỉ thêm vào bộ giám sát nếu nó chưa được theo dõi
        if (!el.dataset.observed) {
            observer.observe(el);
            el.dataset.observed = 'true'; // Đánh dấu là "đã đăng ký theo dõi"
        }
    });
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
    setTimeout(function() {
        initScrollReveal();
    }, 10);
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

    // Sidebar checkboxes (Desktop) VÀ Mobile Panel
    // Đã cập nhật để quét cả 2 bảng lọc
    $("#filter-sidebar .filter-group, #mobile-filter-panel .filter-group").each(function () {
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

  function applyFilters() {
    var f = getActiveFilters();
    console.log("Filter yêu cầu:", f); // [LOG QUAN TRỌNG]

    filteredProducts = allProducts.filter(function (p) {
        // Kiểm tra Category
        if (f.categories.length > 0 && f.categories.indexOf(p.category) === -1) return false;
        
        // Kiểm tra Chất liệu
        if (f.materials.length > 0 && f.materials.indexOf(p.material) === -1) return false;
        
        // Kiểm tra Giá
        if (p.price > f.maxPrice) return false;

        // Kiểm tra Trạng thái
        if (f.statuses.length > 0) {
            var match = false;
            // Chỉ cần 1 trong các trạng thái bạn tick là match = true
            if (f.statuses.includes("new") && p.isNew === true) match = true;
            if (f.statuses.includes("sale") && p.originalPrice != null) match = true;
            if (f.statuses.includes("bestseller") && p.isBestSeller === true) match = true;
            
            if (!match) return false;
        }
        return true;
    });
    applySorting();
    console.log("Sản phẩm còn lại sau lọc:", filteredProducts.length); // [LOG QUAN TRỌNG]
    
    renderGrid(filteredProducts);
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

    // Điều khiển nạp dữ liệu hình ảnh/quote tương thích danh mục
    updateLookbookContent(currentCat);
  }


  // Category pills click realtime switching
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


  // Sidebar checkboxes (chỉ chạy real-time trên Desktop)
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
    // Đã sửa: Xóa check ở cả Desktop và Mobile
    $("#filter-sidebar input[type='checkbox'], #mobile-filter-panel input[type='checkbox']").prop("checked", false);
    $("#price-range").val(50000000);
    $("#price-range-value").text("50.000.000₫");
    $(".filter-pill").removeClass("active");
    $(".filter-pill[data-category='all']").addClass("active");
    updatePageTitle(null);
    applyFilters();
  });

  // Filter group collapse
  $(document).on("click", ".filter-group-title", function () {
    $(this).closest(".filter-group").toggleClass("collapsed");
  });

  var quickCartProduct = null;
  var quickCartSelectedSize = null;

  function openSizePicker(product) {
    quickCartProduct = product;
    quickCartSelectedSize = null;
    $("#size-picker-title").text(product.name_vi || "Chọn size sản phẩm");

    var optionsHtml = "";
    if (product.sizes && product.sizes.length) {
      $.each(product.sizes, function (i, size) {
        optionsHtml += '<button type="button" class="size-picker-option" data-size="' + size + '">' + size + '</button>';
      });
    } else {
      optionsHtml = '<p class="text-sm text-muted">Sản phẩm này không có tùy chọn size.</p>';
    }

    $("#size-picker-options").html(optionsHtml);
    $("#size-picker-overlay").addClass("active").attr("aria-hidden", "false");
  }

  function closeSizePicker() {
    quickCartProduct = null;
    quickCartSelectedSize = null;
    $("#size-picker-overlay").removeClass("active").attr("aria-hidden", "true");
    $("#size-picker-options").empty();
  }

  $(document).off("click", ".size-picker-option").on("click", ".size-picker-option", function () {
    $(".size-picker-option").removeClass("selected");
    $(this).addClass("selected");
    quickCartSelectedSize = $(this).attr("data-size");
  });

  $(document).off("click", "#size-picker-close").on("click", "#size-picker-close", function () {
    closeSizePicker();
  });

  $(document).off("click", "#size-picker-overlay").on("click", "#size-picker-overlay", function (e) {
    if (e.target.id === "size-picker-overlay") {
      closeSizePicker();
    }
  });

  $(document).off("click", "#size-picker-confirm").on("click", "#size-picker-confirm", function () {
    if (!quickCartProduct) return;
    if (!quickCartSelectedSize) {
      $(document).trigger("toast", ["Bạn cần chọn size trước khi thêm vào giỏ.", "error"]);
      return;
    }
    var selectedSize = quickCartSelectedSize;
    window.VaneCart.addToCart(quickCartProduct, selectedSize, 1);
    closeSizePicker();
    $(document).trigger("toast", ["Đã thêm size " + selectedSize + " vào giỏ.", "success"]);
  });

  // Product card actions
  $(document).off("click", ".add-to-cart-btn").on("click", ".add-to-cart-btn", function (e) {
    e.preventDefault();
    e.stopPropagation();

    var id = parseInt($(this).attr("data-id"), 10);
    var product = allProducts.find(function (p) { return p.id === id; });
    if (!product || typeof window.VaneCart === "undefined") return;

    if (product.sizes && product.sizes.length) {
      openSizePicker(product);
      return;
    }

    window.VaneCart.addToCart(product, null, 1);
  });

  // Mobile filter drawer - Đã tách nút Đóng và nút Áp Dụng
  $(document).on("click", "#filter-toggle-btn", function () {
    $("#mobile-filter-overlay").addClass("active");
    $("body").css("overflow", "hidden");
  });

  $(document).on("click", "#mobile-filter-close", function () {
    $("#mobile-filter-overlay").removeClass("active");
    $("body").css("overflow", "");
  });

  // Xử lý sự kiện click "Áp Dụng Bộ Lọc" trên Mobile
  $(document).on("click", "#mobile-filter-apply", function () {
    applyFilters(); // Chạy bộ lọc
    $("#mobile-filter-overlay").removeClass("active"); // Đóng menu
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
    //---Set thời gian chạy Kết nối cùng Vane!---
  setTimeout(function () {
    $('.vane-zigzag-btn .zigzag-line').css('stroke-dashoffset', '0');
    
    setTimeout(function () {
      
      $('.vane-zigzag-btn .zigzag-line').css('stroke-dashoffset', '600');
    
      setTimeout(function() {
        $('.vane-zigzag-btn .zigzag-line').css('stroke-dashoffset', '');
      }, 800); 
      
    }, 1300); 
    
  }, 3000); 
  
});

