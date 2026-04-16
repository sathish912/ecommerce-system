from django.contrib import admin
from .models import Product, Order, Cart, User


# PRODUCT ADMIN
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price")
    search_fields = ("name",)


# ORDER ADMIN
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total", "order_status", "payment_status")
    list_editable = ("order_status", "payment_status")


# USER ADMIN
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email")
    search_fields = ("name", "email")


admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Cart)