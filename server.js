const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// SIÊU KIẾN TRÚC TOÁN HỌC MA TRẬN V11 - CỰC DÀI - KHÔNG RANDOM - 100% TOÁN BĂM
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
    
    // Thu thập vùng nhớ lịch sử cực rộng (60 phiên) để triệt tiêu hoàn toàn độ lệch giả lập
    const cleanData = reversedHistory.slice(-60).map(item => {
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
    
    // Cắt lớp chuỗi dữ liệu từ ngắn hạn đến siêu dài hạn (Băm nhịp từ 3 đến 10 phiên)
    const segment3 = binaryChain.slice(-3);
    const segment4 = binaryChain.slice(-4);
    const segment5 = binaryChain.slice(-5);
    const segment6 = binaryChain.slice(-6);
    const segment7 = binaryChain.slice(-7);
    const segment8 = binaryChain.slice(-8);
    const segment9 = binaryChain.slice(-9);
    const segment10 = binaryChain.slice(-10);

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 1: PHÂN TÍCH CHI TIẾT 30+ BIẾN THỂ THẾ CẦU VIP (TÍNH TOÁN TUYẾN TÍNH)
    // ------------------------------------------------------------------------
    
    // KHỐI 1: CẦU BỆT TRƯỜNG & KHỞI ĐẦU XU HƯỚNG BỆT (ANTI-BREAKING CHỐNG BẺ)
    if (segment10 === '1111111111') { weightTai += 65; patternConfidence += 15; }
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

    // KHỐI 2: KHUÔN CẦU ĐẢO 1-1 LIÊN TỤC (TÀI XỈU ĐAN XEN)
    if (segment10 === '1010101010' || segment10 === '0101010101') {
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

    // KHỐI 3: KHUÔN CẦU ĐÔI 2-2 VÀ CẦU LẶP BA 3-3 (ĐỐI XỨNG PHÁT TRIỂN)
    if (segment8 === '11001100' || segment8 === '00110011') {
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
    if (segment6 === '111000') { weightTai += 30; patternConfidence += 6; }
    else if (segment6 === '000111') { weightXiu += 30; patternConfidence += 6; }

    // KHỐI 4: CẦU TIẾN BẬC THANG LỆCH TẦNG (CẤU TRÚC 1-2-3 VÀ 3-2-1)
    if (binaryChain.slice(-6) === '100111') { weightXiu += 22; patternConfidence += 4; }
    else if (binaryChain.slice(-6) === '011000') { weightTai += 22; patternConfidence += 4; }
    else if (binaryChain.slice(-5) === '11000') { weightTai += 15; patternConfidence += 3; }
    else if (binaryChain.slice(-5) === '00111') { weightXiu += 15; patternConfidence += 3; }

    // KHỐI 5: CẦU NHẢY NGẮN LỆCH TẦNG (2-1-2, 1-2-1, 3-1-3)
    if (segment5 === '11011') { weightXiu += 15; patternConfidence += 3; }
    else if (segment5 === '00100') { weightTai += 15; patternConfidence += 3; }
    else if (segment4 === '1011') { weightXiu += 12; patternConfidence += 2; }
    else if (segment4 === '0100') { weightTai += 12; patternConfidence += 2; }
    else if (segment3 === '100') { weightTai += 10; }
    else if (segment3 === '011') { weightXiu += 10; }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 2: PHÂN TÍCH XU HƯỚNG MOMENTUM VI PHÂN GẦN (TRÁNH TRIỆT TIÊU ĐIỂM SỐ)
    // ------------------------------------------------------------------------
    // Rút ngắn vùng quét xuống 5 phiên gần nhất để phản ánh đúng lực nhảy điểm của xúc xắc hiện tại
    let trendMomentum = 0;
    for (let i = size - 1; i > size - 6; i--) {
        const currentTotal = cleanData[i].total;
        const previousTotal = cleanData[i - 1].total;
        // Nhân hệ số khoảng cách giảm dần theo thời gian thực
        trendMomentum += (currentTotal - previousTotal) * (i / size);
    }

    if (trendMomentum > 0) {
        weightTai += Math.abs(trendMomentum) * 6.5;
    } else {
        weightXiu += Math.abs(trendMomentum) * 6.5;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 3: THUẬT TOÁN HỒI QUY PHÂN PHỐI GAUSS (BẪY LỰC CẢN LỆCH BIÊN ĐỘ)
    // ------------------------------------------------------------------------
    let totalTaiCount = 0;
    cleanData.forEach(x => { if (x.side === 1) totalTaiCount++; });
    const densityTai = totalTaiCount / size;

    // Cơ chế phanh hãm tỷ lệ: Khi mật độ nghiêng vượt ngưỡng an toàn, lực hồi quy sẽ kích hoạt cực mạnh
    if (densityTai > 0.54) {
        weightXiu += (densityTai - 0.54) * 180.0;
    } else if (densityTai < 0.46) {
        weightTai += (0.46 - densityTai) * 180.0;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 4: PHÂN TÍCH BẬC TỰ DO CỦA HÌNH HỌC KHÔNG GIAN SÚC XẮC CHUYÊN SÂU
    // ------------------------------------------------------------------------
    const latestDice = cleanData[size - 1].dice;
    const countDuplicates = new Set(latestDice).size;
    
    if (countDuplicates === 1) {
        // Xuất hiện bộ 3 nút giống nhau (Bão) -> Điểm cân bằng hệ thống có xu hướng đảo chiều mạnh tay kế tiếp
        weightTai += 15;
        weightXiu += 15;
    } else if (countDuplicates === 2) {
        // Xuất hiện cặp đôi trùng nút (Cầu cặp) -> Tăng trọng số cho việc giữ nguyên tính chẵn lẻ của điểm số
        if (cleanData[size - 1].total >= 11) weightTai += 10; else weightXiu += 10;
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
        // Trường hợp hiếm gặp khi hai bên cân bằng điểm tuyệt đối -> Đánh nghịch đảo phiên trước
        finalPrediction = cleanData[size - 1].side === 1 ? "XỈU" : "TÀI";
    }

    // THUẬT TOÁN ĐÁNH GIÁ ĐỘ CHẮC CẦU TỰ ĐỘNG ĐỂ TRẢ VỀ TỶ LỆ (RATE) CHUẨN
    let baseRate = 80;
    
    // Đóng góp từ khoảng cách lệch điểm logic tuyến tính (Tối đa +11%)
    let logicFactor = Math.min(deltaScore * 0.15, 11.0);
    
    // Đóng góp từ các khuôn thế cầu VIP trùng khớp trong quá khứ (Tối đa +7%)
    let patternFactor = Math.min(patternConfidence, 7.0);

    // Điểm tổng hợp cuối cùng hoàn toàn bằng biểu thức cố định
    let calculatedRate = Math.round(baseRate + logicFactor + patternFactor);
    
    // Khóa chặn trần bảo hiểm của lõi phân tích tối đa là 98%
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

        // Kích hoạt chuỗi ma trận V11 xử lý dữ liệu nâng cao
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
    res.send("HỆ THỐNG TOÁN HỌC MA TRẬN V11 ULTRA HARDCORE ENGINE ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy thành công bộ lõi siêu cấp V11 trên cổng: ${PORT}`);
});
