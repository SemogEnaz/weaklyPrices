from modules.item import Item

class Catagory:

    def __init__(self, name, link):
        self.name = name
        self.link = link
        self.items = []

    def add_item(self, item: Item):
        self.items.append(item)