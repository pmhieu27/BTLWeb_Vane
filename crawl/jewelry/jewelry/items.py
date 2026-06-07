# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class JewelryItem(scrapy.Item):
    # define the fields for your item here like:
    _id = scrapy.Field()
    name_vi = scrapy.Field()
    name_en = scrapy.Field()
    type = scrapy.Field()
    catergory = scrapy.Field()
    price = scrapy.Field()
    color = scrapy.Field() #wg, yg, pg
    size = scrapy.Field()
    img = scrapy.Field()
    details = scrapy.Field()
    item_gender = scrapy.Field()
    url = scrapy.Field()
    pass
