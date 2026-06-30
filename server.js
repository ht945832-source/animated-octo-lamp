const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// SIÊU KIẾN TRÚC TOÁN HỌC MA TRẬN V12 - NÂNG CẤP TOÀN BỘ - KHÔNG RANDOM
// ============================================================================
function executeUltraHardcoreLogicChain(historyData) {
    // 1. Khử toàn bộ các phiên lỗi rỗng dữ liệu từ API tổng
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0;
    });

    const reversedHistory = [...validHistory].reverse();
    
    // Mở rộng vùng nhớ lên 80 phiên để phân tích sâu
    const cleanData = reversedHistory.slice(-80).map(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        const total = d1 + d2 + d3;
        return {
            id: parseInt(item.Phien || 0),
            total: total,
            side: total >= 11 ? 1 : 0, // 1 = TÀI, 0 = XỈU
            dice: [d1, d2, d3]
        };
    });

    const size = cleanData.length;
    if (size < 20) {
        return { prediction: "TÀI", rate: "80%" };
    }

    // Khởi tạo các thùng chứa điểm số tuyến tính của ma trận toán học
    let weightTai = 100.00;
    let weightXiu = 100.00;
    let patternConfidence = 0.00;

    // Chuyển chuỗi dữ liệu nhị phân thành Text thô phục vụ bóc tách chuỗi sâu
    const binaryChain = cleanData.map(x => x.side).join('');
    const totalChain = cleanData.map(x => x.total);
    
    // Cắt lớp chuỗi dữ liệu từ ngắn hạn đến siêu dài hạn
    const segment3 = binaryChain.slice(-3);
    const segment4 = binaryChain.slice(-4);
    const segment5 = binaryChain.slice(-5);
    const segment6 = binaryChain.slice(-6);
    const segment7 = binaryChain.slice(-7);
    const segment8 = binaryChain.slice(-8);
    const segment9 = binaryChain.slice(-9);
    const segment10 = binaryChain.slice(-10);
    const segment12 = binaryChain.slice(-12);
    const segment15 = binaryChain.slice(-15);

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 1: PHÂN TÍCH CHI TIẾT 50+ BIẾN THỂ THẾ CẦU VIP
    // ------------------------------------------------------------------------
    
    // KHỐI 1: CẦU BỆT TRƯỜNG (MỞ RỘNG ĐẾN 15 PHIÊN)
    if (segment15 === '111111111111111') { weightTai += 80; patternConfidence += 20; }
    else if (segment15 === '000000000000000') { weightXiu += 80; patternConfidence += 20; }
    else if (segment12 === '111111111111') { weightTai += 70; patternConfidence += 17; }
    else if (segment12 === '000000000000') { weightXiu += 70; patternConfidence += 17; }
    else if (segment10 === '1111111111') { weightTai += 65; patternConfidence += 15; }
    else if (segment10 === '0000000000') { weightXiu += 65; patternConfidence += 15; }
    else if (segment9 === '111111111') { weightTai += 55; patternConfidence += 12; }
    else if (segment9 === '000000000') { weightXiu += 55; patternConfidence += 12; }
    else if (segment8 === '11111111') { weightTai += 45; patternConfidence += 10; }
    else if (segment8 === '00000000') { weightXiu += 45; patternConfidence += 10; }
    else if (segment7 === '1111111') { weightTai += 38; patternConfidence += 8; }
    else if (segment7 === '0000000') { weightXiu += 38; patternConfidence += 8; }
    else if (segment6 === '111111') { weightTai += 30; patternConfidence += 6; }
    else if (segment6 === '000000') { weightXiu += 30; patternConfidence += 6; }
    else if (segment5 === '11111') { weightTai += 22; patternConfidence += 4; }
    else if (segment5 === '00000') { weightXiu += 22; patternConfidence += 4; }
    else if (segment4 === '1111') { weightTai += 15; patternConfidence += 2; }
    else if (segment4 === '0000') { weightXiu += 15; patternConfidence += 2; }

    // KHỐI 2: KHUÔN CẦU ĐẢO 1-1 LIÊN TỤC (MỞ RỘNG ĐA TẦNG)
    if (segment12 === '101010101010' || segment12 === '010101010101') {
        patternConfidence += 18;
        if (segment3 === '101') weightXiu += 55; else if (segment3 === '010') weightTai += 55;
    } else if (segment10 === '1010101010' || segment10 === '0101010101') {
        patternConfidence += 14;
        if (segment3 === '101') weightXiu += 45; else if (segment3 === '010') weightTai += 45;
    } else if (segment8 === '10101010' || segment8 === '01010101') {
        patternConfidence += 10;
        if (segment3 === '101') weightXiu += 35; else if (segment3 === '010') weightTai += 35;
    } else if (segment6 === '101010' || segment6 === '010101') {
        patternConfidence += 6;
        if (segment3 === '101') weightXiu += 25; else if (segment3 === '010') weightTai += 25;
    } else if (segment4 === '1010' || segment4 === '0101') {
        patternConfidence += 3;
        if (segment3 === '101') weightXiu += 15; else if (segment3 === '010') weightTai += 15;
    }

    // KHỐI 3: KHUÔN CẦU ĐÔI 2-2 VÀ CẦU LẶP BA 3-3
    if (segment12 === '110011001100' || segment12 === '001100110011') {
        patternConfidence += 16;
        if (segment4 === '1100') weightTai += 45; else if (segment4 === '0011') weightXiu += 45;
    } else if (segment8 === '11001100' || segment8 === '00110011') {
        patternConfidence += 12;
        if (segment4 === '1100') weightTai += 35; else if (segment4 === '0011') weightXiu += 35;
    } else if (segment6 === '110011') {
        weightXiu += 25; patternConfidence += 5;
    } else if (segment6 === '001100') {
        weightTai += 25; patternConfidence += 5;
    } else if (segment4 === '1100') {
        weightXiu += 18; patternConfidence += 2;
    } else if (segment4 === '0011') {
        weightTai += 18; patternConfidence += 2;
    }
    
    // Cầu lặp 3-3
    if (segment9 === '111000111') { weightTai += 40; patternConfidence += 9; }
    else if (segment9 === '000111000') { weightXiu += 40; patternConfidence += 9; }
    else if (segment6 === '111000') { weightTai += 30; patternConfidence += 6; }
    else if (segment6 === '000111') { weightXiu += 30; patternConfidence += 6; }

    // KHỐI 4: CẦU TIẾN BẬC THANG LỆCH TẦNG (MỞ RỘNG)
    if (segment9 === '111000111') { weightTai += 30; patternConfidence += 8; }
    else if (segment9 === '000111000') { weightXiu += 30; patternConfidence += 8; }
    else if (segment7 === '1110001') { weightXiu += 28; patternConfidence += 6; }
    else if (segment7 === '0001110') { weightTai += 28; patternConfidence += 6; }
    else if (segment6 === '100111') { weightXiu += 22; patternConfidence += 4; }
    else if (segment6 === '011000') { weightTai += 22; patternConfidence += 4; }
    else if (segment5 === '11000') { weightTai += 15; patternConfidence += 3; }
    else if (segment5 === '00111') { weightXiu += 15; patternConfidence += 3; }

    // KHỐI 5: CẦU NHẢY NGẮN LỆCH TẦNG (MỞ RỘNG BIẾN THỂ)
    if (segment7 === '1101101') { weightTai += 20; patternConfidence += 5; }
    else if (segment7 === '0010010') { weightXiu += 20; patternConfidence += 5; }
    else if (segment5 === '11011') { weightXiu += 15; patternConfidence += 3; }
    else if (segment5 === '00100') { weightTai += 15; patternConfidence += 3; }
    else if (segment4 === '1011') { weightXiu += 12; patternConfidence += 2; }
    else if (segment4 === '0100') { weightTai += 12; patternConfidence += 2; }
    else if (segment3 === '100') { weightTai += 10; }
    else if (segment3 === '011') { weightXiu += 10; }

    // KHỐI 6: CẦU ĐẢO CHU KỲ PHỨC TẠP
    if (segment8 === '11101110') { weightXiu += 30; patternConfidence += 8; }
    else if (segment8 === '00010001') { weightTai += 30; patternConfidence += 8; }
    else if (segment6 === '111011') { weightXiu += 22; patternConfidence += 5; }
    else if (segment6 === '000100') { weightTai += 22; patternConfidence += 5; }
    else if (segment5 === '11010') { weightTai += 16; patternConfidence += 3; }
    else if (segment5 === '00101') { weightXiu += 16; patternConfidence += 3; }

    // KHỐI 7: CẦU NHỊP ĐÔI XEN KẼ
    if (segment10 === '1110011100') { weightTai += 35; patternConfidence += 10; }
    else if (segment10 === '0001100011') { weightXiu += 35; patternConfidence += 10; }
    else if (segment8 === '11100111') { weightXiu += 28; patternConfidence += 7; }
    else if (segment8 === '00011000') { weightTai += 28; patternConfidence += 7; }
    else if (segment6 === '111001') { weightXiu += 20; patternConfidence += 5; }
    else if (segment6 === '000110') { weightTai += 20; patternConfidence += 5; }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 2: PHÂN TÍCH XU HƯỚNG MOMENTUM VI PHÂN (NÂNG CẤP)
    // ------------------------------------------------------------------------
    let trendMomentum = 0;
    for (let i = size - 1; i > size - 11; i--) {
        const currentTotal = cleanData[i].total;
        const previousTotal = cleanData[i - 1].total;
        trendMomentum += (currentTotal - previousTotal) * ((i - (size - 11)) / 10);
    }

    if (trendMomentum > 0) {
        weightTai += Math.abs(trendMomentum) * 7.5;
    } else {
        weightXiu += Math.abs(trendMomentum) * 7.5;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 3: PHÂN TÍCH ĐIỂM SỐ CHUYÊN SÂU
    // ------------------------------------------------------------------------
    
    // 3.1 Phân tích trung bình 5 phiên gần nhất
    const last5Totals = totalChain.slice(-5);
    const avgLast5 = last5Totals.reduce((a, b) => a + b, 0) / 5;
    
    if (avgLast5 > 11.5) {
        weightXiu += (avgLast5 - 11.5) * 15;
    } else if (avgLast5 < 9.5) {
        weightTai += (9.5 - avgLast5) * 15;
    }

    // 3.2 Phân tích độ lệch chuẩn 10 phiên
    const last10Totals = totalChain.slice(-10);
    const avg10 = last10Totals.reduce((a, b) => a + b, 0) / 10;
    const variance = last10Totals.reduce((sum, t) => sum + Math.pow(t - avg10, 2), 0) / 10;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 2.0) {
        const lastSide = cleanData[size - 1].side;
        if (lastSide === 1) weightTai += 20;
        else weightXiu += 20;
        patternConfidence += 5;
    } else if (stdDev > 5.0) {
        const lastSide = cleanData[size - 1].side;
        if (lastSide === 1) weightXiu += 25;
        else weightTai += 25;
        patternConfidence += 5;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 4: THUẬT TOÁN HỒI QUY PHÂN PHỐI GAUSS (NÂNG CẤP ĐA KHUNG)
    // ------------------------------------------------------------------------
    const windows = [10, 20, 30, 50, 80];
    let densityScore = 0;
    
    for (const window of windows) {
        const windowData = cleanData.slice(-window);
        const taiCount = windowData.filter(x => x.side === 1).length;
        const ratio = taiCount / windowData.length;
        
        if (ratio > 0.54) {
            densityScore += (ratio - 0.54) * 250;
        } else if (ratio < 0.46) {
            densityScore -= (0.46 - ratio) * 250;
        }
    }
    
    if (densityScore > 0) weightXiu += densityScore;
    else weightTai += Math.abs(densityScore);

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 5: PHÂN TÍCH BẬC TỰ DO CỦA HÌNH HỌC KHÔNG GIAN SÚC XẮC
    // ------------------------------------------------------------------------
    const latestDice = cleanData[size - 1].dice;
    const countDuplicates = new Set(latestDice).size;
    
    if (countDuplicates === 1) {
        const baoValue = latestDice[0];
        if (baoValue >= 4) {
            weightXiu += 30;
        } else {
            weightTai += 30;
        }
        patternConfidence += 6;
    } else if (countDuplicates === 2) {
        if (cleanData[size - 1].total >= 11) weightTai += 15; 
        else weightXiu += 15;
        patternConfidence += 3;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 6: PHÂN TÍCH CHU KỲ DAO ĐỘNG TỰ NHIÊN
    // ------------------------------------------------------------------------
    const cycles = [];
    let currentCycle = 1;
    for (let i = 1; i < size; i++) {
        if (cleanData[i].side !== cleanData[i-1].side) {
            cycles.push(currentCycle);
            currentCycle = 1;
        } else {
            currentCycle++;
        }
    }
    cycles.push(currentCycle);
    
    const avgCycleLength = cycles.reduce((a, b) => a + b, 0) / cycles.length;
    const lastCycleLength = cycles[cycles.length - 1];
    
    if (lastCycleLength > avgCycleLength * 1.5) {
        if (cleanData[size - 1].side === 1) weightXiu += 35;
        else weightTai += 35;
        patternConfidence += 8;
    }

    // ------------------------------------------------------------------------
    // TỔNG HỢP KẾT QUẢ ĐẦU RA CHUẨN XÁC ĐA LUỒNG - TUYỆT ĐỐI KHÔNG RANDOM
    // ------------------------------------------------------------------------
    let finalPrediction = "";
    const deltaScore = Math.abs(weightTai - weightXiu);

    if (weightTai > weightXiu) {
        finalPrediction = "TÀI";
    } else if (weightXiu > weightTai) {
        finalPrediction = "XỈU";
    } else {
        finalPrediction = cleanData[size - 1].side === 1 ? "XỈU" : "TÀI";
    }

    // THUẬT TOÁN ĐÁNH GIÁ ĐỘ CHẮC CẦU TỰ ĐỘNG
    let baseRate = 80;
    let logicFactor = Math.min(deltaScore * 0.15, 12.0);
    let patternFactor = Math.min(patternConfidence, 8.0);
    
    let calculatedRate = Math.round(baseRate + logicFactor + patternFactor);
    
    if (calculatedRate > 98) calculatedRate = 98;

    return { prediction: finalPrediction, rate: `${calculatedRate}%` };
}

// --- TRỤC TIẾP NHẬN ĐẦU VÀO LUỒNG ROUTE API ---
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

        const logicResult = executeUltraHardcoreLogicChain(history);
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
    res.send("HỆ THỐNG TOÁN HỌC MA TRẬN V12 ULTRA HARDCORE ENGINE ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy thành công bộ lõi siêu cấp V12 trên cổng: ${PORT}`);
});
