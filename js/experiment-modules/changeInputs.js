function changeInputs(){
    // Value selector
    const hypothesis = document.getElementById("hypothesis").value;
    // Components
    const hypothesisOneContainer = document.getElementById("hypothesis-one");
    const hypothesisTwoContainer = document.getElementById("hypothesis-two");
    const hypothesisOneOutput = document.getElementById("hypothesis-one-output");
    const hypothesisTwoOutput = document.getElementById("hypothesis-two-output");

    // Change interface
    if (hypothesis==2) {
        console.log("Change interface");
        hypothesisOneContainer.style.display = "none";
        hypothesisTwoContainer.style.display = "block";
        hypothesisOneOutput.style.display = "none";
        hypothesisTwoOutput.style.display = "block";
    } else {
        console.log("Return Interface");
        hypothesisOneContainer.style.display = "block";
        hypothesisTwoContainer.style.display = "none";
        hypothesisOneOutput.style.display = "block";
        hypothesisTwoOutput.style.display = "none";
    }
}