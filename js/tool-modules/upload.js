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
    const images = document.getElementById('images').files;
    const folder = document.getElementById('folder').files;

    const uploads = [...images, ...folder];

    const imageContainer = document.getElementById('image-container');
    const imageCount = document.getElementById('image-count');

    for (const image of uploads) {
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
                    const img = document.createElement('img');
                    img.className = 'col-3 p-1 ' + safeId;
                    img.id = safeId;
                    img.src = event.target.result;
                    imageContainer.appendChild(img);

                    // Store image data in the global variable
                    uploadedImages.push({
                        name: theImage.name,
                        data: event.target.result.split(',')[1] // Keep base64 data
                    });
                    uploadedImagesData.push(theImage);
                    imageCount.innerText = uploadedImages.length;
                };
            })(image);
            reader.onerror = function(error) {
                console.error('Error reading file:', image.name, error);
                excludedImages.push(image.name);
                existingFiles.remove(image.name);
                uploadedImagesData.remove(image.name);
            };
            reader.readAsDataURL(image);
        } else {
            excludedImages.push(image.name);
        }
    }
    console.log("Uploaded Images Data: ", uploadedImagesData);
    console.log("Uploaded Images: ", uploadedImages);
    console.log("Excluded Images: ", excludedImages.length);
    // alert(excludedImages.length," had errors, check console logs for the names.")
}