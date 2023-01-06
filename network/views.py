import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist

from .models import User, Post, Follower


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def posts(request, username):

    if username == "all":
        post_list = Post.objects.all()

    elif username == "following":
        user = User.objects.get(username=request.user.username)
        followings = user.following.all()
        followings = [following.user for following in followings]
        post_list = Post.objects.filter(user__in=followings)

    else:
        user = User.objects.get(username=username)
        post_list = Post.objects.filter(user=user)

    post_list = post_list.order_by("-timestamp").all()
    # Show 10 posts per page
    paginator = Paginator(post_list, 10)
    page_number = int(request.GET.get("page") or 1)
    page_obj = paginator.get_page(page_number)
    if paginator.num_pages < page_number:
        return JsonResponse({"error": "No more pages."}, status=404)

    return JsonResponse([post.serialize() for post in page_obj.object_list], safe=False)


@csrf_exempt
def addpost(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You must be logged in."}, status=400)
    # New post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    data = json.loads(request.body)
    body = data.get("body", "")

    post = Post(user=request.user, body=body)
    post.save()

    return JsonResponse({"message": "Post added successfully."}, status=201)


def profile(request, username):
    try:
        user = User.objects.get(username=username)
    except ObjectDoesNotExist:
        return HttpResponse("The user doesn't exist or has already expired.")

    posts = Post.objects.filter(user=user)
    posts = posts.order_by("-timestamp").all()
    # If user's follower table exists
    try:
        Follower.objects.get(user=user)
        user_f = Follower.objects.get(user=user)
        try:
            user1 = User.objects.get(username=request.user.username)
        except User.DoesNotExist:
            user1 = None
        return render(
            request,
            "network/profile.html",
            {
                "user": user,
                "posts": posts,
                "tableF": user_f.follower.all(),
                "followers": user_f.follower.count(),
                "user1": user1,
            },
        )
    # If not, means 0 follower.
    except Follower.DoesNotExist:
        return render(
            request,
            "network/profile.html",
            {"user": user, "followers": 0, "posts": posts},
        )


@login_required
def following(request):
    return render(request, "network/following.html")


@csrf_exempt
def follow(request, username):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    user = User.objects.get(username=username)
    user1 = User.objects.get(username=request.user.username)
    # 1. Check the user has a follower table or not, if had
    if Follower.objects.filter(user=user).exists():
        user_f = Follower.objects.get(user=user)
        # The function to follow or unfollow by request user
        if user1 in user_f.follower.all():
            user_f.follower.remove(user1)
            follower_list = list(user_f.follower.all().values("id", "username"))
            return JsonResponse(
                {
                    "message": "Unfollowed successfully.",
                    "followers": follower_list,
                },
                status=201,
            )
        else:
            user_f.follower.add(user1)
            follower_list = list(user_f.follower.all().values("id", "username"))
            return JsonResponse(
                {"message": "Followed successfully.", "followers": follower_list},
                status=201,
            )

    # 2. If no, Create a follower table for this user, and add request.user inside
    else:
        new_user_f = Follower.objects.create(user=user)
        new_user_f.follower.add(user1)
        follower_list = list(new_user_f.follower.all().values("id", "username"))

    return JsonResponse(
        {"message": "Followed successfully.", "followers": follower_list},
        status=201,
    )


@csrf_exempt
def edit(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You must be logged in."}, status=400)

    # Edit post must be via PUT
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # Query for requested post
    try:
        post = Post.objects.get(user=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    data = json.loads(request.body)
    if data.get("body") is not None:
        post.body = data["body"]
        post.save()
    return HttpResponse(status=204)


@csrf_exempt
def like_post(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You are not logged in."})
    # Like post must be via PUT
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # Query for requested post
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    liker = User.objects.get(username=request.user.username)
    if liker not in post.likelist.all():
        post.likelist.add(liker)
    else:
        post.likelist.remove(liker)

    return HttpResponse(status=204)
