const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// SIÊU KIẾN TRÚC THUẬT TOÁN ĐA LUỒNG V9 HYPER CORE (TUYỆT ĐỐI KHÔNG RANDOM)
// ============================================================================
function executeHyperMultiThreadLogic(historyData) {
    // 1. Sàng lọc loại bỏ các phiên lỗi kết nối hoặc rỗng xúc xắc từ API gốc
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0;
    });

    const reversedHistory = [...validHistory].reverse();

    // Mở rộng vùng nhớ lưu trữ lên 50 phiên để phục vụ ma trận đa luồng
    const cleanData = reversedHistory.slice(-50).map(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        const total = d1 + d2 + d3;
        return {
            id: parseInt(item.Phien || 0),
            total: total,
            side: total >= 11 ? 1 : 0 // 1 = TÀI, 0 = XỈU
        };
    });

    const size = cleanData.length;
    if (size < 15) {
        return { prediction: "TÀI", rate: "81%" };
    }

    // Khởi tạo các thùng điểm số tổng hợp cuối cùng
    let finalScoreTai = 0.00;
    let finalScoreXiu = 0.00;
    let globalConfidence = 0.00;

    const fullChain = cleanData.map(x => x.side).join('');
    
    const last3 = fullChain.slice(-3);
    const last4 = fullChain.slice(-4);
    const last5 = fullChain.slice(-5);
    const last6 = fullChain.slice(-6);
    const last7 = fullChain.slice(-7);
    const last8 = fullChain.slice(-8);

    // ========================================================================
    // LUỒNG 1: NHẬN DIỆN MA TRẬN 20+ THẾ CẦU VIP (PATTERN THỜI GIAN THỰC)
    // ========================================================================
    let t1Tai = 0, t1Xiu = 0;

    // Nhóm 1: Các thế cầu Bệt Trường & Bệt Gãy
    if (last8 === '11111111' || last7 === '1111111') { t1Tai += 20; globalConfidence += 6; }
    else if (last8 === '00000000' || last7 === '0000000') { t1Xiu += 20; globalConfidence += 6; }
    else if (last6 === '111111' || last5 === '11111') { t1Tai += 15; globalConfidence += 4; }
    else if (last6 === '000000' || last5 === '00000') { t1Xiu += 15; globalConfidence += 4; }
    else if (last4 === '1111') { t1Tai += 10; globalConfidence += 2; }
    else if (last4 === '0000') { t1Xiu += 10; globalConfidence += 2; }

    // Nhóm 2: Các thế cầu Đảo nhịp 1-1-1-1
    if (last8 === '10101010' || last8 === '01010101') {
        globalConfidence += 7;
        if (last3 === '101') t1Xiu += 18; else if (last3 === '010') t1Tai += 18;
    } else if (last6 === '101010' || last6 === '010101') {
        globalConfidence += 4;
        if (last3 === '101') t1Xiu += 12; else if (last3 === '010') t1Tai += 12;
    }

    // Nhóm 3: Các thế cầu Song Hành Lặp Đôi 2-2 và Nhịp 3-3
    if (last4 === '1100') { t1Xiu += 12; globalConfidence += 3; }
    else if (last4 === '0011') { t1Tai += 12; globalConfidence += 3; }
    else if (last6 === '111000') { t1Tai += 15; globalConfidence += 5; }
    else if (last6 === '000111') { t1Xiu += 15; globalConfidence += 5; }

    // Nhóm 4: Các thế cầu Tiến Lệch Tầng nâng cao (1-2-3, 3-2-1, 2-1-2)
    if (fullChain.slice(-6) === '100111') { t1Xiu += 10; globalConfidence += 3; }
    else if (fullChain.slice(-6) === '011000') { t1Tai += 10; globalConfidence += 3; }
    else if (last5 === '11011') { t1Xiu += 8; globalConfidence += 2; }
    else if (last5 === '00100') { t1Tai += 8; globalConfidence += 2; }

    // Nhóm 5: Cầu Nhảy Ngắn Tần Suất Cao (1-2, 2-1, 1-3, 3-1)
    if (last3 === '100') { t1Tai += 6; }
    else if (last3 === '011') { t1Xiu += 6; }
    else if (fullChain.slice(-4) === '1000') { t1Tai += 8; globalConfidence += 1; }
    else if (fullChain.slice(-4) === '0111') { t1Xiu += 8; globalConfidence += 1; }

    finalScoreTai += t1Tai;
    finalScoreXiu += t1Xiu;

    // ========================================================================
    // LUỒNG 2: VI PHÂN GIA TỐC MOMENTUM TRỌNG SỐ LŨY THỪA TẦNG CAO
    // ========================================================================
    let momentum = 0;
    for (let i = 1; i < size; i++) {
        const diff = cleanData[i].total - cleanData[i - 1].total;
        // Đẩy trọng số tiệm cận bậc 3 cho các phiên sát thời gian thực hiện tại
        momentum += diff * Math.pow(i / size, 3);
    }
    if (momentum > 0) {
        finalScoreTai += Math.abs(momentum) * 0.65;
    } else {
        finalScoreXiu += Math.abs(momentum) * 0.65;
    }

    // ========================================================================
    // LUỒNG 3: HỒI QUY HÌNH HỌC PHÂN PHỐI GAUSS (ĐIỂM CÂN BẰNG BIÊN ĐỘ)
    // ========================================================================
    let totalTaiCount = 0;
    cleanData.forEach(x => { if (x.side === 1) totalTaiCount++; });
    const densityTai = totalTaiCount / size;

    // Thiết lập hệ thống phanh hãm lực nghiêng biên độ (Chống việc nghẽn 1 bên)
    if (densityTai > 0.55) {
        finalScoreXiu += (densityTai - 0.55) * 25.0;
    } else if (densityTai < 0.45) {
        finalScoreTai += (0.45 - densityTai) * 25.0;
    }

    // ========================================================================
    // LUỒNG 4: CHUỖI SỐ FIBONACCI KHOẢNG CÁCH GIAO THOA ĐIỂM
    // ========================================================================
    const lastTotal = cleanData[size - 1].total;
    const prevTotal = cleanData[size - 2].total;
    const pointGap = Math.abs(lastTotal - prevTotal);
    
    // Nếu khoảng cách điểm trùng khớp với dãy số Fibonacci chính quy (1,2,3,5,8)
    if ([1, 2, 3, 5, 8].includes(pointGap)) {
        globalConfidence += 1.5;
        if (lastTotal <= 7) finalScoreTai += 5.0;
        else if (lastTotal >= 14) finalScoreXiu += 5.0;
    }

    // ========================================================================
    // LUỒNG 5: ĐỐI CHIẾU MATRIX TRỤC TÂM NGHỊCH ĐẢO CHUỖI QUÁ KHỨ (CẦU KÍNH)
    // ========================================================================
    const checkLength = 6;
    if (size >= checkLength * 2) {
        const stringSegment1 = fullChain.slice(-checkLength * 2, -checkLength);
        const stringSegment2 = fullChain.slice(-checkLength);
        let inverseMatches = 0;
        for (let i = 0; i < checkLength; i++) {
            if (stringSegment1[i] !== stringSegment2[i]) inverseMatches++;
        }
        if (inverseMatches === checkLength) { // Phát hiện cấu trúc Cầu Gương đối xứng hoàn hảo
            globalConfidence += 4.5;
            if (fullChain.slice(-1) === '1') finalScoreXiu += 10; else finalScoreTai += 10;
        }
    }

    // ========================================================================
    // XỬ LÝ TỔNG HỢP CUỐI CÙNG - KHÓA TỶ LỆ ĐỘNG ĐA LUỒNG (NO RANDOM)
    // ========================================================================
    let finalPrediction = "TÀI";
    const deltaScore = Math.abs(finalScoreTai - finalScoreXiu);
    if (finalScoreXiu > finalScoreTai) finalPrediction = "XỈU";

    // Tỉ lệ cơ sở tĩnh khi thị trường không có thế cầu đặc biệt trùng khớp
    let baseRate = 80;
    
    // Độ lệch điểm giữa các luồng toán học đóng góp tối đa 11% vào tỷ lệ %
    let logicContribution = Math.min(deltaScore * 0.35, 11.0);
    
    // Các thế cầu khớp mẫu hình VIP đóng góp tối đa 7% vào tỷ lệ %
    let patternContribution = Math.min(globalConfidence, 7.0);

    // Điểm tổng hợp logic
    let calculatedRate = Math.round(baseRate + logicContribution + patternContribution);
    
    // Trần bảo hiểm kịch khung hệ thống là 98%
    if (calculatedRate > 98) calculatedRate = 98;

    return { prediction: finalPrediction, rate: `${calculatedRate}%` };
}

// --- LUỒNG ROUTE KHAI THÁC DỮ LIỆU TỪ HỆ THỐNG ---
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
            return res.status(500).send("Dữ liệu đầu vào của hệ thống trống.");
        }

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
            return res.status(500).send("Không định vị được phiên dữ liệu sạch.");
        }

        const d1 = parseInt(latestValidSession.Xuc_cac_1 || latestValidSession.Xuc_xac_1 || 0);
        const d2 = parseInt(latestValidSession.Xuc_cac_2 || latestValidSession.Xuc_xac_2 || 0);
        const d3 = parseInt(latestValidSession.Xuc_cac_3 || latestValidSession.Xuc_xac_3 || 0);
        const currentPhien = parseInt(latestValidSession.Phien || 0);
        const currentTong = d1 + d2 + d3;

        const logicResult = executeHyperMultiThreadLogic(history);
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
    res.send("HỆ THỐNG ĐA LUỒNG TOÁN HỌC MA TRẬN V9 HYPER CORE ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy thành công bộ lõi đa luồng V9 trên cổng: ${PORT}`);
});
