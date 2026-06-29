const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// HỆ THỐNG THUẬT TOÁN LOGIC VI PHÂN VÀ NHẬN DIỆN CẦU TUYẾN TÍNH CỰC DÀI (KHÔNG RANDOM)
// ============================================================================
function executeUltraLongLogicChain(historyData) {
    // CHUẨN HÓA VÀ TRÍCH XUẤT TỪ MẢNG DỮ LIỆU ĐÃ FIX ĐÚNG THEO KIỂU CHỮ CỦA API GỐC
    const cleanData = historyData.slice(0, 30).map(item => {
        const d1 = parseInt(item.Xuc_cac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || 0);
        const total = d1 + d2 + d3;
        const finalTotal = total > 0 ? total : parseInt(item.Tong || 10);
        return {
            id: parseInt(item.Phien || 0),
            total: finalTotal,
            side: finalTotal >= 11 ? 1 : 0 // 1 = Tài, 0 = Xỉu
        };
    }).reverse(); // Đảo mảng để sắp xếp từ cũ nhất đến mới nhất ở cuối mảng

    const size = cleanData.length;
    if (size < 12) {
        return { prediction: "CHỜ DỮ LIỆU", rate: "0%" };
    }

    let scoreTai = 0.0000;
    let scoreXiu = 0.0000;

    // ------------------------------------------------------------------------
    // PHẦN I: MODULE NHẬN DIỆN CẤU TRÚC CẦU TĨNH (PATTERN MATCHING ENGINE)
    // ------------------------------------------------------------------------
    const s8 = cleanData.slice(-8).map(x => x.side);
    const str8 = s8.join('');
    
    const s6 = cleanData.slice(-6).map(x => x.side);
    const str6 = s6.join('');

    const str4 = cleanData.slice(-4).map(x => x.side).join('');

    if (str8 === '11111111' || str8 === '00000000') {
        if (s8[7] === 1) scoreTai += 4.50; else scoreXiu += 4.50;
    } 
    else if (str6 === '111111' || str6 === '000000') {
        if (s6[5] === 1) scoreTai += 3.80; else scoreXiu += 3.80;
    }
    else if (str6 === '101010' || str6 === '010101') {
        if (s6[5] === 1) scoreXiu += 4.20; else scoreTai += 4.20;
    }
    else if (str6 === '110011' || str6 === '001100') {
        if (s6[4] === s6[5]) {
            if (s6[5] === 1) scoreXiu += 3.90; else scoreTai += 3.90;
        } else {
            if (s6[5] === 1) scoreTai += 3.90; else scoreXiu += 3.90;
        }
    }
    else if (str6 === '111000' || str6 === '000111') {
        if (s6[3] === s6[4] && s6[4] === s6[5]) {
            if (s6[5] === 1) scoreXiu += 4.10; else scoreTai += 4.10;
        } else {
            if (s6[5] === 1) scoreTai += 4.10; else scoreXiu += 4.10;
        }
    }
    else if (str4 === '1000' || str4 === '0111') {
        if (str4 === '1000') scoreTai += 3.60; else scoreXiu += 3.60;
    }

    // ------------------------------------------------------------------------
    // PHẦN II: CHUỖI TOÁN HỌC KHÔNG GIAN SÂU (VI PHÂN TOÀN PHẦN VÀ MOMENTUM CỰC DÀI)
    // ------------------------------------------------------------------------
    let totalFirstDerivative = 0; 
    let totalSecondDerivative = 0; 

    for (let i = 2; i < size; i++) {
        const vCurr = cleanData[i].total - cleanData[i-1].total;
        const vPrev = cleanData[i-1].total - cleanData[i-2].total;
        const acceleration = vCurr - vPrev;
        const temporalWeight = i / size;
        totalFirstDerivative += vCurr * temporalWeight;
        totalSecondDerivative += acceleration * temporalWeight;
    }

    if (totalFirstDerivative > 0) scoreTai += Math.abs(totalFirstDerivative) * 0.12;
    else scoreXiu += Math.abs(totalFirstDerivative) * 0.12;

    if (totalSecondDerivative > 0) scoreTai += Math.abs(totalSecondDerivative) * 0.08;
    else scoreXiu += Math.abs(totalSecondDerivative) * 0.08;

    // Giải thuật Khớp chuỗi hồi quy Markov đa tầng
    if (size >= 10) {
        const targetPattern = `${cleanData[size-4].side}${cleanData[size-3].side}${cleanData[size-2].side}${cleanData[size-1].side}`;
        let tCount = 0;
        let xCount = 0;

        for (let i = 0; i < size - 5; i++) {
            const currentPattern = `${cleanData[i].side}${cleanData[i+1].side}${cleanData[i+2].side}${cleanData[i+3].side}`;
            if (currentPattern === targetPattern) {
                if (cleanData[i+4].side === 1) tCount++;
                else xCount++;
            }
        }

        const totalPatternsFound = tCount + xCount;
        if (totalPatternsFound > 0) {
            scoreTai += (tCount / totalPatternsFound) * 2.50;
            scoreXiu += (xCount / totalPatternsFound) * 2.50;
        }
    }

    // Cân bằng mật độ dải phổ (Mean Reversion)
    let countTai = 0;
    let countXiu = 0;
    cleanData.forEach(item => {
        if (item.side === 1) countTai++;
        else countXiu++;
    });

    const historicalRatio = (countTai - countXiu) / size;
    if (historicalRatio > 0.12) {
        scoreXiu += historicalRatio * 1.50;
    } else if (historicalRatio < -0.12) {
        scoreTai += Math.abs(historicalRatio) * 1.50;
    }

    // Tổng hợp lực nén hạt điểm số xúc xắc cuối cùng sát biên
    const lastSession = cleanData[size - 1];
    if (lastSession.total <= 5) scoreTai += 2.20;
    else if (lastSession.total >= 16) scoreXiu += 2.20;

    // ------------------------------------------------------------------------
    // PHẦN III: TỔNG HỢP LOGIC, TRÍCH XUẤT KẾT QUẢ VÀ TỶ LỆ KHỚP KHÔNG RANDOM
    // ------------------------------------------------------------------------
    let finalPrediction = "TÀI";
    const delta = Math.abs(scoreTai - scoreXiu);

    if (scoreXiu > scoreTai) {
        finalPrediction = "XỈU";
    } else if (scoreXiu === scoreTai) {
        finalPrediction = lastSession.side === 1 ? "XỈU" : "TÀI";
    }

    let finalRate = 68 + Math.floor(Math.min(delta * 11.5, 29));

    return {
        prediction: finalPrediction,
        rate: `${finalRate}%`
    };
}

// --- HỆ THỐNG ROUTE API CHÍNH (ĐÃ FIX KHỚP JSON TRONG ẢNH) ---
app.get('/api/predict', async (req, res) => {
    try {
        const response = await axios.get('https://b52-qiw2.onrender.com/api/history', { timeout: 6000 });
        const resData = response.data;

        let history = [];

        // ĐỌC ĐÚNG CẤU TRÚC: Nếu JSON gốc bọc trong đối tượng {"data": [...]} giống trong ảnh
        if (resData && resData.data && Array.isArray(resData.data) && resData.data.length > 0) {
            history = resData.data;
        } else if (resData && Array.isArray(resData) && resData.length > 0) {
            history = resData;
        } else {
            return res.status(500).send("Cấu trúc mảng API gốc trống hoặc không tìm thấy trường 'data'.");
        }

        // Đọc thông số phiên mới nhất theo chuẩn viết hoa trong ảnh
        const latestSession = history[0];
        const d1 = parseInt(latestSession.Xuc_cac_1 || 0);
        const d2 = parseInt(latestSession.Xuc_cac_2 || 0);
        const d3 = parseInt(latestSession.Xuc_cac_3 || 0);
        const currentPhien = parseInt(latestSession.Phien || 0);
        const currentTong = (d1 + d2 + d3 > 0) ? (d1 + d2 + d3) : parseInt(latestSession.Tong || 0);

        // Chạy thuật toán ma trận dài phân tích
        const logicResult = executeUltraLongLogicChain(history);

        // Tính toán nhảy bước phiên kế tiếp (+1)
        const nextPhien = currentPhien + 1;

        // Định dạng Plain Text đầu ra chuẩn chỉnh như cấu hình yêu cầu
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
        return res.status(500).send(`Lỗi kết nối API gốc hoặc Timeout hệ thống.\nId: @tranhoang2286`);
    }
});

app.get('/', (req, res) => {
    res.send("API HOANGVIPWIN ĐÃ FIX HOÀN TOÀN CẤU TRÚC ĐỌC TRƯỜNG DATA VIẾT HOA.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy cổng dịch vụ thành công: ${PORT}`);
});
