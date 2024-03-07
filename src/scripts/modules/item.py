
class Item:

    def __init__(self, name: str, old_price: float, new_price: float, link: str):
        self.name = name    # Lable for item
        self.old_price = old_price
        self.new_price = new_price
        self.link = link

    def get_saving(self) -> int:
        return (self.old_price - self.new_price)