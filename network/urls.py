from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    # API routes
    path("post", views.addpost, name="addpost"),
    path("edit/<int:post_id>", views.edit, name="edit"),
    path("posts/<str:username>/", views.posts, name="posts"),
    path("profile/<str:username>/follow", views.follow, name="follow"),
]
