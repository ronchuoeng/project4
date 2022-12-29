from django.contrib import admin
from .models import Post, Follower

# Register your models here.

admin.site.register(Post)
admin.site.register(Follower)
