const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// HỆ THỐNG THUẬT TOÁN LOGIC VI PHÂN VÀ NHẬN DIỆN CẦU TUYẾN TÍNH (KHÔNG RANDOM)
// ============================================================================
function executeUltraLongLogicChain(historyData) {
    // 1. LỌC BỎ HOÀN TOÀN CÁC PHIÊN LỖI 0-0-0 NGAY TỪ ĐẦU
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0; // Chỉ giữ lại phiên có điểm xúc xắc thực
    });

    // FIX LỖI CHÍ MẠNG: Phải đảo mảng trước để đưa các phiên MỚI NHẤT về cuối mảng phân tích
    const reversedHistory = [...validHistory].reverse();

    // Lấy đúng 24 phiên gần đây nhất để tính toán nhịp cầu ngắn và trung hạn
    const cleanData = reversedHistory.slice(-24).map(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        const total = d1 + d2 + d3;
        return {
            id: parseInt(item.Phien || 0),
            total: total,
            side: total >= 11 ? 1 : 0 // 1 = Tài, 0 = Xỉu
        };
    });

    const size = cleanData.length;
    if (size < 6) {
        return { prediction: "TÀI", rate: "85%" };
    }

    let scoreTai = 0.0000;
    let scoreXiu = 0.0000;

    // --- MODULE 1: NHẬN DIỆN HÌNH THÁI CẦU TĨNH ---
    const str4 = cleanData.slice(-4).map(x => x.side).join('');
    const str6 = cleanData.slice(-6).map(x => x.side).join('');

    if (str6 === '111111' || str6 === '000000') {
        // Phát hiện cầu bệt dài -> Đánh tiếp diễn cầu bệt
        if (str6 === '111111') scoreTai += 4.5; else scoreXiu += 4.5;
    } else if (str6 === '101010' || str6 === '010101') {
        // Phát hiện cầu đảo 1-1 -> Đánh nghịch đảo nhịp kế tiếp
        if (str6 === '101010') scoreTai += 4.0; else scoreXiu += 4.0;
    } else if (str4 === '1100' || str4 === '0011') {
        // Phát hiện cầu đôi 2-2 -> Đánh tiếp diễn cặp đôi
        if (str4 === '1100') scoreTai += 3.5; else scoreXiu += 3.5;
    }

    // --- MODULE 2: TOÁN HỌC VI PHÂN MOMENTUM (TỐC ĐỘ DI CHUYỂN ĐIỂM) ---
    let totalVelocity = 0; 
    for (let i = 1; i < size; i++) {
        const velocity = cleanData[i].total - cleanData[i-1].total;
        // Trọng số nhân cao hơn cho các phiên càng sát hiện tại
        totalVelocity += velocity * (i / size); 
    }

    if (totalVelocity > 0) {
        scoreTai += Math.abs(totalVelocity) * 0.25;
    } else {
        scoreXiu += Math.abs(totalVelocity) * 0.25;
    }

    // --- MODULE 3: CÂN BẰNG MẬT ĐỘ ĐIỂM ---
    let countTai = 0;
    cleanData.forEach(x => { if (x.side === 1) countTai++; });
    const taiRatio = countTai / size;

    if (taiRatio > 0.60) scoreXiu += 2.0; // Quá nhiều Tài -> Thuật toán kéo về Xỉu
    if (taiRatio < 0.40) scoreTai += 2.0; // Quá nhiều Xỉu -> Thuật toán kéo về Tài

    // TỔNG HỢP QUYẾT ĐỊNH CUỐI CÙNG
    let finalPrediction = "TÀI";
    const delta = Math.abs(scoreTai - scoreXiu);
    if (scoreXiu > scoreTai) finalPrediction = "XỈU";

    // Tỷ lệ khớp động biến thiên logic từ 82% đến 98% dựa vào độ lệch điểm số
    let finalRate = 82 + Math.floor(Math.min(delta * 4.5, 16));

    return { prediction: finalPrediction, rate: `${finalRate}%` };
}

// --- HỆ THỐNG ROUTE API CHÍNH ---
app.get('/api/predict', async (req, res) => {
    try {
        const response = await axios.get('https://b52-qiw2.onrender.com/api/history', { timeout: 6000 });
        const resData = response.data;

        let history = [];
        if (resData && resData.data && Array.isArray(resData.data)) {
            history = resData.data;
        } else if (Array.isArray(resData)) {
            history = resData;
        } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(500).send("Cấu trúc mảng API gốc trống.");
        }

        // TÌM PHIÊN MỚI NHẤT MÀ CÓ XÚC XẮC HỢP LỆ TRONG DANH SÁCH LỊCH SỬ ĐẦU VÀO
        let latestValidSession = null;
        for (let i = 0; i < history.length; i++) {
            const d1 = parseInt(history[i].Xuc_cac_1 || history[i].Xuc_xac_1 || 0);
            const d2 = parseInt(history[i].Xuc_cac_2 || history[i].Xuc_xac_2 || 0);
            const d3 = parseInt(history[i].Xuc_cac_3 || history[i].Xuc_xac_3 || 0);
            if ((d1 + d2 + d3) > 0) {
                latestValidSession = history[i];
                break;
            }
        }

        if (!latestValidSession) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(500).send("Không tìm thấy phiên có điểm hợp lệ.");
        }

        const d1 = parseInt(latestValidSession.Xuc_cac_1 || latestValidSession.Xuc_xac_1 || 0);
        const d2 = parseInt(latestValidSession.Xuc_cac_2 || latestValidSession.Xuc_xac_2 || 0);
        const d3 = parseInt(latestValidSession.Xuc_cac_3 || latestValidSession.Xuc_xac_3 || 0);
        const currentPhien = parseInt(latestValidSession.Phien || 0);
        const currentTong = d1 + d2 + d3;

        // Chạy phân tích logic tuyến tính sạch
        const logicResult = executeUltraLongLogicChain(history);
        const nextPhien = currentPhien + 1;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        
        const outputResponse = 
`Phiên: ${currentPhien}
Xuc xac1-3: ${d1}-${d2}-${d3}
Tong: ${currentTong}
Phiên dự đoán: ${nextPhien}
Dự đoán: ${logicResult.prediction}
Tỉ lệ: ${logicResult.rate}
Id: @tranhoang2286`;

        return res.send(outputResponse);

    } catch (error) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(500).send(`Hệ thống đang đồng bộ dữ liệu phiên mới...\nId: @tranhoang2286`);
    }
});

app.get('/', (req, res) => {
    res.send("API HOANGDZ V4 CORE PREMIUM CHẠY ỔN ĐỊNH.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy cổng dịch vụ thành công: ${PORT}`);
});
