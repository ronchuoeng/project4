document.addEventListener('DOMContentLoaded', function() {
  
  // Post
  document.querySelector('#post-form').addEventListener('submit', post)

})

// Start with first page
let counter = 1;

// When DOM loads, render the first 10 posts
document.addEventListener('DOMContentLoaded', load);


function load() {

    // Set start and end post numbers, and update counter
    const page = counter;
    counter = page + 1;

    // Get new posts and add posts
    fetch(`/posts?page=${page}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Loops for posts
      data.forEach(contents => {
          // Create the Div for each post
          // Parent Div
          const post = document.createElement('div');
          post.className= 'post-view';
          // Child Div
          const postUser = document.createElement('div');
          postUser.className = 'post-user';
          const postBody = document.createElement('div');
          postBody.className = 'post-body';
          const postTime = document.createElement('div'); 
          postTime.className = 'post-time';   

          // Add the contents inside Child Div
          postUser.innerHTML = contents.user;
          postBody.innerHTML = contents.body;
          postTime.innerHTML = contents.timestamp;

          post.appendChild(postUser);
          post.appendChild(postBody);
          post.appendChild(postTime);

          // Add post to DOM
          document.querySelector('#allposts-view').append(post);         
      });
    })

};




function post(e) {
  e.preventDefault()

  const body = document.querySelector('#new-post').value;

  fetch('/network', {
    method: 'POST',
    body: JSON.stringify({
        body: body
    })
  })
  .then(response => {
    console.log(response);
    return response.json();
  })
  .then(result => {
    // Print result
    console.log(result);
  })
}
