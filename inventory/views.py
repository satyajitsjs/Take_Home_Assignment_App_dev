from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .serializers import UserRegisterSerializer, UserLoginSerializer, InvoiceSerializer
from django.contrib.auth import get_user_model
from .models import Invoice
from django.core.cache import cache
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum
from django.conf import settings
import json
import logging
from django.db.models import Window, F
from django.db.models.functions import RowNumber


logger = logging.getLogger('my_custom_logger')

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request): 
    logger.info("User registration attempt")
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"User registered successfully: {user.email}")
        return Response({
            'email': user.email,
            'name': user.name,
        }, status=status.HTTP_201_CREATED)
    logger.error(f"User registration failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    logger.info("User login attempt")
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = User.objects.filter(email=email).first()
        
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            logger.info(f"User logged in successfully: {user.email}")
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        logger.error("Invalid credentials")
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    logger.error(f"User login failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    logger.info("User logout attempt")
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("User logged out successfully")
        
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"User logout failed: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def invoice_get_create(request):
    if request.method == 'GET':
        page_number = request.query_params.get('page', 1)
        cache_key = f"invoices_page_{page_number}"
        cached_data = cache.get(cache_key)

        if cached_data:
            logger.info(f"Serving cached data for page {page_number}")
            return Response(json.loads(cached_data), status=status.HTTP_200_OK)

        paginator = PageNumberPagination()
        paginator.page_size = 100  

        invoices = Invoice.objects.all().order_by('-id')
        result_page = paginator.paginate_queryset(invoices, request)

        serializer = InvoiceSerializer(result_page, many=True)
        response_data = paginator.get_paginated_response(serializer.data).data

        cache.set(cache_key, json.dumps(response_data), timeout=settings.CACHE_TIMEOUT)
        logger.info(f"Caching data for page {page_number}")

        return Response(response_data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        logger.info("Creating a new invoice")
        serializer = InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            invalidate_invoice_page(serializer.instance)
            logger.info("Invoice created successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Invoice creation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def invalidate_invoice_page(invoice):
    # Calculate the row number (position) of the invoice using the `ROW_NUMBER()` window function
    queryset = Invoice.objects.annotate(row_number=Window(
        expression=RowNumber(),
        order_by=F('id').desc()
    )).filter(id=invoice.id)

    if queryset.exists():
        invoice_position = queryset[0].row_number

        # Determine which page this invoice is on
        paginator = PageNumberPagination()
        paginator.page_size = 100  # Assuming 100 items per page
        page_number = (invoice_position - 1) // paginator.page_size + 1

        # Invalidate the specific page cache
        cache_key = f"invoices_page_{page_number}"
        cache.delete(cache_key)
        logger.info(f"Deleted cache for page {page_number} containing invoice {invoice.id}")
    else:
        logger.error(f"Invoice {invoice.id} not found for page invalidation")


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def invoice_get_update_delete(request, invoice_id):
    cache_key = f"invoice_{invoice_id}"
    cached_invoice = cache.get(cache_key)

    if cached_invoice and request.method == 'GET':
        logger.info(f"Serving cached data for invoice {invoice_id}")
        return Response(cached_invoice, status=status.HTTP_200_OK)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        logger.error(f"Invoice not found: {invoice_id}")
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

    # Retrieve a single invoice by ID (GET)
    if request.method == 'GET':
        serializer = InvoiceSerializer(invoice)
        response_data = serializer.data
        cache.set(cache_key, response_data, timeout=settings.CACHE_TIMEOUT)
        logger.info(f"Retrieved invoice {invoice_id}")
        return Response(response_data, status=status.HTTP_200_OK)

    # Update an existing invoice by ID (PUT)
    elif request.method == 'PUT':
        logger.info(f"Updating invoice {invoice_id}")
        serializer = InvoiceSerializer(invoice, data=request.data)
        if serializer.is_valid():
            serializer.save()

            # Invalidate the specific page(s) that contain the invoice
            invalidate_invoice_page(invoice)

            cache.set(cache_key, serializer.data, timeout=settings.CACHE_TIMEOUT)
            logger.info(f"Invoice {invoice_id} updated successfully")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Invoice update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        logger.info(f"Deleting invoice {invoice_id}")

        # Invalidate the specific page(s) that contain the invoice before deleting it
        invalidate_invoice_page(invoice)

        invoice.delete()
        logger.info(f"Invoice {invoice_id} deleted successfully")
        return Response({'message': 'Invoice deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    logger.info("Fetching dashboard data")
    store_name = request.GET.get('store_name', None)
    city = request.GET.get('city', None)
    zip_code = request.GET.get('zip_code', None)
    county_number = request.GET.get('county_number', None)
    county = request.GET.get('county', None)
    category = request.GET.get('category', None)
    vendor_number = request.GET.get('vendor_number', None)
    item_number = request.GET.get('item_number', None)

    queryset = Invoice.objects.all()

    if store_name:
        queryset = queryset.filter(store_name=store_name)
    if city:
        queryset = queryset.filter(city=city)
    if zip_code:
        queryset = queryset.filter(zip_code=zip_code)
    if county_number:
        queryset = queryset.filter(county_number=county_number)
    if county:
        queryset = queryset.filter(county=county)
    if category:
        queryset = queryset.filter(category=category)
    if vendor_number:
        queryset = queryset.filter(vendor_number=vendor_number)
    if item_number:
        queryset = queryset.filter(item_number=item_number)

    aggregated_data = queryset.aggregate(
        total_stock=Sum('bottles_sold'), 
        total_sales=Sum('sale_dollars'),  
        total_profit=Sum('state_bottle_cost'),
    )

    logger.info("Dashboard data fetched successfully")
    return Response(aggregated_data, status=status.HTTP_200_OK)

def handler404(request, exception):
    logger.error("404 error occurred")
    return render(request, 'errors/404.html', status=404)

def handler500(request):
    logger.error("500 error occurred")
    return render(request, 'errors/500.html', status=500)