from django.urls import path 
from . import views as v

urlpatterns = [
    path('register/', v.user_register, name='register'),
    path('login/', v.user_login, name='login'),       
    path('logout/', v.user_logout, name='logout'),
    path('refresh_token/', v.refresh_token, name='refresh_token'),

    path('invoices/', v.invoice_get_create, name='invoices'),
    path('invoices/<int:invoice_id>/', v.invoice_get_update_delete, name='invoice'),
    path('get_invoice_select_data/', v.get_invoice_select_data, name='get_invoice_select_data'),

    path('dashboard/', v.dashboard_data, name='dashboard_data'),

    path('autocomplete/', v.autocomplete, name='autocomplete'),


]
