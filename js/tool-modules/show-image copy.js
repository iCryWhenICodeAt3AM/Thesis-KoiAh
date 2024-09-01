function generateClassChecklist(annotations, renderAnnotations) {
    const uniqueClasses = [...new Set(annotations.map(annotation => annotation.label))];
    const classesListDiv = document.getElementById('classesList');

    // Clear the list first
    classesListDiv.innerHTML = '';

    // Create a checklist item for each unique class
    uniqueClasses.forEach(label => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input';
        input.id = `class-${label}`;
        input.value = label;
        input.checked = true; // Default to checked

        const labelElement = document.createElement('label');
        labelElement.className = 'form-check-label';
        labelElement.setAttribute('for', `class-${label}`);
        labelElement.textContent = label;

        // Attach event listener to re-render annotations on change
        input.addEventListener('change', renderAnnotations);

        div.appendChild(input);
        div.appendChild(labelElement);
        classesListDiv.appendChild(div);
    });
}

async function showImageModal(filename) {
    console.log(filename);
    console.log(filteredData, resultJsonData);

    const jsonData = [...filteredData, ...resultJsonData];
    const data = jsonData.find(item => item.image === filename || item[0] === filename);
    if (!data) {
        console.error("No data found for the filename:", filename);
        return;
    }

    const annotations = data.annotations || data[1];
    if (!annotations) {
        console.error("No annotations found for the filename:", filename);
        return;
    }

    // Find the image file in uploadedImages array
    const imageFile = uploadedImages.find(file => file.name === filename);
    if (!imageFile) {
        console.error("No uploaded image found for the filename:", filename);
        return;
    }

    const fileExtension = filename.split('.').pop().toLowerCase();
    let mimeType = 'image/jpeg';
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
    }

    const img = new Image();

    img.onload = function() {
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        const xScale = canvas.width / img.width;
        const yScale = canvas.height / img.height;

        // Function to render annotations based on checked classes
        function renderAnnotations() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.drawImage(img, 0, 0); // Redraw the image

            // Get checked classes
            const checkedClasses = Array.from(document.querySelectorAll('#classesList input:checked')).map(input => input.value);

            // Draw scaled annotations
            annotations.filter(annotation => checkedClasses.includes(annotation.label)).forEach(annotation => {
                const { x, y, width, height } = annotation.coordinates;
                
                const adjustedX = x * xScale;
                const adjustedY = y * yScale;
                const adjustedWidth = width * xScale;
                const adjustedHeight = height * yScale;

                const rectX = adjustedX - adjustedWidth / 2;
                const rectY = adjustedY - adjustedHeight / 2;

                ctx.beginPath();
                ctx.rect(rectX, rectY, adjustedWidth, adjustedHeight);
                ctx.lineWidth = 5;
                ctx.strokeStyle = annotation.label !== "Unknown" ? 'red' : 'yellow';
                ctx.stroke();

                ctx.font = '14px Arial';
                ctx.fillStyle = annotation.label !== "Unknown" ? 'red' : 'yellow';
                ctx.fillText(annotation.label, rectX, rectY > 10 ? rectY - 5 : rectY + 15);
            });
        }

        // Generate the class checklist with the render function attached
        generateClassChecklist(annotations, renderAnnotations);

        // Initial rendering of annotations
        renderAnnotations();

        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '80vh';

        // Re-render annotations when the checklist changes
        document.querySelectorAll('#classesList input').forEach(input => {
            input.addEventListener('change', renderAnnotations);
        });
    };

    img.onerror = function() {
        console.error("Image failed to load.");
        alert("Image could not be loaded.");
    };

    // Set the image source after defining the onload and onerror handlers
    const imageDataUrl = `data:${mimeType};base64,${imageFile.data}`;
    img.src = imageDataUrl;

    // Ensure the modal is shown after image loading
    const modalElement = document.getElementById('imageModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Ensure that the modal is fully loaded and displayed before attempting to render annotations
    modalElement.addEventListener('shown.bs.modal', () => {
        // You can put additional code here if needed after the modal is fully shown
    });

    modal.show();

    document.getElementById('closeModal').onclick = function() {
        modal.hide();
    };
}
