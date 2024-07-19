let currentJsonData = []; // Initialize as an empty array

function loadJson() {
    const jsonFileInput = document.getElementById('jsonFile');
    const jsonFile = jsonFileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const jsonFileData = JSON.parse(event.target.result);

        // Only add new items from the JSON file that are not exempted or already existing
        jsonFileData.forEach(jsonItem => {
            if (!exemptedFiles.has(jsonItem.image) && existingFiles.has(jsonItem.image)) {
                currentJsonData.push(jsonItem);
                exemptedFiles.add(jsonItem.image);
                existingFiles.delete(jsonItem.image);
            }
        });

        console.log("Combined JSON Data:", currentJsonData);
        console.log("Existing Files:", existingFiles);
        console.log("Exempted Files:", exemptedFiles);

        const annotationCount = document.getElementById('annotated-count');
        annotationCount.innerText = exemptedFiles.size; 

        // Clear the file input value to allow re-uploading of the same file
        jsonFileInput.value = null;
    };

    reader.readAsText(jsonFile);
}