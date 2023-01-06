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
    const requestUser = document.querySelector("#request-user").innerHTML;
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
                    // Like Tag
                    const likeTag = document.createElement("a");
                    likeTag.className = "liketag";
                    const userTag = document.createElement("a");

                    // Set tag's data
                    likeTag.setAttribute("data-code", contents.id);
                    let likecount = Number(contents.likelist.length);
                    likeTag.onclick = function () {
                        like_post(this.getAttribute("data-code"));
                        // Prevent display from changing if not logged in
                        if (requestUser == "") {
                            return;
                        }
                        // Change display without reloading page
                        if (postLikeTag.style.color == "black") {
                            // Like
                            postLikeTag.style.color = "#007bff";
                            likecount++;
                            console.log("Like successfully.");
                            if (likecount > 1) {
                                postLikeCount.innerHTML =
                                    likecount + " " + "likes";
                            } else {
                                postLikeCount.innerHTML =
                                    likecount + " " + "like";
                            }
                            postLikeTag.innerHTML =
                                "<img src='/static/network/LikedThumb.png' style='width:10%;height:50%;margin-right:10px;'> Unlike";
                        } else {
                            // Unlike
                            postLikeTag.style.color = "black";
                            likecount--;
                            console.log("Unlike successfully.");
                            if (likecount > 1) {
                                postLikeCount.innerHTML =
                                    likecount + " " + "likes";
                            } else {
                                postLikeCount.innerHTML =
                                    likecount + " " + "like";
                            }
                            postLikeTag.innerHTML =
                                "<img src='/static/network/LikeThumb.png' style='width:10%;height:50%;margin-right:10px;'> Like";
                        }

                        // Change HTML
                    };

                    userTag.href = `/profile/${contents.user}`;

                    // Add the contents inside Child Div
                    userTag.innerHTML = contents.user;
                    postBody.innerHTML = contents.body;
                    postTime.innerHTML = contents.timestamp;

                    // Like/Likes
                    if (contents.likelist.length < 2) {
                        postLikeCount.innerHTML =
                            contents.likelist.length + " " + "like";
                    } else {
                        postLikeCount.innerHTML =
                            contents.likelist.length + " " + "likes";
                    }

                    // Display Like/Unlike
                    if (!contents.likelist.includes(requestUser)) {
                        postLikeTag.style.color = "black";
                        postLikeTag.innerHTML =
                            "<img src='/static/network/LikeThumb.png' style='width:10%;height:50%;margin-right:10px;'> Like";
                    } else {
                        postLikeTag.style.color = "#007bff";
                        postLikeTag.innerHTML =
                            "<img src='/static/network/LikedThumb.png' style='width:10%;height:50%;margin-right:10px;'> Unlike";
                    }

                    // Each post's View
                    likeTag.appendChild(postLikeTag);
                    postUser.appendChild(userTag);
                    post.appendChild(postUser);
                    post.appendChild(postBody);
                    post.appendChild(postTime);
                    post.appendChild(postLikeCount);
                    post.appendChild(likeTag);

                    // Edit Button
                    const btnE = document.createElement("button");
                    btnE.className = "btn btn-edit";
                    btnE.innerHTML = "Edit";

                    // Required author to edit
                    if (
                        userTag.innerHTML ==
                        document.querySelector("#request-user").innerHTML
                    ) {
                        postUser.appendChild(btnE);
                    }

                    btnE.onclick = function () {
                        // Hide post's contents
                        btnE.style.display = "none";
                        postBody.style.display = "none";
                        postTime.style.display = "none";
                        postLikeCount.style.display = "none";
                        likeTag.style.display = "none";

                        // Create a textarea to user for edit
                        const textarea = document.createElement("textarea");
                        textarea.defaultValue = postBody.innerHTML;
                        textarea.className = "edit-post";
                        post.append(textarea);
                        const btnS = document.createElement("button");
                        btnS.textContent = "Save";
                        btnS.className = "btn btn-save";
                        post.append(btnS);

                        // Save after edit
                        btnS.addEventListener("click", () => {
                            // Function to update the post
                            edit(contents.id);
                            // Update the innerHTML without reload page
                            postBody.innerHTML = textarea.value;
                            // Remove edit element
                            textarea.remove();
                            btnS.remove();
                            // Show post
                            btnE.style.display = "flex";
                            postBody.style.display = "block";
                            postTime.style.display = "block";
                            postLikeCount.style.display = "block";
                            likeTag.style.display = "block";
                        });
                    };

                    // Add post to page
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

function post() {
    // New post contents
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
                load("all");
            } else {
                window.location.replace("login");
            }
        });
}

function follow() {
    // Request user
    const username = document.querySelector(".btn-follow").value;

    fetch(`/profile/${username}/follow`, {
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result.message);
            console.log(result.followers);

            // HTML followers' count
            document.querySelector("#follower-div").innerHTML =
                result.followers.length + "<br> Followers";

            // Display of follow/unfollow
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

function edit(post_id) {
    // Edited contents
    const body = document.querySelector(".edit-post").value;

    fetch(`/edit/${post_id}`, {
        method: "PUT",
        body: JSON.stringify({
            body: body,
        }),
    });
    console.log("Post edited successfully.");
}

function like_post(post_id) {
    fetch(`/likepost/${post_id}`, {
        method: "PUT",
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.error != undefined) {
                window.location.replace("/login");
            }
        });
}
