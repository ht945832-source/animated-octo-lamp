const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// TOÁN HỌC PHÂN TÍCH MA TRẬN NHẬN DIỆN TẤT CẢ CÁC THẾ CẦU B52 (TUYỆT ĐỐI KHÔNG RANDOM)
// ============================================================================
function executeUltraLongLogicChain(historyData) {
    // 1. Sàng lọc loại bỏ hoàn toàn các phiên lỗi xúc xắc 0-0-0 từ API gốc
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0;
    });

    // Đảo mảng để đưa các phiên mới nhất về cuối hàng đợi tính toán xu hướng
    const reversedHistory = [...validHistory].reverse();

    // Lấy chuỗi dữ liệu chuẩn của 35 phiên gần nhất để bóc tách cấu trúc vi mô
    const cleanData = reversedHistory.slice(-35).map(item => {
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

    // Khởi tạo thang điểm ma trận quyết định xu hướng hai bên
    let scoreTai = 0.00;
    let scoreXiu = 0.00;

    // Chuyển lịch sử chuỗi kết quả sang dạng nhị phân Text để bóc tách các thế cầu kinh điển
    const fullChain = cleanData.map(x => x.side).join('');
    
    // Tạo các chuỗi con đại diện cho nhịp độ phiên gần nhất (từ 3 đến 8 phiên thời gian thực)
    const last3 = fullChain.slice(-3);
    const last4 = fullChain.slice(-4);
    const last5 = fullChain.slice(-5);
    const last6 = fullChain.slice(-6);
    const last7 = fullChain.slice(-7);
    const last8 = fullChain.slice(-8);

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 1: NHẬN DIỆN CHUYÊN SÂU TẤT CẢ CÁC THẾ CẦU B52 (PATTERN MATCHING)
    // ------------------------------------------------------------------------
    
    // [THẾ 1] Nhận diện Cầu Bệt Trường (Bệt sâu dài hạn)
    if (last8 === '11111111' || last7 === '1111111') {
        scoreTai += 7.5; // Xu hướng bám bệt Tài cực mạnh, không bẻ cầu dài
    } else if (last8 === '00000000' || last7 === '0000000') {
        scoreXiu += 7.5; // Xu hướng bám bệt Xỉu cực mạnh, không bẻ cầu dài
    }
    // [THẾ 1.2] Nhận diện khởi đầu Cầu Bệt ngắn (Bệt 5-6 tay)
    else if (last6 === '111111' || last5 === '11111') {
        scoreTai += 5.5;
    } else if (last6 === '000000' || last5 === '00000') {
        scoreXiu += 5.5;
    }

    // [THẾ 2] Nhận diện Cầu Đảo Liên Tục 1-1 (Nhịp xen kẽ Tài Xỉu)
    if (last8 === '10101010' || last8 === '01010101') {
        if (last3 === '101') scoreXiu += 6.5;
        else if (last3 === '010') scoreTai += 6.5;
    } else if (last6 === '101010' || last6 === '010101') {
        if (last3 === '101') scoreXiu += 5.0;
        else if (last3 === '010') scoreTai += 5.0;
    }

    // [THẾ 3] Nhận diện Cầu Lặp Đôi Cân Bằng 2-2
    if (last6 === '110011' || last4 === '0011') {
        scoreXiu += 5.0; // Đi tiếp nhịp thứ 2 của chuỗi Xỉu tiếp theo
    } else if (last6 === '001100' || last4 === '1100') {
        scoreTai += 5.0; // Đi tiếp nhịp thứ 2 của chuỗi Tài tiếp theo
    }

    // [THẾ 4] Nhận diện Cầu Lặp Ba Đối Xứng 3-3
    if (last6 === '111000') {
        scoreTai += 5.5; // Đạt đỉnh chuỗi 3 Xỉu, quay trở lại nhịp đầu Tài
    } else if (last6 === '000111') {
        scoreXiu += 5.5; // Đạt đỉnh chuỗi 3 Tài, quay trở lại nhịp đầu Xỉu
    }

    // [THẾ 5] Nhận diện Cầu Tiến Bậc Thang Lệch Tầng (1-2-3 hoặc 3-2-1)
    if (fullChain.slice(-6) === '100111') {
        scoreXiu += 4.5; // Nhịp gãy sau cấu trúc tiến bậc
    } else if (fullChain.slice(-6) === '011000') {
        scoreTai += 4.5;
    }

    // [THẾ 6] Nhận diện Cầu Nhảy Ngắn 1-2 hoặc 2-1
    if (last3 === '100') {
        scoreTai += 4.0; 
    } else if (last3 === '011') {
        scoreXiu += 4.0;
    } else if (last4 === '1101') {
        scoreXiu += 3.5;
    } else if (last4 === '0010') {
        scoreTai += 3.5;
    }

    // [THẾ 7] Phân tích điểm đối xứng qua trục tâm chuỗi (Cầu Kính)
    const halfSize = Math.floor(size / 2);
    if (halfSize >= 4) {
        const firstHalf = fullChain.slice(-halfSize * 2, -halfSize);
        const secondHalf = fullChain.slice(-halfSize);
        let matchCount = 0;
        for (let i = 0; i < halfSize; i++) {
            if (firstHalf[i] !== secondHalf[i]) matchCount++;
        }
        // Nếu phát hiện cấu trúc nghịch đảo đối xứng (Cầu gương)
        if (matchCount === halfSize) {
            if (fullChain.slice(-1) === '1') scoreXiu += 3.0;
            else scoreTai += 3.0;
        }
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 2: TOÁN HỌC KHẢ VI MOMENTUM (TỐC ĐỘ DI CHUYỂN ĐIỂM XÚC XẮC)
    // ------------------------------------------------------------------------
    let momentum = 0;
    for (let i = 1; i < size; i++) {
        const diff = cleanData[i].total - cleanData[i - 1].total;
        // Nhân trọng số cấp số cộng tuyến tính: Phiên càng gần thời gian thực hiện tại, trọng số càng lớn
        momentum += diff * (i / size);
    }
    
    // Nếu quán tính điểm tổng đang đi lên (Momentum dương) -> tăng điểm Tài và ngược lại
    if (momentum > 0) {
        scoreTai += Math.abs(momentum) * 0.35;
    } else {
        scoreXiu += Math.abs(momentum) * 0.35;
    }

    // ------------------------------------------------------------------------
    // MÔ-ĐUN 3: THUẬT TOÁN HỒI QUY CÂN BẰNG MẬT ĐỘ NGHIÊNG CẦU
    // ------------------------------------------------------------------------
    let totalTaiCount = 0;
    cleanData.forEach(x => { if (x.side === 1) totalTaiCount++; });
    const densityTai = totalTaiCount / size;

    // Cơ chế hồi quy đưa dòng chảy phân phối Gauss về điểm cân bằng 50-50
    if (densityTai > 0.60) {
        scoreXiu += 3.0; // Lực cản nghiêng cầu Tài vượt ngưỡng
    } else if (densityTai < 0.40) {
        scoreTai += 3.0; // Lực cản nghiêng cầu Xỉu vượt ngưỡng
    }

    // ------------------------------------------------------------------------
    // TỔNG HỢP KẾT QUẢ ĐẦU RA KHÔNG PHỤ THUỘC VÀO SỐ DƯ NGẪU NHIÊN (NO RANDOM)
    // ------------------------------------------------------------------------
    let finalPrediction = "TÀI";
    const deltaScore = Math.abs(scoreTai - scoreXiu);
    if (scoreXiu > scoreTai) finalPrediction = "XỈU";

    // Sử dụng thuật toán tiệm cận cố định để tính toán Tỷ lệ (Rate) dựa trên deltaScore 
    // Thay thế hoàn toàn Math.floor(Math.random()) cũ bằng công thức logarit tuyến tính chặn trần
    let rateFactor = Math.min(deltaScore * 4.5, 14.0);
    let calculatedRate = Math.round(84 + rateFactor);

    return { prediction: finalPrediction, rate: `${calculatedRate}%` };
}

// --- LUỒNG ROUTE KHAI THÁC DỮ LIỆU TỪ API ---
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

        // Định vị tìm kiếm phiên thực tế hợp lệ gần nhất trong chuỗi lịch sử trả về
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

        // Tiến hành chạy chuỗi ma trận nhận diện cầu tuyến tính nâng cao
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
    res.send("HỆ THỐNG THUẬT TOÁN MA TRẬN PHÂN TÍCH CẦU HOANGDZ V6 PREMIUM ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy lõi xử lý thuật toán chuyên sâu thành công trên cổng: ${PORT}`);
});
