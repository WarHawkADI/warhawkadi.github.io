
let visitCount = getCookie("visitCount") || 0;

document.getElementById("visit-counter").innerText = visitCount;
visitCount++;
document.cookie = `visitCount=${visitCount}; expires=${getCookieExpirationDate()}; path=/`;

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null;
}

function getCookieExpirationDate() {
    const date = new Date();
    date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
    return date.toUTCString();
}

var $ = document.querySelector.bind(document);
var $on = document.addEventListener.bind(document);

var xmouse, ymouse;
$on('mousemove', function (e) {
    xmouse = e.clientX || e.pageX;
    ymouse = e.clientY || e.pageY;
});

var ball = document.getElementById('ball');
var x = void 0,
    y = void 0,
    dx = void 0,
    dy = void 0,
    key = -1;

var followMouse = function followMouse() {
    key = requestAnimationFrame(followMouse);

    if (!x || !y) {
        x = xmouse;
        y = ymouse;
    } else {
        dx = (xmouse - x) * 0.125;
        dy = (ymouse - y) * 0.125;
        if (Math.abs(dx) + Math.abs(dy) < 0.1) {
            x = xmouse;
            y = ymouse;
        } else {
            x += dx;
            y += dy;
        }
    }
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
}

// Set a smaller size for the ball
ball.style.width = '20px';
ball.style.height = '20px';

// Start the ball following the mouse movement
followMouse();


document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevents default form submission (page reload)
    var form = this;

    fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { "Accept": "application/json" }
    }).then(response => {
        if (response.ok) {
            alert("Thank you! Your message has been sent.");
            form.reset();
        } else {
            alert("Something went wrong. Please try again.");
        }
    }).catch(() => alert("Error connecting to the server. Try again later."));
});
function selectEmoji(selected) {
    // Remove "active" class from all emojis
    document.querySelectorAll(".emoji").forEach(emoji => {
        emoji.classList.remove("active");
    });

    // Add "active" class to the clicked emoji
    selected.classList.add("active");
}
