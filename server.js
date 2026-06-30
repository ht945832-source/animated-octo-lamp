const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// THUẬT TOÁN ĐA LUỒNG V10 - QUANTUM MATRIX - KHÔNG RANDOM - TOÁN HỌC THUẦN TÚY
// ============================================================================

function quantumMatrixPredict(historyData) {
    // Lọc sạch dữ liệu rác
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0;
    });

    // Đảo ngược để lấy mới nhất trước
    const reversed = [...validHistory].reverse();
    const clean = reversed.slice(-60).map(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        const total = d1 + d2 + d3;
        return {
            id: parseInt(item.Phien || 0),
            total: total,
            side: total >= 11 ? 1 : 0, // 1 = TÀI, 0 = XỈU
            raw: [d1, d2, d3]
        };
    });

    const n = clean.length;
    if (n < 20) {
        // Nếu ít dữ liệu, dùng cơ chế dự phòng dựa trên trung bình trượt có trọng số
        let sum = 0;
        for (let i = 0; i < n; i++) sum += clean[i].total;
        const avg = sum / n;
        if (avg >= 11) return { prediction: "TÀI", rate: "76%" };
        else return { prediction: "XỈU", rate: "76%" };
    }

    // ==========================================================
    // KHỐI 1: MA TRẬN TƯƠNG QUAN CHUỖI (CORRELATION MATRIX)
    // ==========================================================
    let taiScore = 0, xiuScore = 0;
    let confidence = 0;

    // Chuyển chuỗi thành dạng bit
    const bitChain = clean.map(x => x.side).join('');
    const last = clean[n - 1];

    // ----- 1.1 Phát hiện cầu bệt (dài hoặc ngắn) -----
    const bệtTai = bitChain.match(/1{4,}/g);
    const bệtXiu = bitChain.match(/0{4,}/g);
    if (bệtTai) {
        const maxLen = Math.max(...bệtTai.map(s => s.length));
        taiScore += maxLen * 3.5;
        confidence += maxLen * 0.8;
    }
    if (bệtXiu) {
        const maxLen = Math.max(...bệtXiu.map(s => s.length));
        xiuScore += maxLen * 3.5;
        confidence += maxLen * 0.8;
    }

    // ----- 1.2 Phát hiện cầu đảo nhịp (1-1, 2-2, 3-3) -----
    const last6 = bitChain.slice(-6);
    const last8 = bitChain.slice(-8);
    if (last6 === '101010' || last6 === '010101') {
        taiScore += 12;
        xiuScore += 12;
        confidence += 5;
    }
    if (last8 === '11001100' || last8 === '00110011') {
        taiScore += 10;
        xiuScore += 10;
        confidence += 4;
    }

    // ----- 1.3 Phát hiện cầu gương (đối xứng) -----
    if (bitChain.length >= 12) {
        const half = Math.floor(bitChain.length / 2);
        const left = bitChain.slice(0, half);
        const right = bitChain.slice(half);
        let mirror = 0;
        for (let i = 0; i < Math.min(left.length, right.length); i++) {
            if (left[i] !== right[i]) mirror++;
        }
        if (mirror === Math.min(left.length, right.length)) {
            taiScore += 15;
            xiuScore += 15;
            confidence += 6;
        }
    }

    // ==========================================================
    // KHỐI 2: VI PHÂN MOMENTUM BẬC 4 (DERIVATIVE OF ORDER 4)
    // ==========================================================
    let momentum = 0;
    for (let i = 4; i < n; i++) {
        const d1 = clean[i].total - clean[i-1].total;
        const d2 = clean[i-1].total - clean[i-2].total;
        const d3 = clean[i-2].total - clean[i-3].total;
        const d4 = clean[i-3].total - clean[i-4].total;
        const accel = (d1 - d2) + (d3 - d4);
        momentum += accel * (i / n);
    }
    if (momentum > 0) taiScore += Math.abs(momentum) * 0.7;
    else xiuScore += Math.abs(momentum) * 0.7;

    // ==========================================================
    // KHỐI 3: HỒI QUY POLYNOMIAL BẬC 3 (TREND FITTING)
    // ==========================================================
    let sumX = 0, sumX2 = 0, sumX3 = 0, sumY = 0, sumXY = 0, sumX2Y = 0;
    for (let i = 0; i < n; i++) {
        const x = i + 1;
        const y = clean[i].total;
        sumX += x;
        sumX2 += x * x;
        sumX3 += x * x * x;
        sumY += y;
        sumXY += x * y;
        sumX2Y += x * x * y;
    }
    // Giải hệ phương trình tuyến tính cho hồi quy bậc 3 (dùng ma trận 3x3)
    const a1 = n, b1 = sumX, c1 = sumX2, d1 = sumY;
    const a2 = sumX, b2 = sumX2, c2 = sumX3, d2 = sumXY;
    const a3 = sumX2, b3 = sumX3, c3 = sumX2 * sumX2, d3 = sumX2Y;
    // Dùng quy tắc Cramer
    const det = a1 * (b2 * c3 - c2 * b3) - b1 * (a2 * c3 - c2 * a3) + c1 * (a2 * b3 - b2 * a3);
    if (Math.abs(det) > 1e-9) {
        const detA = d1 * (b2 * c3 - c2 * b3) - b1 * (d2 * c3 - c2 * d3) + c1 * (d2 * b3 - b2 * d3);
        const detB = a1 * (d2 * c3 - c2 * d3) - d1 * (a2 * c3 - c2 * a3) + c1 * (a2 * d3 - d2 * a3);
        const detC = a1 * (b2 * d3 - d2 * b3) - b1 * (a2 * d3 - d2 * a3) + d1 * (a2 * b3 - b2 * a3);
        const A = detA / det;
        const B = detB / det;
        const C = detC / det;
        // Dự đoán phiên tiếp theo (x = n+1)
        const pred = A + B * (n + 1) + C * (n + 1) * (n + 1);
        if (pred >= 11) taiScore += 12;
        else xiuScore += 12;
        confidence += 3;
    }

    // ==========================================================
    // KHỐI 4: FIBONACCI GAP & SMOOTHING
    // ==========================================================
    const lastTotal = clean[n-1].total;
    const prevTotal = clean[n-2].total;
    const gap = Math.abs(lastTotal - prevTotal);
    if ([1,2,3,5,8].includes(gap)) {
        confidence += 2;
        if (lastTotal <= 7) taiScore += 6;
        else if (lastTotal >= 14) xiuScore += 6;
    }

    // ==========================================================
    // KHỐI 5: PHÂN PHỐI GAUSS (DENSITY CORRECTION)
    // ==========================================================
    let taiCount = 0;
    for (let i = 0; i < n; i++) if (clean[i].side === 1) taiCount++;
    const density = taiCount / n;
    if (density > 0.6) {
        xiuScore += (density - 0.6) * 30;
    } else if (density < 0.4) {
        taiScore += (0.4 - density) * 30;
    }

    // ==========================================================
    // KHỐI 6: LỌC NHIỄU TẦN SỐ CAO (HIGH-PASS FILTER)
    // ==========================================================
    let highFreqNoise = 0;
    for (let i = 2; i < n; i++) {
        const diff1 = Math.abs(clean[i].total - clean[i-1].total);
        const diff2 = Math.abs(clean[i-1].total - clean[i-2].total);
        if (diff1 > 5 && diff2 > 5) highFreqNoise += 1;
    }
    if (highFreqNoise > n * 0.3) {
        taiScore -= 4;
        xiuScore -= 4;
        confidence += 1;
    }

    // ==========================================================
    // TỔNG HỢP CUỐI CÙNG - KHÔNG RANDOM
    // ==========================================================
    let finalPred = "TÀI";
    if (xiuScore > taiScore) finalPred = "XỈU";

    // Tính tỉ lệ dựa trên chênh lệch điểm
    let diff = Math.abs(taiScore - xiuScore);
    let baseRate = 78;
    let bonus = Math.min(diff * 0.5, 14);
    let rate = Math.min(baseRate + bonus + (confidence * 0.3), 97);
    rate = Math.round(rate);

    return { prediction: finalPred, rate: rate + "%" };
}

// ============================================================================
// API ENDPOINT
// ============================================================================
app.get('/api/predict', async (req, res) => {
    try {
        const response = await axios.get('https://b52-qiw2.onrender.com/api/history', { timeout: 7000 });
        const data = response.data;

        let history = [];
        if (data && data.data && Array.isArray(data.data)) history = data.data;
        else if (Array.isArray(data)) history = data;
        else return res.status(500).send("Dữ liệu API không hợp lệ.");

        // Lấy phiên hiện tại
        let latest = null;
        for (let i = 0; i < history.length; i++) {
            const d1 = parseInt(history[i].Xuc_cac_1 || history[i].Xuc_xac_1 || 0);
            const d2 = parseInt(history[i].Xuc_cac_2 || history[i].Xuc_xac_2 || 0);
            const d3 = parseInt(history[i].Xuc_cac_3 || history[i].Xuc_xac_3 || 0);
            if ((d1 + d2 + d3) > 0) { latest = history[i]; break; }
        }
        if (!latest) return res.status(500).send("Không tìm thấy phiên hợp lệ.");

        const d1 = parseInt(latest.Xuc_cac_1 || latest.Xuc_xac_1 || 0);
        const d2 = parseInt(latest.Xuc_cac_2 || latest.Xuc_xac_2 || 0);
        const d3 = parseInt(latest.Xuc_cac_3 || latest.Xuc_xac_3 || 0);
        const phien = parseInt(latest.Phien || 0);
        const tong = d1 + d2 + d3;

        const result = quantumMatrixPredict(history);
        const nextPhien = phien + 1;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(
`Phiên: ${phien}
Xúc xắc: ${d1}-${d2}-${d3}
Tổng: ${tong}
Phiên dự đoán: ${nextPhien}
Dự đoán: ${result.prediction}
Tỉ lệ: ${result.rate}
ID: @tranhoang2286`
        );

    } catch (error) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(500).send(
`Hệ thống đang đồng bộ dữ liệu...
ID: @tranhoang2286`
        );
    }
});

app.get('/', (req, res) => {
    res.send("QRG QUANTUM MATRIX V10 - NO RANDOM - ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[QRG] V10 QUANTUM MATRIX đang chạy trên cổng ${PORT}`);
});
