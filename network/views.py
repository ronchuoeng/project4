import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist

from .models import User, Post


def index(request):
    return render(request, "network/index.html", {"profile": User.objects.all()})


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
        return JsonResponse({"error": "You must be login."}, status=400)
    # New post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    data = json.loads(request.body)
    body = data.get("body", "")

    post = Post(user=request.user, body=body)
    post.save()

    return JsonResponse({"message": "Post added successfully."}, status=201)


@login_required
def profile(request, username):
    try:
        user = User.objects.get(username=f"{username}")
    except ObjectDoesNotExist:
        return HttpResponse("The user doesn't exist or has already expired.")
    posts = Post.objects.filter(user=user)
    posts = posts.order_by("-timestamp").all()

    return render(request, "network/profile.html", {"user": user, "posts": posts})
