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

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50) 
    date = models.DateField() 
    store_number = models.IntegerField()  
    store_name = models.CharField(max_length=100)  
    address = models.CharField(max_length=255)  
    city = models.CharField(max_length=100)  
    zip_code = models.CharField(max_length=10)  
    store_location = models.CharField(max_length=100, null=True)  
    county_number = models.IntegerField()  
    county = models.CharField(max_length=100)  
    category = models.IntegerField()  
    category_name = models.CharField(max_length=100)  
    vendor_number = models.IntegerField()  
    vendor_name = models.CharField(max_length=100)  
    item_number = models.IntegerField()  
    item_desc = models.CharField(max_length=255)  
    pack = models.IntegerField()  
    bottle_volume_ml = models.IntegerField()  
    state_bottle_cost = models.FloatField()  
    state_bottle_retail = models.FloatField()  
    bottles_sold = models.IntegerField()  
    sale_dollars = models.FloatField()  
    volume_sold_liters = models.FloatField()  
    volume_sold_gallons = models.FloatField()  

    def __str__(self):
        return self.invoice_number
