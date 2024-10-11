from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .serializers import UserRegisterSerializer, UserLoginSerializer,InvoiceSerializer
from django.contrib.auth import get_user_model
from .models import Invoice
from django.core.cache import cache 
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum


User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'email': user.email,
            'name': user.name,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = User.objects.filter(email=email).first()
        
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    print(serializer.errorsrializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def user_logout(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) 
def invoice_get_create(request):
    # Retrieve all invoices (GET)
    if request.method == 'GET':
        paginator = PageNumberPagination()
        paginator.page_size = 100  
        
        invoices = Invoice.objects.all()  
        result_page = paginator.paginate_queryset(invoices, request)
        
        serializer = InvoiceSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    # Create a new invoice (POST)
    if request.method == 'POST':
        serializer = InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated]) 
def invoice_get_update_delete(request, invoice_id):
    cache_key = f"invoice_{invoice_id}"
    cached_invoice = cache.get(cache_key) 

    if cached_invoice and request.method == 'GET':
        return Response(cached_invoice, status=status.HTTP_200_OK)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

    # Retrieve a single invoice by ID (GET)
    if request.method == 'GET':
        serializer = InvoiceSerializer(invoice)
        response_data = serializer.data
        cache.set(cache_key, response_data, timeout=60 * 60)
        return Response(response_data, status=status.HTTP_200_OK)

    # Update an existing invoice by ID (PUT)
    elif request.method == 'PUT':
        serializer = InvoiceSerializer(invoice, data=request.data)
        if serializer.is_valid():
            serializer.save()
            cache.set(cache_key, serializer.data, timeout=60 * 60)  
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete an invoice by ID (DELETE)
    elif request.method == 'DELETE':
        invoice.delete()
        cache.delete(cache_key)  # Invalidate the cache after deletion
        return Response({'message': 'Invoice deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def dashboard_data(request):
    # Extract filters from query parameters
    store_name = request.GET.get('store_name', None)
    city = request.GET.get('city', None)
    zip_code = request.GET.get('zip_code', None)
    county_number = request.GET.get('county_number', None)
    county = request.GET.get('county', None)
    category = request.GET.get('category', None)
    vendor_number = request.GET.get('vendor_number', None)
    item_number = request.GET.get('item_number', None)

    # Start the query with Invoice model
    queryset = Invoice.objects.all()

    # Apply filters based on the parameters provided
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

    # Aggregate data using correct field names
    aggregated_data = queryset.aggregate(
        total_stock=Sum('bottles_sold'),  # Assuming this field represents stock
        total_sales=Sum('sale_dollars'),   # Assuming this field represents sales
        total_profit=Sum('state_bottle_cost'),  # Adjust based on your profit logic
    )

    return Response(aggregated_data, status=status.HTTP_200_OK)
