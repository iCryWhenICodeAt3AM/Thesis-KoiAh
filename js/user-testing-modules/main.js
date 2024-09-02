// Roboflow configurations
const ROBOFLOW_API_KEY = 'rceoip2HWWqZY9R1cTn4';
const ONE_MODEL_VERSION = '13';
let resultJsonData = [];
let filteredData = [];

function checkWhichRadioIsChecked() {
    const checkedRadio = document.querySelector('input[name="rule"]:checked');
    console.log(checkedRadio.id);
    if (checkedRadio.id == 'rule1') {
        return true;
    } else {
        return false;
    }
}

async function startCounting() {
    if (existingFiles.size != 0) {
        await predict();
        active++;
        updateProgress();
        pageLoad();
    } else {
        alert("Please upload images to continue.");
        active--;
        updateProgress();
        pageLoad();
    }
}

// Predict function
async function predict() {
    const totalImages = uploadedImages.length;
    let pending = 0;

    for (let index = 0; index < totalImages; index++) {
        if (existingFiles.has(uploadedImages[index].name) && !resultJsonData.some(item => item[0] === uploadedImages[index].name)) {
            pending++;
        }
    }
    initialize1(pending);
    let processedImages = 0;

    for (let index = 0; index < totalImages; index++) {
        console.log(uploadedImages[index].name);

        if (existingFiles.has(uploadedImages[index].name) && !resultJsonData.some(item => item[0] === uploadedImages[index].name)) {
            const prediction = await getRoboflowPrediction(uploadedImages[index].data, 'thesis-koiah', ONE_MODEL_VERSION, ROBOFLOW_API_KEY);
            resultJsonData.push([
                uploadedImages[index].name,
                prediction
            ]);
            console.log(resultJsonData);
            // await plotAnnotations();

            // Update the progress bar
            processedImages++;
            console.log(processedImages, " Processed Images");
            updateProgress1(processedImages);
        } else {
            console.log("Already in: ", uploadedImages[index].name, resultJsonData);
        }
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// Function to fetch Roboflow predictions
async function getRoboflowPrediction(imageData, model, version, apiKey) {
    try {
        const response = await axios({
            method: 'POST',
            url: `https://detect.roboflow.com/${model}/${version}`,
            params: {
                api_key: apiKey,
                confidence: 0.20
            },
            data: imageData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;

        if (!result.predictions) {
            throw new Error(`Invalid response format: ${JSON.stringify(result)}`);
        }

        console.log("Prediction Made!", result);

        let formattedAnnotations = response.data.predictions.map(prediction => {
            let label = prediction.class;
            if (prediction.confidence < 0.4) {
                label = 'Unknown';
            }

            return {
                label: label,
                coordinates: {
                    x: prediction.x,
                    y: prediction.y,
                    width: prediction.width,
                    height: prediction.height
                },
                confidence: prediction.confidence // Keep the confidence in case you need it later
            };
        });

        return formattedAnnotations;

    } catch (error) {
        console.error('Error fetching predictions:', error);
        return [];
    }
}