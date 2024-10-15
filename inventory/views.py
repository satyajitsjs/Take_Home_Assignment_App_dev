from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from rest_framework import status
from .serializers import UserSerializer,UserLoginSerializer,InvoiceSerializer,StoreSerializer,ItemSerializer
from django.contrib.auth import get_user_model
from .models import Invoice, Store, Item,Category,Vendor
from django.core.cache import cache
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum
from django.conf import settings
import json
import logging
from django.db.models import Window, F
from django.db.models.functions import RowNumber
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

logger = logging.getLogger('my_custom_logger')

User = get_user_model()

def index(request):
    return render(request, 'index.html')

@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request): 
    logger.info("User registration attempt")
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user_data = serializer.validated_data
        user = User(
            email=user_data['email'],
            name=user_data['name']
        )
        user.set_password(user_data['password'])
        user.save()
        logger.info(f"User registered successfully: {user.email}")
        return Response({
            'email': user.email,
            'name': user.name,
        }, status=status.HTTP_201_CREATED)
    logger.error(f"User registration failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def user_login(request):
    logger.info("User login attempt")
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = User.objects.filter(email=email).first()
        
        if user and user.check_password(password):
            login(request, user)
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
@login_required()
def user_logout(request):
    logger.info("User logout attempt")
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logout(request)
            logger.info("User logged out successfully")
        
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"User logout failed: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def refresh_token(request):
    logger.info("Token refresh attempt")
    refresh_token = request.data.get('refresh_token')
    if not refresh_token:
        logger.error("No refresh token provided")
        return Response({'error': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        new_access_token = str(token.access_token)
        new_refresh_token = str(token)
        logger.info("Token refreshed successfully")
        return Response({
            'access': new_access_token,
            'refresh': new_refresh_token,
        }, status=status.HTTP_200_OK)
    except TokenError as e:
        logger.error(f"Token refresh failed: {str(e)}")
        return Response({'error': 'Token refresh failed'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@login_required()
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

        invoices = Invoice.objects.select_related('store', 'item__category', 'item__vendor').all().order_by('-id')
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoice_select_data(request):
    cache_key = 'invoice_select_data'
    cached_data = cache.get(cache_key)

    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    stores = Store.objects.all()
    items = Item.objects.select_related('category', 'vendor').all()

    store_serializer = StoreSerializer(stores, many=True)
    item_serializer = ItemSerializer(items, many=True)

    response_data = {
        'stores': store_serializer.data,
        'items': item_serializer.data,
    }

    cache.set(cache_key, response_data, timeout=settings.CACHE_TIMEOUT)

    return Response(response_data, status=status.HTTP_200_OK)


def invalidate_invoice_page(invoice):
    queryset = Invoice.objects.annotate(row_number=Window(
        expression=RowNumber(),
        order_by=F('id').desc()
    )).filter(id=invoice.id)

    if queryset.exists():
        invoice_position = queryset[0].row_number

        paginator = PageNumberPagination()
        paginator.page_size = 100  
        page_number = (invoice_position - 1) // paginator.page_size + 1

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

    if request.method == 'GET':
        serializer = InvoiceSerializer(invoice)
        response_data = serializer.data
        cache.set(cache_key, response_data, timeout=settings.CACHE_TIMEOUT)
        logger.info(f"Retrieved invoice {invoice_id}")
        return Response(response_data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        logger.info(f"Updating invoice {invoice_id}")
        serializer = InvoiceSerializer(invoice, data=request.data)
        if serializer.is_valid():
            serializer.save()

            invalidate_invoice_page(invoice)

            cache.set(cache_key, serializer.data, timeout=settings.CACHE_TIMEOUT)
            logger.info(f"Invoice {invoice_id} updated successfully")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Invoice update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        logger.info(f"Deleting invoice {invoice_id}")

        invalidate_invoice_page(invoice)

        invoice.delete()
        logger.info(f"Invoice {invoice_id} deleted successfully")
        return Response({'message': 'Invoice deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    logger.info("Fetching dashboard data")
    filters = {
        'store__store_name__icontains': request.GET.get('store_name', None),
        'store__city__icontains': request.GET.get('city', None),
        'store__zip_code__icontains': request.GET.get('zip_code', None),
        'store__store_location__icontains': request.GET.get('store_location', None),
        'store__county_number__icontains': request.GET.get('county_number', None),
        'store__county__icontains': request.GET.get('county', None),
        'item__category__category_name__icontains': request.GET.get('category_name', None),
        'item__category__category_number__icontains': request.GET.get('category', None), 
        'item__vendor__vendor_number__icontains': request.GET.get('vendor_number', None),
        'item__vendor__vendor_name__icontains': request.GET.get('vendor_name', None),
        'item__item_number__icontains': request.GET.get('item_number', None),
    }

    cache_key = f"dashboard_data_{'_'.join([f'{k}_{v}' for k, v in filters.items() if v])}"
    cached_data = cache.get(cache_key)

    if cached_data is not None:
        logger.info("Serving cached dashboard data")
        return Response(cached_data, status=status.HTTP_200_OK)

    queryset = Invoice.objects.all()
    for key, value in filters.items():
        if value:
            logger.info(f"Filtering by {key}: {value}")
            queryset = queryset.filter(**{key: value})

    aggregated_data = queryset.aggregate(
        total_stock=Sum('bottles_sold'), 
        total_sales=Sum('sale_dollars'),  
        total_profit=Sum('state_bottle_cost'),
    )

    sales_data = queryset.values('date').annotate(total_sales=Sum('sale_dollars'))[:15]
    stock_data = queryset.values('date').annotate(total_stock=Sum('bottles_sold'))[:15]
    profit_data = queryset.values('date').annotate(total_profit=Sum('state_bottle_cost'))[:15]

    response_data = {
        'total_stock': aggregated_data['total_stock'],
        'total_sales': round(aggregated_data['total_sales'], 2) if aggregated_data['total_sales'] is not None else None,
        'total_profit': round(aggregated_data['total_profit'], 2) if aggregated_data['total_profit'] is not None else None,
        'salesData': {
            'labels': [data['date'] for data in sales_data],
            'values': [data['total_sales'] for data in sales_data],
        },
        'stockData': {
            'labels': [data['date'] for data in stock_data],
            'values': [data['total_stock'] for data in stock_data],
        },
        'profitData': {
            'labels': [data['date'] for data in profit_data],
            'values': [data['total_profit'] for data in profit_data],
        },
    }

    cache.set(cache_key, response_data, timeout=settings.CACHE_TIMEOUT)
    logger.info("Dashboard data fetched and cached successfully")
    return Response(response_data, status=status.HTTP_200_OK)


def autocomplete(request):
    query = request.GET.get('query', '').strip()
    filter_type = request.GET.get('filter_type', '').strip()
    logger.info(f"Autocomplete request: {query} ({filter_type})")

    if not query or not filter_type:
        return JsonResponse({'results': []})

    cache_key = f"autocomplete_{filter_type}_{query}"
    cached_results = cache.get(cache_key)

    if cached_results is not None:
        logger.info(f"Serving cached results for query: {query} ({filter_type})")
        return JsonResponse({'results': cached_results})

    try:
        if filter_type == 'store_name':
            results = Store.objects.filter(store_name__icontains=query).values_list('store_name', flat=True).distinct()
        elif filter_type == 'city':
            results = Store.objects.filter(city__icontains=query).values_list('city', flat=True).distinct()
        elif filter_type == 'zip_code':
            results = Store.objects.filter(zip_code__icontains=query).values_list('zip_code', flat=True).distinct()
        elif filter_type == 'store_location':
            results = Store.objects.filter(store_location__icontains=query).values_list('store_location', flat=True).distinct()
        elif filter_type == 'county_number':
            results = Store.objects.filter(county_number__icontains=query).values_list('county_number', flat=True).distinct()
        elif filter_type == 'county':
            results = Store.objects.filter(county__icontains=query).values_list('county', flat=True).distinct()
        elif filter_type == 'category':
            results = Category.objects.filter(category_number__icontains=query).values_list('category_number', flat=True).distinct()
        elif filter_type == 'category_name':
            results = Category.objects.filter(category_name__icontains=query).values_list('category_name', flat=True).distinct()
        elif filter_type == 'vendor_number':
            results = Vendor.objects.filter(vendor_number__icontains=query).values_list('vendor_number', flat=True).distinct()
        elif filter_type == 'vendor_name':
            results = Vendor.objects.filter(vendor_name__icontains=query).values_list('vendor_name', flat=True).distinct()
        elif filter_type == 'item_number':
            results = Invoice.objects.filter(item__item_number__icontains=query).values_list('item__item_number', flat=True).distinct()
        else:
            results = []

        results_list = list(results)
        cache.set(cache_key, results_list, timeout=settings.CACHE_TIMEOUT)
        logger.info(f"Caching results for query: {query} ({filter_type})")

        return JsonResponse({'results': results_list})
    except Exception as e:
        logger.error(f"Autocomplete error: {e}")
        return JsonResponse({'results': [], 'error': 'An error occurred while processing your request.'})


def handler404(request, exception):
    logger.error("404 error occurred")
    return render(request, 'templates/errors/404.html', status=404)


def handler500(request):
    logger.error("500 error occurred")
    return render(request, 'templates/errors/500.html', status=500)