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
    startCounting();
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
        document.querySelector(".sub-header").innerHTML = "Your images have been processed. ";
        // document.querySelectorAll(".move").style.height = "400px";
        showImageAnnotation(resultJsonData[0][0]);
    }
}
