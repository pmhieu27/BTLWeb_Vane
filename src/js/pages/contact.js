/**
 * VANE VIETNAM - CONTACT PAGE LOGIC
 * Tệp xử lý kiểm duyệt dữ liệu Form và hiệu ứng cục bộ trang Liên Hệ
 */

$(document).ready(function() {
  
  // 1. CHỈ CHO PHÉP NHẬP SỐ VÀO Ô ĐIỆN THOẠI (Chặn hoàn toàn chữ cái/ký tự lạ)
  $('#form-phone').on('keypress', function(e) {
    var charCode = (e.which) ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault();
    }
  });

  // 2. LOGIC KIỂM TRA VALIDATION KHI SUBMIT TIN NHẮN
  $('#contact-form').on('submit', function(e) {
    var isValid = true;
    
    // Biểu thức chính quy (Regex) check cấu trúc email tiêu chuẩn toàn cầu
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Biểu thức chính quy check chuẩn xác đủ 10 ký tự số tự nhiên
    var phoneRegex = /^[0-9]{10}$/;

    // Reset toàn bộ thông báo lỗi cũ trước khi check mới
    $('.error-msg').hide();
    $('input, textarea').removeClass('input-error');

    // Kiểm tra Họ và tên
    if ($.trim($('#form-name').val()) === '') {
      $('#form-name').addClass('input-error');
      $('#error-name').fadeIn();
      isValid = false;
    }

    // Kiểm tra cấu trúc Email
    var emailVal = $.trim($('#form-email').val());
    if (emailVal === '' || !emailRegex.test(emailVal)) {
      $('#form-email').addClass('input-error');
      $('#error-email').fadeIn();
      isValid = false;
    }

    // Kiểm tra cấu trúc số điện thoại (Chỉ gồm số và bắt buộc đủ 10 số)
    var phoneVal = $.trim($('#form-phone').val());
    if (phoneVal === '' || !phoneRegex.test(phoneVal)) {
      $('#form-phone').addClass('input-error');
      $('#error-phone').fadeIn();
      isValid = false;
    }

    // Kiểm tra nội dung lời nhắn
    if ($.trim($('#form-message').val()) === '') {
      $('#form-message').addClass('input-error');
      $('#error-message').fadeIn();
      isValid = false;
    }

    // Nếu bất kỳ trường dữ liệu nào vi phạm, chặn không cho submit form
    if (!isValid) {
      e.preventDefault();
      // Cuộn nhẹ màn hình đến vị trí lỗi đầu tiên để khách hàng dễ nhận biết
      $('html, body').animate({
        scrollTop: $('.input-error').first().offset().top - 150
      }, 400);
    } else {
      // Xử lý gửi tin nhắn thành công
      alert('Cảm ơn bạn. Lời nhắn của bạn đã được gửi thành công đến Vane Vietnam!');
    }
  });
});