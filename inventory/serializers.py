from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, Store, Vendor, Category, Item, Invoice

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name']

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password']

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            name=validated_data['name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    vendor = VendorSerializer()
    class Meta:
        model = Item
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    item = ItemSerializer(read_only=True)
    store_id = serializers.PrimaryKeyRelatedField(queryset=Store.objects.all(), write_only=True, source='store')
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), write_only=True, source='item')

    class Meta:
        model = Invoice
        fields = '__all__'