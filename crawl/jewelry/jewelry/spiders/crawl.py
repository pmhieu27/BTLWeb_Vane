# pyrefly: ignore [missing-import]
import json
import scrapy
from jewelry.items import JewelryItem


class CrawlSpider(scrapy.Spider):
    name = "crawl"
    allowed_domains = ["www.messika.com", "messika.com"]
    start_urls = ["https://www.messika.com/en"]

    # BỘ ĐỆM LƯU TẠM THỜI BIẾN THỂ ĐỂ KIỂM TRA ĐỦ 3 MÀU
    product_buffer = {}

    # Chống trùng tuyệt đối khi xuất file đầu ra
    scraped_ids = set()

    custom_settings = {
        "FEEDS": {
            "messika_products.json": {
                "format": "json",
                "encoding": "utf8",
                "store_empty": False,
                "fields": None,
                "indent": 4,
            },
        },
        "FEED_EXPORT_ENCODING": "utf-8",
    }

    def parse(self, response):
        # 1. BỔ SUNG: Cấu trúc lại danh sách dưới dạng Dictionary chứa cả Link và Type thực tế
        categories_config = [
            {
                "link": "/en/jewelry/categories/diamond-single-earrings",
                "type": "Single Earring",
            },
            {
                "link": "/en/jewelry/categories/diamond-earring",
                "type": "Earring",
            },
            {
                "link": "/en/jewelry/categories/diamond-necklace",
                "type": "Necklace",
            },
            {"link": "/en/jewelry/categories/diamond-ring", "type": "Ring"},
            {
                "link": "/en/jewelry/categories/diamond-bracelet",
                "type": "Bracelet",
            },
        ]

        for item in categories_config:
            # Truyền dữ liệu 'type' vào meta để chuyển tiếp sang các hàm sau
            yield response.follow(
                url=item["link"],
                callback=self.parse_category,
                meta={"product_type": item["type"]},
            )

    def parse_category(self, response):
        # Nhận lại trường product_type từ hàm parse
        product_type = response.meta.get("product_type")

        self.logger.info(
            f"Đang xử lý danh mục: {response.url} | Loại: {product_type}"
        )
        category_name = response.url.split("/")[-1]
        product_link = response.xpath(
            "//a[contains(@class, 'block')]/@data-href-anon"
        ).getall()

        for link in product_link:
            if link == "https://www.messika.com/en/" or not link:
                continue
            # Tiếp tục truyền product_type sang tầng phân tách màu sắc
            yield response.follow(
                url=link,
                callback=self.parse_product,
                meta={"product_type": product_type},
            )

    def generate_variant_urls(self, url):
        url_lower = url.lower()
        color_configs = {
            "yg": ("-yellow-gold-", "-yg"),
            "pg": ("-pink-gold-", "-pg"),
            "wg": ("-white-gold-", "-wg"),
        }

        current_key = None
        for key, (text, suffix) in color_configs.items():
            if text in url_lower and url_lower.endswith(suffix):
                current_key = key
                break

        result_links = set()
        if current_key:
            curr_text, curr_suffix = color_configs[current_key]
            for key, (target_text, target_suffix) in color_configs.items():
                new_url = url_lower.replace(curr_text, target_text)
                if new_url.endswith(curr_suffix):
                    new_url = new_url[: -len(curr_suffix)] + target_suffix
                result_links.add(new_url)
        else:
            result_links.add(url_lower)

        return result_links

    def parse_product(self, response):
        # Nhận lại trường product_type từ hàm parse_category
        product_type = response.meta.get("product_type")

        product_links = self.generate_variant_urls(response.url)
        for p_link in product_links:
            # Tiếp tục gài product_type vào meta của từng request biến thể màu gửi sang parse_detail
            yield response.follow(
                url=p_link,
                callback=self.parse_detail,
                dont_filter=True,
                errback=self.handle_error,
                meta={"product_type": product_type},
            )

    def handle_error(self, failure):
        self.logger.debug(
            f"Biến thể màu không tồn tại (404): {failure.request.url}"
        )

    def parse_detail(self, response):
        # ĐÍCH ĐẾN CUỐI CÙNG: Nhặt product_type từ meta ra để đóng gói dữ liệu
        product_type = response.meta.get("product_type", "NA")

        raw_text = response.xpath(
            '//script[@class="gtm-data" and @type="application/json"]/text()'
        ).get()
        album_images = list(
            dict.fromkeys(
                [
                    img.strip()
                    for img in response.xpath(
                        "//div[contains(@class, 'swiper-slide')]//img/@src"
                    ).getall()
                    if img
                ]
            )
        )

        raw_details = response.xpath(
            "string(//div[@id='product-description-modal-details']//p)"
        ).get()
        details = (
            raw_details.replace("\r\r\n", "\n").strip() if raw_details else "NA"
        )

        if raw_text:
            try:
                data = json.loads(raw_text.strip())
                item_id = data.get("item_id", "NA")

                if item_id in self.scraped_ids:
                    return

                if "-" in item_id:
                    base_id = item_id.split("-")[0]
                    color_suffix = item_id.split("-")[-1].lower()
                else:
                    return

                item_color = (
                    "yg"
                    if color_suffix == "yg"
                    else "pg" if color_suffix == "pg" else "wg"
                )

                item_name = data.get("item_name", "NA")
                price = data.get("price", "NA")
                gender = data.get("item_gender", "NA")

                category_list = {}
                if data.get("item_category"):
                    category_list[1] = data.get("item_category")
                for i in range(2, 6):
                    key_name = f"item_category{i}"
                    if data.get(key_name):
                        category_list[i] = data.get(key_name)

                # Khởi tạo đối tượng lưu trữ kèm trường dữ liệu mở rộng
                current_item = JewelryItem(
                    _id=item_id,
                    name_vi="NA",
                    name_en=item_name,
                    type=product_type,
                    catergory=category_list,
                    price=price,
                    color=item_color,
                    size=data.get("size", "NA"),
                    img=album_images,
                    details=details,
                    item_gender=gender,
                    url=response.url,
                )

                if base_id not in self.product_buffer:
                    self.product_buffer[base_id] = {}

                self.product_buffer[base_id][item_color] = current_item

                if len(self.product_buffer[base_id]) == 3:
                    self.logger.info(
                        f" Thành công! Sản phẩm {base_id} có đủ 3 màu. Tiến hành xuất file..."
                    )
                    for color_key in ["yg", "wg", "pg"]:
                        item_to_yield = self.product_buffer[base_id][color_key]
                        self.scraped_ids.add(item_to_yield["_id"])
                        yield item_to_yield

                    del self.product_buffer[base_id]

            except json.JSONDecodeError as e:
                self.logger.error(f"Lỗi cấu trúc JSON: {e}")