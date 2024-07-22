function showImageModal(filename) {
    // Find the image and its annotations from the currentJson or resultJson
    const jsonData = [...filteredData, ...resultJsonData];
    console.log(filteredData, resultJsonData);
    const data = jsonData.find(item => item.image === filename);
    if (!data) {
        console.error("No data found for the filename:", filename);
        return;
    }

    const { annotations } = data;
    
    // Find the image file in uploadedImages array
    const imageFile = uploadedImages.find(file => file.name === filename);
    if (!imageFile) {
        console.error("No uploaded image found for the filename:", filename);
        return;
    }

    // Extract the file extension and determine the MIME type
    const fileExtension = filename.split('.').pop().toLowerCase();
    let mimeType = 'image/jpeg'; // Default MIME type
    switch (fileExtension) {
        case 'png':
            mimeType = 'image/png';
            break;
        case 'gif':
            mimeType = 'image/gif';
            break;
        case 'webp':
            mimeType = 'image/webp';
            break;
        // Add other cases as needed
        default:
            mimeType = 'image/jpeg'; // Fallback to JPEG if unknown
    }

    // Create an image element
    const img = new Image();

    // Create canvas elements
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const canvasOverlay = document.getElementById('cover');
    const ctxOverlay = canvasOverlay.getContext('2d');

    img.onload = function() {
        // Set canvas sizes
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.maxHeight = img.height;
        canvas.style.maxWidth = img.width;
        canvasOverlay.width = img.width;
        canvasOverlay.height = img.height;

        // Draw the image on the base canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Clear the overlay canvas
        ctxOverlay.clearRect(0, 0, img.width, img.height);

        // Draw annotations
        annotations.forEach(annotation => {
            const { x, y, width, height } = annotation.coordinates;

            // Draw rectangle
            ctxOverlay.beginPath();
            ctxOverlay.rect(x, y, width, height);
            ctxOverlay.lineWidth = 2;
            ctxOverlay.strokeStyle = 'red';
            ctxOverlay.stroke();

            // Draw label
            ctxOverlay.font = '14px Arial';
            ctxOverlay.fillStyle = 'red';
            ctxOverlay.fillText(annotation.label, x, y > 10 ? y - 5 : y + 15);
        });
    };

    // Specify the src to load the image
    const imageDataUrl = `data:${mimeType};base64,${imageFile.data}`;
    img.src = imageDataUrl;


    // Show the modal
    const modal = document.getElementById('imageModal');
    modal.style.display = 'block';

    // Add event listener to close the modal
    const closeButton = document.getElementById('closeModal');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside the content
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}


