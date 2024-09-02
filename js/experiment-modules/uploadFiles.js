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
const koiGroundTruthCount = document.querySelector(".k-ground-truth-count");
const nonKoiGroundTruthCount = document.querySelector(".nk-ground-truth-count");
const koiPredictionsCount = document.querySelector(".k-predictions-count");
const nonKoiPredictionsCount = document.querySelector(".nk-predictions-count");
const koiImageContainer = document.querySelector(".k-image-container");
const nonKoiImageContainer = document.querySelector(".nk-image-container");

// Hypothesis Two Components
const smallImageCount = document.querySelector(".small-images-count");
const mediumImageCount = document.querySelector(".medium-images-count");
const largeImageCount = document.querySelector(".large-images-count");
const smallGroundTruthCount = document.querySelector(".small-ground-truth-count");
const mediumGroundTruthCount = document.querySelector(".medium-ground-truth-count");
const largeGroundTruthCount = document.querySelector(".large-ground-truth-count");
const smallPredictionsCount = document.querySelector(".small-predictions-count");
const mediumPredictionsCount = document.querySelector(".medium-predictions-count");
const largePredictionsCount = document.querySelector(".large-predictions-count");

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
    let imageIndex = 0;


    // Determine the container and count element based on input type
    if (isKoi) {
        // containerId = "k-img-count";
        countElementId = "k-images-count";
        uploadedImages = koiImageUploads;
    } else if (isNonKoi) {
        // containerId = "nk-image-container";
        countElementId = "nk-images-count";
        uploadedImages = nonKoiImageUploads;
    } else if (isSmall) {
        // containerId = "small-image-container";
        countElementId = "small-images-count";
        uploadedImages = smallImageUploads;
    } else if (isMedium) {
        // containerId = "medium-image-container";
        countElementId = "medium-images-count";
        uploadedImages = mediumImageUploads;
    } else if (isLarge) {
        // containerId = "large-image-container";
        countElementId = "large-images-count";
        uploadedImages = largeImageUploads;
    }

    // Get the container and count elements
    imageContainer = document.getElementById(containerId);
    const countElement = document.querySelector(`.${countElementId}`);

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

            // imageContainer.innerHTML += `
            //     <div class="image-wrapper col-2 ${++imageIndex}" id="${imageIndex}0">
            //         <div class="row d-flex justify-content-center">
            //             <button class="delete-btn" onclick="deleteImage('${imageIndex}', '${file.name}')">X</button>
            //             <img class="col-12 p-1 uploaded" src="${e.target.result}">
            //         </div>
            //     </div>
            // `;
            countElement.innerText = uploadedImages.length;
            // Update the image count after each image is read
            // countElement.innerText = uploadedImages.length;

            // Logging the counts and uploads for debugging
            // console.log("");
            console.log("Images Count: ", uploadedImages.length);
            // console.log("---");
            // console.log("Koi Images: ", koiImageUploads);
            // console.log("Non Koi Images: ", nonKoiImageUploads);
            // console.log("---");
            // console.log("Small Images: ", smallImageUploads);
            // console.log("Medium Images: ", mediumImageUploads);
            // console.log("Large Images: ", largeImageUploads);
        };
        reader.readAsDataURL(file);
    }
}