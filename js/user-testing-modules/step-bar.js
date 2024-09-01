const progressBar = document.getElementById("progress-bar1");
const progressNext = document.getElementById("progress-next");
const progressPrev = document.getElementById("progress-prev");
const steps = document.querySelectorAll(".step");
let active = 1;

progressNext.addEventListener("click", () => {
    active++;
    if (active > steps.length) {
      active = steps.length;
    }
    updateProgress();
    if (window.location.pathname.includes("user%20testing.html")) {
        startCounting();
    }
    pageLoad();
  });


const updateProgress = async () => {
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
        } else if (active === 2) {
            document.querySelectorAll(".toggle-button").forEach(button => {
                button.style.display = "none";
            });
            document.querySelectorAll(".toggle-progress").forEach(button => {
                button.style.display = "block";
            });
            document.querySelector(".head").innerHTML = "Processing your images...";
            document.querySelector(".sub-header").innerHTML = "Hold on, we’re working on it!";
        } else {
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
            document.getElementById("main").style.height = "350px";
            document.getElementById("secondary").style.height = "350px";
        }
    } else {
        if (active === 1) {
            document.querySelector(".head").innerHTML = "Get Started!";
            document.querySelector(".sub-header").innerHTML = "Start by selecting the hypothesis to test.";
        } else if (active === 2) {
            if (document.getElementById("hypothesis1").checked) {
                // Code to execute when hypothesis 1 is selected
                document.querySelector(".head").innerHTML = "Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Your Koi Images for Analysis.";
                document.getElementById("koi-img-base").style.display = "block";
                document.getElementById("koi-img-btn").style.display = "block";
            } else {
                // Code to execute when hypothesis 1 is not selected
                document.querySelector(".head").innerHTML = "Small Koi Image Hypothesis Testing";
                document.querySelector(".sub-header").innerHTML = "Upload Your Small Koi Images for Analysis";
                const progressNum = document.getElementById("progress-num");
                for (let i = 10; i < 13; i++) {
                    const li1 = document.createElement("li");
                    li1.classList.add("step");
                    li1.textContent = i;
                    progressNum.appendChild(li1);
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
                
            }
        } else if (active === 8) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Processing your images...";
                document.querySelector(".sub-header").innerHTML = "Hold on, we’re working on it!";
                document.getElementById("non-koi-pred-base").style.display = "none";
                document.getElementById("non-koi-pred-btn").style.display = "none";
                document.getElementById("loading-base").style.display = "block";
                evaluateImages();
            } else {
                
            }
        } else if (active === 9) {
            if (document.getElementById("hypothesis1").checked) {
                document.querySelector(".head").innerHTML = "Results Ready!";
                document.querySelector(".sub-header").innerHTML = "Here are your results. You can export it as CSV at the export section.";
                document.getElementById("loading-base").style.display = "none";
                document.getElementById("main").style.display = "none";
                document.getElementById("progress-next").style.display = "none";
                document.getElementById("data").style.display = "block";
            } else {
                
            }
        }
    }
}
