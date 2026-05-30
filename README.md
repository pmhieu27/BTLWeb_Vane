# Vane Vietnam — Trang Sức Cao Cấp

## Cài đặt

```bash
npm install
```

## Chạy trong quá trình phát triển

```bash
npm run dev
```

Lệnh trên sẽ **tự động theo dõi** thay đổi CSS và rebuild `output.css` mỗi khi bạn lưu file.

Sau đó mở `index.html` bằng **Live Server** (extension VS Code) hoặc bất kỳ local server nào.

## Build CSS (1 lần)

```bash
npm run build
```

## Cấu trúc thư mục

```
├── index.html              # Trang chủ
├── collections.html        # Danh sách sản phẩm
├── product-detail.html     # Chi tiết sản phẩm
├── about.html              # Về chúng tôi
├── services.html           # Dịch vụ
├── contact.html            # Liên hệ
├── account.html            # Đăng nhập / Đăng ký
├── wishlist.html            # Sản phẩm yêu thích
├── checkout.html            # Thanh toán
└── src/
    ├── css/
    │   ├── input.css         # Entry point CSS (import base + custom)
    │   ├── base.css          # Design tokens (fonts, colors)
    │   ├── custom.css        # Import các component CSS
    │   ├── output.css        # File CSS đã build (KHÔNG sửa trực tiếp)
    │   └── components/       # CSS cho từng component
    ├── js/
    │   ├── app.js            # Orchestrator (load components + scripts)
    │   ├── core/             # Scripts chạy mọi trang (header, scroll, transition)
    │   ├── modules/          # Modules dùng chung (cart, wishlist, toast...)
    │   └── pages/            # Scripts riêng từng trang
    ├── components/           # HTML components (header, footer, cart-overlay)
    └── data/
        └── products.json     # Dữ liệu sản phẩm
```
