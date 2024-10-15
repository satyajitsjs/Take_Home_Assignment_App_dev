import csv
import os
import logging
from django.core.management.base import BaseCommand
from inventory.models import Invoice  

logger = logging.getLogger('my_custom_logger')

class Command(BaseCommand):
    help = 'Update invoice data from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file.')

    def handle(self, *args, **kwargs):
        csv_file_path = kwargs['csv_file']

        if not os.path.exists(csv_file_path):
            logger.error('The specified file does not exist.')
            return

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            updated_count = 0
            
            for row in reader:
                try:
                    invoice_number = row['Invoice/Item Number']  
                    state_bottle_cost = row['State Bottle Cost']
                    state_bottle_retail = row['State Bottle Retail']
                    
                    invoice = Invoice.objects.get(invoice_number=invoice_number)

                    invoice.state_bottle_cost = state_bottle_cost
                    invoice.state_bottle_retail = state_bottle_retail
                    invoice.save()
                    updated_count += 1
                    logger.info(f'Inovice {invoice_number} updated successfully. Counter: {updated_count}')
                except Invoice.DoesNotExist:
                    logger.warning(f'Invoice with number {invoice_number} does not exist.')
                except Exception as e:
                    logger.error(f'Error updating invoice {invoice_number}: {e}')

        logger.info(f'Successfully updated {updated_count} invoices.')