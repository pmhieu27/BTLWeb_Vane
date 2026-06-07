# Vane Vietnam — Trang Sức Cao Cấp

Website thương mại điện tử cho thương hiệu trang sức cao cấp Vane Vietnam. Thiết kế theo phong cách Apple-minimalist, light luxury với hiệu ứng scroll-triggered animations.

## Tech Stack

- **HTML5** — Semantic markup
- **Tailwind CSS v3** — Utility-first CSS framework
- **PostCSS + Autoprefixer** — CSS processing
- **jQuery** — DOM manipulation & component loading
- **Google Fonts** — Bodoni Moda, Cormorant Garamond, Inter, Montserrat

## Cài đặt

```bash
npm install
```

## Chạy trong quá trình phát triển

Mở **2 terminal** và chạy song song:

**Terminal 1** — Khởi động web server (tự động reload khi sửa file):
```bash
npm start
```
> Server chạy tại **http://localhost:3005** — tự động refresh browser khi bạn sửa file HTML/CSS/JS.

**Terminal 2** — Tailwind CSS watch mode (tự rebuild CSS):
```bash
npm run dev
```

Lệnh trên sẽ **tự động theo dõi** thay đổi CSS và rebuild `output.css` mỗi khi bạn lưu file.

Sau đó mở `index.html` bằng **Live Server** (extension VS Code) hoặc bất kỳ local server nào.

## Build CSS (production)

```bash
npm run build
```

Build minified CSS cho production.

## Cấu trúc thư mục

```
├── index.html                # Trang chủ
├── collections.html          # Danh sách sản phẩm
├── product-detail.html       # Chi tiết sản phẩm
├── about.html                # Về chúng tôi
├── services.html             # Chính sách & dịch vụ
├── contact.html              # Liên hệ
├── account.html              # Đăng nhập / Đăng ký
├── wishlist.html             # Sản phẩm yêu thích
├── checkout.html             # Thanh toán
├── config/
│   └── tailwind.config.js    # Cấu hình Tailwind (fonts, colors, shadows...)
└── src/
    ├── css/
    │   ├── input.css          # Entry point CSS (@tailwind directives + import base)
    │   ├── base.css           # Google Fonts import + base reset
    │   ├── custom.css         # Import các component CSS
    │   ├── output.css         # File CSS đã build (KHÔNG sửa trực tiếp)
    │   └── components/        # CSS cho từng component
    │       ├── header.css     # Header states, breadcrumb
    │       ├── animations.css # Reveal, parallax, shimmer effects
    │       ├── luxury-effects.css
    │       ├── products.css   # Product card styles
    │       ├── cart.css       # Cart overlay
    │       ├── filters.css    # Collection filters
    │       ├── forms.css      # Form inputs, selects
    │       └── ui.css         # Buttons, glass cards, dividers
    ├── js/
    │   ├── app.js             # Orchestrator (load components + scripts)
    │   ├── core/              # Scripts chạy mọi trang (header, scroll, transition)
    │   ├── modules/           # Modules dùng chung (cart, wishlist, toast...)
    │   └── pages/             # Scripts riêng từng trang
    ├── components/            # HTML components (header, footer, cart-overlay)
    ├── images/                # Hình ảnh sản phẩm & hero
    └── data/
        └── products.json      # Dữ liệu sản phẩm
```

## Design Tokens

Tất cả design tokens được cấu hình trong `tailwind.config.js`:

| Token | Giá trị |
|-------|---------|
| **Font Logo** | Bodoni Moda |
| **Font Heading** | Cormorant Garamond |
| **Font Body** | Inter |
| **Font UI** | Montserrat |
| **Gold** | `#C9A96E` |
| **Primary** | `#0A0A0A` |
| **Ivory** | `#FAF8F5` |
| **Charcoal** | `#333333` |
