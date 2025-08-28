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

    const response = await fetch("https://envirox-hhcc-backend.onrender.com/get_location", {
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

// ================== 动态背景（山 + 云） ==================
const canvas = document.getElementById("mountain-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let t = 0;

// 初始化一些云
const clouds = [];
for (let i = 0; i < 5; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 150 + 30, // 高度范围
        speed: Math.random() * 0.3 + 0.2,
        size: Math.random() * 40 + 40
    });
}

function drawCloud(cloud) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 5; i++) {
        let offsetX = Math.cos(i) * cloud.size * 0.6;
        let offsetY = Math.sin(i) * cloud.size * 0.2;
        ctx.ellipse(cloud.x + offsetX, cloud.y + offsetY, cloud.size, cloud.size * 0.6, 0, 0, Math.PI * 2);
    }
    ctx.fill();
}

function drawMountains() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制云
    clouds.forEach(cloud => {
        drawCloud(cloud);
        cloud.x += cloud.speed;
        if (cloud.x - cloud.size > canvas.width) {
            cloud.x = -cloud.size;
            cloud.y = Math.random() * 150 + 30;
        }
    });

    // 多层山峦
    drawLayer("#555", 150, 0.002, 80);
    drawLayer("#888", 100, 0.003, 50);
    drawLayer("#bbb", 60, 0.004, 30);

    t += 0.01;
    requestAnimationFrame(drawMountains);
}

function drawLayer(color, baseHeight, speed, amplitude) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x += 10) {
        let y = canvas.height - baseHeight
            - Math.sin((x * 0.01) + (t * speed * 200)) * amplitude;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

drawMountains();

// Call the function to set the location when the page loads
window.onload = setLocation;