// Hypothesis One Images
let koiImageUploads = [];
let nonKoiImageUploads = [];

// Hypothesis Two Images
let smallImageUploads = [];
let mediumImageUploads = [];
let largeImageUploads = [];

// Hypothesis One Ground Truth JSON
const koiGT = new Set();
const nonKoiGT = new Set();

// Hypothesis Two Ground Truth JSON
const smallGT = new Set();
const mediumGT = new Set();
const largeGT = new Set();

// Hypothesis One Prediction Boxes JSON
const koiPB = new Set();
const nonKoiPB = new Set();

// Hypothesis Two Prediction Boxes JSON
const smallPB = new Set();
const mediumPB = new Set();
const largePB = new Set();

// Hypothesis One Components
const koiImageCount = document.getElementById("k-images-count");
const nonKoiImageCount = document.getElementById("nk-images-count");
const koiGroundTruthCount = document.getElementById("k-ground-truth-count");
const nonKoiGroundTruthCount = document.getElementById("nk-ground-truth-count");
const koiPredictionsCount = document.getElementById("k-predictions-count");
const nonKoiPredictionsCount = document.getElementById("nk-predictions-count");
const koiImageContainer = document.getElementById("k-image-container");
const nonKoiImageContainer = document.getElementById("nk-image-container");

// Hypothesis Two Components
const smallImageCount = document.getElementById("small-images-count");
const mediumImageCount = document.getElementById("medium-images-count");
const largeImageCount = document.getElementById("large-images-count");
const smallGroundTruthCount = document.getElementById("small-ground-truth-count");
const mediumGroundTruthCount = document.getElementById("medium-ground-truth-count");
const largeGroundTruthCount = document.getElementById("large-ground-truth-count");
const smallPredictionsCount = document.getElementById("small-predictions-count");
const mediumPredictionsCount = document.getElementById("medium-predictions-count");
const largePredictionsCount = document.getElementById("large-predictions-count");

// Storing and Displaying Images
function displayImage(event) {
    // Get the input element and files
    const inputElement = event.target;
    const files = inputElement.files;

    // Determine which input triggered the event
    const isKoi = inputElement.id.includes("koi");
    const isNonKoi = inputElement.id.includes("nonKoi");
    const isSmall = inputElement.id.includes("small");
    const isMedium = inputElement.id.includes("medium");
    const isLarge = inputElement.id.includes("large");

    let containerId = "";
    let countElementId = "";
    let uploadedImages = [];
    let imageContainer = "";

    // Determine the container and count element based on input type
    if (isKoi) {
        containerId = "k-image-container";
        countElementId = "k-images-count";
        uploadedImages = koiImageUploads;
    } else if (isNonKoi) {
        containerId = "nk-image-container";
        countElementId = "nk-images-count";
        uploadedImages = nonKoiImageUploads;
    } else if (isSmall) {
        countElementId = "small-images-count";
        uploadedImages = smallImageUploads;
    } else if (isMedium) {
        countElementId = "medium-images-count";
        uploadedImages = mediumImageUploads;
    } else if (isLarge) {
        countElementId = "large-images-count";
        uploadedImages = largeImageUploads;
    }

    // Get the container and count elements
    if (isKoi || isNonKoi) {
        imageContainer = document.getElementById(containerId);
    }
    const countElement = document.getElementById(countElementId);

    // Loop through files and store them
    for (const file of files) {
        // Check if the file is already uploaded
        const isAlreadyUploaded = uploadedImages.some(img => img.name === file.name);
        if (isAlreadyUploaded) {
            continue;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImages.push({
                name: file.name,
                data: e.target.result.split(',')[1] // Keep base64 data
            });

            if (isKoi || isNonKoi) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.classList.add("img-thumbnail", "m-1"); // Add Bootstrap classes for styling
                img.style.width = "100px"; // Adjust the size as needed
                imageContainer.appendChild(img);
            }

            // Update the image count after each image is read
            countElement.innerText = uploadedImages.length;

            // Logging the counts and uploads for debugging
            console.log("");
            console.log("Images Count: ", uploadedImages.length);
            console.log("---");
            console.log("Koi Images: ", koiImageUploads);
            console.log("Non Koi Images: ", nonKoiImageUploads);
            console.log("---");
            console.log("Small Images: ", smallImageUploads);
            console.log("Medium Images: ", mediumImageUploads);
            console.log("Large Images: ", largeImageUploads);
        };
        reader.readAsDataURL(file);
    }
}