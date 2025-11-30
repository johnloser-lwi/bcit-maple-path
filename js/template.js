const generateHeader = () => {
    document.querySelector("#header-template").innerHTML = `
        <header class="flex bg-deep-black p-4 w-10/10 items-center">
            <div class="flex-grow-1">
                <a href="index.html"><img class="h-8" src="assets/Logo.png" alt="logo"></a>
            </div>
            <nav>
                <ul class="flex gap-5 items-center">
                    <li><a class="nav-link" href="profile.html">Profile</a></li>
                    <li><a class="nav-link" href="consultation.html">Consultation</a></li>
                    <li><a class="nav-link" href="blog.html">Blog</a></li>
                </ul>
            </nav>
        </header>
    `;
}

const generateFooter = () => {
    document.querySelector("#footer-template").innerHTML = `
        <footer class="flex bg-deep-black p-4 w-10/10 items-center">
            <nav>
                <ul class="flex gap-10">
                    <li><a class="nav-link" href="#">Legal</a></li>
                    <li><a class="nav-link" href="#">Privacy</a></li>
                    <li><a class="nav-link" href="#">Contact Us</a></li>
                </ul>
            </nav>
        </footer>
    `;
}

generateHeader();
generateFooter();