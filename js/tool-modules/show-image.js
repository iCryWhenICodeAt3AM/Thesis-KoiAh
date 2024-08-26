function generateClassList(annotations, renderAnnotations) {
    const uniqueClasses = [...new Set(annotations.map(annotation => annotation.label))];
    const classListDiv = document.getElementById('classList');

    // Clear the list first
    classListDiv.innerHTML = '';

    // Create a clickable item for each unique class
    uniqueClasses.forEach(label => {
        const div = document.createElement('div');
        div.className = 'col-12';

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        const countDiv = document.createElement('div');
        countDiv.className = 'col-4';
        countDiv.textContent = annotations.filter(annotation => annotation.label === label).length;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'col-8';
        labelDiv.textContent = label;
        labelDiv.style.cursor = 'pointer';
        labelDiv.dataset.label = label;
        labelDiv.classList.add('active'); // Default to active

        // Attach event listener to toggle visibility of annotations
        labelDiv.addEventListener('click', function() {
            this.classList.toggle('active');
            renderAnnotations();
        });

        rowDiv.appendChild(countDiv);
        rowDiv.appendChild(labelDiv);
        div.appendChild(rowDiv);
        classListDiv.appendChild(div);
    });
}

function generateItemList(annotations, renderAnnotations) {
    const itemListDiv = document.getElementById('itemList');

    // Clear the list first
    itemListDiv.innerHTML = '';

    // Create a clickable item for each annotation
    annotations.forEach((annotation, index) => {
        const div = document.createElement('div');
        div.className = 'col-12';

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'col-12';
        labelDiv.textContent = `${annotation.label} (${(annotation.confidence * 100).toFixed(2)}%)`;
        labelDiv.style.cursor = 'pointer';
        labelDiv.dataset.index = index;

        // Attach event listener to highlight the annotation on hover
        labelDiv.addEventListener('mouseenter', function() {
            renderAnnotations([annotation]);
        });

        // Attach event listener to reset annotations on mouse leave
        labelDiv.addEventListener('mouseleave', function() {
            renderAnnotations();
        });

        rowDiv.appendChild(labelDiv);
        div.appendChild(rowDiv);
        itemListDiv.appendChild(div);
    });
}

let locked = false;
async function showImageAnnotation(filename) {
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

        // Calculate scaling factors to maintain aspect ratio and enforce minimum dimensions
        const maxDimension = 225;
        const scale = Math.max(maxDimension / img.width, maxDimension / img.height);
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Function to render annotations based on active labels
        function renderAnnotations(filteredAnnotations = annotations) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight); // Draw the image

            // Get active labels
            const activeLabels = Array.from(document.querySelectorAll('#classList .col-8.active')).map(div => div.dataset.label);

            // Draw scaled annotations
            filteredAnnotations.filter(annotation => activeLabels.includes(annotation.label)).forEach(annotation => {
                const { x, y, width, height } = annotation.coordinates;

                const adjustedX = x * scale;
                const adjustedY = y * scale;
                const adjustedWidth = width * scale;
                const adjustedHeight = height * scale;

                const rectX = adjustedX - adjustedWidth / 2;
                const rectY = adjustedY - adjustedHeight / 2;

                ctx.beginPath();
                ctx.rect(rectX, rectY, adjustedWidth, adjustedHeight);
                ctx.lineWidth = 5;
                ctx.strokeStyle = annotation.label !== "Unknown" ? 'red' : 'yellow';
                ctx.stroke();

                ctx.font = '14px Arial';
                ctx.fillStyle = annotation.label !== "Unknown" ? 'red' : 'yellow';
                ctx.fillText(`${annotation.label} (${(annotation.confidence * 100).toFixed(2)}%)`, rectX, rectY > 10 ? rectY - 5 : rectY + 15);
            });
        }

        // Generate the class list and item list with the render function attached
        generateClassList(annotations, renderAnnotations);
        generateItemList(annotations, renderAnnotations);

        // Initial rendering of annotations
        renderAnnotations();

        canvas.style.maxWidth = '350px';
        canvas.style.maxHeight = '350px';
    };

    img.onerror = function() {
        console.error("Image failed to load.");
        alert("Image could not be loaded.");
    };

    // Set the image source after defining the onload and onerror handlers
    const imageDataUrl = `data:${mimeType};base64,${imageFile.data}`;
    img.src = imageDataUrl;

    if (!locked) {
        // Show image of the first item in the list
        console.log('Showing image of the first item in the list');
        locked = true;
    }
}

// Toggle between class list and item list
document.querySelector('.btn-sm.active').addEventListener('click', function() {
    document.getElementById('classList').style.display = 'block';
    document.getElementById('itemList').style.display = 'none';
    this.classList.add('active');
    this.nextElementSibling.classList.remove('active');
});

document.querySelector('.btn-sm:not(.active)').addEventListener('click', function() {
    document.getElementById('classList').style.display = 'none';
    document.getElementById('itemList').style.display = 'block';
    this.classList.add('active');
    this.previousElementSibling.classList.remove('active');
});