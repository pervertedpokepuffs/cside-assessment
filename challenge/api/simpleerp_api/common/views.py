from django.shortcuts import render
from django.db.models import Sum
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..common import models, serializers

# Create your views here.


class ReadWriteSerializerMixin:
    read_serializer = None
    write_serializer = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return self.write_serializer
        return self.read_serializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = models.Item.objects.all()
    serializer_class = serializers.ItemSerializer
    permission_classes = [permissions.AllowAny]


class PurchaseOrderViewSet(ReadWriteSerializerMixin, viewsets.ModelViewSet):
    queryset = models.PurchaseOrder.objects.all()
    read_serializer = serializers.PurchaseOrderReadSerializer
    write_serializer = serializers.PurchaseOrderWriteSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def reject_order(self, request, pk=None):
        po = self.get_object()
        po.status = models.PurchaseOrderStatus.objects.filter(
            name='REJECTED').get()
        po.save()
        return Response({'message': 'Purchase order rejected.'})
    
    @action(detail=True, methods=['get'])
    def approve_order(self, request, pk=None):
        po = self.get_object()
        po.status = models.PurchaseOrderStatus.objects.filter(
            name='PENDING_RECEIVE').get()
        po.save()
        return Response({'message': 'Purchase order approved.'})


class InventoryLotViewSet(ReadWriteSerializerMixin, viewsets.ModelViewSet):
    queryset = models.InventoryLot.objects.all()
    read_serializer = serializers.InventoryLotReadSerializer
    write_serializer = serializers.InventoryLotWriteSerializer
    permission_classes = [permissions.AllowAny]

    def isEnoughForReceived(self, instance):
        itempurchaseorder_set = instance.purchase_order.itempurchaseorder_set.all()
        isEnoughItems = [(models.InventoryLot.objects.filter(
            purchase_order=itempurchaseorder.purchase_order, item=itempurchaseorder.item).aggregate(Sum('quantity'))['quantity__sum'] or 0) >= itempurchaseorder.quantity for itempurchaseorder in itempurchaseorder_set]
        return len(isEnoughItems) > 0 and any(isEnoughItems)
    
    def markAsReceived(self, instance):
        po = instance.purchase_order
        po.status = models.PurchaseOrderStatus.objects.get(name='RECEIVED')
        po.save()

    def perform_create(self, serializer):
        instance = serializer.save()
        if self.isEnoughForReceived(instance):
            self.markAsReceived(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        if self.isEnoughForReceived(instance):
            self.markAsReceived(instance)
