// loader.js
function showLoader() {                                                                 
    const loader = document.querySelector('.loader');
    // console.log("Showing loader....");
    // console.log(loader);    
    if (loader) {
        loader.style.display = 'block';
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    // console.log(loader);
    if (loader) {
        // console.log("Hiding loader....");

        loader.style.display = 'none';
    }
}
