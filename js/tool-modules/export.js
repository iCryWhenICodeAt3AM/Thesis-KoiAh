// Function to open the modal
function openExportModal() {
    populateClassTable(); // Populate the table with class names and checkboxes
}

// Function to populate the class table in the modal
function populateClassTable() {
    const classContainer = document.getElementById('class-table-container');
    classContainer.innerHTML = ''; // Clear existing content

    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover', 'table-bordered', 'table-export'); // Add Bootstrap table classes
    table.innerHTML = `
        <thead class="thead-dark">
            <tr>
                <th>Select</th>
                <th>Class Name</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    Object.keys(globalLabelCounts).forEach(label => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center"><input type="checkbox" class="class-checkbox" value="${label}" checked /></td>
            <td>${label}</td>
        `;
        table.querySelector('tbody').appendChild(row);
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
    let includedImages = new Set();

    console.log(`Total images to process: ${uploadedImages.length}`);
    console.log(`Include unannotated: ${includeUnannotated}`);

    // Log all filtered data images
    console.log('Filtered Data Images:', data.map(item => item.image));

    for (const img of uploadedImages) {
        const arrayBuffer = new Uint8Array(atob(img.data).split("").map(char => char.charCodeAt(0)));

        const item = data.find(d => d.image === img.name);

        if (includeUnannotated || item) {
            includedImages.add(img.name);

            if (exportType === 'default') {
                zip.file(img.name, arrayBuffer);
            } else if (exportType === 'group' && item) {
                const uniqueLabels = [...new Set(item.annotations.map(annotation => annotation.label))];
                const numLabels = uniqueLabels.length;

                let folderName = '';
                if (numLabels === 1) {
                    const label = uniqueLabels[0];
                    const count = item.annotations.filter(ann => ann.label === label).length;
                    folderName = (count === 1) ? 'Solo' : 'Group';
                } else {
                    folderName = 'Varied';
                }

                uniqueLabels.forEach(label => {
                    zip.folder(`${folderName}/${label}`).file(img.name, arrayBuffer);
                });
            }
        }
    }

    console.log(`Included images: ${includedImages.size}`);
    console.log(`Expected number of images: ${data.length}`);

    // Log images that were not included
    const filteredImageNames = new Set(data.map(item => item.image));
    const includedImageNames = Array.from(includedImages);
    const missingImages = Array.from(filteredImageNames).filter(image => !includedImages.has(image));
    console.log('Missing Images:', missingImages);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'Dataset.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}