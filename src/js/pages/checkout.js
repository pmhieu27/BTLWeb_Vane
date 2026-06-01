/**
 * pages/checkout.js
 */

$(function () {
    "use strict";

    // =========================
    // FORMAT PRICE
    // =========================
    function formatPrice(n) {
        return Number(n)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
    }

    // =========================
    // RENDER ĐƠN HÀNG
    // =========================
    function renderOrderSummary() {

        let items = [];

        const buyNowItem =
            sessionStorage.getItem("buyNowItem");

        if (buyNowItem) {

            items = [
                JSON.parse(buyNowItem)
            ];

        } else {

            if (
                typeof window.VaneCart !==
                "undefined"
            ) {
                items =
                    window.VaneCart.getAll();
            }
        }

        const $container =
            $("#checkout-items");

        if (!items || !items.length) {

            $container.html(`
                <p class="text-center text-muted">
                    Chưa có sản phẩm nào
                </p>
            `);

            $("#checkout-subtotal")
                .text("0₫");

            $("#checkout-total")
                .text("0₫");

            return;
        }

        $.getJSON(
            "src/data/products.json"
        ).done(function (products) {

            let html = "";
            let total = 0;

            items.forEach(function (item) {

                const product =
                    products.find(
                        p => p.id == item.id
                    );

                if (!product) return;

                const qty =
                    item.qty || 1;

                const subtotal =
                    product.price * qty;

                total += subtotal;

                html += `
                    <div class="flex gap-3 py-4 border-b">

                        <img
                            src="${product.images[0]}"
                            alt="${product.name_vi}"
                            class="w-16 h-16 object-cover"
                        >

                        <div class="flex-1">

                            <div class="font-semibold">
                                ${product.name_vi}
                            </div>

                            <div class="text-xs text-muted mt-1">
                                Số lượng: ${qty}
                            </div>

                            <div class="text-xs text-muted">
                                Đơn giá:
                                ${formatPrice(product.price)}
                            </div>

                        </div>

                        <div class="font-semibold">
                            ${formatPrice(subtotal)}
                        </div>

                    </div>
                `;
            });

            $container.html(html);

            $("#checkout-subtotal")
                .text(formatPrice(total));

            $("#checkout-total")
                .text(formatPrice(total));

            $("#qrAmount")
                .text(formatPrice(total));
        });
    }

    renderOrderSummary();
// =========================
// ẨN TẤT CẢ THÔNG BÁO LỖI
// =========================
function hideErrors() {

    $("#fullname-error").addClass("hidden");
    $("#phone-error").addClass("hidden");
    $("#email-error").addClass("hidden");
    $("#address-error").addClass("hidden");
    $("#city-error").addClass("hidden");
    $("#district-error").addClass("hidden");
    $("#ward-error").addClass("hidden");

}
    // =========================
    // VALIDATE FORM
    // =========================
    function validateForm() {
        hideErrors() 
        let isValid = true;

        const fullname =
            $("#fullname").val().trim();

        const phone =
            $("#phone").val().trim();

        const email =
            $("#email").val().trim();

        const address =
            $("#address").val().trim();

        const city =
            $("#city").val();

        const district =
            $("#district").val();

        const ward =
            $("#ward").val();

        if (!fullname) {

            $("#fullname-error")
                .removeClass("hidden");

            isValid = false;
        }

        if (!/^0\d{9}$/.test(phone)) {

            $("#phone-error")
                .removeClass("hidden");

            isValid = false;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            $("#email-error")
                .removeClass("hidden");

            isValid = false;
        }

        if (!address) {

            $("#address-error")
                .removeClass("hidden");

            isValid = false;
        }

        if (!city) {

            $("#city-error")
                .removeClass("hidden");

            isValid = false;
        }

        if (!district) {

            $("#district-error")
                .removeClass("hidden");

            isValid = false;
        }

        if (!ward) {

            $("#ward-error")
                .removeClass("hidden");

            isValid = false;
        }

        return isValid;
    }

    // =========================
    // CẬP NHẬT TIỀN QR
    // =========================
    function updateQrAmount() {

        const total =
            $("#checkout-total").text();

        $("#qrAmount")
            .text(total);
    }
    //xóa lỗi ô họ tên
    $("#fullname").on("blur", function () {

    const value = $(this).val().trim();

    if (value) {
        $("#fullname-error").addClass("hidden");
    }
});
//xóa lỗi ô sđt
$("#phone").on("blur", function () {

    const phone = $(this).val().trim();

    if (/^0\d{9}$/.test(phone)) {
        $("#phone-error").addClass("hidden");
    }
});
//xóa lỗi ô email
$("#email").on("blur", function () {

    const email = $(this).val().trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $("#email-error").addClass("hidden");
    }
});
//xóa lỗi ô địa chỉ
$("#address").on("blur", function () {

    if ($(this).val().trim()) {
        $("#address-error").addClass("hidden");
    }
});
//xóa lỗi các dropdown
$("#city").on("change", function () {

    if ($(this).val()) {
        $("#city-error").addClass("hidden");
    }
});

$("#district").on("change", function () {

    if ($(this).val()) {
        $("#district-error").addClass("hidden");
    }
});

$("#ward").on("change", function () {

    if ($(this).val()) {
        $("#ward-error").addClass("hidden");
    }
});
    // =========================
    // HOÀN THÀNH ĐƠN HÀNG
    // =========================
    function completeOrder() {

        sessionStorage.setItem(
            "lastOrderTotal",
            $("#checkout-total").text()
        );

        sessionStorage.removeItem(
            "buyNowItem"
        );

        if (
            typeof window.VaneCart !==
            "undefined"
        ) {

            window.VaneCart.clear();
        }

        window.location.href =
            "payment-success.html";
    }

    // =========================
    // NÚT THANH TOÁN
    // =========================
    $("#checkout-btn").on(
        "click",
        function (e) {

            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            const paymentMethod =
                $("input[name='payment']:checked")
                    .val();

            // THANH TOÁN THẺ
            if (
                paymentMethod === "card"
            ) {

                document
                    .getElementById(
                        "cardPaymentModal"
                    )
                    .showModal();
            }

            // THANH TOÁN QR
            else {

                updateQrAmount();

                const qrModal =
                    document.getElementById(
                        "qrPaymentModal"
                    );

                qrModal.showModal();

                setTimeout(function () {

                    qrModal.close();

                    completeOrder();

                }, 5000);
            }
        }
    );

    // =========================
    // XÁC NHẬN THANH TOÁN THẺ
    // =========================
    $("#confirmCardPayment").on(
        "click",
        function () {

            const cardNumber =
                $("#cardNumber")
                    .val()
                    .trim();

            if (!cardNumber) {

                alert(
                    "Vui lòng nhập số tài khoản."
                );

                return;
            }

            if (
                !/^\d{10,15}$/
                    .test(cardNumber)
            ) {

                alert(
                    "Số tài khoản không hợp lệ."
                );

                return;
            }

            document
                .getElementById(
                    "cardPaymentModal"
                )
                .close();

            completeOrder();
        }
    );

});
// =========================
    // Đóng popup
    // =========================
  // =========================
    $(".close-modal").on("click", function () {

    $(this)
        .closest("dialog")[0]
        .close();

});