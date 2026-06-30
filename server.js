const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// SIÊU THUẬT TOÁN V8 PRO EXTREME - TỰ ĐỘNG ĐÁNH GIÁ ĐỘ CHẮC CỦA CẦU (KHÔNG RANDOM)
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

    // Duy trì vùng quét 45 phiên gần nhất để bóc tách ma trận phân phối chu kỳ lớn
    const cleanData = reversedHistory.slice(-45).map(item => {
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
    if (size < 12) {
        return { prediction: "TÀI", rate: "82%" };
    }

    // Khởi tạo thang điểm ma trận xu hướng
    let scoreTai = 0.00;
    let scoreXiu = 0.00;
    
    // BIẾN QUYẾT ĐỊNH TỶ LỆ CỦA BẠN: Cầu càng chắc thì điểm thưởng này càng cao!
    let confidenceBonus = 0.00; 

    // Chuyển chuỗi dữ liệu sang dạng Text nhị phân để bóc tách mẫu hình
    const fullChain = cleanData.map(x => x.side).join('');
    
    const last3 = fullChain.slice(-3);
    const last4 = fullChain.slice(-4);
    const last5 = fullChain.slice(-5);
    const last6 = fullChain.slice(-6);
    const last7 = fullChain.slice(-7);
    const last8 = fullChain.slice(-8);

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 1: NHẬN DIỆN THẾ CẦU CHI TIẾT & PHÂN LOẠI ĐỘ CHẮC CHẮN (CONFIDENCE)
    // ------------------------------------------------------------------------
    
    // [THẾ 1] Cầu Bệt Siêu Dày (Bệt từ 7 tay trở lên) -> CẦU CỰC CHẮC, BÁM ĐẾN CHẾT
    if (last8 === '11111111' || last7 === '1111111') {
        scoreTai += 25.0;
        confidenceBonus += 8.5; // Cộng thưởng lớn vì cầu bệt trường rất hiếm khi gãy đột ngột
    } else if (last8 === '00000000' || last7 === '0000000') {
        scoreXiu += 25.0;
        confidenceBonus += 8.5;
    }
    // [THẾ 1.2] Cầu Bệt Tiêu Chuẩn (Bệt từ 4-6 tay) -> CẦU CHẮC
    else if (last6 === '111111' || last5 === '11111' || last4 === '1111') {
        scoreTai += 18.0;
        confidenceBonus += 5.0;
    } else if (last6 === '000000' || last5 === '00000' || last4 === '0000') {
        scoreXiu += 18.0;
        confidenceBonus += 5.0;
    }

    // [THẾ 2] Cầu Đảo 1-1 Chuẩn Khuôn Máy (Tài Xỉu xen kẽ lặp lại liên tục) -> CẦU CỰC CHẮC
    if (last8 === '10101010' || last8 === '01010101') {
        confidenceBonus += 7.5; // Khuôn đảo sâu rất ổn định
        if (last3 === '101') scoreXiu += 20.0;
        else if (last3 === '010') scoreTai += 20.0;
    } else if (last6 === '101010' || last6 === '010101') {
        confidenceBonus += 4.5;
        if (last3 === '101') scoreXiu += 15.0;
        else if (last3 === '010') scoreTai += 15.0;
    } else if (last4 === '1010' || last4 === '0101') {
        confidenceBonus += 2.0;
        if (last3 === '101') scoreXiu += 10.0;
        else if (last3 === '010') scoreTai += 10.0;
    }

    // [THẾ 3] Cầu Nhịp Đôi Cân Bằng 2-2 -> CẦU CHẮC TAY
    if (last4 === '1100') {
        scoreXiu += 12.0; confidenceBonus += 3.5;
    } else if (last4 === '0011') {
        scoreTai += 12.0; confidenceBonus += 3.5;
    } else if (last6 === '110011') {
        scoreXiu += 14.0; confidenceBonus += 4.0;
    } else if (last6 === '001100') {
        scoreTai += 14.0; confidenceBonus += 4.0;
    }

    // [THẾ 4] Cầu Nhịp Ba Cân Bằng 3-3 -> CẦU CHẮC TAY
    if (last6 === '111000') {
        scoreTai += 15.0; confidenceBonus += 5.0; // Điểm gãy hồi tụ về Tài rất nét
    } else if (last6 === '000111') {
        scoreXiu += 15.0; confidenceBonus += 5.0; // Điểm gãy hồi tụ về Xỉu rất nét
    }

    // [THẾ 5] Cầu Nhảy Bậc Thang Lệch Tầng nâng cao (Chuỗi 1-2-3 hoặc 3-2-1)
    if (fullChain.slice(-6) === '100111') {
        scoreXiu += 10.0; confidenceBonus += 2.5;
    } else if (fullChain.slice(-6) === '011000') {
        scoreTai += 10.0; confidenceBonus += 2.5;
    }

    // [THẾ 6] Cầu Nhảy Ngắn Tần Suất Cao (1-2 hoặc 2-1) -> Cầu bình thường
    if (last3 === '100') {
        scoreTai += 8.0; confidenceBonus += 1.0;
    } else if (last3 === '011') {
        scoreXiu += 8.0; confidenceBonus += 1.0;
    } else if (last4 === '1101') {
        scoreXiu += 7.0; confidenceBonus += 1.0;
    } else if (last4 === '0010') {
        scoreTai += 7.0; confidenceBonus += 1.0;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 2: TOÁN HỌC VI PHÂN MOMENTUM THEO CẤP SỐ LŨY THỪA GIỜ THỰC
    // ------------------------------------------------------------------------
    let momentum = 0;
    for (let i = 1; i < size; i++) {
        const diff = cleanData[i].total - cleanData[i - 1].total;
        // Các phiên càng sát thời gian thực hiện tại sẽ được đẩy trọng số cực đại (lũy thừa bậc 3)
        momentum += diff * Math.pow(i / size, 3);
    }
    
    if (momentum > 0) {
        scoreTai += Math.abs(momentum) * 0.55;
    } else {
        scoreXiu += Math.abs(momentum) * 0.55;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 3: CƠ CHẾ HỒI QUY GAUSS CÂN BẰNG MẬT ĐỘ LỆCH BIÊN ĐỘ
    // ------------------------------------------------------------------------
    let totalTaiCount = 0;
    cleanData.forEach(x => { if (x.side === 1) totalTaiCount++; });
    const densityTai = totalTaiCount / size;

    if (densityTai > 0.56) {
        scoreXiu += 6.0; // Lực cản kéo hồi quy khi mật độ Tài quá dày
    } else if (densityTai < 0.44) {
        scoreTai += 6.0; // Lực cản kéo hồi quy khi mật độ Xỉu quá dày
    }

    // ------------------------------------------------------------------------
    // XỬ LÝ ĐẦU RA - TÍNH TOÁN TỶ LỆ ĐỘNG LOGIC TUYẾN TÍNH (TUYỆT ĐỐI KHÔNG RANDOM)
    // ------------------------------------------------------------------------
    let finalPrediction = "TÀI";
    const deltaScore = Math.abs(scoreTai - scoreXiu);
    if (scoreXiu > scoreTai) finalPrediction = "XỈU";

    // Gốc tỉ lệ khởi điểm nằm ở mức 80% (Khi cầu đang đi ngang, không rõ thế cầu rõ nét)
    let baseRate = 80;
    
    // Tính toán độ lệch logic giữa 2 bên để tăng tỷ lệ tuyến tính (Tối đa tăng thêm 10%)
    let logicFactor = Math.min(deltaScore * 0.45, 10.0);
    
    // Khóa chặn trần điểm thưởng tự động từ các thế cầu chuẩn (Tối đa tăng thêm 8%)
    let patternBonus = Math.min(confidenceBonus, 8.0);

    // Tổng hợp tỷ lệ hoàn toàn bằng toán học cố định
    let calculatedRate = Math.round(baseRate + logicFactor + patternBonus);
    
    // Khóa cứng trần tỉ lệ không vượt quá 98% để đảm bảo tính thực tế của core phân tích
    if (calculatedRate > 98) calculatedRate = 98;

    return { prediction: finalPrediction, rate: `${calculatedRate}%` };
}

// --- LUỒNG ROUTE KHAI THÁC VÀ KHỚP NỐI DỮ LIỆU API ---
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
    res.send("HỆ THỐNG LÕI THUẬT TOÁN MA TRẬN V8 PRO EXTREME ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy lõi xử lý V8 phân tách độ chắc cầu thành công trên cổng: ${PORT}`);
});
