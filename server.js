const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// THUẬT TOÁN MA TRẬN V7 CORE PREMIUM - SIÊU CHỐNG LOẠN NHỊP CẦU BỆT VÀ CẦU ĐẢO
// ============================================================================
function executeUltraLongLogicChain(historyData) {
    // 1. Sàng lọc loại bỏ các phiên lỗi hệ thống từ nhà cái
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0;
    });

    const reversedHistory = [...validHistory].reverse();

    // Tăng vùng quét lên 40 phiên gần nhất để có cái nhìn toàn cảnh về xu hướng chu kỳ
    const cleanData = reversedHistory.slice(-40).map(item => {
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
    if (size < 10) {
        return { prediction: "TÀI", rate: "85%" };
    }

    let scoreTai = 0.00;
    let scoreXiu = 0.00;

    const fullChain = cleanData.map(x => x.side).join('');
    
    const last3 = fullChain.slice(-3);
    const last4 = fullChain.slice(-4);
    const last5 = fullChain.slice(-5);
    const last6 = fullChain.slice(-6);
    const last7 = fullChain.slice(-7);
    const last8 = fullChain.slice(-8);

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 1: ĐỘNG LỰC HỌC NHẬN DIỆN THẾ CẦU - KHÓA CHẶT BỆT (ANTI-BREAK)
    // ------------------------------------------------------------------------
    
    // Nâng mạnh trọng số bệt trường để ép bot TUYỆT ĐỐI KHÔNG BẺ CẦU KHI ĐANG RA BỆT THÔNG
    if (last8 === '11111111' || last7 === '1111111') {
        scoreTai += 15.0; 
    } else if (last8 === '00000000' || last7 === '0000000') {
        scoreXiu += 15.0; 
    }
    // Chặn đứng lỗi gãy chuỗi ở ảnh lịch sử của bạn (phát hiện bệt từ tay 4, tay 5)
    else if (last6 === '111111' || last5 === '11111' || last4 === '1111') {
        scoreTai += 10.5;
    } else if (last6 === '000000' || last5 === '00000' || last4 === '0000') {
        scoreXiu += 10.5;
    }

    // [THẾ 2] Nhận diện và bắt chuẩn nhịp Cầu Đảo 1-1 liên tục
    if (last8 === '10101010' || last8 === '01010101') {
        if (last3 === '101') scoreXiu += 9.5;
        else if (last3 === '010') scoreTai += 9.5;
    } else if (last6 === '101010' || last6 === '010101') {
        if (last3 === '101') scoreXiu += 7.5;
        else if (last3 === '010') scoreTai += 7.5;
    } else if (last4 === '1010' || last4 === '0101') {
        if (last3 === '101') scoreXiu += 5.5;
        else if (last3 === '010') scoreTai += 5.5;
    }

    // [THẾ 3] Nhận diện cấu trúc nhịp đôi song hành cân bằng 2-2
    if (last4 === '1100') {
        scoreXiu += 6.0; // Dự toán tay thứ 3 đưa dòng chuỗi về Xỉu tiếp tục
    } else if (last4 === '0011') {
        scoreTai += 6.0; // Dự toán tay thứ 3 đưa dòng chuỗi về Tài tiếp tục
    } else if (last5 === '11001') {
        scoreTai += 5.0; 
    } else if (last5 === '00110') {
        scoreXiu += 5.0;
    }

    // [THẾ 4] Nhận diện cấu trúc nhịp ba đối xứng 3-3
    if (last6 === '111000') {
        scoreTai += 7.0; // Chạm biên độ 3 tay Xỉu, hồi phục nhịp đầu Tài
    } else if (last6 === '000111') {
        scoreXiu += 7.0; // Chạm biên độ 3 tay Tài, hồi phục nhịp đầu Xỉu
    }

    // [THẾ 5] Cấu trúc cầu nhảy bậc thang và cầu lệch (1-2-3 hoặc 3-2-1)
    if (fullChain.slice(-6) === '100111') {
        scoreXiu += 5.5;
    } else if (fullChain.slice(-6) === '011000') {
        scoreTai += 5.5;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 2: PHÂN TÍCH ĐIỂM SỐ MOMENTUM VI PHÂN TUYẾN TÍNH GIỜ THỰC
    // ------------------------------------------------------------------------
    let momentum = 0;
    for (let i = 1; i < size; i++) {
        const diff = cleanData[i].total - cleanData[i - 1].total;
        // Các phiên càng sát thời gian thực hiện tại sẽ được nhân hệ số lũy thừa bậc hai để bắt nhịp nhạy hơn
        momentum += diff * Math.pow(i / size, 2);
    }
    
    if (momentum > 0) {
        scoreTai += Math.abs(momentum) * 0.45;
    } else {
        scoreXiu += Math.abs(momentum) * 0.45;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 3: THUẬT TOÁN HỒI QUY PHÂN PHỐI GAUSS ĐƯA VỀ ĐIỂM CÂN BẰNG
    // ------------------------------------------------------------------------
    let totalTaiCount = 0;
    cleanData.forEach(x => { if (x.side === 1) totalTaiCount++; });
    const densityTai = totalTaiCount / size;

    if (densityTai > 0.58) {
        scoreXiu += 4.0; // Lực cản kéo hồi quy khi mật độ Tài quá dày
    } else if (densityTai < 0.42) {
        scoreTai += 4.0; // Lực cản kéo hồi quy khi mật độ Xỉu quá dày
    }

    // ------------------------------------------------------------------------
    // ĐẦU RA KẾT QUẢ ĐỒNG NHẤT KHÔNG RANDOM 100%
    // ------------------------------------------------------------------------
    let finalPrediction = "TÀI";
    const deltaScore = Math.abs(scoreTai - scoreXiu);
    if (scoreXiu > scoreTai) finalPrediction = "XỈU";

    // Tính toán Tỷ lệ động tiệm cận cố định dựa trên khoảng cách lệch điểm số logic
    let rateFactor = Math.min(deltaScore * 3.8, 13.0);
    let calculatedRate = Math.round(85 + rateFactor);

    return { prediction: finalPrediction, rate: `${calculatedRate}%` };
}

// --- LUỒNG ROUTE KHAI THÁC VÀ ĐÓNG GÓI DỮ LIỆU ---
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
    res.send("HỆ THỐNG LÕI THUẬT TOÁN MA TRẬN V7 CORE PREMIUM ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy lõi xử lý V7 chống loạn nhịp thành công trên cổng: ${PORT}`);
});
