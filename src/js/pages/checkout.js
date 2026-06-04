/**
 * pages/checkout.js
 */

$(function () {
    "use strict";

    // =================================
    // FORMAT PRICE
    // =================================
    function formatPrice(n) {
        return Number(n)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
    }

    // =================================
    // RENDER ĐƠN HÀNG (Hỗ trợ Giỏ hàng & Mua ngay)
    // =================================
    function renderOrderSummary() {
        let items = [];
        const buyNowItem = sessionStorage.getItem("buyNowItem");

        if (buyNowItem) {
            // Trường hợp 1: Mua ngay từ trang Chi tiết sản phẩm
            items = [JSON.parse(buyNowItem)];
        } else {
            // Trường hợp 2: Mua từ Giỏ hàng tổng
            if (typeof window.VaneCart !== "undefined") {
                items = window.VaneCart.getAll();
            }
        }

        const $container = $("#checkout-items");

        if (!items || !items.length) {
            $container.html(`
                <p class="text-center text-muted py-4">
                    Chưa có tác phẩm nào trong đơn hàng
                </p>
            `);
            $("#checkout-subtotal").text("0₫");
            $("#checkout-total").text("0₫");
            return;
        }

        $.getJSON("src/data/products.json").done(function (products) {
            let html = "";
            let total = 0;

            items.forEach(function (item) {
                const product = products.find(p => p.id == item.id);
                if (!product) return;

                const qty = item.qty || 1;
                const subtotal = product.price * qty;
                total += subtotal;

                html += `
                    <div class="flex gap-3 py-4 border-b border-ivory">
                        <img 
                            src="${product.images[0]}" 
                            alt="${product.name_vi}" 
                            class="w-16 h-16 object-cover rounded-sm"
                        >
                        <div class="flex-1">
                            <div class="font-serif text-sm text-charcoal tracking-wide">
                                ${product.name_vi}
                            </div>
                            <div class="text-[11px] text-silver mt-1 uppercase tracking-wider">
                                Số lượng: ${qty}
                            </div>
                            <div class="text-[11px] text-silver">
                                Đơn giá: ${formatPrice(product.price)}
                            </div>
                        </div>
                        <div class="font-sans text-xs font-medium tracking-wider text-charcoal">
                            ${formatPrice(subtotal)}
                        </div>
                    </div>
                `;
            });

            $container.html(html);
            $("#checkout-subtotal").text(formatPrice(total));
            $("#checkout-total").text(formatPrice(total));
            $("#qrAmount").text(formatPrice(total));
        });
    }

    renderOrderSummary();

    // =================================
    // QUẢN LÝ THÔNG BÁO LỖI VALIDATION
    // =================================
    function hideErrors() {
        $("#fullname-error, #phone-error, #email-error, #address-error, #city-error, #district-error, #ward-error").addClass("hidden");
    }

    function validateForm() {
        hideErrors();
        let isValid = true;

        const fullname = $("#fullname").val().trim();
        const phone = $("#phone").val().trim();
        const email = $("#email").val().trim();
        const address = $("#address").val().trim();
        const city = $("#city").val();
        const district = $("#district").val();
        const ward = $("#ward").val();

        if (!fullname) { $("#fullname-error").removeClass("hidden"); isValid = false; }
        if (!/^0\d{9}$/.test(phone)) { $("#phone-error").removeClass("hidden"); isValid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("#email-error").removeClass("hidden"); isValid = false; }
        if (!address) { $("#address-error").removeClass("hidden"); isValid = false; }
        if (!city) { $("#city-error").removeClass("hidden"); isValid = false; }
        if (!district) { $("#district-error").removeClass("hidden"); isValid = false; }
        if (!ward) { $("#ward-error").removeClass("hidden"); isValid = false; }

        return isValid;
    }

    // Gắn sự kiện xóa lỗi nhanh khi khách hàng tương tác nhập liệu
    $("#fullname, #address").on("blur", function () {
        if ($(this).val().trim()) {
            $(`#${$(this).attr('id')}-error`).addClass("hidden");
        }
    });
    $("#phone").on("blur", function () {
        if (/^0\d{9}$/.test($(this).val().trim())) { $("#phone-error").addClass("hidden"); }
    });
    $("#email").on("blur", function () {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($(this).val().trim())) { $("#email-error").addClass("hidden"); }
    });
    $("#city, #district, #ward").on("change", function () {
        if ($(this).val()) { $(`#${$(this).attr('id')}-error`).addClass("hidden"); }
    });

    function updateQrAmount() {
        const total = $("#checkout-total").text();
        $("#qrAmount").text(total);
    }

    // =================================
    // HOÀN THÀNH ĐƠN HÀNG & ĐIỀU HƯỚNG
    // =================================
    function completeOrder() {
        // Lưu lại giá trị tổng đơn để hiển thị bên trang thành công nếu cần
        sessionStorage.setItem("lastOrderTotal", $("#checkout-total").text());

        const isBuyNow = sessionStorage.getItem("buyNowItem") !== null;

        if (isBuyNow) {
            // Nếu mua ngay: Chỉ xóa token mua ngay, giữ nguyên giỏ hàng persistent
            sessionStorage.removeItem("buyNowItem");
        } else {
            // SỬA LỖI 1: Bọc try-catch bảo hiểm, nếu xóa giỏ hàng lỗi thì vẫn bỏ qua để ưu tiên nhảy trang
            try {
                if (typeof window.VaneCart !== "undefined" && typeof window.VaneCart.clear === "function") {
                    window.VaneCart.clearCart();
                }
            } catch (error) {
                console.error("Lỗi xóa giỏ hàng ngầm đã được bỏ qua để chạy lệnh chuyển trang:", error);
            }
        }

        // SỬA LỖI 2: Đổi từ dấu gạch dưới thành dấu gạch nối "payment-success.html" chuẩn xác theo file của bồ
        window.location.href = "payment_success.html";
    }

    // =================================
    // NÚT KÍCH HOẠT THANH TOÁN CHÍNH
    // =================================
    $("#checkout-btn").on("click", function (e) {
        e.preventDefault();

        if (!validateForm()) return;

        const paymentMethod = $("input[name='payment']:checked").val();

        // TRƯỜNG HỢP A: THANH TOÁN THẺ -> BẬT DIALOG THẺ KHÁCH HÀNG
        if (paymentMethod === "card") {
            const cardModal = document.getElementById("cardPaymentModal");
            if (cardModal) cardModal.showModal();
        } 
        // TRƯỜNG HỢP B: THANH TOÁN QR -> ĐẾM NGƯỢC 5 GIÂY XỊN MỊN RỒI TỰ CHUYỂN TRANG
        else {
            updateQrAmount();
            const qrModal = document.getElementById("qrPaymentModal");
            
            if (qrModal) {
                qrModal.showModal();

                let secondsLeft = 5;
                // Nếu trong modal QR của bồ có thẻ <span id="countdownText"></span> thì nó sẽ tự nhảy số lùi cực pro
                $("#countdownText").text(secondsLeft); 

                const qrInterval = setInterval(function () {
                    secondsLeft--;
                    $("#countdownText").text(secondsLeft);

                    if (secondsLeft <= 0) {
                        clearInterval(qrInterval);
                        qrModal.close();
                        completeOrder();
                    }
                }, 1000);
            }
        }
    });

    // =================================
    // XÁC NHẬN THANH TOÁN THẺ
    // =================================
    // SỬA LỖI 3: Thêm tham số (e) và e.preventDefault() để xích cổ hiện tượng tự reload trang ngầm của form
    $("#confirmCardPayment").on("click", function (e) {
        e.preventDefault(); 

        const cardNumber = $("#cardNumber").val().trim();

        if (!cardNumber) {
            alert("Vui lòng nhập số tài khoản ngân hàng.");
            return;
        }

        if (!/^\d{10,15}$/.test(cardNumber)) {
            alert("Số tài khoản không hợp lệ (Phải từ 10 đến 15 chữ số).");
            return;
        }

        const cardModal = document.getElementById("cardPaymentModal");
        if (cardModal) cardModal.close();

        // Ấn xác nhận thành công là bốc đầu qua trang success luôn
        completeOrder();
    });

    // =================================
    // ĐÓNG POPUP THỦ CÔNG
    // =================================
    $(".close-modal").on("click", function (e) {
        e.preventDefault();
        $(this).closest("dialog")[0].close();
    });

});