function generateClassList(annotations, renderAnnotations) {
    const uniqueClasses = [...new Set(annotations.map(annotation => annotation.label))];
    const classListDiv = document.getElementById('classList');

    // Clear the list first
    classListDiv.innerHTML = '';

    // Create a Bootstrap table for the class list
    const table = document.createElement('table');
    table.style.maxHeight = '350px';
    table.className = 'table table-striped table-hover';

    // Create the table head
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const countHeader = document.createElement('th');
    countHeader.textContent = 'Count';
    const labelHeader = document.createElement('th');
    labelHeader.textContent = 'Label';
    headerRow.appendChild(countHeader);
    headerRow.appendChild(labelHeader);
    thead.appendChild(headerRow);

    // Create the table body
    const tbody = document.createElement('tbody');

    // Create a row for each unique class
    uniqueClasses.forEach(label => {
        const tr = document.createElement('tr');

        // Create the count cell
        const countCell = document.createElement('td');
        countCell.textContent = annotations.filter(annotation => annotation.label === label).length;

        // Create the label cell
        const labelCell = document.createElement('td');
        labelCell.textContent = label;
        labelCell.style.cursor = 'pointer';
        labelCell.dataset.label = label;
        labelCell.classList.add('active'); // Default to active
        labelCell.style.backgroundColor = 'lightblue'; // Set active color to light blue

        // Attach event listener to toggle visibility of annotations
        labelCell.addEventListener('click', function() {
            this.classList.toggle('active');
            renderAnnotations();
        });

        // Append the count cell and label cell to the table row
        tr.appendChild(countCell);
        tr.appendChild(labelCell);

        // Append the table row to the table body
        tbody.appendChild(tr);
    });

    // Append the table head and body to the table
    table.appendChild(thead);
    table.appendChild(tbody);

    // Append the table to the class list div
    classListDiv.appendChild(table);
}

function generateItemList(annotations, renderAnnotations) {
    const itemListDiv = document.getElementById('itemList');

    // Clear the list first
    itemListDiv.innerHTML = '';

    // Create a Bootstrap table for the annotations
    const table = document.createElement('table');
    table.style.maxHeight = '350px';
    table.className = 'table table-striped table-hover';

    // Create the table head
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const labelHeader = document.createElement('th');
    labelHeader.textContent = 'Annotation';
    headerRow.appendChild(labelHeader);
    thead.appendChild(headerRow);

    // Create the table body
    const tbody = document.createElement('tbody');

    // Add each annotation as a table row
    annotations.forEach((annotation, index) => {
        const tr = document.createElement('tr');

        // Create the label cell
        const labelCell = document.createElement('td');
        labelCell.textContent = `${annotation.label} (${(annotation.confidence * 100).toFixed(2)}%)`;
        labelCell.style.cursor = 'pointer';
        labelCell.dataset.index = index;

        // Attach event listener to highlight the annotation on hover
        labelCell.addEventListener('mouseenter', function() {
            renderAnnotations([annotation]);
        });

        // Attach event listener to reset annotations on mouse leave
        labelCell.addEventListener('mouseleave', function() {
            renderAnnotations();
        });

        // Append the label cell to the table row
        tr.appendChild(labelCell);

        // Append the table row to the table body
        tbody.appendChild(tr);
    });

    // Append the table head and body to the table
    table.appendChild(thead);
    table.appendChild(tbody);

    // Append the table to the item list div
    itemListDiv.appendChild(table);
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

        // Calculate scaling factors to maintain aspect ratio and enforce maximum dimensions
        const maxWidth = 350;
        const maxHeight = 350;
        let canvasWidth = img.width;
        let canvasHeight = img.height;

        if (canvasWidth > maxWidth || canvasHeight > maxHeight) {
            const widthRatio = maxWidth / canvasWidth;
            const heightRatio = maxHeight / canvasHeight;
            const scale = Math.min(widthRatio, heightRatio);
            canvasWidth = canvasWidth * scale;
            canvasHeight = canvasHeight * scale;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Function to render annotations based on active labels
        function renderAnnotations(filteredAnnotations = annotations) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight); // Draw the image

            // Get active labels
            const activeLabels = Array.from(document.querySelectorAll('#classList td.active')).map(td => td.dataset.label);

            // Draw scaled annotations
            filteredAnnotations.filter(annotation => activeLabels.includes(annotation.label)).forEach(annotation => {
                const { x, y, width, height } = annotation.coordinates;

                const adjustedX = x * (canvasWidth / img.width);
                const adjustedY = y * (canvasHeight / img.height);
                const adjustedWidth = width * (canvasWidth / img.width);
                const adjustedHeight = height * (canvasHeight / img.height);

                const rectX = adjustedX - adjustedWidth / 2;
                const rectY = adjustedY - adjustedHeight / 2;

                ctx.beginPath();
                ctx.rect(rectX, rectY, adjustedWidth, adjustedHeight);
                ctx.lineWidth = Math.min(canvasWidth, canvasHeight) / 100;
                ctx.strokeStyle = annotation.label !== "Unknown" ? 'white' : 'red';
                ctx.stroke();

                ctx.font = `${Math.min(canvasWidth, canvasHeight) / 30}px Arial`;
                ctx.fillStyle = annotation.label !== "Unknown" ? 'white' : 'yellow';
                ctx.fillText(`${annotation.label} (${(annotation.confidence * 100).toFixed(2)}%)`, rectX, rectY > 10 ? rectY - 5 : rectY + 15);
            });
        }

        // Generate the class list and item list with the render function attached
        generateClassList(annotations, renderAnnotations);
        generateItemList(annotations, renderAnnotations);

        // Initial rendering of annotations
        renderAnnotations();

        canvas.style.maxWidth = '400px';
        canvas.style.maxHeight = '';
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
document.querySelector('.btn-md.active').addEventListener('click', function() {
    document.getElementById('classList').style.display = 'block';
    document.getElementById('itemList').style.display = 'none';
    this.classList.add('active');
    this.nextElementSibling.classList.remove('active');
});

document.querySelector('.btn-md:not(.active)').addEventListener('click', function() {
    document.getElementById('classList').style.display = 'none';
    document.getElementById('itemList').style.display = 'block';
    this.classList.add('active');
    this.previousElementSibling.classList.remove('active');
});