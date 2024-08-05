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
    const images = document.getElementById('images').files;
    const folder = document.getElementById('folder').files;

    const uploads = [...images, ...folder];

    const imageContainer = document.getElementById('image-container');
    const imageCount = document.getElementById('image-count');

    for (const image of uploads) {
        let htmlContent = '';
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
                        <div class="image-wrapper col-3 ${++imageIndex}" id="${imageIndex}">
                            <div class="row d-flex justify-content-center">
                                <button class="delete-btn" onclick="deleteImage('${imageIndex}', '${theImage.name}')">X</button>
                                <img class="col-12 p-1" src="${event.target.result}">
                            </div>
                        </div>
                    `;
                    // const img = document.createElement('img');
                    // img.className = 'col-3 p-1 ' + safeId;
                    // img.id = safeId;
                    // img.src = event.target.result;
                    imageContainer.innerHTML += htmlContent;

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
    console.log("Existing Files: ", existingFiles);
    console.log("Exempted Files: ", exemptedFiles);
    // alert(excludedImages.length," had errors, check console logs for the names.")
}


// Function to handle the image delete
async function deleteImage(index, imageName) {
    // Remove the image element from the DOM
    const imgWrapper = document.getElementById(index);
    if (imgWrapper) {
        imgWrapper.remove();
    }

    // Remove the image data from the global variables
    existingFiles.delete(imageName);
    uploadedImages = uploadedImages.filter(img => img.name !== imageName);
    resultJsonData = resultJsonData.filter(json => json[0] !== imageName);
    if (typeof currentJsonData !== 'undefined' && currentJsonData.length > 0) {
        currentJsonData = currentJsonData.filter(json => json.image !== imageName);
        document.getElementById("annotated-count").innerText = currentJsonData.length;
        console.log("JSON: ", currentJsonData);
    }
    if (typeof uploadedImagesData !== 'undefined' && uploadedImagesData.length > 0) {
        uploadedImagesData = uploadedImagesData.filter(json => json.name !== imageName);
        console.log("Image Data: ", uploadedImagesData);
        console.log("Images: ", uploadedImages);
    }
    // Check if plotAnnotations function exists and call it
    if (typeof plotAnnotations === 'function') {
        console.log("PLOT!!!", resultJsonData);
        await plotAnnotations(); // Update annotation counts
    }
    // Update the image count
    const imageCount = document.getElementById('image-count');
    imageCount.innerText = uploadedImages.length;
    
    console.log("Deleted Image:", imageName);
    console.log("Files: ", existingFiles, "Images: ", uploadedImages);
}