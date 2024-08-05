// Roboflow configurations
const ROBOFLOW_API_KEY = 'rceoip2HWWqZY9R1cTn4';
const ONE_MODEL_VERSION = '11';
let resultJsonData = [];

function checkWhichRadioIsChecked() {
    const checkedRadio = document.querySelector('input[name="rule"]:checked');
    console.log(checkedRadio.id);
    if (checkedRadio.id == 'rule1') {
        return true;
    } else {
        return false
    }
}

async function startCounting() {
    const rule1 = checkWhichRadioIsChecked();
    console.log(rule1);
    if (existingFiles.size != 0) {
        await predict();
    }

    if (rule1) {
        recommendPondDimensions(1);
    } else {
        recommendPondDimensions(2);
    }
}

async function plotAnnotations() {
    // Initialize counters
    let koiCounter = 0;
    let sankeCounter = 0;
    let showaCounter = 0;
    let kohakuCounter = 0;
    let asagiCounter = 0;
    let bekkoCounter = 0;
    let hikarimonoCounter = 0;
    let nonKoiCounter = 0;
    let peopleCounter = 0;
    let goldfishCounter = 0;
    let liliesCounter = 0;
    let rocksCounter = 0;

    // Containers
    const koiCount = document.getElementById('koi');
    const sankeCount = document.getElementById('sanke');
    const showaCount = document.getElementById('showa');
    const kohakuCount = document.getElementById('kohaku');
    const asagiCount = document.getElementById('asagi');
    const bekkoCount = document.getElementById('bekko');
    const hikarimonoCount = document.getElementById('hikarimono');
    const nonKoiCount = document.getElementById('non-koi');
    const peopleCount = document.getElementById('people');
    const goldfishCount = document.getElementById('goldfish');
    const liliesCount = document.getElementById('lilies');
    const rocksCount = document.getElementById('rocks');
    const totalCount = document.getElementById('total');
    const numberOfKoiFish = document.getElementById('numberOfKoiFish');

    // Function to update counters
    function updateCounters(label) {
        switch (label) {
            case 'Sanke':
                sankeCounter++;
                koiCounter++;
                break;
            case 'Showa':
                showaCounter++;
                koiCounter++;
                break;
            case 'Kohaku':
                kohakuCounter++;
                koiCounter++;
                break;
            case 'Asagi':
                asagiCounter++;
                koiCounter++;
                break;
            case 'Bekko':
                bekkoCounter++;
                koiCounter++;
                break;
            case 'Hikarimono':
                hikarimonoCounter++;
                koiCounter++;
                break;
            case 'People':
                peopleCounter++;
                nonKoiCounter++;
                break;
            case 'Goldfish':
                goldfishCounter++;
                nonKoiCounter++;
                break;
            case 'Lilies':
                liliesCounter++;
                nonKoiCounter++;
                break;
            case 'Rocks':
                rocksCounter++;
                nonKoiCounter++;
                break;
        }
        // Update the DOM elements
        koiCount.textContent = koiCounter;
        sankeCount.textContent = sankeCounter;
        showaCount.textContent = showaCounter;
        kohakuCount.textContent = kohakuCounter;
        asagiCount.textContent = asagiCounter;
        bekkoCount.textContent = bekkoCounter;
        hikarimonoCount.textContent = hikarimonoCounter;
        nonKoiCount.textContent = nonKoiCounter;
        peopleCount.textContent = peopleCounter;
        goldfishCount.textContent = goldfishCounter;
        liliesCount.textContent = liliesCounter;
        rocksCount.textContent = rocksCounter;
        totalCount.textContent = koiCounter + nonKoiCounter;
        numberOfKoiFish.value = koiCounter;
    }

    for (const [name, annotation] of resultJsonData) {
        console.log(name, annotation);
        annotation.forEach(annotation => {
            updateCounters(annotation.label);
        });
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

    // Initialize the progress bar
    initializeProgressBar(pending);

    let processedImages = 0;

    for (let index = 0; index < totalImages; index++) {
        console.log(uploadedImages[index].name);

        if (existingFiles.has(uploadedImages[index].name) && !resultJsonData.some(item => item[0] === uploadedImages[index].name)) {
            const prediction = await getRoboflowPrediction(uploadedImages[index].data, 'koiah-version-controls', ONE_MODEL_VERSION, ROBOFLOW_API_KEY);
            resultJsonData.push([
                uploadedImages[index].name,
                prediction
            ]);
            console.log(resultJsonData);
            await plotAnnotations();

            // Update the progress bar
            processedImages++;
            updateProgress(processedImages);
        } else {
            console.log("Already in: ", uploadedImages[index].name, resultJsonData);
        }
    }

    // Complete the progress bar
    completeProgressBar();

    // Optionally hide the overlay after processing is complete
    document.getElementById('overlay').style.display = 'none';
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
                api_key: apiKey
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

        let formattedAnnotations = response.data.predictions.map(prediction => ({
            label: prediction.class,
            coordinates: {
                x: prediction.x,
                y: prediction.y,
                width: prediction.width,
                height: prediction.height
            }
        }));

        return formattedAnnotations;

    } catch (error) {
        console.error('Error fetching predictions:', error);
        return [];
    }
}