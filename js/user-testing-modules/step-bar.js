const progressBar = document.getElementById("progress-bar1");
const progressNext = document.getElementById("progress-next");
const progressPrev = document.getElementById("progress-prev");
let steps = document.querySelectorAll(".step");
let active = 1;

progressNext.addEventListener("click", () => {
    active++;
    if (active > steps.length) {
      active = steps.length;
    }
    if(window.location.pathname.includes("tool.html")){
        if(existingFiles.size == 0 ){
            active--;
            alert("Please upload images to continue.");
        }
    }
    updateProgress();
    if (window.location.pathname.includes("user%20testing.html") && active === 2) {
        startCounting();
    }
    pageLoad();
    
  });


const updateProgress = async () => {
    steps = document.querySelectorAll(".step");

    // toggle active class on list items
    steps.forEach((step, i) => {
        if (i < active) {
            step.classList.add("active");
        } else {
            step.classList.remove("active");
        }
    });
    // set progress bar width  
    progressBar.style.width = 
        ((active - 1) / (steps.length - 1)) * 100 + "%";
    // enable disable prev and next buttons

    progressNext.disabled = false;
};

function pageLoad() {
    console.log(active);
    if (window.location.pathname.includes("user%20testing.html")) {
        if (active === 1) {
            document.querySelectorAll(".toggle-button").forEach(button => {
                button.style.display = "block";
            });
            document.querySelectorAll(".toggle-progress").forEach(button => {
                button.style.display = "none";
            });
            document.querySelector(".head").innerHTML = "Get Started!";
            document.querySelector(".sub-header").innerHTML = "Start by uploading your koi images.";
            document.getElementById("image-container").style.display = "flex";
        } else if (active === 2) {
            document.querySelectorAll(".toggle-button").forEach(button => {
                button.style.display = "none";
            });
            document.querySelectorAll(".toggle-progress").forEach(button => {
                button.style.display = "block";
            });
            document.querySelector(".head").innerHTML = "Processing your images...";
            document.querySelector(".sub-header").innerHTML = "Hold on, we’re working on it!";
            document.getElementById("input-container").style.display = "none";
            document.getElementById("image-container").style.display = "none";
        } else if (active === 3) {
            document.querySelectorAll(".toggle-button").forEach(button => {
                button.style.display = "none";
            });
            document.querySelectorAll(".toggle-progress").forEach(button => {
                button.style.display = "none";
            });
            document.querySelectorAll(".toggle-final").forEach(button => {
                button.style.display = "flex";
            });
            document.querySelector(".head").innerHTML = "Results Ready!";
            document.querySelector(".sub-header").innerHTML = "Your images have been processed. ";
            // document.querySelectorAll(".move").style.height = "400px";
            showImageAnnotation(resultJsonData[0][0]);
            document.getElementById("main").style.height = "400px";
            document.getElementById("secondary").style.height = "400px";
            document.getElementById("main").classList.remove("col-7");
            document.getElementById("main").classList.add("col-9");
            document.getElementById("progress-next").style.display = "block";
        } else if (active == 4) {
            document.querySelector(".head").innerHTML = "Configure Recommendation Input";
            document.querySelector(".sub-header").innerHTML = "Kindly fill up the form.";
            document.getElementById("pond-input").style.display = "block";
            document.querySelectorAll(".toggle-final").forEach(button => {
                button.style.display = "none";
            });
            document.getElementById("main").style.height = "350px";
            document.getElementById("secondary").style.display = "none";
            let count = 0;
            resultJsonData.forEach((data) => {
                const annotations = data[1];
                annotations.forEach((annotation) => {
                    if (["Sanke", "Showa", "Kohaku", "Asagi", "Bekko", "Hikarimono"].includes(annotation.label)) {
                        count++;
                    }
                });
            });
            document.getElementById("numberOfKoiFish").value = count;
        } else {
            recommendPondDimensions(1);
            document.querySelector(".head").innerHTML = "Recommendation!";
            document.querySelector(".sub-header").innerHTML = "Pond size recommendation.";
            document.getElementById("progress-next").style.display = "none";
            document.getElementById("pond-recommendation").style.display = "block";
            document.getElementById("pond-input").style.display = "none";
            document.getElementById("progress-container").style.display = "none";
            document.getElementById("main").style.height = "450px";

        }
    } else if (window.location.pathname.includes("experiment.html")) {
        if (active === 1) {
            document.querySelector(".head").innerHTML = "Get Started!";
            document.querySelector(".sub-header").innerHTML = "Start by selecting the hypothesis to test.";
            document.getElementById("buttons-base").style.display = "none";
        } else if (active === 2) {
            if (document.getElementById("hypothesis1").checked) {
                document.getElementById("buttons-base").style.display = "block";
                // Code to execute when hypothesis 1 is selected
                document.querySelector(".head").innerHTML = "Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Your Koi Images for Analysis.";
                document.getElementById("koi-img-base").style.display = "block";
                document.getElementById("koi-img-btn").style.display = "block";
            } else {
                document.getElementById("buttons-base").style.display = "block";
                // Code to execute when hypothesis 1 is not selected
                document.querySelector(".head").innerHTML = "Small Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Your Small Koi Images for Analysis";
                document.getElementById("small-img-base").style.display = "block";
                document.getElementById("small-img-btn").style.display = "block";
                const progressNum = document.getElementById("progress-num");
                if (progressNum.childElementCount < 13) {
                    for (let i = progressNum.childElementCount + 1; i <= 12; i++) {
                        const li1 = document.createElement("li");
                        li1.classList.add("step");
                        li1.textContent = i;
                        progressNum.appendChild(li1);
                    }
                }
            }
            document.getElementById("hypothesis-select").style.display = "none";
        } else if (active === 3) {            
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Koi Truth JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your ground truth JSON.";
                document.getElementById("koi-img-base").style.display = "none";
                document.getElementById("koi-img-btn").style.display = "none";
                document.getElementById("koi-gt-base").style.display = "block";
                document.getElementById("koi-gt-btn").style.display = "block";
            } else {
                document.querySelector(".head").innerHTML = "Small Koi Truth JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your ground truth JSON.";
                document.getElementById("small-img-base").style.display = "none";
                document.getElementById("small-img-btn").style.display = "none";
                document.getElementById("small-gt-base").style.display = "block";
                document.getElementById("small-gt-btn").style.display = "block";
            }
        } else if (active === 4) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Koi Predictions JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your predictions JSON.";
                document.getElementById("koi-gt-base").style.display = "none";
                document.getElementById("koi-gt-btn").style.display = "none";
                document.getElementById("koi-pred-base").style.display = "block";
                document.getElementById("koi-pred-btn").style.display = "block";
            } else {
                document.querySelector(".head").innerHTML = "Small Koi Predictions JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your predictions JSON.";
                document.getElementById("small-gt-base").style.display = "none";
                document.getElementById("small-gt-btn").style.display = "none";
                document.getElementById("small-pred-base").style.display = "block";
                document.getElementById("small-pred-btn").style.display = "block";
            }
        } else if (active === 5) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Non-Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Other Images for Comparative Analysis.";
                document.getElementById("koi-pred-base").style.display = "none";
                document.getElementById("koi-pred-btn").style.display = "none";
                document.getElementById("non-koi-img-base").style.display = "block";
                document.getElementById("non-koi-img-btn").style.display = "block";
            } else {
                document.querySelector(".head").innerHTML = "Medium Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Your Medium Koi Images for Analysis.";
                document.getElementById("small-pred-base").style.display = "none";
                document.getElementById("small-pred-btn").style.display = "none";
                document.getElementById("medium-img-base").style.display = "block";
                document.getElementById("medium-img-btn").style.display = "block";
            }
        } else if (active === 6) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Non-Koi Truth JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your ground truth JSON.";
                document.getElementById("non-koi-img-base").style.display = "none";
                document.getElementById("non-koi-img-btn").style.display = "none";
                document.getElementById("non-koi-gt-base").style.display = "block";
                document.getElementById("non-koi-gt-btn").style.display = "block";
            } else {
                document.querySelector(".head").innerHTML = "Medium Koi Truth JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your ground truth JSON.";
                document.getElementById("medium-img-base").style.display = "none";
                document.getElementById("medium-img-btn").style.display = "none";
                document.getElementById("medium-gt-base").style.display = "block";
                document.getElementById("medium-gt-btn").style.display = "block";
            }
        } else if (active === 7) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Non-Koi Predictions JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your predictions JSON.";
                document.getElementById("non-koi-gt-base").style.display = "none";
                document.getElementById("non-koi-gt-btn").style.display = "none";
                document.getElementById("non-koi-pred-base").style.display = "block";
                document.getElementById("non-koi-pred-btn").style.display = "block";
                document.getElementById("loading-base").style.display = "none";
            } else {
                document.querySelector(".head").innerHTML = "Medium Koi Predictions JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your predictions JSON.";
                document.getElementById("medium-gt-base").style.display = "none";
                document.getElementById("medium-gt-btn").style.display = "none";
                document.getElementById("medium-pred-base").style.display = "block";
                document.getElementById("medium-pred-btn").style.display = "block";
            }
        } else if (active === 8) {
            if (document.getElementById("hypothesis1").checked) {
                document.getElementById("buttons-base").style.display = "none";
                document.querySelector(".head").innerHTML = "Processing your images...";
                document.querySelector(".sub-header").innerHTML = "Hold on, we’re working on it!";
                document.getElementById("non-koi-pred-base").style.display = "none";
                document.getElementById("non-koi-pred-btn").style.display = "none";
                document.getElementById("loading-base").style.display = "block";
                evaluateImages();
            } else {
                document.querySelector(".head").innerHTML = "Large Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Your Large Koi Images for Analysis.";
                document.getElementById("medium-pred-base").style.display = "none";
                document.getElementById("medium-pred-btn").style.display = "none";
                document.getElementById("large-img-base").style.display = "block";
                document.getElementById("large-img-btn").style.display = "block";
            }
        } else if (active === 9) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Results Ready!";
                document.querySelector(".sub-header").innerHTML = "Here are your results.";
                document.getElementById("loading-base").style.display = "none";
                document.getElementById("main").style.display = "none";
                document.getElementById("progress-next").style.display = "none";
                document.getElementById("data-1").style.display = "block";
                document.getElementById("progress-container").style.display = "none";
                document.getElementById("export-button-one").style.display = "block";
            } else {
                document.querySelector(".head").innerHTML = "Large Koi Truth JSON Annotation";
                document.querySelector(".sub-header").innerHTML = "Upload your ground truth JSON.";
                document.getElementById("large-img-base").style.display = "none";
                document.getElementById("large-img-btn").style.display = "none";
                document.getElementById("large-gt-base").style.display = "block";
                document.getElementById("large-gt-btn").style.display = "block";
            }
        } else if (active == 10) {
            document.querySelector(".head").innerHTML = "Large Koi Predictions JSON Annotation";
            document.querySelector(".sub-header").innerHTML = "Upload your predictions JSON.";
            document.getElementById("large-gt-base").style.display = "none";
            document.getElementById("large-gt-btn").style.display = "none";
            document.getElementById("large-pred-base").style.display = "block";
            document.getElementById("large-pred-btn").style.display = "block";
        } else if (active == 11) {
            document.getElementById("buttons-base").style.display = "none";
            document.querySelector(".head").innerHTML = "Processing your images...";
            document.querySelector(".sub-header").innerHTML = "Hold on, we’re working on it!";
            document.getElementById("large-pred-base").style.display = "none";
            document.getElementById("large-pred-btn").style.display = "none";
            document.getElementById("loading-base").style.display = "block";
            evaluateImages();
        } else if (active == 12) {
            document.querySelector(".head").innerHTML = "Results Ready!";
            document.querySelector(".sub-header").innerHTML = "Here are your results.";
            document.getElementById("loading-base").style.display = "none";
            document.getElementById("main").style.display = "none";
            document.getElementById("progress-next").style.display = "none";
            document.getElementById("data-2").style.display = "block";
            document.getElementById("progress-container").style.display = "none";
            document.getElementById("export-button-two").style.display = "block";
        }
    } else {
        if (active === 1) {
            document.querySelector(".head").innerHTML = "Get Started!";
            document.querySelector(".sub-header").innerHTML = "Start by uploading your images.";
            document.getElementById("image-container").style.display = "flex";

        } else if (active === 2) {
            document.querySelector(".head").innerHTML = "Optional JSON Annotation";
            document.querySelector(".sub-header").innerHTML = "Upload your JSON from Roboflow.";
            document.getElementById("input-file").style.display = "none";
            document.getElementById("input-folder").style.display = "none";
            document.getElementById("image-container").style.display = "none";
            document.getElementById("json-input").style.display = "block";
            document.getElementById("annotations-base").style.display = "block";
        } else if (active === 3) {
            document.querySelector(".head").innerHTML = "Configurations";
            document.querySelector(".sub-header").innerHTML = "Fill-up the required configurations to proceed.";
            document.getElementById("json-input").style.display = "none";
            document.getElementById("annotations-base").style.display = "none";
            document.getElementById("loading-base").style.display = "none";
            document.getElementById("configurations").style.display = "block";
            document.getElementById("progress-next").style.display = "block";
        } else if (active === 4) {
            document.querySelector(".head").innerHTML = "Processing your images...";
            document.querySelector(".sub-header").innerHTML = "Hold on, we’re working on it!";
            document.getElementById("configurations").style.display = "none";
            document.getElementById("progress-next").style.display = "none";
            document.getElementById("loading-base").style.display = "block";
            startAnnotation();
        } else if (active === 5) {
            document.querySelector(".head").innerHTML = "Results Ready!";
            document.querySelector(".sub-header").innerHTML = "Here are your classes and image counts results.";
            document.getElementById("loading-base").style.display = "none";
            document.getElementById("progress-next").style.display = "block";
            document.getElementById("classlist-base").style.display = "block";
        } else {
            document.querySelector(".head").innerHTML = "Assess and Export!";
            document.querySelector(".sub-header").innerHTML = "Here are your images, you can also export the data.";
            document.getElementById("main").style.height = "500px";
            document.getElementById("secondary").style.height = "500px";
            document.getElementById("main").classList.remove("col-7");
            document.getElementById("main").classList.add("col-8");
            document.getElementById("classlist-base").style.display = "none";
            document.getElementById("progress-next").style.display = "none";
            document.getElementById("final").style.display = "flex";
            document.getElementById("secondary").style.display = "flex";
            document.getElementById("export-button").style.display = "block";
            document.getElementById("progress-container").style.display = "none";
            if (filteredData.length > 0) {
                showImageAnnotation(filteredData[0].image);
            } else {
                showImageAnnotation(resultJsonData[0].image);
            }
        }
    }
}
