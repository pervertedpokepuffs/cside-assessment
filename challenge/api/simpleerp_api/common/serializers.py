from rest_framework import serializers
from ..common import models


class ItemSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.Item
        fields = ['url', 'code', 'name']


class ItemPurchaseOrderReadSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = models.ItemPurchaseOrder
        fields = ['purchase_order', 'item', 'quantity']


class ItemPurchaseOrderWriteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.ItemPurchaseOrder
        fields = ['item', 'quantity']


class InventoryLotReadSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.InventoryLot
        fields = ['url', 'item', 'lot_number', 'quantity', 'purchase_order', 'created_at']
        read_only_fields = ['url', 'item', 'lot_number']


class InventoryLotWriteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.InventoryLot
        fields = ['purchase_order', 'item', 'quantity']
        extra_kwargs = {
            'purchase_order': {'required': False}
        }

    def create(self, validated_data):
        if not validated_data['purchase_order'].status.name == 'PENDING_RECEIVE':
            raise Exception(
                'This purchase order is not pending to receive any items.')
        if not validated_data['purchase_order'].items.filter(id=validated_data['item'].id).exists():
            raise models.Item.DoesNotExist(
                "The item does not exist for this purchase order.")
        try:
            latest_lot_number = models.InventoryLot.objects.filter(
                item=validated_data['item']).latest('created_at').lot_number
        except:
            latest_lot_number = 0
        il = models.InventoryLot.objects.create(
            **validated_data, lot_number=latest_lot_number + 1)
        return il

    def update(self, instance, validated_data):
        po = models.InventoryLot(**validated_data, id=instance.id)
        # Limit update to row quantity.
        instance.save(update_fields=['quantity'])
        return instance


class PurchaseOrderReadSerializer(serializers.HyperlinkedModelSerializer):
    items = ItemPurchaseOrderReadSerializer(
        source="itempurchaseorder_set", many=True)
    status = serializers.CharField(source='status.name')
    inventory_lots = InventoryLotReadSerializer(
        source="inventorylot_set", many=True)

    class Meta:
        model = models.PurchaseOrder
        fields = ['url', 'uuid', 'status', 'items',
                  'inventory_lots', 'created_at']


class PurchaseOrderWriteSerializer(serializers.ModelSerializer):
    items = ItemPurchaseOrderWriteSerializer(
        source='itempurchaseorder_set', many=True)

    class Meta:
        model = models.PurchaseOrder
        fields = ['items', 'status']
        extra_kwargs = {
            'status': {'required': False}
        }

    def create(self, validated_data):
        items = validated_data.pop('itempurchaseorder_set')
        pending_approved_status = models.PurchaseOrderStatus.objects.get(
            name="PENDING_APPROVAL")
        purchase_order = models.PurchaseOrder.objects.create(
            status=pending_approved_status)
        return purchase_order.create_or_update_itempurchaseorder(items)

    def update(self, instance, validated_data):
        items = validated_data.pop('itempurchaseorder_set')
        instance.create_or_update_itempurchaseorder(items)
        po = models.PurchaseOrder(uuid=instance.uuid, **validated_data)
        # Update only the status column.
        po.save(['status'])
        return instance
