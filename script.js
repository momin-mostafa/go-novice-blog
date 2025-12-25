// --- Theme Toggle Logic ---
const toggleBtn = document.getElementById("themeToggle");
const html = document.documentElement;

// Function to set and save the theme
function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    toggleBtn.textContent = theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
}

// Restore theme from localStorage on page load
const savedTheme = localStorage.getItem("theme") || "light";
// Only run the toggle logic if the button exists on the page
if (toggleBtn) {
    setTheme(savedTheme);

    // Toggle theme on button click
    toggleBtn.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        setTheme(next);
    });
}


// --- GitHub Navigation Logic ---
const username = "momin-mostafa";   // YOUR GitHub username
const repo = "blog-go-novice";      // YOUR repo name

async function buildNavigation() {
    const blogNav = document.getElementById("blogNav");
    // Only run navigation logic if the #blogNav element exists
    if (!blogNav) {
        return;
    }
    
    const url = `https://api.github.com/repos/${username}/${repo}/contents/`;
    const res = await fetch(url);
    const files = await res.json();

    // Filter blog files: blog_1.html, blog_2.html, ...
    let blogs = files
        .filter(f => /^blog_\d+\.html$/.test(f.name))
        .map(f => f.name);

    // Sort numerically (1, 2, 3 ...)
    blogs.sort((a, b) => {
        const n1 = parseInt(a.match(/\d+/)[0]);
        const n2 = parseInt(b.match(/\d+/)[0]);
        return n1 - n2;
    });

    const current = window.location.pathname.split("/").pop();
    const index = blogs.indexOf(current);

    let html = "";
    const baseButtonStyle = `padding:10px 16px; border-radius:8px; background:var(--card-bg); color:var(--text); border:none; cursor:pointer;`;

    // Previous blog button logic
    if (index > 0) {
        html += `<button onclick="location.href='${blogs[index - 1]}'" style="${baseButtonStyle}">
         ⬅ Previous
         </button>`;
    } else {
        html += `<button onclick="location.href='index.html'" style="${baseButtonStyle}">
         🏡 Home
         </button>`;
    }

    // Next blog button logic
    if (index < blogs.length - 1) {
        html += `<button onclick="location.href='${blogs[index + 1]}'" style="${baseButtonStyle}">
         Next ➜
         </button>`;
    } else {
        html += `<button onclick="location.href='index.html'" style="${baseButtonStyle}">
         🏡 Home
         </button>`;
    }

    blogNav.innerHTML = html;
}

// Ensure the function runs automatically when the script loads
buildNavigation();
