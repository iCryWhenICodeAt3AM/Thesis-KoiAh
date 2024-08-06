async function showImageModal(filename) {
    console.log(filename);
    // Find the image and its annotations from the currentJson or resultJson
    const jsonData = [...filteredData, ...resultJsonData];
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
        default:
            mimeType = 'image/jpeg';
    }

    // Create an image element
    const img = new Image();
    img.onload = function() {
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');

        // Calculate scaling factors based on canvas and image dimensions
        const xScale = canvas.width / img.width;
        const yScale = canvas.height / img.height;

        // Set canvas size to match image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Draw scaled annotations
        annotations.forEach(annotation => {
            const { x, y, width, height } = annotation.coordinates;

            // Adjust coordinates based on the scaling factor
            const adjustedX = x * xScale;
            const adjustedY = y * yScale;
            const adjustedWidth = width * xScale;
            const adjustedHeight = height * yScale;

            // Calculate top-left corner for rect
            const rectX = adjustedX - adjustedWidth / 2;
            const rectY = adjustedY - adjustedHeight / 2;

            // Draw rectangle
            ctx.beginPath();
            ctx.rect(rectX, rectY, adjustedWidth, adjustedHeight);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();

            // Draw label
            ctx.font = '14px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText(annotation.label, rectX, rectY > 10 ? rectY - 5 : rectY + 15);
        });

        // Adjust canvas style to fit within modal without stretching
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '80vh'; // Ensure it fits within the modal's height
    };

    const imageDataUrl = `data:${mimeType};base64,${imageFile.data}`;
    img.src = imageDataUrl;

    img.onerror = function() {
        console.error("Image failed to load.");
        alert("Image could not be loaded.");
    };

    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    modal.show();

    document.getElementById('closeModal').onclick = function() {
        modal.hide();
    };
}