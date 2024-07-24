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

    const exportType = document.querySelector('input[name="export-type"]:checked').value;
    const includeUnannotated = document.getElementById('include-unannotated').checked;

    const filteredData = filterDataBySelectedClasses(selectedClasses, includeUnannotated);
    exportData(filteredData, exportType);

    closeModal(); // Close the modal after export
}

// Function to filter data by selected classes
function filterDataBySelectedClasses(selectedClasses, includeUnannotated) {
    let combinedData = [...filteredData, ...resultJsonData];
    return combinedData.map(item => {
        const filteredAnnotations = item.annotations.filter(annotation => selectedClasses.includes(annotation.label));
        return { image: item.image, annotations: filteredAnnotations };
    }).filter(item => includeUnannotated || item.annotations.length > 0);
}

// Function to export the filtered data
async function exportData(data, exportType = 'default') {
    const zip = new JSZip();
    const createmlData = data.map(item => ({
        image: item.image,
        annotations: item.annotations
    }));

    const jsonBlob = new Blob([JSON.stringify(createmlData, null, 2)], { type: 'application/json' });
    zip.file('createml.json', jsonBlob);

    const includeUnannotated = document.getElementById('include-unannotated').checked;

    for (const img of uploadedImages) {
        const imageData = atob(img.data);
        const arrayBuffer = new Uint8Array(imageData.length);
        for (let i = 0; i < imageData.length; i++) {
            arrayBuffer[i] = imageData.charCodeAt(i);
        }

        const item = data.find(d => d.image === img.name);
        
        // Export if unannotated images are included or if the image has annotations
        if (includeUnannotated || item) {
            if (exportType === 'default') {
                zip.file(img.name, arrayBuffer);
            } else if (exportType === 'group' && item) {
                const uniqueLabels = [...new Set(item.annotations.map(annotation => annotation.label))];
                const numLabels = uniqueLabels.length;

                let folderName = '';
                if (numLabels === 1) {
                    const label = uniqueLabels[0];
                    const count = item.annotations.filter(ann => ann.label === label).length;
                    folderName = (count === 1) ? 'Solo' : 'Repeated';
                } else {
                    folderName = 'Varied';
                }

                uniqueLabels.forEach(label => {
                    zip.folder(`${folderName}/${label}`).file(img.name, arrayBuffer);
                });
            }
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'annotations.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}