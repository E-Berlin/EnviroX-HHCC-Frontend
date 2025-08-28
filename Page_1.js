let cityTarget = "";

// Use the Geolocation API to determine the user's location
function setLocation() {
    const locationInput = document.getElementById('location');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Use a reverse geocoding API to get the location name
                fetchLocationName(latitude, longitude, locationInput);
            },
            (error) => {
                locationInput.value = "Unable to determine location";
                console.error("Reverse geocoding error:", error);
            }
        );
    } else {
        locationInput.value = "Geolocation not supported";
    }
}

// Fetch the location name using a reverse geocoding API
async function fetchLocationName(latitude, longitude, locationInput) {
    const lat = latitude;
    const lng = longitude;

    const response = await fetch("http://192.168.60.231:5000/get_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: lat, lng: lng })
    });

    // Extract the city name from the API response
    const data = await response.json();

    const city = data.address.city;
    const province = data.address.province; // 省份信息
    const country = "China"; // 高德API主要用于中国地区

    const translateToEnglish = async (text) => {
        // 简单调用 Google Translate API 或其他在线翻译
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const pos = await res.json();
        return pos[0][0][0]; // 翻译结果
    };

    const cityEN = await translateToEnglish(city);
    // const districtEN = await translateToEnglish(district);
    const provinceEN = await translateToEnglish(province);

    // 过滤空值，再用逗号组合
    const parts = [cityEN, provinceEN, country].filter(p => p && p != "");
    const addressStringEN = parts.join(", ");

    localStorage.setItem("address", addressStringEN);

    locationInput.value = `${addressStringEN}`;

    // 如果 city 为空或只有空格，就用省份兜底
    if (city == "") {
        localStorage.setItem("city", provinceEN);
    }
}

// Navigate to the other page with the location value
function navigateToSecondPage() {
    const locationInput = document.getElementById('location');
    const location = locationInput.value; // Get the current value of the location input
    const address = localStorage.getItem("address");
    if (location != address) {
        localStorage.setItem("city", location);
    }
    const city = localStorage.getItem("city");
    const encodedLocation = encodeURIComponent(city);
    window.location.href = `Page_2.html?location=${encodedLocation}`;
}

function navigateToThirdPage() {
    const city = localStorage.getItem("city");
    const encodedCity = encodeURIComponent(city);
    window.location.href = `Page_3.html?city=${encodedCity}`;
}

// Call the function to set the location when the page loads
window.onload = setLocation;