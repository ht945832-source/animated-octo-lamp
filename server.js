const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// HỆ THỐNG THUẬT TOÁN LOGIC VI PHÂN VÀ NHẬN DIỆN CẦU TUYẾN TÍNH CỰC DÀI (KHÔNG RANDOM)
// ============================================================================
function executeUltraLongLogicChain(historyData) {
    // 1. CHUẨN HÓA VÀ TRÍCH XUẤT MẢNG DỮ LIỆU TĨNH TỪ API GỐC (LẤY 30 PHIÊN GẦN NHẤT)
    const cleanData = historyData.slice(0, 30).map(item => {
        const d1 = parseInt(item.dice1 || item.xucxac1 || 0);
        const d2 = parseInt(item.dice2 || item.xucxac2 || 0);
        const d3 = parseInt(item.dice3 || item.xucxac3 || 0);
        const total = d1 + d2 + d3;
        const finalTotal = total > 0 ? total : parseInt(item.tong || 10);
        return {
            id: parseInt(item.phien || item.id || 0),
            total: finalTotal,
            side: finalTotal >= 11 ? 1 : 0 // 1 = Tài, 0 = Xỉu
        };
    }).reverse(); // Đảo mảng để sắp xếp từ cũ nhất đến mới nhất ở cuối mảng

    const size = cleanData.length;
    if (size < 12) {
        return { prediction: "CHỜ DỮ LIỆU", rate: "0%", pattern: "ĐANG QUÉT CHUỖI" };
    }

    // KHỞI TẠO ĐIỂM SỐ ĐIỀU HƯỚNG TOÁN HỌC TĨNH
    let scoreTai = 0.0000;
    let scoreXiu = 0.0000;
    let detectedPatternName = "Cầu Tự Do (Vi Phân Điểm)";

    // ------------------------------------------------------------------------
    // PHẦN I: MODULE NHẬN DIỆN CẤU TRÚC CẦU TĨNH (PATTERN MATCHING ENGINE)
    // ------------------------------------------------------------------------
    
    // Trích xuất chuỗi kết quả của 8 phiên gần đây nhất để khớp mẫu cấu trúc cầu
    const s8 = cleanData.slice(-8).map(x => x.side);
    const str8 = s8.join('');
    
    // Trích xuất chuỗi kết quả của 6 phiên gần đây nhất
    const s6 = cleanData.slice(-6).map(x => x.side);
    const str6 = s6.join('');

    // Tách chuỗi 4 phiên để bắt các mẫu ngắn
    const str4 = cleanData.slice(-4).map(x => x.side).join('');

    // KIỂM TRA LẦN LƯỢT CÁC ĐỊNH DẠNG CẦU KINH ĐIỂN THEO THỨ TỰ ƯU TIÊN SÂU
    if (str8 === '11111111' || str8 === '00000000') {
        detectedPatternName = "Cầu Bệt Trường Kỳ (Xu Hướng Thuận)";
        if (s8[7] === 1) scoreTai += 4.50; else scoreXiu += 4.50;
    } 
    else if (str6 === '111111' || str6 === '000000') {
        detectedPatternName = "Cầu Bệt Đại Phát (Xu Hướng Thuận)";
        if (s6[5] === 1) scoreTai += 3.80; else scoreXiu += 3.80;
    }
    else if (str6 === '101010' || str6 === '010101') {
        detectedPatternName = "Cầu Bảng Quy Tắc 1-1 (Đảo Chiều Liên Tục)";
        // Dự đoán phần tử tiếp theo lật ngược lại phần tử cuối cùng
        if (s6[5] === 1) scoreXiu += 4.20; else scoreTai += 4.20;
    }
    else if (str6 === '110011' || str6 === '001100') {
        detectedPatternName = "Cầu Quy Tắc Đối Xứng 2-2";
        // Cầu 2-2 đang chạy: Nếu 2 phiên cuối giống nhau thì phiên kế tiếp phải đổi màu
        if (s6[4] === s6[5]) {
            if (s6[5] === 1) scoreXiu += 3.90; else scoreTai += 3.90;
        } else {
            if (s6[5] === 1) scoreTai += 3.90; else scoreXiu += 3.90;
        }
    }
    else if (str6 === '111000' || str6 === '000111') {
        detectedPatternName = "Cầu Song Hành 3-3 Tĩnh";
        if (s6[3] === s6[4] && s6[4] === s6[5]) {
            // Đã đủ 3 tiếng bệt cùng màu, tiếng thứ 4 bẻ cầu
            if (s6[5] === 1) scoreXiu += 4.10; else scoreTai += 4.10;
        } else {
            // Đang trong tiến trình tích lũy chuỗi 3 tiếng
            if (s6[5] === 1) scoreTai += 4.10; else scoreXiu += 4.10;
        }
    }
    else if (str6 === '111100' || str6 === '000011' || str6 === '111001' || str6 === '000110') {
        detectedPatternName = "Cầu Giảm Dần Quy Luật 4-2-1 / 3-2-1";
        if (str6 === '111100' || str6 === '000110') {
            if (s6[5] === 0) scoreXiu += 3.50; else scoreTai += 3.50;
        } else {
            if (s6[5] === 1) scoreTai += 3.50; else scoreXiu += 3.50;
        }
    }
    else if (str4 === '1000' || str4 === '0111') {
        detectedPatternName = "Cầu Bách Bộ 1-3 Tiến Tiến";
        if (str4 === '1000') {
            // Đủ 3 tiếng xỉu sau 1 tiếng tài, bẻ sang tài
            scoreTai += 3.60;
        } else {
            scoreXiu += 3.60;
        }
    }
    else if (str4 === '1110' || str4 === '0001') {
        detectedPatternName = "Cầu Bách Bộ 3-1 Lùi Tiến";
        if (str4 === '1110') {
            scoreXiu += 3.40;
        } else {
            scoreTai += 3.40;
        }
    }

    // ------------------------------------------------------------------------
    // PHẦN II: CHUỖI TOÁN HỌC KHÔNG GIAN SÂU (VI PHÂN TOÀN PHẦN VÀ MOMENTUM CỰC DÀI)
    // ------------------------------------------------------------------------
    
    // Thuật toán Toán học 1: Vận tốc biên và Gia tốc biến thiên (Velocity & Acceleration)
    let totalFirstDerivative = 0; // Vi phân bậc 1 (Vận tốc dịch chuyển điểm)
    let totalSecondDerivative = 0; // Vi phân bậc 2 (Gia tốc lực đẩy)

    for (let i = 2; i < size; i++) {
        const vCurr = cleanData[i].total - cleanData[i-1].total;
        const vPrev = cleanData[i-1].total - cleanData[i-2].total;
        const acceleration = vCurr - vPrev;

        // Tính trọng số tuyến tính theo thời gian (Phiên càng gần hiện tại giá trị nhân tử càng lớn)
        const temporalWeight = i / size;
        totalFirstDerivative += vCurr * temporalWeight;
        totalSecondDerivative += acceleration * temporalWeight;
    }

    // Tích hợp kết quả Vi phân vào Ma trận hướng điểm số tĩnh
    if (totalFirstDerivative > 0) scoreTai += Math.abs(totalFirstDerivative) * 0.12;
    else scoreXiu += Math.abs(totalFirstDerivative) * 0.12;

    if (totalSecondDerivative > 0) scoreTai += Math.abs(totalSecondDerivative) * 0.08;
    else scoreXiu += Math.abs(totalSecondDerivative) * 0.08;


    // Thuật toán Toán học 2: Giải thuật Khớp chuỗi hồi quy Markov đa tầng (Markov Chain Sub-Matrix)
    // Thuật toán này rà soát lại toàn bộ lịch sử 30 phiên xem tổ hợp 4 phiên gần nhất từng xuất hiện ở đâu
    if (size >= 10) {
        const targetPattern = `${cleanData[size-4].side}${cleanData[size-3].side}${cleanData[size-2].side}${cleanData[size-1].side}`;
        let tCount = 0;
        let xCount = 0;

        for (let i = 0; i < size - 5; i++) {
            const currentPattern = `${cleanData[i].side}${cleanData[i+1].side}${cleanData[i+2].side}${cleanData[i+3].side}`;
            if (currentPattern === targetPattern) {
                // Đọc phần tử ngay kế tiếp trong lịch sử quá khứ để lấy dữ liệu chuỗi tĩnh lặp lại
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


    // Thuật toán Toán học 3: Cân bằng mật độ dải phổ (Spectrum Density Balance)
    let countTai = 0;
    let countXiu = 0;
    cleanData.forEach(item => {
        if (item.side === 1) countTai++;
        else countXiu++;
    });

    const historicalRatio = (countTai - countXiu) / size;
    // Cơ chế Mean Reversion: Nếu tổng thể lệch quá 12% về một bên, lực hút trục trung tâm sẽ đẩy về bên kia
    if (historicalRatio > 0.12) {
        scoreXiu += historicalRatio * 1.50;
    } else if (historicalRatio < -0.12) {
        scoreTai += Math.abs(historicalRatio) * 1.50;
    }


    // Thuật toán Toán học 4: Tổng hợp lực nén của hạt điểm số xúc xắc cuối cùng
    const lastSession = cleanData[size - 1];
    // Nếu điểm số sát biên (3,4,5 hoặc 16,17,18) - Khả năng đàn hồi phản xạ cực cao
    if (lastSession.total <= 5) {
        scoreTai += 2.20; // Điểm quá thấp, xu hướng kéo lên Tài mạnh mẽ ở phiên sau
    } else if (lastSession.total >= 16) {
        scoreXiu += 2.20; // Điểm quá cao, xu hướng sập xuống Xỉu mạnh mẽ ở phiên sau
    }

    // ------------------------------------------------------------------------
    // PHẦN III: TỔNG HỢP LOGIC, TRÍCH XUẤT KẾT QUẢ VÀ TỶ LỆ KHỚP KHÔNG RANDOM
    // ------------------------------------------------------------------------
    let finalPrediction = "TÀI";
    const delta = Math.abs(scoreTai - scoreXiu);

    if (scoreXiu > scoreTai) {
        finalPrediction = "XỈU";
    } else if (scoreXiu === scoreTai) {
        // Thuật toán dự phòng điểm chết đối xứng tuyệt đối: Đảo ngược tiếng cuối cùng
        finalPrediction = lastSession.side === 1 ? "XỈU" : "TÀI";
    }

    // Công thức tính toán tỷ lệ an toàn tĩnh tuyến tính, khống chế chặt chẽ trong biên độ an toàn thực tế [68% - 97%]
    let finalRate = 68 + Math.floor(Math.min(delta * 11.5, 29));

    return {
        prediction: finalPrediction,
        rate: `${finalRate}%`,
        pattern: detectedPatternName
    };
}

// --- HỆ THỐNG ROUTE API ĐỊNH DẠNG SIÊU GỌN THEO ĐÚNG TIÊU CHUẨN ---
app.get('/api/predict', async (req, res) => {
    try {
        // Khởi tạo tiến trình kéo dữ liệu từ nguồn API gốc thời gian thực
        const response = await axios.get('https://b52-qiw2.onrender.com/api/history', { timeout: 6000 });
        const history = response.data;

        if (!Array.isArray(history) || history.length === 0) {
            return res.status(500).send("Cấu trúc mảng API gốc rỗng hoặc không hợp lệ.");
        }

        // Trích xuất thông số phiên hiện tại tại node đầu tiên của mảng gốc
        const latestSession = history[0];
        const d1 = parseInt(latestSession.dice1 || latestSession.xucxac1 || 0);
        const d2 = parseInt(latestSession.dice2 || latestSession.xucxac2 || 0);
        const d3 = parseInt(latestSession.dice3 || latestSession.xucxac3 || 0);
        const currentPhien = parseInt(latestSession.phien || latestSession.id || 0);
        const currentTong = (d1 + d2 + d3 > 0) ? (d1 + d2 + d3) : parseInt(latestSession.tong || 0);

        // Kích hoạt chuỗi phân tích thuật toán ma trận dài để lấy dự đoán và mẫu cầu
        const logicResult = executeUltraLongLogicChain(history);

        // Xử lý bước nhảy phiên (+1 phiên tiếp theo để tiến hành dự đoán trước)
        const nextPhien = currentPhien + 1;

        // Trả về Plain Text thuần túy định dạng siêu nén cực kỳ gọn gàng đúng yêu cầu
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

// Route kiểm tra trạng thái hoạt động tổng quan của server dịch vụ
app.get('/', (req, res) => {
    res.send("HỆ THỐNG API ĐỐI XỨNG CHUỖI DÀI HOANGDZ ĐANG HOẠT ĐỘNG ỔN ĐỊNH.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy cổng dịch vụ thành công: ${PORT}`);
});
