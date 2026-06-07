/**
 * pages/collections.js — Product listing, filtering, sorting, and lookbook state
 */
$(function () {
  "use strict";

  var allProducts = [];
  var filteredProducts = [];
  var quickCartProduct = null;
  var quickCartSelectedSize = null;

  var params = new URLSearchParams(window.location.search);
  var urlCategory = params.get("category");
  var urlNew = params.get("new");
  var isNewCollection = urlNew === "true";
  var currentCategory = urlCategory || null;

  var lookbookData = {
    rings: {
      quote: '"Biểu tượng của tình yêu vĩnh cửu."',
      subDesc: "Mỗi chiếc nhẫn là một câu chuyện được gìn giữ, mang ngôn ngữ của sự gắn kết trọn đời.",
      img1: "src/images/product-ring-banner2.png",
      img2: "src/images/product-ring-banner1.png",
    },
    necklaces: {
      quote: '"Vẻ đẹp tỏa sáng trên xương quai xanh."',
      subDesc: "Tuyệt tác hòa quyện giữa kỹ nghệ tinh hoa và thiết kế đương đại, nâng tầm phong cách thượng lưu.",
      img1: "src/images/product-necklace-banner1.png",
      img2: "src/images/product-necklace-banner2.png",
    },
    bracelets: {
      quote: '"Điểm nhấn tinh tế cho mỗi cử động."',
      subDesc: "Ôm lấy cổ tay bằng ánh kim rực rỡ, khơi gợi nét duyên dáng thầm lặng trong từng cử chỉ nhỏ nhất.",
      img1: "src/images/product-bracelet-banner1.png",
      img2: "src/images/product-bracelet-banner2.png",
    },
    earrings: {
      quote: '"Điểm xuyết dịu dàng cho vẻ đẹp tinh khôi."',
      subDesc: "Ánh sáng tinh xảo lấp lánh theo từng bước đi, mỗi khoảnh khắc đều trở thành nghệ thuật.",
      img1: "src/images/product-earrings-banner1.png",
      img2: "src/images/product-earrings-banner2.png",
    },
  };

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("vi-VN") + "₫";
  }

  function unique(list) {
    var result = [];

    $.each(list, function (_, item) {
      if ($.inArray(item, result) === -1) {
        result.push(item);
      }
    });

    return result;
  }

  function getBaseProducts() {
    if (isNewCollection) {
      return allProducts.filter(function (product) {
        return product.isNew;
      });
    }

    return allProducts.slice();
  }

  function getCategoryLabel(category) {
    var labels = {
      rings: "Nhẫn",
      necklaces: "Dây chuyền",
      bracelets: "Vòng tay",
      earrings: "Hoa tai",
    };

    return labels[category] || "Hoa tai";
  }

  function setLookbookImage(selector, source, fallbackLabel) {
    var $image = $(selector);
    var $container = $image.parent();

    $container.find(".lookbook-image-fallback").remove();
    $image.show();

    $image
      .off("error.lookbook")
      .one("error.lookbook", function () {
        $(this).hide();
        $container.append('<span class="lookbook-image-fallback text-[10px] text-muted/40">' + fallbackLabel + "</span>");
      })
      .attr("src", source);
  }

  function updateLookbookContent(category) {
    var $lookbookBanner = $("#dynamic-lookbook-banner");
    var $plainTitleRow = $("#plain-title-row");

    if (category && lookbookData[category]) {
      var data = lookbookData[category];

      $("#lookbook-quote").text(data.quote);
      $("#lookbook-bottom-desc").text(data.subDesc);
      setLookbookImage("#lookbook-img-1", data.img1, "?nh 1 tr?ng");
      setLookbookImage("#lookbook-img-2", data.img2, "?nh 2 tr?ng");

      $lookbookBanner.css("display", "grid");
      $plainTitleRow.css("display", "none");
      $("#shop-header-filter").show();
      $("#shop-toolbar-filter").show();
      $("#shop-products-container").show();
      $("#lookbook-design-space").hide();
      return;
    }

    $lookbookBanner.css("display", "none");

    if (isNewCollection) {
      $plainTitleRow.css("display", "flex");
      $("#shop-header-filter").show();
      $("#shop-toolbar-filter").show();
      $("#shop-products-container").show();
      $("#lookbook-design-space").hide();
      return;
    }

    $plainTitleRow.css("display", "none");
    $("#shop-header-filter").hide();
    $("#shop-toolbar-filter").hide();
    $("#shop-products-container").hide();
    $("#lookbook-design-space").removeClass("hidden").show();
  }

  function updatePageTitle(category) {
    var activeCategory = typeof category === "undefined" ? currentCategory : category;
    var titles = {
      rings: "Nhẫn",
      necklaces: "Dây chuyền",
      bracelets: "Vòng tay",
      earrings: "Hoa tai",
    };

    $(".filter-pill").removeClass("active");

    if (activeCategory && titles[activeCategory]) {
      $("#collection-title").text(titles[activeCategory]);
      $("#plain-collection-title").text(titles[activeCategory]);
      $("#breadcrumb-current").text(titles[activeCategory]);
      document.title = titles[activeCategory] + " | Vane Vietnam";
      $('.filter-pill[data-category="' + activeCategory + '"]').addClass("active");
    } else if (isNewCollection) {
      $("#collection-title").text("Sản Phẩm Mới");
      $("#plain-collection-title").text("Sản Phẩm Mới");
      $("#breadcrumb-current").text("Sản Phẩm Mới");
      document.title = "Sản Phẩm Mới | Vane Vietnam";
      $('.filter-pill[data-category="all"]').addClass("active");
    } else {
      $("#collection-title").text("Tất Cả Sản Phẩm");
      $("#plain-collection-title").text("Tất Cả Sản Phẩm");
      $("#breadcrumb-current").text("Bộ Sưu Tập");
      document.title = "Bộ Sưu Tập | Vane Vietnam";
      $('.filter-pill[data-category="all"]').addClass("active");
    }

    updateLookbookContent(activeCategory);
  }

  function renderProductCard(product) {
    var badge = "";
    var priceHtml = "";

    if (product.originalPrice) {
      badge =
        '<span class="absolute top-3 left-3 bg-gold text-white font-ui text-[9px] uppercase tracking-wider px-2.5 py-1 z-10">Giảm giá</span>';
      priceHtml =
        '<span class="text-gold font-ui text-[12px]">' +
        formatPrice(product.price) +
        '</span> <span class="text-muted/50 line-through font-ui text-[10px]">' +
        formatPrice(product.originalPrice) +
        "</span>";
    } else if (product.isNew) {
      badge =
        '<span class="absolute top-3 left-3 bg-primary text-white font-ui text-[9px] uppercase tracking-wider px-2.5 py-1 z-10">Mới</span>';
      priceHtml = '<span class="text-charcoal font-ui text-[12px]">' + formatPrice(product.price) + "</span>";
    } else {
      priceHtml = '<span class="text-charcoal font-ui text-[12px]">' + formatPrice(product.price) + "</span>";
    }

    return [
      '<a href="product-detail.html?id=' + product.id + '" class="product-card group block" data-reveal="scale">',
      '<div class="relative overflow-hidden bg-white mb-4">',
      badge,
      '<img src="' +
        product.images[0] +
        '" alt="' +
        product.name_vi +
        '" class="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105">',
      product.images[1]
        ? '<img src="' +
          product.images[1] +
          '" alt="' +
          product.name_vi +
          '" class="product-img-secondary absolute inset-0 w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105">'
        : "",
      '<div class="absolute bottom-0 inset-x-0 p-3 flex justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-400">',
      '<button type="button" class="diamond-btn add-to-cart-btn" data-id="' + product.id + '">',
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      "</button>",
      '<button type="button" class="diamond-btn toggle-wishlist-btn wishlist-btn" data-id="' +
        product.id +
        '" data-product-id="' +
        product.id +
        '">',
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      "</button>",
      "</div>",
      "</div>",
      '<p class="font-ui text-[10px] uppercase tracking-wider text-gold mb-1">' + getCategoryLabel(product.category) + "</p>",
      '<h3 class="font-serif text-lg text-primary mb-1.5 group-hover:text-gold transition-colors">' + product.name_vi + "</h3>",
      "<div>" + priceHtml + "</div>",
      "</a>",
    ].join("");
  }

  function initScrollReveal() {
    if (!("IntersectionObserver" in window)) {
      $("[data-reveal]").addClass("revealed");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll("[data-reveal]").forEach(function (element) {
      if (!element.dataset.observed) {
        observer.observe(element);
        element.dataset.observed = "true";
      }
    });
  }

  function renderGrid(products) {
    var $grid = $("#products-grid");
    var $empty = $("#products-empty");
    var $count = $("#product-count");
    var html = "";

    if (!products.length) {
      $grid.hide();
      $empty.removeClass("hidden");
      $count.text("0 sản phẩm");
      return;
    }

    $empty.addClass("hidden");
    $grid.show();
    $count.text(products.length + " sản phẩm");

    $.each(products, function (_, product) {
      html += renderProductCard(product);
    });

    $grid.html(html);
    setTimeout(initScrollReveal, 10);
  }

  function getActiveFilters() {
    var categories = [];
    var materials = [];
    var statuses = [];
    var maxPrice = parseInt($("#price-range").val(), 10) || 50000000;
    var categoryValues = {
      rings: true,
      necklaces: true,
      bracelets: true,
      earrings: true,
    };
    var statusValues = {
      new: true,
      sale: true,
      bestseller: true,
    };
    var activePill = $(".filter-pill.active").attr("data-category");

    if (activePill && activePill !== "all") {
      categories.push(activePill);
    }

    $("#filter-sidebar input:checked, #mobile-filter-panel input:checked").each(function () {
      var value = $(this).val();

      if (categoryValues[value]) {
        categories.push(value);
      } else if (statusValues[value]) {
        statuses.push(value);
      } else {
        materials.push(value);
      }
    });

    return {
      categories: unique(categories),
      materials: unique(materials),
      statuses: unique(statuses),
      maxPrice: maxPrice,
    };
  }

  function applySorting(products) {
    var sort = $("#sort-select").val();

    products.sort(function (a, b) {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name_vi.localeCompare(b.name_vi);
      if (sort === "new") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      return 0;
    });
  }

  function applyFilters() {
    var filters = getActiveFilters();
    var sourceProducts = getBaseProducts();

    filteredProducts = sourceProducts.filter(function (product) {
      if (filters.categories.length > 0 && filters.categories.indexOf(product.category) === -1) {
        return false;
      }

      if (filters.materials.length > 0 && filters.materials.indexOf(product.material) === -1) {
        return false;
      }

      if (product.price > filters.maxPrice) {
        return false;
      }

      if (filters.statuses.length > 0) {
        var matchesStatus = false;

        if (filters.statuses.indexOf("new") > -1 && product.isNew === true) {
          matchesStatus = true;
        }

        if (filters.statuses.indexOf("sale") > -1 && product.originalPrice != null) {
          matchesStatus = true;
        }

        if (filters.statuses.indexOf("bestseller") > -1 && product.isBestSeller === true) {
          matchesStatus = true;
        }

        if (!matchesStatus) {
          return false;
        }
      }

      return true;
    });

    applySorting(filteredProducts);
    renderGrid(filteredProducts);
  }

  function openSizePicker(product) {
    var optionsHtml = "";

    quickCartProduct = product;
    quickCartSelectedSize = null;

    $("#size-picker-title").text(product.name_vi || "Chọn size sản phẩm");

    if (product.sizes && product.sizes.length) {
      $.each(product.sizes, function (_, size) {
        optionsHtml += '<button type="button" class="size-picker-option" data-size="' + size + '">' + size + "</button>";
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

  $(document).on("click", ".filter-pill", function () {
    var selectedCategory = $(this).attr("data-category");

    $(".filter-pill").removeClass("active");
    $(this).addClass("active");

    currentCategory = selectedCategory === "all" ? null : selectedCategory;
    updatePageTitle(currentCategory);
    applyFilters();
  });

  $(document).on("change", "#filter-sidebar input[type='checkbox']", applyFilters);

  $(document).on("input", "#price-range", function () {
    var value = parseInt($(this).val(), 10) || 0;

    $("#price-range-value").text(formatPrice(value));
    applyFilters();
  });

  $(document).on("change", "#sort-select", applyFilters);

  $(document).on("click", "#filter-reset", function () {
    $("#filter-sidebar input[type='checkbox'], #mobile-filter-panel input[type='checkbox']").prop("checked", false);
    $("#price-range").val(50000000);
    $("#price-range-value").text("50.000.000₫");
    $(".filter-pill").removeClass("active");
    $('.filter-pill[data-category="all"]').addClass("active");
    currentCategory = null;
    updatePageTitle(currentCategory);
    applyFilters();
  });

  $(document).on("click", ".filter-group-title", function () {
    $(this).closest(".filter-group").toggleClass("collapsed");
  });

  $(document).on("click", ".size-picker-option", function () {
    $(".size-picker-option").removeClass("selected");
    $(this).addClass("selected");
    quickCartSelectedSize = $(this).attr("data-size");
  });

  $(document).on("click", "#size-picker-close", function () {
    closeSizePicker();
  });

  $(document).on("click", "#size-picker-overlay", function (event) {
    if (event.target.id === "size-picker-overlay") {
      closeSizePicker();
    }
  });

  $(document).on("click", "#size-picker-confirm", function () {
    if (!quickCartProduct) return;
    if (!quickCartSelectedSize) {
      $(document).trigger("toast", ["Bạn cần chọn size trước khi thêm vào giỏ.", "error"]);
      return;
    }

    window.VaneCart.addToCart(quickCartProduct, quickCartSelectedSize, 1);
    closeSizePicker();
  });

  $(document).on("click", ".add-to-cart-btn", function (event) {
    var id = parseInt($(this).attr("data-id"), 10);
    var product = allProducts.find(function (item) {
      return item.id === id;
    });

    event.preventDefault();
    event.stopPropagation();

    if (!product || typeof window.VaneCart === "undefined") return;

    if (product.sizes && product.sizes.length) {
      openSizePicker(product);
      return;
    }

    window.VaneCart.addToCart(product, null, 1);
  });

  $(document).on("click", "#filter-toggle-btn", function () {
    $("#mobile-filter-overlay").addClass("active");
    $("body").css("overflow", "hidden");
  });

  $(document).on("click", "#mobile-filter-close", function () {
    $("#mobile-filter-overlay").removeClass("active");
    $("body").css("overflow", "");
  });

  $(document).on("click", "#mobile-filter-apply", function () {
    applyFilters();
    $("#mobile-filter-overlay").removeClass("active");
    $("body").css("overflow", "");
  });

  $(document).on("click", "#mobile-filter-overlay", function (event) {
    if ($(event.target).is("#mobile-filter-overlay")) {
      $(this).removeClass("active");
      $("body").css("overflow", "");
    }
  });

  $.getJSON("src/data/products.json")
    .done(function (data) {
      allProducts = data;
      updatePageTitle(currentCategory);
      applyFilters();
    })
    .fail(function () {
      $("#products-grid").html('<p class="col-span-full text-center text-muted py-10">Không thể tải sản phẩm.</p>');
    });

  setTimeout(function () {
    $(".vane-zigzag-btn .zigzag-line").css("stroke-dashoffset", "0");

    setTimeout(function () {
      $(".vane-zigzag-btn .zigzag-line").css("stroke-dashoffset", "600");

      setTimeout(function () {
        $(".vane-zigzag-btn .zigzag-line").css("stroke-dashoffset", "");
      }, 800);
    }, 1300);
  }, 3000);
});
