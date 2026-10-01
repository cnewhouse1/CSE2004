const behaviors = document.querySelectorAll(".behavior");

behaviors[0].addEventListener("click", function() {
    this.classList.toggle("flipped");

    if (this.classList.contains("flipped")) {
        this.querySelector("h3").textContent = "Excitement!";
    } else {
        this.querySelector("h3").textContent = "Binkying (Quick, high jumps/ running) means...";
    }
});

behaviors[1].addEventListener("click", function() {
    this.classList.toggle("flipped");

    if (this.classList.contains("flipped")) {
        this.querySelector("h3").textContent = "Relaxed!";
    } else {
        this.querySelector("h3").textContent = "Flopping Over means...";
    }
});

behaviors[2].addEventListener("click", function() {
    this.classList.toggle("flipped");

    if (this.classList.contains("flipped")) {
        this.querySelector("h3").textContent = "Scared!";
    } else {
        this.querySelector("h3").textContent = "Thumping means...";
    }
});

behaviors[3].addEventListener("click", function() {
    this.classList.toggle("flipped");

    if (this.classList.contains("flipped")) {
        this.querySelector("h3").textContent = "Pay Attention to Me!";
    } else {
        this.querySelector("h3").textContent = "Nudging You means...";
    }
});

behaviors[4].addEventListener("click", function() {
    this.classList.toggle("flipped");

    if (this.classList.contains("flipped")) {
        this.querySelector("h3").textContent = "Feeling Unsafe!";
    } else {
        this.querySelector("h3").textContent = "Hiding means...";
    }
});