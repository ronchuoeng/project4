from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likelist = models.ManyToManyField(
        User, blank=True, null=True, related_name="likers"
    )

    def __str__(self):
        return f"{self.id} {self.user}"

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likelist": self.likelist.count(),
        }


class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed")
    follower = models.ManyToManyField(
        User, blank=True, null=True, related_name="followers"
    )

    def __str__(self):
        return f"{self.user} ({self.follower.count()})"

    def serialize(self):
        return {"id": self.id, "user": self.user.username, "follower": self.follower}
