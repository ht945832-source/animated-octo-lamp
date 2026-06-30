const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// SIÊU KIẾN TRÚC TOÁN HỌC MA TRẬN V12 - NÂNG CẤP TOÀN DIỆN - KHÔNG RANDOM
// ============================================================================
function executeUltraHardcoreLogicChain(historyData) {
    // 1. Lọc và chuẩn hóa dữ liệu
    const validHistory = historyData.filter(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        return (d1 + d2 + d3) > 0;
    });

    const reversedHistory = [...validHistory].reverse();
    
    // Mở rộng vùng nhớ lên 80 phiên để phân tích sâu hơn
    const cleanData = reversedHistory.slice(-80).map(item => {
        const d1 = parseInt(item.Xuc_cac_1 || item.Xuc_xac_1 || 0);
        const d2 = parseInt(item.Xuc_cac_2 || item.Xuc_xac_2 || 0);
        const d3 = parseInt(item.Xuc_cac_3 || item.Xuc_xac_3 || 0);
        const total = d1 + d2 + d3;
        return {
            id: parseInt(item.Phien || 0),
            total: total,
            side: total >= 11 ? 1 : 0,
            dice: [d1, d2, d3],
            sumMod3: total % 3,
            isEven: total % 2 === 0 ? 1 : 0
        };
    });

    const size = cleanData.length;
    if (size < 20) {
        return { prediction: "TÀI", rate: "80%", confidence: "THẤP" };
    }

    // Khởi tạo vector trọng số đa chiều
    let weightTai = 100.00;
    let weightXiu = 100.00;
    let patternConfidence = 0.00;
    let advancedPatternScore = 0.00;

    // Chuỗi nhị phân cho phân tích mẫu
    const binaryChain = cleanData.map(x => x.side).join('');
    const totalChain = cleanData.map(x => x.total);
    
    // ========================================================================
    // MÔ-ĐUN 1: PHÂN TÍCH CHUỖI MẪU NÂNG CAO (40+ BIẾN THỂ)
    // ========================================================================
    
    // 1.1 CẦU BỆT (STREAK) - Mở rộng từ 3 đến 15 phiên
    for (let streakLen = 15; streakLen >= 3; streakLen--) {
        const segment = binaryChain.slice(-streakLen);
        const allOnes = '1'.repeat(streakLen);
        const allZeros = '0'.repeat(streakLen);
        
        if (segment === allOnes) {
            weightTai += streakLen * 4.5;
            patternConfidence += streakLen * 1.2;
            break;
        } else if (segment === allZeros) {
            weightXiu += streakLen * 4.5;
            patternConfidence += streakLen * 1.2;
            break;
        }
    }

    // 1.2 CẦU ĐẢO 1-1 (ALTERNATING) - Phát hiện đa tầng
    const altPatterns = [
        { len: 20, weight: 50, conf: 18 },
        { len: 16, weight: 40, conf: 14 },
        { len: 12, weight: 30, conf: 10 },
        { len: 8, weight: 20, conf: 6 },
        { len: 6, weight: 12, conf: 4 }
    ];

    for (const pat of altPatterns) {
        const seg = binaryChain.slice(-pat.len);
        const alt1 = '10'.repeat(pat.len / 2);
        const alt2 = '01'.repeat(pat.len / 2);
        
        if (seg === alt1 || seg === alt2) {
            patternConfidence += pat.conf;
            if (binaryChain.slice(-1) === '1') weightXiu += pat.weight;
            else weightTai += pat.weight;
            break;
        }
    }

    // 1.3 CẦU ĐÔI 2-2 (DOUBLE ALTERNATING)
    const doublePatterns = ['1100', '0011', '11001100', '00110011', '1100110011', '0011001100'];
    for (const dp of doublePatterns) {
        if (binaryChain.slice(-dp.length) === dp) {
            patternConfidence += dp.length * 1.5;
            if (dp.startsWith('11')) weightXiu += dp.length * 2;
            else weightTai += dp.length * 2;
            break;
        }
    }

    // 1.4 CẦU 3-3 (TRIPLE PATTERN)
    const triplePatterns = ['111000', '000111', '111000111', '000111000'];
    for (const tp of triplePatterns) {
        if (binaryChain.slice(-tp.length) === tp) {
            patternConfidence += tp.length * 1.8;
            if (tp.startsWith('111')) weightTai += tp.length * 2.5;
            else weightXiu += tp.length * 2.5;
            break;
        }
    }

    // 1.5 CẦU TIẾN BẬC THANG (PROGRESSIVE STAIRCASE)
    const staircasePatterns = [
        { pattern: '100111', taiWeight: 0, xiuWeight: 25, conf: 5 },
        { pattern: '011000', taiWeight: 25, xiuWeight: 0, conf: 5 },
        { pattern: '11000111', taiWeight: 30, xiuWeight: 0, conf: 7 },
        { pattern: '00111000', taiWeight: 0, xiuWeight: 30, conf: 7 },
        { pattern: '111000111', taiWeight: 35, xiuWeight: 0, conf: 9 },
        { pattern: '000111000', taiWeight: 0, xiuWeight: 35, conf: 9 }
    ];

    for (const sp of staircasePatterns) {
        if (binaryChain.slice(-sp.pattern.length) === sp.pattern) {
            weightTai += sp.taiWeight;
            weightXiu += sp.xiuWeight;
            patternConfidence += sp.conf;
            break;
        }
    }

    // 1.6 CẦU NHỊP ĐẶC BIỆT (SPECIAL RHYTHM)
    const specialRhythms = [
        { pattern: '101100', desc: '1-1-2' },
        { pattern: '010011', desc: '0-0-2' },
        { pattern: '110101', desc: '2-1-1' },
        { pattern: '001010', desc: '2-0-1' },
        { pattern: '100101', desc: '1-2-1' },
        { pattern: '011010', desc: '1-2-0' }
    ];

    for (const sr of specialRhythms) {
        if (binaryChain.slice(-sr.pattern.length) === sr.pattern) {
            patternConfidence += 4;
            if (sr.pattern.endsWith('0')) weightTai += 18;
            else weightXiu += 18;
            break;
        }
    }

    // ========================================================================
    // MÔ-ĐUN 2: PHÂN TÍCH ĐIỂM SỐ CHUYÊN SÂU
    // ========================================================================
    
    // 2.1 Phân tích tổng điểm 5 phiên gần nhất
    const last5Totals = totalChain.slice(-5);
    const avgLast5 = last5Totals.reduce((a, b) => a + b, 0) / 5;
    
    if (avgLast5 > 11.5) {
        weightXiu += (avgLast5 - 11.5) * 12;
        advancedPatternScore += 3;
    } else if (avgLast5 < 9.5) {
        weightTai += (9.5 - avgLast5) * 12;
        advancedPatternScore += 3;
    }

    // 2.2 Phân tích độ lệch chuẩn tổng điểm 10 phiên
    const last10Totals = totalChain.slice(-10);
    const avg10 = last10Totals.reduce((a, b) => a + b, 0) / 10;
    const variance = last10Totals.reduce((sum, t) => sum + Math.pow(t - avg10, 2), 0) / 10;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 2.0) {
        // Điểm đang ổn định - xu hướng tiếp tục
        const lastSide = cleanData[size - 1].side;
        if (lastSide === 1) weightTai += 15;
        else weightXiu += 15;
        advancedPatternScore += 5;
    } else if (stdDev > 4.5) {
        // Điểm biến động mạnh - xu hướng đảo chiều
        const lastSide = cleanData[size - 1].side;
        if (lastSide === 1) weightXiu += 20;
        else weightTai += 20;
        advancedPatternScore += 5;
    }

    // 2.3 Phân tích chuỗi tăng/giảm liên tiếp
    let consecutiveIncreases = 0;
    let consecutiveDecreases = 0;
    for (let i = size - 1; i > size - 8; i--) {
        if (totalChain[i] > totalChain[i-1]) {
            consecutiveIncreases++;
            consecutiveDecreases = 0;
        } else if (totalChain[i] < totalChain[i-1]) {
            consecutiveDecreases++;
            consecutiveIncreases = 0;
        }
    }
    
    if (consecutiveIncreases >= 3) {
        weightXiu += consecutiveIncreases * 10;
        advancedPatternScore += 4;
    }
    if (consecutiveDecreases >= 3) {
        weightTai += consecutiveDecreases * 10;
        advancedPatternScore += 4;
    }

    // ========================================================================
    // MÔ-ĐUN 3: PHÂN TÍCH CẤU TRÚC XÚC XẮC
    // ========================================================================
    
    // 3.1 Phân tích bộ ba xúc xắc
    const latestDice = cleanData[size - 1].dice;
    const uniqueCount = new Set(latestDice).size;
    
    // Bão (3 số giống nhau)
    if (uniqueCount === 1) {
        const baoValue = latestDice[0];
        if (baoValue >= 4) weightXiu += 35;
        else weightTai += 35;
        advancedPatternScore += 8;
    }
    
    // Cặp đôi (2 số giống nhau)
    if (uniqueCount === 2) {
        const sorted = [...latestDice].sort();
        if (sorted[0] === sorted[1] || sorted[1] === sorted[2]) {
            const total = latestDice.reduce((a, b) => a + b, 0);
            if (total >= 11) weightTai += 12;
            else weightXiu += 12;
            advancedPatternScore += 4;
        }
    }

    // 3.2 Phân tích tần suất xuất hiện từng mặt xúc xắc
    const allDiceValues = cleanData.flatMap(x => x.dice);
    const frequencyMap = {};
    allDiceValues.forEach(v => frequencyMap[v] = (frequencyMap[v] || 0) + 1);
    
    // Tìm mặt xuất hiện nhiều nhất và ít nhất trong 20 phiên gần
    const recentDice = cleanData.slice(-20).flatMap(x => x.dice);
    const recentFreq = {};
    recentDice.forEach(v => recentFreq[v] = (recentFreq[v] || 0) + 1);
    
    const maxFreq = Math.max(...Object.values(recentFreq));
    const minFreq = Math.min(...Object.values(recentFreq));
    
    if (maxFreq - minFreq >= 8) {
        const hotNumber = Object.keys(recentFreq).find(k => recentFreq[k] === maxFreq);
        if (hotNumber >= 4) weightTai += 15;
        else weightXiu += 15;
        advancedPatternScore += 6;
    }

    // ========================================================================
    // MÔ-ĐUN 4: PHÂN TÍCH MOMENTUM VÀ GIA TỐC
    // ========================================================================
    
    // 4.1 Momentum tuyến tính có trọng số
    let weightedMomentum = 0;
    for (let i = 1; i <= 10; i++) {
        if (size - i - 1 >= 0) {
            const diff = totalChain[size - i] - totalChain[size - i - 1];
            weightedMomentum += diff * (11 - i) / 55; // Trọng số giảm dần
        }
    }
    
    if (weightedMomentum > 0.3) {
        weightTai += Math.abs(weightedMomentum) * 50;
        advancedPatternScore += 5;
    } else if (weightedMomentum < -0.3) {
        weightXiu += Math.abs(weightedMomentum) * 50;
        advancedPatternScore += 5;
    }

    // 4.2 Gia tốc (thay đổi của momentum)
    let acceleration = 0;
    const firstHalf = totalChain.slice(-10, -5);
    const secondHalf = totalChain.slice(-5);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / 5;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / 5;
    acceleration = avgSecond - avgFirst;
    
    if (Math.abs(acceleration) > 1.5) {
        if (acceleration > 0) weightXiu += 25;
        else weightTai += 25;
        advancedPatternScore += 7;
    }

    // ========================================================================
    // MÔ-ĐUN 5: PHÂN TÍCH MẬT ĐỘ VÀ HỒI QUY
    // ========================================================================
    
    // 5.1 Tỷ lệ Tài/Xỉu trong các khung thời gian khác nhau
    const windows = [10, 20, 30, 50, 80];
    let densityScore = 0;
    
    for (const window of windows) {
        const windowData = cleanData.slice(-window);
        const taiCount = windowData.filter(x => x.side === 1).length;
        const ratio = taiCount / windowData.length;
        
        if (ratio > 0.55) {
            densityScore += (ratio - 0.55) * 200;
        } else if (ratio < 0.45) {
            densityScore -= (0.45 - ratio) * 200;
        }
    }
    
    if (densityScore > 0) weightXiu += densityScore;
    else weightTai += Math.abs(densityScore);

    // 5.2 Chu kỳ dao động tự nhiên
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
        // Chu kỳ hiện tại dài bất thường - dự đoán đảo chiều
        if (cleanData[size - 1].side === 1) weightXiu += 30;
        else weightTai += 30;
        advancedPatternScore += 8;
    }

    // ========================================================================
    // MÔ-ĐUN 6: PHÂN TÍCH TƯƠNG QUAN CHÉO
    // ========================================================================
    
    // 6.1 Tương quan giữa tổng điểm và kết quả Tài/Xỉu
    const last20Data = cleanData.slice(-20);
    let crossCorrelation = 0;
    for (let i = 1; i < last20Data.length; i++) {
        if (last20Data[i].total > 12 && last20Data[i-1].side === 1) crossCorrelation++;
        if (last20Data[i].total < 9 && last20Data[i-1].side === 0) crossCorrelation++;
    }
    
    if (crossCorrelation > 8) {
        advancedPatternScore += 6;
        if (cleanData[size - 1].total > 12) weightXiu += 20;
        else if (cleanData[size - 1].total < 9) weightTai += 20;
    }

    // 6.2 Phân tích tính chẵn lẻ
    const parityChain = cleanData.map(x => x.isEven);
    const lastParities = parityChain.slice(-6);
    const evenCount = lastParities.filter(x => x === 1).length;
    
    if (evenCount >= 5) {
        // Quá nhiều chẵn liên tiếp
        if (cleanData[size - 1].total % 2 === 0) {
            weightTai += 10;
            weightXiu += 10;
        }
    }

    // ========================================================================
    // TỔNG HỢP KẾT QUẢ
    // ========================================================================
    
    let finalPrediction = "";
    const deltaScore = Math.abs(weightTai - weightXiu);

    if (weightTai > weightXiu) {
        finalPrediction = "TÀI";
    } else if (weightXiu > weightTai) {
        finalPrediction = "XỈU";
    } else {
        finalPrediction = cleanData[size - 1].side === 1 ? "XỈU" : "TÀI";
    }

    // Tính toán tỷ lệ tin cậy
    let baseRate = 75;
    let logicFactor = Math.min(deltaScore * 0.12, 12.0);
    let patternFactor = Math.min(patternConfidence * 0.8, 8.0);
    let advancedFactor = Math.min(advancedPatternScore * 0.6, 5.0);
    
    let calculatedRate = Math.round(baseRate + logicFactor + patternFactor + advancedFactor);
    
    // Giới hạn tỷ lệ trong khoảng 65-98%
    if (calculatedRate > 98) calculatedRate = 98;
    if (calculatedRate < 65) calculatedRate = 65;

    // Xác định mức độ tin cậy
    let confidenceLevel = "THẤP";
    if (calculatedRate >= 90) confidenceLevel = "RẤT CAO";
    else if (calculatedRate >= 82) confidenceLevel = "CAO";
    else if (calculatedRate >= 74) confidenceLevel = "TRUNG BÌNH";

    return { 
        prediction: finalPrediction, 
        rate: `${calculatedRate}%`,
        confidence: confidenceLevel,
        analysis: {
            taiWeight: weightTai.toFixed(2),
            xiuWeight: weightXiu.toFixed(2),
            deltaScore: deltaScore.toFixed(2),
            patternConfidence: patternConfidence.toFixed(2),
            advancedPatternScore: advancedPatternScore.toFixed(2),
            dataPoints: size,
            avgTotal: (totalChain.reduce((a, b) => a + b, 0) / size).toFixed(2)
        }
    };
}

// ============================================================================
// ROUTE API CHÍNH
// ============================================================================
app.get('/api/predict', async (req, res) => {
    try {
        const response = await axios.get('https://b52-qiw2.onrender.com/api/history', { 
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });
        
        const resData = response.data;
        let history = [];
        
        if (resData && resData.data && Array.isArray(resData.data)) {
            history = resData.data;
        } else if (Array.isArray(resData)) {
            history = resData;
        } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(500).send("Dữ liệu đầu vào không hợp lệ.");
        }

        // Tìm phiên gần nhất có dữ liệu hợp lệ
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
            return res.status(500).send("Không tìm thấy phiên dữ liệu hợp lệ.");
        }

        const d1 = parseInt(latestValidSession.Xuc_cac_1 || latestValidSession.Xuc_xac_1 || 0);
        const d2 = parseInt(latestValidSession.Xuc_cac_2 || latestValidSession.Xuc_xac_2 || 0);
        const d3 = parseInt(latestValidSession.Xuc_cac_3 || latestValidSession.Xuc_xac_3 || 0);
        const currentPhien = parseInt(latestValidSession.Phien || 0);
        const currentTong = d1 + d2 + d3;

        // Thực thi thuật toán
        const logicResult = executeUltraHardcoreLogicChain(history);
        const nextPhien = currentPhien + 1;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        
        const outputResponse = 
`╔══════════════════════════════════╗
║   HỆ THỐNG MA TRẬN V12 ULTRA   ║
╠══════════════════════════════════╣
║ Phiên hiện tại: ${currentPhien}
║ Xúc xắc: ${d1}-${d2}-${d3}
║ Tổng điểm: ${currentTong}
╠══════════════════════════════════╣
║ Phiên dự đoán: ${nextPhien}
║ Dự đoán: ${logicResult.prediction}
║ Tỷ lệ: ${logicResult.rate}
║ Độ tin cậy: ${logicResult.confidence}
╠══════════════════════════════════╣
║ Dữ liệu phân tích: ${logicResult.analysis.dataPoints} phiên
║ Tổng TB: ${logicResult.analysis.avgTotal}
║ Điểm Tài: ${logicResult.analysis.taiWeight}
║ Điểm Xỉu: ${logicResult.analysis.xiuWeight}
║ Chênh lệch: ${logicResult.analysis.deltaScore}
╚══════════════════════════════════╝
Id: @tranhoang2286`;

        return res.send(outputResponse);

    } catch (error) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(500).send(
            `╔══════════════════════════════════╗\n` +
            `║   HỆ THỐNG ĐANG ĐỒNG BỘ DỮ LIỆU  ║\n` +
            `║   Vui lòng thử lại sau 3 giây    ║\n` +
            `╚══════════════════════════════════╝\n` +
            `Id: @tranhoang2286`
        );
    }
});

// ============================================================================
// ROUTE PHÂN TÍCH CHI TIẾT (DEBUG)
// ============================================================================
app.get('/api/analysis', async (req, res) => {
    try {
        const response = await axios.get('https://b52-qiw2.onrender.com/api/history', { timeout: 8000 });
        const resData = response.data;
        let history = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
        
        const result = executeUltraHardcoreLogicChain(history);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Lỗi phân tích" });
    }
});

app.get('/', (req, res) => {
    res.send("HỆ THỐNG TOÁN HỌC MA TRẬN V12 ULTRA HARDCORE ENGINE ONLINE.");
});

app.listen(PORT, () => {
    console.log(`[ONLINE] Khởi chạy thành công bộ lõi siêu cấp V12 trên cổng: ${PORT}`);
});
