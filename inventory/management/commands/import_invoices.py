import csv
import logging
from django.core.management.base import BaseCommand
from inventory.models import Store, Vendor, Category, Item, Invoice

# Get the custom logger
logger = logging.getLogger('my_custom_logger')

class Command(BaseCommand):
    help = 'Imports invoice data from a CSV file'

    def handle(self, *args, **kwargs):
        # Path to your CSV file
        csv_file_path = input("Enter the path to the CSV file: ")
        
        logger.info(f"Starting import from {csv_file_path}")

        # Open the CSV file
        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            # Prepare a list to hold invoice objects
            invoices = []

            for row in reader:
                # Get or create the store
                store, created = Store.objects.get_or_create(
                    store_number=row['Store Number'],
                    defaults={
                        'store_name': row['store_name'],
                        'address': row['Address'],
                        'city': row['City'],
                        'zip_code': row['Zip Code'],
                        'store_location': row['Store Location'],
                        'county_number': row['County Number'],
                        'county': row['County'],
                    }
                )
                if created:
                    logger.info(f"Created new store: {store.store_name}")

                # Get or create the vendor
                vendor, created = Vendor.objects.get_or_create(
                    vendor_number=row['Vendor Number'],
                    defaults={'vendor_name': row['vendor_name']}
                )
                if created:
                    logger.info(f"Created new vendor: {vendor.vendor_name}")

                # Get or create the category
                category, created = Category.objects.get_or_create(
                    category_number=row['Category'],
                    defaults={'category_name': row['category_name']}
                )
                if created:
                    logger.info(f"Created new category: {category.category_name}")

                # Get or create the item
                item, created = Item.objects.get_or_create(
                    item_number=row['Item Number'],
                    defaults={
                        'item_desc': row['item_desc'],
                        'category': category,
                        'vendor': vendor,
                        'store': store,
                        'pack': row['Pack'],
                        'bottle_volume_ml': row['Bottle Volume (ml)'].replace(',', '') if row['Bottle Volume (ml)'] else 0,
                    }
                )
                if created:
                    logger.info(f"Created new item: {item.item_desc}")

                # Create the invoice
                invoice = Invoice(
                    invoice_number=row['Invoice/Item Number'],
                    date=row['Date'],
                    store=store,
                    item=item,
                    bottles_sold=row['Bottles Sold'],
                    sale_dollars=row['Sale (Dollars)'],
                    volume_sold_liters=row['Volume Sold (Liters)'],
                    volume_sold_gallons=row['Volume Sold (Gallons)'],
                    state_bottle_cost=row['State Bottle Cost'].replace(',', '') if row['State Bottle Cost'] else 0,
                    state_bottle_retail=row['State Bottle Retail'].replace(',', '') if row['State Bottle Retail'] else 0,
                )
                invoices.append(invoice)

            # Bulk insert the invoices for efficiency
            Invoice.objects.bulk_create(invoices, batch_size=1000)  # Adjust batch size if needed

            logger.info(f"Successfully imported {len(invoices)} invoices")
            self.stdout.write(self.style.SUCCESS('Successfully imported invoices'))