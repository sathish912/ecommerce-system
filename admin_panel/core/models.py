from django.db import models


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    role = models.CharField(max_length=20, default="customer")

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.FloatField()
    stock = models.IntegerField(default=0)
    category = models.CharField(max_length=100)
    image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product)
    total = models.FloatField()

    payment_status = models.CharField(max_length=50, default="pending")

    order_status = models.CharField(
        max_length=50,
        default="pending",
        choices=[
            ("pending", "Pending"),
            ("processing", "Processing"),
            ("shipped", "Shipped"),
            ("delivered", "Delivered"),
        ]
    )

    timestamp = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    amount = models.FloatField()
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=200)
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.transaction_id