from django.db import models
from uuid import uuid4

# Create your models here.


class Item(models.Model):
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=50, null=True)
    purchase_orders = models.ManyToManyField(
        'PurchaseOrder', through='ItemPurchaseOrder')
    created_at = models.DateField(auto_now_add=True, null=False, blank=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.name


class PurchaseOrderStatus(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class PurchaseOrder(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    status = models.ForeignKey(
        PurchaseOrderStatus, on_delete=models.SET_NULL, null=True)
    items = models.ManyToManyField(Item, through='ItemPurchaseOrder')
    created_at = models.DateField(auto_now_add=True)
    
    def create_or_update_itempurchaseorder(self, item_quantity_pairs = []):
        """Create or update ItemPurchaseOrder on this row.

        Args:
            item_quantity_pairs ((Item, int)[], optional): List containing tuples of item and quantity count. Defaults to [].

        Returns:
            PurchaseOrder: self
        """
        for item in item_quantity_pairs:
            i = ItemPurchaseOrder.objects.get_or_create(purchase_order=self, item=item['item'])[0]
            i.quantity = item['quantity']
            i.save()
        return self

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.uuid}'


class InventoryLot(models.Model):
    lot_number = models.IntegerField()
    item = models.ForeignKey(Item, on_delete=models.RESTRICT)
    quantity = models.IntegerField()
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.SET_NULL, null=True)
    created_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.item} Lot {self.lot_number}'


class ItemPurchaseOrder(models.Model):
    purchase_order = models.ForeignKey(
        'PurchaseOrder', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.RESTRICT)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.purchase_order}/{self.item} - {self.quantity}'
