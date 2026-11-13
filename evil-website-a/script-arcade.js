
// API INFORMATION
const insultAPI = "https://evilinsult.com/generate_insult.php?lang=en&type=json";
const openAIAPI = "https://cse2004.com/api/openai/responses";
const classAPIKey = "yytoqxh5qvgj";

// VARIABLES
let currentInsult = "";
let currentComeback = "";
let selectedTone = "Funny";
let insultActionsTimer;
let comebackActionsTimer;
let insultReturnScrollY = 0;
let comebackReturnScrollY = 0;

function fitResultToViewport(result) {
    if (!result || result.classList.contains("hidden")) return;

    const quote = result.querySelector(".result-text");
    const actions = result.querySelector(".result-actions");
    if (!quote || !actions) return;

    quote.style.fontSize = "";
    const styles = getComputedStyle(result);
    const availableHeight = result.clientHeight -
        parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const gap = parseFloat(getComputedStyle(actions).marginTop) || 0;
    let size = parseFloat(getComputedStyle(quote).fontSize);

    while (size > 14 && quote.scrollHeight + gap + actions.scrollHeight > availableHeight) {
        size -= 1;
        quote.style.fontSize = size + "px";
    }
}

window.addEventListener("resize", function() {
    fitResultToViewport(document.getElementById("insult-result"));
    fitResultToViewport(document.getElementById("comeback-result"));
});

// Rotate the homepage artwork, preloading each frame so the crossfade stays smooth.
const homepageImageFiles = [
    "homepage1.png",
    "homepage2.png",
    "homepage3.png",
    "homepage4.png",
    "homepage5.png",
    "homepage6.png"
];
const homepageImage = document.querySelector(".home-image");
let homepageImageIndex = 0;
homepageImageFiles.slice(1).forEach(function(file) {
    const image = new Image();
    image.src = file;
});

if (homepageImage) {
    setInterval(function() {
        homepageImageIndex = (homepageImageIndex + 1) % homepageImageFiles.length;
        homepageImage.src = homepageImageFiles[homepageImageIndex];
    }, 2000);
}

const enemiesWord = document.querySelector(".enemies-word");
if (enemiesWord && "IntersectionObserver" in window) {
    const enemiesObserver = new IntersectionObserver(function(entries) {
        if (entries.some(function(entry) { return entry.isIntersecting; })) {
            enemiesWord.classList.add("animate");
            enemiesObserver.disconnect();
        }
    }, { threshold: 0.5 });
    enemiesObserver.observe(enemiesWord);
}

// INSULT GENERATOR
const generateInsultButton = document.getElementById("generate-insult");
const anotherInsultButton = document.getElementById("another-insult");





async function generateInsult() {
    clearTimeout(insultActionsTimer);
    document.getElementById("insult-loading").classList.remove("hidden");
    const insultResult = document.getElementById("insult-result");
    if (insultResult.classList.contains("hidden")) insultReturnScrollY = window.scrollY;
    insultResult.classList.add("hidden");
    insultResult.classList.remove("actions-visible");
    document.getElementById("insult-error").textContent = "";

    try {
        // Add a random number to prevent cached responses
        const freshInsultAPI = insultAPI + "&test=" + Math.random();

        const response = await fetch(
            "https://cse2004.com/api/proxy?url=" +
            encodeURIComponent(freshInsultAPI),
            {
                headers: {
                    "Authorization": "Bearer " + classAPIKey
                }
            }
        );

        if (!response.ok) {
            throw new Error("API error: " + response.status);
        }

        const data = await response.json();

        if (!data.insult) {
            throw new Error("No insult was returned.");
        }

        const textArea = document.createElement("textarea");
textArea.innerHTML = data.insult;
currentInsult = textArea.value;

        document.getElementById("insult-text").textContent = currentInsult;
        insultResult.classList.remove("hidden");
        fitResultToViewport(insultResult);
        // Restart the reveal animation whenever a new insult arrives.
        void insultResult.offsetWidth;
        insultActionsTimer = setTimeout(function() {
            insultResult.classList.add("actions-visible");
        }, 1500);

    } catch (error) {
        document.getElementById("insult-error").textContent =
            "Oops! We couldn't generate an insult. Try again.";
        console.error("Insult generator error:", error);

    } finally {
        document.getElementById("insult-loading").classList.add("hidden");
    }
}




generateInsultButton.addEventListener("click", generateInsult);
anotherInsultButton.addEventListener("click", generateInsult);

document.getElementById("close-insult").addEventListener("click", function(event) {
    event.preventDefault();
    clearTimeout(insultActionsTimer);
    const insultResult = document.getElementById("insult-result");
    insultResult.classList.add("hidden");
    insultResult.classList.remove("actions-visible");
    window.scrollTo({ top: insultReturnScrollY, behavior: "instant" });
});


// TONE BUTTONS
const toneButtons = document.querySelectorAll(".tone-button");

toneButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        toneButtons.forEach(function(otherButton) {
            otherButton.classList.remove("selected");
        });

        button.classList.add("selected");
        selectedTone = button.dataset.tone;
    });
});


// COMEBACK GENERATOR
const generateComebackButton = document.getElementById("generate-comeback");
const anotherComebackButton = document.getElementById("another-comeback");

async function generateComeback() {
    const userInput = document.getElementById("comeback-input").value.trim();

    if (userInput === "") {
        document.getElementById("comeback-error").textContent =
            "Please enter what the other person said first.";
        return;
    }

    clearTimeout(comebackActionsTimer);
    document.getElementById("comeback-loading").classList.remove("hidden");
    const comebackResult = document.getElementById("comeback-result");
    if (comebackResult.classList.contains("hidden")) comebackReturnScrollY = window.scrollY;
    comebackResult.classList.add("hidden");
    comebackResult.classList.remove("actions-visible");
    document.getElementById("comeback-error").textContent = "";

    try {
        const prompt =
            "Write one short, clever comeback in a " + selectedTone +
            " tone in response to this comment: " + userInput +
            ". Only give me the comeback, without an explanation or quotation marks.";

        const response = await fetch(openAIAPI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + classAPIKey
            },
            body: JSON.stringify({ input: prompt })
        });

        if (!response.ok) {
            throw new Error("Could not generate a comeback. Status: " + response.status);
        }

        const data = await response.json();
        currentComeback = data.text;

        if (!currentComeback) {
            throw new Error("OpenAI did not return a comeback.");
        }

        document.getElementById("comeback-text").textContent = currentComeback;
        comebackResult.classList.remove("hidden");
        fitResultToViewport(comebackResult);
        void comebackResult.offsetWidth;
        comebackActionsTimer = setTimeout(function() {
            comebackResult.classList.add("actions-visible");
        }, 1500);

    } catch (error) {
        document.getElementById("comeback-error").textContent =
            "Oops! Something went wrong. Please try again.";
        console.error(error);
    }

    document.getElementById("comeback-loading").classList.add("hidden");
}

generateComebackButton.addEventListener("click", generateComeback);
anotherComebackButton.addEventListener("click", generateComeback);

document.getElementById("close-comeback").addEventListener("click", function(event) {
    event.preventDefault();
    clearTimeout(comebackActionsTimer);
    const comebackResult = document.getElementById("comeback-result");
    comebackResult.classList.add("hidden");
    comebackResult.classList.remove("actions-visible");
    window.scrollTo({ top: comebackReturnScrollY, behavior: "instant" });
});


// COPY BUTTONS
document.getElementById("copy-insult").addEventListener("click", function() {
    if (currentInsult !== "") {
        navigator.clipboard.writeText(currentInsult);
    }
});

document.getElementById("copy-comeback").addEventListener("click", function() {
    if (currentComeback !== "") {
        navigator.clipboard.writeText(currentComeback);
    }
});


// FAVORITES / LOCAL STORAGE
let favorites = [];
try {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    favorites = Array.isArray(storedFavorites) ? storedFavorites : [];
} catch (error) {
    // Keep favorites usable during this visit if browser storage is unavailable.
    console.warn("Favorites could not be loaded from browser storage:", error);
}

function saveFavorites() {
    try {
        localStorage.setItem("favorites", JSON.stringify(favorites));
        return true;
    } catch (error) {
        console.warn("Favorites could not be saved to browser storage:", error);
        return false;
    }
}

function goToFavorites() {
    clearTimeout(insultActionsTimer);
    clearTimeout(comebackActionsTimer);
    document.getElementById("insult-result").classList.add("hidden");
    document.getElementById("comeback-result").classList.add("hidden");
    document.getElementById("insult-result").classList.remove("actions-visible");
    document.getElementById("comeback-result").classList.remove("actions-visible");
    requestAnimationFrame(function() {
        displayFavorites();
        document.getElementById("favorites").scrollIntoView({ behavior: "smooth" });
    });
}


// SAVE INSULT
document.getElementById("save-insult").addEventListener("click", function(event) {
    event.preventDefault();
    if (currentInsult !== "") {
        favorites.push({
            text: currentInsult,
            type: "Insult"
        });

        saveFavorites();
        displayFavorites();
        goToFavorites();
    }
});


// SAVE COMEBACK
document.getElementById("save-comeback").addEventListener("click", function(event) {
    event.preventDefault();
    if (currentComeback !== "") {
        favorites.push({
            text: currentComeback,
            type: "Comeback"
        });

        saveFavorites();
        displayFavorites();
        goToFavorites();
    }
});


// DISPLAY FAVORITES

// DISPLAY FAVORITES
function displayFavorites() {
    const favoritesList = document.getElementById("favorites-list");

    // Clear the current favorites
    favoritesList.innerHTML = "";

    // Show a message if there are no saved favorites
    if (favorites.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.id = "empty-message";
        emptyMessage.textContent = "Nothing to see here... yet.";
        favoritesList.appendChild(emptyMessage);
        return;
    }

    // Create a card for each favorite
    favorites.forEach(function(favorite) {
        const card = document.createElement("div");
        card.classList.add("favorite-card");

        const type = document.createElement("p");
        type.classList.add("favorite-type");
        type.textContent = favorite.type;

        const text = document.createElement("p");
        text.classList.add("favorite-text");
        text.textContent = favorite.text;

        const actions = document.createElement("div");
        actions.classList.add("favorite-actions");

        const copyButton = document.createElement("button");
        copyButton.textContent = "COPY";

        const removeButton = document.createElement("button");
        removeButton.textContent = "REMOVE";
        removeButton.type = "button";

        copyButton.addEventListener("click", function() {
            navigator.clipboard.writeText(favorite.text);
        });

        removeButton.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();

            const favoriteIndex = favorites.indexOf(favorite);
            if (favoriteIndex === -1) return;

            favorites.splice(favoriteIndex, 1);
            saveFavorites();
            displayFavorites();
        });

        actions.appendChild(copyButton);
        actions.appendChild(removeButton);

        card.appendChild(type);
        card.appendChild(text);
        card.appendChild(actions);

        favoritesList.appendChild(card);
    });
}


function refreshFavoritesFromStorage() {
    try {
        const latestFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        if (Array.isArray(latestFavorites)) {
            favorites = latestFavorites;
            displayFavorites();
        }
    } catch (error) {
        console.warn("Favorites could not be refreshed from browser storage:", error);
    }
}

document.querySelector('a[href="#favorites"]').addEventListener("click", function() {
    refreshFavoritesFromStorage();
});

window.addEventListener("storage", function(event) {
    if (event.key === "favorites") refreshFavoritesFromStorage();
});

// Load favorites when the page opens
displayFavorites();

