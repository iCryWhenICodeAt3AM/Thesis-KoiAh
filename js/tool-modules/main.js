async function startAnnotation() {
    // Input Fields Collection
    const images = document.getElementById('images').files;
    const folder = document.getElementById('folder').files;

    // Interface actions
    const processStatus = document.getElementById('process-status');
    const pendingImages = document.getElementById('pending-images');
    const annotatedImages = document.getElementById('annotated-images');
    const previousImage = document.getElementById('previous-image');
    const currentImage = document.getElementById('current-image');
    const processingContainer = document.getElementById("processed-image-container");
    const startButton = document.getElementById("start-button");

    // Combine images and folder files into a single array
    const files = [...images, ...folder];

    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    // Dynamic Elements
    let pendingImagesCount = parseInt(imageFiles.length);
    let annotatedImagesCount = 0;
    
    // Status Actions
    processStatus.innerText = "Running...";
    pendingImages.innerText = pendingImagesCount;

    // Just for the delay
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const processImage = async (imageFile) => {
        console.log(imageFile);
        startButton.disabled = true;
        // Set image name
        currentImage.innerText = imageFile.name;
        const reader = new FileReader();
        reader.onload = (function(theImage) {
            return function(event) {
                // Image Change
                const img = `
                    <div class="col-12">
                        <img src="${event.target.result}" alt="Current Image" id="processing-image">
                    </div>
                `;
                processingContainer.innerHTML = img;
                startButton.disabled = false;
            };
        })(imageFile);
        
        reader.readAsDataURL(imageFile);
    }

    for (const imageFile of imageFiles) {
        await processImage(imageFile);
        await delay(1000); // 1 second delay
        pendingImagesCount-=1;
        annotatedImagesCount++;
        pendingImages.innerText = pendingImagesCount;
        annotatedImages.innerText = annotatedImagesCount;
        currentImage.innerText = "-";
        processingContainer.innerHTML = "";
        previousImage.innerText = imageFile.name;
    }
    processStatus.innerText = "Completed";
}

async function updateList(){

}
// async function startAnnotation() {
//     const model = document.getElementById('model').value;
//     const apiKey = document.getElementById('apiKey').value;
//     const images = document.getElementById('images').files;
//     const folder = document.getElementById('folder').files;
//     const imageLimit = document.getElementById('classLimit').value.replace(/[eE]/g,'');
//     console.log(imageLimit);

//     const imageContainer = document.getElementById('imageContainer');
//     imageContainer.innerHTML = '';

//     results = []; // Reset results
//     uploadedImages = []; // Reset uploaded images

//     const processImage = async (imageFile) => {
//         const reader = new FileReader();
//         return new Promise((resolve, reject) => {
//             reader.onload = async (event) => {
//                 const base64Image = event.target.result.split(',')[1];
//                 const imageName = imageFile.name;

//                 try {
//                     const response = await axios({
//                         method: 'POST',
//                         url: `https://detect.roboflow.com/${model}`,
//                         params: {
//                             api_key: apiKey
//                         },
//                         data: base64Image,
//                         headers: {
//                             'Content-Type': 'application/x-www-form-urlencoded'
//                         }
//                     });

//                     const formattedAnnotations = response.data.predictions.map(prediction => ({
//                         label: prediction.class,
//                         coordinates: {
//                             x: prediction.x,
//                             y: prediction.y,
//                             width: prediction.width,
//                             height: prediction.height
//                         }
//                     }));
                    
//                     results.push({
//                         image: imageName,
//                         annotations: formattedAnnotations
//                     });

//                     uploadedImages.push({
//                         name: imageName,
//                         data: event.target.result.split(',')[1] // Keep base64 data
//                     });

//                     const annotationBox = document.createElement('div');
//                     annotationBox.className = 'image-box';

//                     const img = document.createElement('img');
//                     img.src = event.target.result;
//                     annotationBox.appendChild(img);

//                     const annotation = document.createElement('div');
//                     annotation.className = 'annotation';
//                     annotation.innerText = JSON.stringify(formattedAnnotations, null, 2);
//                     annotationBox.appendChild(annotation);

//                     imageContainer.appendChild(annotationBox);

//                     resolve();
//                 } catch (error) {
//                     console.error(error.message);
//                     reject(error);
//                 }
//             };
//             reader.readAsDataURL(imageFile);
//         });
//     };

//     const files = [...images, ...folder];
//     for (const imageFile of files) {
//         await processImage(imageFile);
//     }

//     console.log(JSON.stringify(results, null, 2));

//     const jsonResult = document.createElement('pre');
//     jsonResult.innerText = JSON.stringify(results, null, 2);
//     document.body.appendChild(jsonResult);

//     // Enable export button if there are results
//     document.getElementById('exportButton').disabled = results.length === 0;
// }