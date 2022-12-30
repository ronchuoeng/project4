document.addEventListener("DOMContentLoaded", function () {
    // Post
    if (document.querySelector("#post-form")) {
        document.querySelector("#post-form").addEventListener("submit", post);
    }
    // Follow/Unfollow button
    if (document.querySelector(".btn-follow")) {
        document
            .querySelector(".btn-follow")
            .addEventListener("click", function () {
                follow();
            });
    }

    // Load the page by different situation
    if (document.querySelector("#user")) {
        //  Profile Page
        load(`${document.querySelector("#user").innerHTML}`);
    } else if (document.querySelector("#following")) {
        // Following Page
        load("following");
    } else {
        // Default Page
        load("all");
    }
});

// Start with first page
let counter = 1;

function load(user) {
    // Set start and end post numbers, and update counter
    const page = counter;
    document.querySelector(".posts-view").innerHTML = "";
    // Get new posts and add posts
    fetch(`/posts/${user}/?page=${page}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // If out of pages, skip this
            if (data.error === undefined) {
                // Loops for posts
                data.forEach((contents) => {
                    // Create the Div for each post
                    // Parent Div
                    const post = document.createElement("div");
                    post.className = "post-view";
                    // Child Div
                    const postUser = document.createElement("div");
                    postUser.className = "post-user";
                    const postBody = document.createElement("div");
                    postBody.className = "post-body";
                    const postTime = document.createElement("div");
                    postTime.className = "post-time";
                    const postLikeCount = document.createElement("div");
                    postLikeCount.className = "post-likecount";
                    const postLikeTag = document.createElement("div");
                    postLikeTag.className = "post-liketag";

                    const likeTag = document.createElement("a");
                    const userTag = document.createElement("a");

                    likeTag.setAttribute("data-code", contents.id);
                    likeTag.onclick = function () {
                        like_post(this.getAttribute("data-code"));
                    };
                    userTag.href = `/profile/${contents.user}`;

                    // Add the contents inside Child Div
                    userTag.innerHTML = contents.user;
                    postBody.innerHTML = contents.body;
                    postTime.innerHTML = contents.timestamp;
                    if (contents.likelist < 2) {
                        postLikeCount.innerHTML =
                            contents.likelist + " " + "like";
                    } else {
                        postLikeCount.innerHTML =
                            contents.likelist + " " + "likes";
                    }
                    postLikeTag.innerHTML =
                        "<img src='/static/network/LikeThumb.png' style='width:20%;height:50%;'> Like";
                    likeTag.appendChild(postLikeTag);
                    postUser.appendChild(userTag);
                    post.appendChild(postUser);
                    post.appendChild(postBody);
                    post.appendChild(postTime);
                    post.appendChild(postLikeCount);
                    post.appendChild(likeTag);

                    // Add post to DOM
                    document.querySelector(".posts-view").append(post);
                });
            }
            // Add Pagination to HTML
            const pagination = document.querySelector(".pagination");
            pagination.innerHTML =
                "<button class='prev'>Previous</button>" +
                page +
                "<button class='next'>Next</button>";
            const prev = document.querySelector(".prev");
            const next = document.querySelector(".next");
            // First page do not have prev
            if (page <= 1) {
                prev.style.display = "none";
            } else {
                prev.style.display = "block";
            }
            // When Prev is clicked
            prev.onclick = function () {
                counter--;
                document.querySelector(".posts-view").innerHTML = "";
                load(user);
            };
            // Last Page do not have next
            const outerDiv = document.querySelector(".posts-view");
            const innerDivs = outerDiv.querySelectorAll(".post-view");
            const count = innerDivs.length;
            if (count < 10) {
                next.style.display = "none";
                const message = document.createElement("div");
                message.className = "msg-pages";
                message.innerHTML = "There are no more pages.";
                document.querySelector(".posts-view").appendChild(message);
            } else {
                next.style.display = "block";
            }
            // When Next is clicked
            next.onclick = function () {
                counter++;
                document.querySelector(".posts-view").innerHTML = "";
                load(user);
            };
        });
}

function like_post(post_id) {}

function post() {
    const body = document.querySelector("#new-post").value;

    fetch("/post", {
        method: "POST",
        body: JSON.stringify({
            body: body,
        }),
    })
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((result) => {
            // Print result
            console.log(result);
            // If not login, error occur and redirect to login page
            if (result.error === undefined) {
                load();
            } else {
                window.location.replace("login");
            }
        });
}

function follow() {
    const username = document.querySelector(".btn-follow").value;

    fetch(`/profile/${username}/follow`, {
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result.message);
            console.log(result.followers);
            document.querySelector("#follower-div").innerHTML =
                result.followers.length + "<br> Followers";
            btnF = document.querySelector(".btn-follow");
            if (btnF.style.backgroundColor == "rgb(211, 211, 211)") {
                btnF.innerHTML = "Follow";
                btnF.style.backgroundColor = "#007bff";
                btnF.style.color = "white";
            } else {
                btnF.innerHTML = "Following";
                btnF.style.backgroundColor = "#D3D3D3";
                btnF.style.color = "black";
            }
        });
}
