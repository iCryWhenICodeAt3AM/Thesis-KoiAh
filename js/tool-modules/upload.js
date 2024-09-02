// Global variables
let uploadedImages = []; // Array to store uploaded images
let uploadedImagesData = [];
const existingFiles = new Set();
const exemptedFiles = new Set();

// Function to sanitize and shorten file names
function sanitizeFileName(name) {
    // Replace invalid characters with "-"
    let sanitized = name.replace(/[^\w\s.-]/g, '-');
    // Truncate if the name is too long
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
    }
    // Ensure name does not start with a number
    if (/^\d/.test(sanitized)) {
        sanitized = "_" + sanitized;
    }
    return sanitized;
}

// Function to display images and store them in the global variable
function displayImage() {
    let excludedImages = [];
    let imageIndex = 0;
    const imagesInput = document.getElementById('images');
    const folderInput = document.getElementById('folder');
    const imageContainer = document.getElementById('image-container');
    const imageCount = document.getElementById('image-count');
    const classLimit = document.getElementById('classLimit');

    // Combine files from both inputs
    const uploads = [...imagesInput.files, ...folderInput.files];

    for (const image of uploads) {
        let htmlContent = '';
        let htmlContentExtra = "";
        // Get file extension and check if it's an image format
        const idxDot = image.name.lastIndexOf(".") + 1;
        const extFile = image.name.substr(idxDot, image.name.length).toLowerCase();
        
        // Check if the file extension is valid for images and if it's not already processed
        if ((extFile === "jpg" || extFile === "jpeg" || extFile === "png") && !existingFiles.has(image.name) && !exemptedFiles.has(image.name)) {
            existingFiles.add(image.name);

            // Sanitize and shorten the file name
            let safeId = sanitizeFileName(image.name);

            const reader = new FileReader();
            reader.onload = (function(theImage) {
                return function(event) {
                    htmlContent += `
                        <div class="image-wrapper col-3 ${++imageIndex}" id="${imageIndex}0">
                            <div class="row d-flex justify-content-center">
                                <button class="delete-btn" onclick="deleteImage('${imageIndex}', '${theImage.name}')">X</button>
                                <img class="col-12 p-1 uploaded" src="${event.target.result}">
                            </div>
                        </div>
                    `;
                    imageContainer.innerHTML += htmlContent;
                    // Check if the webpage is user-testing.html
                    if (window.location.pathname.includes("user%20testing.html") || window.location.pathname.includes("tool.html")) {
                        htmlContentExtra += `
                        <div class="image-wrapper col-12 ${imageIndex}" id="${imageIndex}1" onclick="showImageAnnotation('${theImage.name}')">
                            <div class="row d-flex justify-content-center">
                                <img class="col-12 p-1 uploaded" src="${event.target.result}">
                            </div>
                        </div>
                        `;
                        // Add your code here
                        document.getElementById("image-container-extra").innerHTML += htmlContentExtra;
                    }

                    // Store image data in the global variable
                    uploadedImages.push({
                        name: theImage.name,
                        data: event.target.result.split(',')[1] // Keep base64 data
                    });
                    uploadedImagesData.push(theImage);
                    // imageCount.innerText = uploadedImages.length;
                    if (window.location.pathname.includes("tool.html")) {
                        classLimit.value = uploadedImages.length;
                    }
                };
            })(image);
            reader.onerror = function(error) {
                console.error('Error reading file:', image.name, error);
                excludedImages.push(image.name);
                existingFiles.delete(image.name);
                uploadedImagesData = uploadedImagesData.filter(img => img.name !== image.name);
            };
            reader.readAsDataURL(image);
        } else {
            excludedImages.push(image.name);
        }
    }
    
    // Clear file inputs after processing
    imagesInput.value = '';
    folderInput.value = '';

    console.log("Uploaded Images Data: ", uploadedImagesData);
    console.log("Uploaded Images: ", uploadedImages);
    console.log("Excluded Images: ", excludedImages.length);
    console.log("Existing Files: ", existingFiles);
    console.log("Exempted Files: ", exemptedFiles);
    // alert(excludedImages.length," had errors, check console logs for the names.")
}