/**
 * pages/home.js — Homepage-specific functionality
 * Appointment form handler, scroll indicator
 */
$(function () {
  "use strict";

  // --- Appointment Form ---
  var $appointmentForm = $("#appointment-form");
  if ($appointmentForm.length) {
    $appointmentForm.on("submit", function (e) {
      e.preventDefault();

      var $btn = $(this).find("button[type='submit']");
      var originalText = $btn.text();
      $btn.text("Đang gửi...").prop("disabled", true);

      // Simulate form submission
      setTimeout(function () {
        $btn.text("Đã gửi thành công ✓").addClass("bg-green-600 border-green-600");
        $(document).trigger("toast", ["Đặt lịch hẹn thành công! Chúng tôi sẽ liên hệ bạn sớm.", "success"]);

        setTimeout(function () {
          $btn.text(originalText).prop("disabled", false).removeClass("bg-green-600 border-green-600");
          $appointmentForm[0].reset();
        }, 3000);
      }, 1500);
    });
  }

  // --- Scroll indicator click ---
  $(document).on("click", ".scroll-indicator", function (e) {
    e.preventDefault();
    var $nextSection = $(this).closest("section").next("section");
    if ($nextSection.length) {
      var topPosition = $nextSection.offset().top - 80;
      $("html, body").stop().animate({ scrollTop: topPosition }, 800, "swing");
    }
  });
});


//-- POPUP JS ----
const popup = document.getElementById('collectionPopup');
const closeBtn = document.getElementById('closePopup');

closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
});
//--Đóng popup khi bấm ra ngoài
window.addEventListener('click', (e) => {
    if(e.target === popup){
        popup.style.display = 'none';
    }
});
//--Đóng popup bằng phím ESC
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
        popup.style.display = 'none';
    }
});