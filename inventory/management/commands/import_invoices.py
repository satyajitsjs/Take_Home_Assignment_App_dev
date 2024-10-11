import csv
from django.core.management.base import BaseCommand
from inventory.models import Invoice

class Command(BaseCommand):
    help = 'Import invoices from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str)

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                invoice = Invoice(
                    invoice_number=row['Invoice/Item Number'],
                    date=row['Date'],
                    store_number=row['Store Number'],
                    store_name=row['store_name'],
                    address=row['Address'],
                    city=row['City'],
                    zip_code=row['Zip Code'],
                    store_location=row['Store Location'],
                    county_number=row['County Number'],
                    county=row['County'],
                    category=row['Category'],
                    category_name=row['category_name'],
                    vendor_number=row['Vendor Number'],
                    vendor_name=row['vendor_name'],
                    item_number=row['Item Number'],
                    item_desc=row['item_desc'],
                    pack=row['Pack'],
                    bottle_volume_ml=row['Bottle Volume (ml)'],
                    state_bottle_cost=row['State Bottle Cost'],
                    state_bottle_retail=row['State Bottle Retail'],
                    bottles_sold=row['Bottles Sold'],
                    sale_dollars=row['Sale (Dollars)'],
                    volume_sold_liters=row['Volume Sold (Liters)'],
                    volume_sold_gallons=row['Volume Sold (Gallons)'],
                )
                invoice.save()
        self.stdout.write(self.style.SUCCESS('Successfully imported invoices'))
