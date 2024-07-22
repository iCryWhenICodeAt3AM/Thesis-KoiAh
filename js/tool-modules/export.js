// Function to open the modal
function openExportModal() {
    const modal = document.getElementById('export-modal');
    populateClassTable(); // Populate the table with class names and checkboxes
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('export-modal');
    modal.style.display = 'none';
}

// Function to populate the class table in the modal
function populateClassTable() {
    const classContainer = document.getElementById('class-table-container');
    classContainer.innerHTML = ''; // Clear existing content

    const table = document.createElement('table');
    table.innerHTML = '<tr><th>Select</th><th>Class Name</th></tr>';

    Object.keys(globalLabelCounts).forEach(label => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="class-checkbox" value="${label}" /></td>
            <td>${label}</td>
        `;
        table.appendChild(row);
    });

    classContainer.appendChild(table);
}

// Function to select all classes
function selectAllClasses() {
    document.querySelectorAll('.class-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
}

// Function to confirm export
function confirmExport() {
    const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    const filtered = filterDataBySelectedClasses(selectedClasses);
    exportData(filtered);
    
    closeModal(); // Close the modal after export
}

// Function to filter data by selected classes
function filterDataBySelectedClasses(selectedClasses) {
    let combinedData = [...filteredData, ...resultJsonData];

    return combinedData.filter(item => {
        const annotations = item.annotations;
        // Filters the annotations for selected only
        const filteredAnnotations = annotations.filter(annotation => {
            return selectedClasses.includes(annotation.label);
        });        
        const hasAnnotations = filteredAnnotations.length > 0;

        if (hasAnnotations) {
            item.annotations = filteredAnnotations; // Keep only selected class annotations
            return true;
        }

        return false;
    });
}

// Function to export the filtered data
async function exportData(filteredData) {
    const zip = new JSZip();

    // Add JSON file to ZIP
    const jsonBlob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    zip.file('createml.json', jsonBlob);

    // Add images to ZIP
    for (const img of uploadedImages) {
        const imageData = atob(img.data);
        const arrayBuffer = new Uint8Array(imageData.length);
        for (let i = 0; i < imageData.length; i++) {
            arrayBuffer[i] = imageData.charCodeAt(i);
        }
        zip.file(img.name, arrayBuffer);
    }

    // Generate the ZIP file and trigger download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'annotations.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL object
    URL.revokeObjectURL(zipUrl);
}