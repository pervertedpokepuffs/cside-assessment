from django.core.management.base import BaseCommand, CommandError
from ....common import models

class Command(BaseCommand):
    help = 'Seeds the database.'
    
    def handle(self, *args, **options):
        for idx in range(0, 100):
            i = models.Item.objects.get_or_create(code=idx, name=f'Item {idx}')[0]
            i.save()