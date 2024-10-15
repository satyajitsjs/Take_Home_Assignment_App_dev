from django.contrib import admin
from .forms import *
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Invoice, Store, Vendor, Category, Item, User

# Register your models here.

class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ["email", "is_admin"]
    list_filter = ["is_admin"]
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Permissions", {"fields": ["is_admin"]}),
    ]
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                "fields": ["email", "password1", "password2"],
            },
        ),
    ]
    search_fields = ["email"]
    ordering = ["email"]
    filter_horizontal = []

class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "date", "store", "item", "bottles_sold", "sale_dollars", "volume_sold_liters", "volume_sold_gallons"]
    list_filter = ["date"]
    search_fields = ["invoice_number", "store__store_name", "item__item_desc"]
    ordering = ["-date"]

class StoreAdmin(admin.ModelAdmin):
    list_display = ["store_number", "store_name", "address", "city", "zip_code", "store_location", "county_number", "county"]
    search_fields = ["store_number", "store_name", "city", "county"]
    ordering = ["store_number"]

class VendorAdmin(admin.ModelAdmin):
    list_display = ["vendor_number", "vendor_name"]
    search_fields = ["vendor_number", "vendor_name"]
    ordering = ["vendor_number"]

class CategoryAdmin(admin.ModelAdmin):
    list_display = ["category_number", "category_name"]
    search_fields = ["category_number", "category_name"]
    ordering = ["category_number"]

class ItemAdmin(admin.ModelAdmin):
    list_display = ["item_number", "item_desc", "category", "vendor", "store", "pack", "bottle_volume_ml"]
    search_fields = ["item_number", "item_desc", "category__category_name", "vendor__vendor_name", "store__store_name"]
    ordering = ["item_number"]

# Now register the new UserAdmin...
admin.site.register(User, UserAdmin)
# ... and, since we're not using Django's built-in permissions,
# unregister the Group model from admin.
admin.site.unregister(Group)

# Register the Invoice model with the custom InvoiceAdmin
admin.site.register(Invoice, InvoiceAdmin)

# Register other models with their custom admin classes
admin.site.register(Store, StoreAdmin)
admin.site.register(Vendor, VendorAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Item, ItemAdmin)