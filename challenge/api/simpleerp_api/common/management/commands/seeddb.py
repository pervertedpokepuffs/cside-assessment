from django.core.management.base import BaseCommand, CommandError
from ...models import Item, PurchaseOrder, PurchaseOrderStatus

class Command(BaseCommand):
    help = 'Seeds the database.'
    
    def handle(self, *args, **options):
        statuses = ['PENDING_APPROVAL', 'PENDING_RECEIVE', 'RECEIVED', 'REJECTED']
        for status in statuses:
            s = PurchaseOrderStatus.objects.get_or_create(name=status)[0]
            s.save()