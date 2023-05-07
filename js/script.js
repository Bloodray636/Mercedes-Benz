function registration() {
    fetch(`${window.location.origin}/api/v1/registration`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            login: document.querySelector("#login").value,
            password: document.querySelector("#password").value,
            repeatPassword: document.querySelector("#repeatPassword").value
        })
    }).then(function (response) {
        return response.json().then(function (resp) {
            console.log(resp);
        });
    });
}

function login() {
    fetch(`${window.location.origin}/api/v1/login`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            login: document.querySelector("#login").value,
            password: document.querySelector("#password").value
        })
    }).then(function (response) {
        return response.json().then(function (resp) {
            console.log(resp);
        });
    });
}

function logout() {
    fetch(`${window.location.origin}/api/v1/logout`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (response) {
        return response.json().then(function (resp) {
            console.log(resp);
        });
    });
}

function addPost() {
    let date = new Date();
    let hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    let minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`; 
    let image = document.querySelector("#postImage").files[0];
    let formData = new FormData();
    formData.append("title", document.querySelector("#postTitle").value);
    formData.append("body", document.querySelector("#postBody").value);
    formData.append("tag", document.querySelector("#postTag").value);
    formData.append("publicationTime", `${hours}:${minutes}`);
    formData.append("image", image, image.name);
    fetch(`${window.location.origin}/api/v1/addPost`, {
        method: 'POST',
        body: formData
    }).then(function (response) {
        return response.json().then(function (resp) {
            console.log(resp);
            fetch(`${window.location.origin}/api/v1/getLastPostId`, {
                method: 'POST'
            }).then(function (response) {
                return response.json().then(function (resp) {
                    createPostCard(
                        formData.get("title"), 
                        formData.get("tag"), 
                        formData.get("publicationTime"), 
                        resp["id"], 
                        `/pages/post_images/${image.name}`
                    );
                })
            });
        });
    });
}

function getPosts() {
    let args = window.location.search;
    if (args.length === 0) {
        redirectToSecurityNews();
    }
    args = args.split("&");
    if (args.length > 1) {
        redirectToSecurityNews();
    }
    args[0] = args[0].substring(1, args[0].length);
    args.map(function (arg) {
        if (!(arg.startsWith("id=") || arg.startsWith("tag="))) {
            redirectToSecurityNews();
        }

        if (arg.startsWith("tag=")) {
            let tag = arg.substring(arg.indexOf("=") + 1, arg.length);
            if (["security", "administration", "social", "health", "studying"].indexOf(tag) === -1) {
                redirectToSecurityNews();
            }
            getPostsByTag(tag);
        } else if (arg.startsWith("id=")) {
            document.querySelector("#addPostForm").style.display = "none";
            let id = arg.substring(arg.indexOf("=") + 1, arg.length);
            getPostById(id);
        }
    })
}

function isAdmin() {
    fetch(`${window.location.origin}/api/v1/isAdmin`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (response) {
        return response.json().then(function (resp) {
            if (resp["response"] === "admin") {
                document.querySelector("#addPostForm").style.visibility = "visible";
            }
        });
    });
}

function getPostById(id) {
    fetch(`${window.location.origin}/api/v1/getPostById`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id
        })
    }).then(function (response) {
        return response.json().then(function (resp) {
            console.log(resp);
            if (!resp["response"] && Object.keys(resp).length > 0) {
                let key = Object.keys(resp)[0];
                let body = resp[key].body.replaceAll("\n", "<br>");
                createFullPost(resp[key].title, body, resp[key].tag, resp[key].publication_time, resp[key].image);
            }
        });
    });
}

function getPostsByTag(tag) {
    fetch(`${window.location.origin}/api/v1/getPostsByTag`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tag: tag
        })
    }).then(function (response) {
        return response.json().then(function (resp) {
            console.log(resp);
            if (!resp["response"] && Object.keys(resp).length > 0) {
                Object.keys(resp).map(function (key) {
                    let body = resp[key].body.replaceAll("\n", "<br>");
                    createPostCard(resp[key].title, resp[key].tag, resp[key].publication_time, key, resp[key].image);
                });
            }
        });
    });
}

function redirectToSecurityNews() {
    window.location = "/posts/?tag=security";
    return;
}

function translateTag(tag) {
    if (tag === "security") {
        return "Безопасность";
    } else if (tag === "administration") {
        return "Администрация";
    } else if (tag === "social") {
        return "Социальная сфера";
    } else if (tag === "health") {
        return "Здравоохранение";
    } else if (tag === "studying") {
        return "Образование";
    }
}

function createPostCard(title, tag, publicationTime, id, image) {
    let pageTag = window.location.search;
    pageTag = pageTag.substring(pageTag.indexOf("=") + 1, pageTag.length);
    if (pageTag !== tag) {
        return;
    }
    let post = document.createElement("div");
    let postImage = document.createElement("img");
    postImage.alt = "post image";
    postImage.src = image;
    postImage.width = 200;
    postImage.height = 200;
    let aTitle = document.createElement("a");
    aTitle.innerHTML = `Title: ${title}`;
    aTitle.href = `?id=${id}`;
    let pTag = document.createElement("p");
    pTag.innerText = `Tag: ${translateTag(tag)}`;
    let pPublicationTime = document.createElement("p");
    pPublicationTime.innerText = `Publication time: ${publicationTime}`;
    post.appendChild(postImage);
    post.appendChild(aTitle);
    post.appendChild(pTag);
    post.appendChild(pPublicationTime);
    post.appendChild(document.createElement("hr"));
    document.querySelector("#posts").appendChild(post);
}

function createFullPost(title, body, tag, publicationTime, image) {
    let post = document.createElement("div");
    let postImage = document.createElement("img");
    postImage.alt = "post image";
    postImage.src = image;
    postImage.width = 200;
    postImage.height = 200;
    let pTitle = document.createElement("p");
    pTitle.innerHTML = `Title: ${title}`;
    let pBody = document.createElement("p");
    pBody.innerHTML = `Body: ${body}`;
    let pTag = document.createElement("p");
    pTag.innerText = `Tag: ${tag}`;
    let pPublicationTime = document.createElement("p");
    pPublicationTime.innerText = `Publication time: ${publicationTime}`;
    post.appendChild(postImage);
    post.appendChild(document.createElement("br"));
    post.appendChild(pTitle);
    post.appendChild(pTag);
    post.appendChild(pPublicationTime);
    post.appendChild(pBody);
    post.appendChild(document.createElement("hr"));
    document.querySelector("#posts").appendChild(post);
}