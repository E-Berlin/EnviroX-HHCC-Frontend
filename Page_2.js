// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set the location value from the query parameter
function setLocationFromQuery() {
    //const locationElement = document.getElementById('location');
    const location = getQueryParam('location');
    if (location) {
        //locationElement.textContent = location;

        // Call Google Custom Search API to fetch water situation data
        fetchWaterSituation(location);
    } else {
        //locationElement.textContent = "Determining location...";
    }
}

async function fetchWaterSituation(location) {
    const response_data = await fetch("http://192.168.60.231:5000/get_quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: location })
    })

    const enviro_data = await response_data.json();

    // 发送 POST 请求到后端
    const response = await fetch('http://192.168.60.231:5000/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enviro_data })
    })

    const data = await response.json();

    document.getElementById('reply').innerHTML = data.reply.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
}

// Call the function when the page loads
window.onload = setLocationFromQuery;