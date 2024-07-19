let existingFiles = new Set();
let exemptedFiles = new Set();

function displayImage() {
    const images = document.getElementById('images').files;
    const folder = document.getElementById('folder').files;
    const uploads = [...images, ...folder];

    const imageContainer = document.getElementById('image-container');
    const imageCount = document.getElementById('image-count');

    for (const image of uploads) {
        // Get file extension and check if it's an image format
        var idxDot = image.name.lastIndexOf(".") + 1;
        var extFile = image.name.substr(idxDot, image.name.length).toLowerCase();
        
        // Check if the file extension is valid for images and if it's not already processed
        if ((extFile === "jpg" || extFile === "jpeg" || extFile === "png") && !existingFiles.has(image.name) && !exemptedFiles.has(image.name)) {
            existingFiles.add(image.name);

            // Preprocess the image name to make it safe for ID attribute
            let safeId = image.name.replace(/\s+/g, "-"); // Replace whitespaces with "-"
            
            // Check if the name starts with a number, prepend "_" if true
            if (/^\d/.test(safeId)) {
                safeId = "_" + safeId;
            }

            const reader = new FileReader();
            reader.onload = (function(theImage) {
                return function(event) {
                    const img = document.createElement('img');
                    img.className = 'col-3 p-1 ' + safeId;
                    img.id = safeId;
                    img.src = event.target.result;
                    imageContainer.appendChild(img);
                };
            })(image);
            reader.readAsDataURL(image);
        }
    }
    imageCount.innerText = existingFiles.size+exemptedFiles.size;
}
