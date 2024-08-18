// Function to calculate Intersection over Union (IoU)
function calculateIoU(gtBox, predBox) {
    const [xA, yA, wA, hA] = gtBox;
    const [xB, yB, wB, hB] = predBox;

    const x1 = Math.max(xA, xB);
    const y1 = Math.max(yA, yB);
    const x2 = Math.min(xA + wA, xB + wB);
    const y2 = Math.min(yA + hA, yB + hB);

    const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const boxAArea = wA * hA;
    const boxBArea = wB * hB;

    return interArea / (boxAArea + boxBArea - interArea);
}

// Function to calculate precision, recall, F1-score, and accuracy for each image
function calculateMetricsPerImage(groundTruth, predictions) {
    const iouThreshold = 0.5;
    const metricsPerImage = [];

    // Map ground truth and predictions by image
    const groundTruthByImage = groundTruth.reduce((acc, gt) => {
        acc[gt.image] = gt.annotations;
        return acc;
    }, {});

    const predictionsByImage = predictions.reduce((acc, pred) => {
        acc[pred.image] = pred.annotations;
        return acc;
    }, {});

    // Get unique image names from ground truth and predictions
    const allImages = new Set([...Object.keys(groundTruthByImage), ...Object.keys(predictionsByImage)]);

    // Calculate metrics for each image
    allImages.forEach(image => {
        const gtAnnotations = groundTruthByImage[image] || [];
        const predAnnotations = predictionsByImage[image] || [];
        console.log("paired img: ", image, gtAnnotations, predAnnotations);

        let truePositives = 0;
        let falsePositives = 0;
        let falseNegatives = 0;

        // Create arrays to track matched predictions and ground truths
        const matchedGts = new Set();
        const matchedPreds = new Set();

        // Check each prediction against ground truth
        predAnnotations.forEach(pred => {
            const match = gtAnnotations.some(gt => 
                calculateIoU(gt.bbox, pred.bbox) >= iouThreshold && gt.label === pred.label
            );
            if (match) {
                truePositives++;
                matchedPreds.add(pred); // Track matched predictions
            } else {
                falsePositives++;
            }
        });

        // Check each ground truth against predictions
        gtAnnotations.forEach(gt => {
            const match = predAnnotations.some(pred => 
                calculateIoU(gt.bbox, pred.bbox) >= iouThreshold && gt.label === pred.label
            );
            if (!match) {
                falseNegatives++;
            } else {
                matchedGts.add(gt); // Track matched ground truths
            }
        });

        // Calculate metrics
        const precision = truePositives / (truePositives + falsePositives) || 0;
        const recall = truePositives / (truePositives + falseNegatives) || 0;
        const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

        // Determine label type
        const labels = new Set(gtAnnotations.map(ann => ann.label));
        let labelType = 'solo';
        if (labels.size > 1) {
            labelType = 'varied';
        } else if (gtAnnotations.length > 1) {
            labelType = 'grouped';
        }

        metricsPerImage.push({
            image,
            precision,
            recall,
            f1Score,
            labelType
        });
    });

    return metricsPerImage;
}


// Updated evaluateImages function
async function evaluateImages() {
    const selectorValue = document.getElementById('hypothesis').value; // Adjust 'hypothesis' to your actual selector ID
    let groundTruth, predictions, images;

    if (selectorValue === '1') {
        // Hypothesis One: Koi and Non-Koi
        groundTruth = {
            koi: Array.from(koiGT),
            nonKoi: Array.from(nonKoiGT)
        };
        predictions = {
            koi: Array.from(koiPB),
            nonKoi: Array.from(nonKoiPB)
        };
        images = {
            koi: koiImageUploads,
            nonKoi: nonKoiImageUploads
        };
    } else if (selectorValue === '2') {
        // Hypothesis Two: Small, Medium, Large
        groundTruth = {
            small: Array.from(smallGT),
            medium: Array.from(mediumGT),
            large: Array.from(largeGT)
        };
        predictions = {
            small: Array.from(smallPB),
            medium: Array.from(mediumPB),
            large: Array.from(largePB)
        };
        images = {
            small: smallImageUploads,
            medium: mediumImageUploads,
            large: largeImageUploads
        };
    } else {
        console.error('Invalid selector value');
        return;
    }

    // Print initial ground truth and prediction sets
    console.log('Initial Ground Truth:', groundTruth);
    console.log('Initial Predictions:', predictions);

    // Determine the minimum number of images across all categories
    const imageCounts = Object.values(images).map(imgArr => imgArr.length);
    const minImageCount = Math.min(...imageCounts);

    // Helper function to get a set of selected image names
    function getRandomImageNames(imgUploads, count) {
        const shuffled = imgUploads.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        return new Set(selected.map(img => img.name));
    }

    // List to keep track of image names to keep
    let selectedImageNames = {};

    // Randomly select images to keep
    for (const key in images) {
        selectedImageNames[key] = getRandomImageNames(images[key], minImageCount);
        console.log(`Selected image names for ${key}:`, Array.from(selectedImageNames[key]));
    }

    // Filter images based on selected names
    for (const key in images) {
        images[key] = images[key].filter(img => selectedImageNames[key].has(img.name));
        console.log(`Selected images for ${key}:`, images[key]);
    }

    // Filter ground truth and predictions based on selected images
    for (const key in groundTruth) {
        groundTruth[key] = groundTruth[key].filter(item => selectedImageNames[key].has(item.image));
        predictions[key] = predictions[key].filter(item => selectedImageNames[key].has(item.image));
        console.log(`Filtered ground truth for ${key}:`, groundTruth[key]);
        console.log(`Filtered predictions for ${key}:`, predictions[key]);
    }

    // Print filtered ground truth and prediction sets
    console.log('Filtered Ground Truth:', groundTruth);
    console.log('Filtered Predictions:', predictions);
    console.log('Balanced Images:', images);

    // New function to check for missing ground truth
    function checkForMissingGroundTruth() {
        for (const key in images) {
            const imageNames = new Set(images[key].map(img => img.name));
            const hasGroundTruth = groundTruth[key].some(item => imageNames.has(item.image));
            if (!hasGroundTruth) {
                alert(`Comparison cannot be done because no ground truth is uploaded for images in the ${key} category.`);
                return false; // Exit the function early if ground truth is missing
            }
        }
        return true; // All categories have ground truth
    }

    // Perform the ground truth check
    if (!checkForMissingGroundTruth()) {
        return; // Stop further execution if missing ground truth
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

            return result.predictions.map(pred => ({
                label: pred.class,
                bbox: [
                    pred.x - pred.width / 2,
                    pred.y - pred.height / 2,
                    pred.width,
                    pred.height
                ]
            }));
        } catch (error) {
            console.error('Error fetching predictions:', error);
            return [];
        }
    }

    // Roboflow configurations
    const ROBOFLOW_API_KEY = 'rceoip2HWWqZY9R1cTn4';
    const ONE_MODEL_VERSION = '11';
    const TWO_MODEL_VERSION = '2';

    let unprocessed = 0;
    let processed = 0;

    // Check and add missing predictions for Koi images
    if (selectorValue === '1') {
        for (const img of images.koi) {
            if (!predictions.koi.find(pred => pred.image === img.name)) {
                unprocessed++;
            }
        }
        for (const img of images.nonKoi) {
            if (!predictions.nonKoi.find(pred => pred.image === img.name)) {
                unprocessed++;
            }
        }
        console.log("Unprocessed: ", unprocessed);
        // Initialize progress bar
        initializeProgressBar(unprocessed);

        // Process Koi images
        for (const img of images.koi) {
            if (!predictions.koi.find(pred => pred.image === img.name)) {
                const imageData = img.data; // Prepare imageData according to your needs
                const preds = await getRoboflowPrediction(imageData, 'koiah-version-controls', ONE_MODEL_VERSION, ROBOFLOW_API_KEY);
                predictions.koi.push({ image: img.name, annotations: preds });
                koiPB.add({ image: img.name, annotations: preds });
                document.getElementById('k-predictions-count').innerText = predictions.koi.length;
                updateProgress(++processed); // Update progress
            }
        }

        // Process Non-Koi images
        for (const img of images.nonKoi) {
            if (!predictions.nonKoi.find(pred => pred.image === img.name)) {
                const imageData = img.data; // Prepare imageData according to your needs
                const preds = await getRoboflowPrediction(imageData, 'koiah-version-controls', ONE_MODEL_VERSION, ROBOFLOW_API_KEY);
                predictions.nonKoi.push({ image: img.name, annotations: preds });
                nonKoiPB.add({ image: img.name, annotations: preds });
                document.getElementById('nk-predictions-count').innerText = predictions.nonKoi.length;
                updateProgress(++processed); // Update progress
            }
        }
    } else if (selectorValue === '2') {
        // Process Small images
        for (const img of images.small) {
            if (!predictions.small.find(pred => pred.image === img.name)) {
                unprocessed++;
            }
        }
        for (const img of images.medium) {
            if (!predictions.medium.find(pred => pred.image === img.name)) {
                unprocessed++;
            }
        }
        for (const img of images.large) {
            if (!predictions.large.find(pred => pred.image === img.name)) {
                unprocessed++;
            }
        }
        // Initialize progress bar
        initializeProgressBar(unprocessed);

        // Process Small images
        for (const img of images.small) {
            if (!predictions.small.find(pred => pred.image === img.name)) {
                const imageData = img.data; // Prepare imageData according to your needs
                const preds = await getRoboflowPrediction(imageData, 'koiah-version-controls', TWO_MODEL_VERSION, ROBOFLOW_API_KEY);
                predictions.small.push({ image: img.name, annotations: preds });
                smallPB.add({ image: img.name, annotations: preds });
                document.getElementById('small-predictions-count').innerText = predictions.small.length;
                updateProgress(++processed); // Update progress
            }
        }

        // Process Medium images
        for (const img of images.medium) {
            if (!predictions.medium.find(pred => pred.image === img.name)) {
                const imageData = img.data; // Prepare imageData according to your needs
                const preds = await getRoboflowPrediction(imageData, 'koiah-version-controls', TWO_MODEL_VERSION, ROBOFLOW_API_KEY);
                predictions.medium.push({ image: img.name, annotations: preds });
                mediumPB.add({ image: img.name, annotations: preds });
                document.getElementById('medium-predictions-count').innerText = predictions.medium.length;
                updateProgress(++processed); // Update progress
            }
        }

        // Process Large images
        for (const img of images.large) {
            if (!predictions.large.find(pred => pred.image === img.name)) {
                const imageData = img.data; // Prepare imageData according to your needs
                const preds = await getRoboflowPrediction(imageData, 'koiah-version-controls', TWO_MODEL_VERSION, ROBOFLOW_API_KEY);
                predictions.large.push({ image: img.name, annotations: preds });
                largePB.add({ image: img.name, annotations: preds });
                document.getElementById('large-predictions-count').innerText = predictions.large.length;
                updateProgress(++processed); // Update progress
            }
        }
    }

    // Complete progress bar after processing
    completeProgressBar();

    // Optionally hide the overlay after processing is complete
    document.getElementById('overlay').style.display = 'none';
    
    // Calculate and display metrics for each image
    let overallMetrics = [];
    let confusionMatrix = {};
    let confusionMatrixTable;

    if (selectorValue === '1') {
        const metricsKoi = calculateMetricsPerImage(groundTruth.koi, predictions.koi);
        const metricsNonKoi = calculateMetricsPerImage(groundTruth.nonKoi, predictions.nonKoi);
        overallMetrics = metricsKoi.concat(metricsNonKoi);

        console.log('Koi Metrics:', metricsKoi);
        console.log('Non-Koi Metrics:', metricsNonKoi);

        displayMetrics(metricsKoi, 'koi-metric');
        displayMetrics(metricsNonKoi, 'non-koi-metric');

        // Calculate confusion matrix
        confusionMatrix = calculateConfusionMatrix(
            groundTruth.koi.concat(groundTruth.nonKoi), 
            predictions.koi.concat(predictions.nonKoi)
        );

        confusionMatrixTable = document.getElementById('one-confusion-matrix');

    } else if (selectorValue === '2') {
        const metricsSmall = calculateMetricsPerImage(groundTruth.small, predictions.small);
        const metricsMedium = calculateMetricsPerImage(groundTruth.medium, predictions.medium);
        const metricsLarge = calculateMetricsPerImage(groundTruth.large, predictions.large);
        overallMetrics = metricsSmall.concat(metricsMedium.concat(metricsLarge));

        console.log('Small Metrics:', metricsSmall);
        console.log('Medium Metrics:', metricsMedium);
        console.log('Large Metrics:', metricsLarge);

        displayMetrics(metricsSmall, 'small-metric');
        displayMetrics(metricsMedium, 'medium-metric');
        displayMetrics(metricsLarge, 'large-metric');

        // Calculate confusion matrix
        confusionMatrix = calculateConfusionMatrix(
            groundTruth.small.concat(groundTruth.medium).concat(groundTruth.large),
            predictions.small.concat(predictions.medium).concat(predictions.large)
        );
        confusionMatrixTable = document.getElementById('two-confusion-matrix');
    }

    console.log('Overall Metrics:', overallMetrics);
    console.log('Confusion Metrics:', confusionMatrix);
        
    // Generate and display the confusion matrix table
    confusionMatrixTable.innerHTML = await generateConfusionMatrixTable(confusionMatrix);

    // Display accuracy graph based on hypothesis
    await displayAccuracyGraph(selectorValue, overallMetrics);

    // Process Anova
    await performAnova(selectorValue, overallMetrics);

    if (selectorValue === '1') {
        $('#hypOneModal').modal('show');
    } else {
        $('#hypTwoModal').modal('show');
    }
}


// Function to display metrics in a table
function displayMetrics(metrics, tableId) {
    const table = document.getElementById(tableId);
    table.innerHTML = ''; // Clear previous contents
    let index = 0;
    metrics.forEach(metric => {
        const row = table.insertRow();
        row.insertCell(0).innerText = ++index;
        row.insertCell(1).innerText = metric.image;
        row.insertCell(2).innerText = metric.precision.toFixed(2);
        row.insertCell(3).innerText = metric.recall.toFixed(2);
        row.insertCell(4).innerText = metric.f1Score.toFixed(2);
        row.insertCell(5).innerText = metric.labelType;
    });
}

// Function to create and display a line chart using Chart.js
async function displayAccuracyGraph(hypothesis, overallMetrics) {
    let labels = [];
    let koiAccuracies = [];
    let nonKoiAccuracies = [];
    let smallAccuracies = [];
    let mediumAccuracies = [];
    let largeAccuracies = [];

    overallMetrics.forEach((metric, index) => {
        labels.push(index + 1); // Use image index as the label
    });

    if (hypothesis === '1') {
        const halfLength = Math.floor(overallMetrics.length / 2);
        for (let i = 0; i < halfLength; i++) {
            koiAccuracies.push(overallMetrics[i].f1Score);
        }
        for (let i = halfLength; i < overallMetrics.length; i++) {
            nonKoiAccuracies.push(overallMetrics[i].f1Score);
        }
    } else if (hypothesis === '2') {
        const thirdLength = Math.floor(overallMetrics.length / 3);
        for (let i = 0; i < thirdLength; i++) {
            smallAccuracies.push(overallMetrics[i].f1Score);
        }
        for (let i = thirdLength; i < 2 * thirdLength; i++) {
            mediumAccuracies.push(overallMetrics[i].f1Score);
        }
        for (let i = 2 * thirdLength; i < overallMetrics.length; i++) {
            largeAccuracies.push(overallMetrics[i].f1Score);
        }
    }

    let dataSets = [];
    if (hypothesis === '1') {
        dataSets.push({
            label: 'Koi Accuracy (F1-score)',
            data: koiAccuracies,
            borderColor: '#D9534F',
            borderWidth: 1
        }, {
            label: 'Non-Koi Accuracy (F1-score)',
            data: nonKoiAccuracies,
            borderColor: '#F0AD4E',
            borderWidth: 1
        });
    } else if (hypothesis === '2') {
        dataSets.push({
            label: 'Small Accuracy (F1-score)',
            data: smallAccuracies,
            borderColor: '#D9534F',
            borderWidth: 1
        }, {
            label: 'Medium Accuracy (F1-score)',
            data: mediumAccuracies,
            borderColor: '#F0AD4E',
            borderWidth: 1
        }, {
            label: 'Large Accuracy (F1-score)',
            data: largeAccuracies,
            borderColor: '#FFD700',
            borderWidth: 1
        });
    }

    if (hypothesis === '1') {
        createLineChart('hypothesis-one-graph', labels, dataSets);
    } else if (hypothesis === '2') {
        createLineChart('hypothesis-two-graph', labels, dataSets);
    }
}

// Track the chart instance globally or within a closure if needed
let chartInstance = null;

function createLineChart(elementId, labels, dataSets) {
    const ctx = document.getElementById(elementId).getContext('2d');

    if (elementId === 'hypothesis-one-graph') {
        const half_length = Math.ceil(labels.length / 2);    
        labels = labels.slice(0, half_length);
    } else {
        const third_length = Math.ceil(labels.length / 3);
        labels = labels.slice(0, third_length);
    }

    // Destroy the existing chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: dataSets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Image Index'
                    }
                },
                y: {
                    min: -0.5,
                    max: 1.5,
                    title: {
                        display: true,
                        text: 'Accuracy  (F1-score)'
                    }
                }
            }
        }
    });
}

// Perform ANOVA Call
async function performAnova(hypothesis, overallMetrics) {
    let koiGroup = [];
    let nonKoiGroup = [];
    let smallGroup = [];
    let mediumGroup = [];
    let largeGroup = [];
    let pairwiseGroups = {};
    let container;
    let dataContainer;
    let pairwiseContainer = document.getElementById('pairwise-anova');
    const x = [];
    const f = [];

    if (hypothesis === '1') {
        const half_length = Math.ceil(overallMetrics.length / 2);
        koiGroup = overallMetrics.slice(0, half_length);
        nonKoiGroup = overallMetrics.slice(half_length);

        // Use only up to the minLength for both groups to balance the data
        for (let i = 0; i < half_length; i++) {
            x.push(koiGroup[i].f1Score, nonKoiGroup[i].f1Score);
            f.push('Koi', 'Non-Koi');
        }

        container = document.getElementById('anova-one');
        dataContainer = document.getElementById('data-one');
    } else if (hypothesis === '2') {
        const third_length = Math.ceil(overallMetrics.length / 3);
        const secondCut = third_length * 2;
        smallGroup = overallMetrics.slice(0, third_length);
        mediumGroup = overallMetrics.slice(third_length, secondCut);
        largeGroup = overallMetrics.slice(secondCut);

        // ------ Pairwise Alternative ----
        pairwiseGroups = {
            'Small vs Medium': { x: [], f: [] },
            'Small vs Large': { x: [], f: [] },
            'Medium vs Large': { x: [], f: [] }
        };

        // Populate pairwiseGroups arrays
        for (let i = 0; i < third_length; i++) {
            if (i < smallGroup.length && i < mediumGroup.length) {
                pairwiseGroups['Small vs Medium'].x.push(smallGroup[i].f1Score, mediumGroup[i].f1Score);
                pairwiseGroups['Small vs Medium'].f.push('Small', 'Medium');
            }
            if (i < smallGroup.length && i < largeGroup.length) {
                pairwiseGroups['Small vs Large'].x.push(smallGroup[i].f1Score, largeGroup[i].f1Score);
                pairwiseGroups['Small vs Large'].f.push('Small', 'Large');
            }
            if (i < mediumGroup.length && i < largeGroup.length) {
                pairwiseGroups['Medium vs Large'].x.push(mediumGroup[i].f1Score, largeGroup[i].f1Score);
                pairwiseGroups['Medium vs Large'].f.push('Medium', 'Large');
            }
        }

        // Perform ANOVA for each pair
        const pairwiseResults = {};
        for (const [pair, { x, f }] of Object.entries(pairwiseGroups)) {
            console.log(pair, x, f);
            pairwiseResults[pair] = anova1(x, f, { 'alpha': 0.05 });
        }

        // Log pairwise results
        for (const [pair, result] of Object.entries(pairwiseResults)) {
            console.log(`${pair} ANOVA Result:`, result.print());
        }

        // Table for Pairwise
        console.log('Pairwise: ', Object.entries(pairwiseResults));
        pairwiseContainer.innerHTML = await generatePairwiseTable(pairwiseResults);

        // ------- Pairwise Alternative ------

        // Use only up to the minLength for all groups to balance the data
        for (let i = 0; i < third_length; i++) {
            x.push(smallGroup[i].f1Score, mediumGroup[i].f1Score, largeGroup[i].f1Score);
            f.push('Small', 'Medium', 'Large');
        }

        container = document.getElementById('anova-two');
        dataContainer = document.getElementById('data-two');
    }

    console.log("Hyp 1 - Koi Group:", koiGroup);
    console.log("Hyp 1 - Non-Koi Group:", nonKoiGroup);
    console.log("Hyp 2 - Small Group:", smallGroup);
    console.log("Hyp 2 - Medium Group:", mediumGroup);
    console.log("Hyp 2 - Large Group:", largeGroup);
    console.log("X | F for Main ANOVA:", x, f);
    
    const anova = anova1(x, f, { 'alpha': 0.05 });

    // Prepare the results to be displayed
    console.log("Main ANOVA X:", x);
    console.log("Main ANOVA Y:", f);
    console.log("Main ANOVA Results:", anova.print());
    console.log("Main ANOVA Object:", anova);

    // Display the results
    container.innerHTML = await generateAnovaTable(anova);
    dataContainer.innerHTML = await generateDataTable(hypothesis, anova);
}

async function generateAnovaTable(anova) {
    // Extract ANOVA results
    const treatment = anova.treatment;
    const error = anova.error;
    const statistic = anova.statistic || 0;
    const pValue = anova.pValue || 0;
    const alpha = anova.alpha;
    const rejectNull = anova.rejected;
    console.log("Reject Null: ", rejectNull);

    // Format the HTML table
    return `
            <div class="row p-3">
                <div class="cont-inner col-12 border border-3 mt-2 border-dark">
                    <b>Hypothesis:</b> <br>There is "a" significant difference in accuracy.
                </div>
                <div class="cont-inner col-12 border border-3 border-dark">
                    <b>Null Hypothesis:</b> <br>There is "no" significant difference in accuracy.
                </div>
            </div>
            <div class="row p-3" id="anova-table">
                <div class="col-12 d-flex justify-content-center">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>One-way ANOVA</th>
                            </tr>
                            <tr>
                                <th>Source</th>
                                <th>df</th>
                                <th>SS</th>
                                <th>MS</th>
                                <th>F Score</th>
                                <th>P Value</th>
                                <th>Sig. Diff.?</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Treatment</td>
                                <td>${treatment.df}</td>
                                <td>${treatment.ss.toFixed(4)}</td>
                                <td>${treatment.ms.toFixed(4)}</td>
                                <td>${statistic.toFixed(4)}</td>
                                <td>${pValue.toFixed(4)}</td>
                                <td>${(rejectNull) ? 'Yes' : 'No'}</td>

                            </tr>
                            <tr>
                                <td>Errors</td>
                                <td>${error.df}</td>
                                <td>${error.ss.toFixed(4)}</td>
                                <td>${error.ms.toFixed(4)}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="row p-3">
                <div class="cont-inner col-12 border border-3 mt-2 border-dark">
                    <b>Pvalue:</b> ${pValue.toFixed(4)} <=  <b>Alpha:</b> ${alpha}                              
                </div>
                <div class="cont-inner col-12 border border-3 mt-2 border-dark">
                    <b>Accept Hypothesis:</b> <br>${(rejectNull==false) ? 'No' : 'Yes'}                                
                </div>
                <div class="cont-inner col-12 border border-3 border-dark">
                    <b>Accept Null Hypothesis:</b> <br>${(rejectNull==false) ? 'Yes' : 'No'}                                
                </div>
            </div>
    `;
}

async function generateDataTable(hypothesis, anova) {
    // Extract ANOVA results
    const means = anova.means;
    
    if (hypothesis=='1') {
        const koiData = means['Koi'];
        const nonKoiData = means['Non-Koi'];
        // Sample Size
        const koiCount = koiData.sampleSize;
        const nonKoiCount = nonKoiData.sampleSize;
        const totalCount = parseFloat(koiCount+nonKoiCount);
        // Mean
        const koiMean = koiData.mean;
        const nonKoiMean = nonKoiData.mean;
        const totalMean = parseFloat(koiMean+nonKoiMean);
        // SD
        const koiSD = koiData.SD;
        const nonKoiSD = nonKoiData.SD;
        const totalSD = parseFloat(koiSD+nonKoiSD);
        // Summation of X
        const koiSumma = koiCount*koiMean;
        const nonKoiSumma = nonKoiCount*nonKoiMean;
        const totalSumma = parseFloat(koiSumma+nonKoiSumma);
        // Summation of X ^ 2
        const koiSumma2 = parseFloat(Math.pow(koiSumma,2));
        const nonKoiSumma2 = parseFloat(Math.pow(nonKoiSumma,2));
        const totalSumma2 = parseFloat(koiSumma2+nonKoiSumma2);
        // Format the HTML table
        return `
            <div class="row p-3">
                <div class="cont-inner col-12 border border-3 mt-2 border-dark">
                    Summary of Data
                </div>
            </div>
            <div class="row p-3">
                <div class="col-12 d-flex justify-content-center">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Summary of Data</th>
                            </tr>
                            <tr>
                                <th>-</th>
                                <th>Koi</th>
                                <th>Non-Koi</th>
                                <th>-</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>N</td>
                                <td>${koiCount}</td>
                                <td>${nonKoiCount}</td>
                                <td>-</td>
                                <td>${totalCount}</td>
                            </tr>
                            <tr>
                                <td>∑X</td>
                                <td>${koiSumma.toFixed(4)}</td>
                                <td>${nonKoiSumma.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalSumma.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>Mean</td>
                                <td>${koiMean.toFixed(4)}</td>
                                <td>${nonKoiMean.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalMean.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>∑X<sup>2</sup></td>
                                <td>${koiSumma2.toFixed(4)}</td>
                                <td>${nonKoiSumma2.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalSumma2.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>Std. Dev.</td>
                                <td>${koiSD.toFixed(4)}</td>
                                <td>${nonKoiSD.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalSD.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        // Format the HTML table
        const smallData = means['Small'];
        const mediumData = means['Medium'];
        const largeData = means['Large'];
        // Sample Size
        const smallCount = smallData.sampleSize;
        const mediumCount = mediumData.sampleSize;
        const largeCount = largeData.sampleSize;
        const totalCount = (smallCount+mediumCount+largeCount);
        // Mean
        const smallMean = smallData.mean;
        const mediumMean = mediumData.mean;
        const largeMean = largeData.mean;
        const totalMean = parseFloat(smallMean+mediumMean+largeMean);
        // SD
        const smallSD = smallData.SD;
        const mediumSD = mediumData.SD;
        const largeSD = largeData.SD;
        const totalSD = parseFloat((smallSD+mediumSD+largeSD));
        // Summation of X
        const smallSumma = smallCount*smallMean;
        const mediumSumma = mediumCount*mediumMean;
        const largeSumma = largeCount*largeMean;
        const totalSumma = parseFloat(smallSumma+mediumSumma+largeSumma);
        // Summation of X ^ 2
        const smallSumma2 = parseFloat(Math.pow(smallSumma,2));
        const mediumSumma2 = parseFloat(Math.pow(mediumSumma,2));
        const largeSumma2 = parseFloat(Math.pow(largeSumma,2));
        const totalSumma2 = parseFloat(smallSumma2+mediumSumma2+largeSumma2);
        // Format the HTML table
        return `
            <div class="row p-3">
                <div class="cont-inner col-12 border border-3 mt-2 border-dark">
                    Summary of Data
                </div>
            </div>
            <div class="row p-3">
                <div class="col-12 d-flex justify-content-center">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Summary of Data</th>
                            </tr>
                            <tr>
                                <th>-</th>
                                <th>Small</th>
                                <th>Medium</th>
                                <th>Large</th>
                                <th>-</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>N</td>
                                <td>${smallCount}</td>
                                <td>${mediumCount}</td>
                                <td>${largeCount}</td>
                                <td>-</td>
                                <td>${totalCount}</td>
                            </tr>
                            <tr>
                                <td>∑X</td>
                                <td>${smallSumma.toFixed(4)}</td>
                                <td>${mediumSumma.toFixed(4)}</td>
                                <td>${largeSumma.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalSumma.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>Mean</td>
                                <td>${smallMean.toFixed(4)}</td>
                                <td>${mediumMean.toFixed(4)}</td>
                                <td>${largeMean.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalMean.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>∑X<sup>2</sup></td>
                                <td>${smallSumma2.toFixed(4)}</td>
                                <td>${mediumSumma2.toFixed(4)}</td>
                                <td>${largeSumma2.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalSumma2.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>Std. Dev.</td>
                                <td>${smallSD.toFixed(4)}</td>
                                <td>${mediumSD.toFixed(4)}</td>
                                <td>${largeSD.toFixed(4)}</td>
                                <td>-</td>
                                <td>${totalSD.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
}

async function generatePairwiseTable(pairwiseData){
    const pairwiseArray = Object.entries(pairwiseData);
    const svm = pairwiseArray[0][1];
    const svl = pairwiseArray[1][1];
    const mvl = pairwiseArray[2][1];

    // Small vs Medium Data
    const svmSize = svm.means['Small'].sampleSize * 2;
    const svmF = svm.statistic || 0;
    const svmPValue = svm.pValue || 0;
    const svmAlpha = svm.alpha;
    const svmRejected = svm.rejected;

    // Small vs Large Data
    const svlSize = svl.means['Small'].sampleSize * 2;
    const svlF = svl.statistic || 0;
    const svlPValue = svl.pValue || 0;
    const svlAlpha = svl.alpha;
    const svlRejected = svl.rejected;

    // Medium vs Large Data
    const mvlSize = mvl.means['Medium'].sampleSize * 2;
    const mvlF = mvl.statistic || 0;
    const mvlPValue = mvl.pValue || 0;
    const mvlAlpha = mvl.alpha;
    const mvlRejected = mvl.rejected;

    console.log("SvM Rejected? ", svmRejected, (svmPValue<=svmAlpha));
    console.log("SvL Rejected? ", svlRejected, (svlPValue<=svlAlpha));
    console.log("MvL Rejected? ", mvlRejected, (mvlPValue<=mvlAlpha));
    // Format the HTML table
    return `
            <div class="row p-3" id="anova-table">
                <div class="col-12 d-flex justify-content-center">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Pairwise ANOVA</th>
                            <tr>
                            <tr>
                                <th>Pairs</th>
                                <th>Total Size</th>
                                <th>F Score</th>
                                <th>P Value (p)</th>
                                <th>Alpha (a)</th>
                                <th>Significant Diff.?</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Small vs Medium</td>
                                <td>${svmSize}</td>
                                <td>${svmF.toFixed(4)}</td>
                                <td>${svmPValue.toFixed(4)}</td>
                                <td>${svmAlpha}</td>
                                <td>${(svmRejected) ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <td>Small vs Large</td>
                                <td>${svlSize}</td>
                                <td>${svlF.toFixed(4)}</td>
                                <td>${svlPValue.toFixed(4)}</td>
                                <td>${svlAlpha}</td>
                                <td>${(svlRejected) ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <td>Medium vs Large</td>
                                <td>${mvlSize}</td>
                                <td>${mvlF.toFixed(4)}</td>
                                <td>${mvlPValue.toFixed(4)}</td>
                                <td>${mvlAlpha}</td>
                                <td>${(mvlRejected) ? 'Yes' : 'No'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    `;
}

// Function to extract unique labels from annotations
function extractLabels(annotations) {
    const labels = new Set();
    annotations.forEach(item => {
        item.annotations.forEach(annotation => {
            labels.add(annotation.label);
        });
    });
    return Array.from(labels);
}

// Function to calculate confusion matrix for multiclass classification
function calculateConfusionMatrix(groundTruth, predictions) {
    const labels = extractLabels([...groundTruth, ...predictions]); // Extract labels from both ground truth and predictions
    const matrix = {};

    // Initialize confusion matrix
    labels.forEach(label => {
        matrix[label] = {};
        labels.forEach(predLabel => {
            matrix[label][predLabel] = 0;
        });
    });

    // Map ground truth and predictions by image
    const groundTruthByImage = groundTruth.reduce((acc, gt) => {
        acc[gt.image] = gt.annotations;
        return acc;
    }, {});

    const predictionsByImage = predictions.reduce((acc, pred) => {
        acc[pred.image] = pred.annotations;
        return acc;
    }, {});

    // Get unique image names from ground truth and predictions
    const allImages = new Set([...Object.keys(groundTruthByImage), ...Object.keys(predictionsByImage)]);

    // Calculate confusion matrix
    allImages.forEach(image => {
        const gtAnnotations = groundTruthByImage[image] || [];
        const predAnnotations = predictionsByImage[image] || [];

        // Track which predictions have been matched
        const matchedPreds = new Set();

        // Loop through ground truth annotations
        gtAnnotations.forEach(gt => {
            const predMatch = predAnnotations.find(pred => calculateIoU(gt.bbox, pred.bbox) >= 0.5);

            if (predMatch) {
                // Increment True Positive in the actual class row and predicted class column
                matrix[gt.label][predMatch.label]++;
                matchedPreds.add(predMatch);
            } else {
                // Increment False Negative in the actual class row
                matrix[gt.label][gt.label]++;
            }
        });

        // Loop through prediction annotations
        predAnnotations.forEach(pred => {
            if (!matchedPreds.has(pred)) {
                // Increment False Positive in the predicted class column
                matrix[pred.label][pred.label]++;
            }
        });
    });

    return matrix;
}

// Function to generate HTML table for the confusion matrix
async function generateConfusionMatrixTable(matrix) {
    const labels = Object.keys(matrix).filter(label => label !== 'Unknown'); // Get unique labels excluding 'Unknown'
    let tableHtml = '<h3>Confusion Matrix</h3><table class="table"><thead><tr><th>Truth v</th><th>Predicted -></th></tr><tr><th>Classes</th>';

    // Add table headers
    labels.forEach(label => {
        tableHtml += `<td>${label}</td>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    // Add rows for each true label
    labels.forEach(trueLabel => {
        tableHtml += `<tr><td>${trueLabel}</td>`;
        labels.forEach(predLabel => {
            tableHtml += `<td>${matrix[trueLabel] && matrix[trueLabel][predLabel] || 0}</td>`;
        });
        tableHtml += '</tr>';
    });

    tableHtml += '</tr></tbody></table>';

    return tableHtml;
}