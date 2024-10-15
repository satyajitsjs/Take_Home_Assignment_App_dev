from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .manager import UserManager
# Create your models here.

class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin


class Store(models.Model):
    store_number = models.IntegerField(unique=True)
    store_name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    store_location = models.CharField(max_length=100, null=True)
    county_number = models.IntegerField()
    county = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.store_name} - {self.store_number}"

    class Meta:
        indexes = [
            models.Index(fields=['store_number']),
            models.Index(fields=['city']),
            models.Index(fields=['zip_code']),
        ]


class Vendor(models.Model):
    vendor_number = models.IntegerField(unique=True)
    vendor_name = models.CharField(max_length=100)

    def __str__(self):
        return self.vendor_name


class Category(models.Model):
    category_number = models.IntegerField(unique=True)
    category_name = models.CharField(max_length=100)

    def __str__(self):
        return self.category_name

    class Meta:
        indexes = [
            models.Index(fields=['category_name']),
        ]


class Item(models.Model):
    item_number = models.IntegerField(unique=True)
    item_desc = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)  
    store = models.ForeignKey(Store, on_delete=models.CASCADE) 
    pack = models.IntegerField()
    bottle_volume_ml = models.IntegerField()

    def __str__(self):
        return f"{self.item_desc} - {self.item_number}"

    class Meta:
        indexes = [
            models.Index(fields=['item_number']),
            models.Index(fields=['item_desc']),
            models.Index(fields=['store']),
            models.Index(fields=['vendor']),
        ]


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50)
    date = models.DateField()
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)  
    bottles_sold = models.IntegerField()
    sale_dollars = models.DecimalField(max_digits=10, decimal_places=2)
    volume_sold_liters = models.FloatField()
    volume_sold_gallons = models.FloatField()
    state_bottle_cost = models.DecimalField(max_digits=10, decimal_places=2,default=0)  # Add this field
    state_bottle_retail = models.DecimalField(max_digits=10, decimal_places=2,default=0)  # Add this field


    def __str__(self):
        return self.invoice_number

    class Meta:
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['date']),
            models.Index(fields=['store']),
            models.Index(fields=['item']),
        ]
