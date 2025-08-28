// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set the location value from the query parameter
function setLocationFromQuery() {
    const locationElement = document.getElementById('location');
    const location = getQueryParam('location');
    if (location) {
        locationElement.textContent = "Location: " + location;

        // Call Google Custom Search API to fetch water situation data
        fetchWaterSituation(location);
    } else {
        locationElement.textContent = "Determining location...";
    }
}

function parseReply(text) {
    // 用正则匹配每一部分
    const sections = {};

    // 定义想要捕捉的字段
    const keys = ["Location", "Critical Trend", "Anomaly Flag", "Source Hypothesis", "Action Priority"];

    keys.forEach((key, index) => {
        // 正则：找 **Key:** 后面的内容
        const regex = new RegExp(`\\*\\*${key}:\\*\\*([^]*?)(?=\\*\\*|$)`, "g");
        const match = regex.exec(text);
        if (match) {
            sections[key] = match[1].trim(); // 去掉前后空格换行
        }
    });

    return sections;
}

async function fetchWaterSituation(location) {
    const response_data = await fetch("https://envirox-hhcc-backend.onrender.com/get_quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: location })
    })

    const enviro_data = await response_data.json();

    // 发送 POST 请求到后端
    const response = await fetch('https://envirox-hhcc-backend.onrender.com/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enviro_data })
    })

    const data = await response.json();

    const parsed = parseReply(data.reply);

    document.getElementById('trend').innerHTML = parsed['Critical Trend'];
    document.getElementById('anomaly').innerHTML = parsed['Anomaly Flag'];
    document.getElementById('source').innerHTML = parsed['Source Hypothesis'];
    document.getElementById('action').innerHTML = parsed['Action Priority'];
}

function openTab(tabId, event) {
    // 1. 隐藏所有内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 2. 去掉所有按钮的 active
    document.querySelectorAll('.tab-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. 显示当前内容
    document.getElementById(tabId).classList.add('active');

    // 4. 给当前按钮加 active
    event.target.classList.add('active');
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

// Call the function when the page loads
window.onload = setLocationFromQuery;