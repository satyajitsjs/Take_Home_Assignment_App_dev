import csv
from django.core.management.base import BaseCommand
from inventory.models import Invoice

class Command(BaseCommand):
    help = 'Imports invoice data from a CSV file'

    def handle(self, *args, **kwargs):
        # Path to your CSV file
        csv_file_path = r'C:\Users\satya\OneDrive\Desktop\Take_Home_Assignment_App_dev\cleaned_invoices.csv'
        
        # Open the CSV file
        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            # Prepare a list to hold invoice objects
            invoices = []

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
                    bottle_volume_ml=row['Bottle Volume (ml)'].replace(',', '') if row['Bottle Volume (ml)'] else 0,
                    state_bottle_cost=row['State Bottle Cost'],
                    state_bottle_retail=row['State Bottle Retail'],
                    bottles_sold=row['Bottles Sold'],
                    sale_dollars=row['Sale (Dollars)'],
                    volume_sold_liters=row['Volume Sold (Liters)'],
                    volume_sold_gallons=row['Volume Sold (Gallons)'],
                )
                invoices.append(invoice)

            # Bulk insert the invoices for efficiency
            Invoice.objects.bulk_create(invoices, batch_size=1000)  # Adjust batch size if needed

            self.stdout.write(self.style.SUCCESS('Successfully imported invoices'))
