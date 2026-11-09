// lib/luan-giai/star-dict.ts
import { getStarElement } from "../ngu-hanh";

export interface StarEntry { name: string; element: string; group: string; summary: string; advice: string; }

const EL_LABEL: Record<string, string> = { K: "Kim", M: "Mộc", T: "Thủy", H: "Hỏa", Th: "Thổ" };

const CORE_STARS: Record<string, [string, string, string]> = {
    "tử vi": ["Chính tinh • Đế Tinh", "Chủ quyền uy, lãnh đạo, tự tôn, bao quát và che chở; gặp Tả Hữu, Khôi Việt, Xương Khúc thì khí chất tôn quý, dễ nắm vị trí đứng đầu.", "Cần giữ sự khiêm cung, lắng nghe cộng sự để tránh độc đoán hoặc cô độc."],
    "thiên cơ": ["Chính tinh • Thiện Tinh", "Chủ trí tuệ, mưu lược, linh hoạt, giỏi phân tích kỹ thuật, tham mưu và thích nghi nhanh với biến đổi.", "Tránh suy nghĩ quá nhiều gây do dự; nên biến ý tưởng thành hành động dứt khoát."],
    "thái dương": ["Chính tinh • Quý Tinh", "Chủ quang minh, nhiệt huyết, cống hiến, danh tiếng và trách nhiệm xã hội; rực sáng ở Dần–Ngọ, dịu ở Thân–Hợi.", "Chú ý giữ sức khỏe mắt/tim mạch và cân bằng giữa việc công với gia đình."],
    "vũ khúc": ["Chính tinh • Tài Tinh", "Chủ tài chính, quyết đoán, thực tế, kỷ luật cao và năng lực quản trị tiền bạc, kinh doanh hoặc kỹ nghệ.", "Nên mềm dẻo hơn trong giao tiếp tình cảm để tránh khô khan, cứng nhắc."],
    "thiên đồng": ["Chính tinh • Phúc Tinh", "Chủ phúc hậu, hòa nhã, nghệ thuật, thích trải nghiệm và có duyên thay đổi môi trường sống/làm việc.", "Cần rèn tính kiên trì trước áp lực để không dễ nản lòng giữa chừng."],
    "liêm trinh": ["Chính tinh • Tù / Đào Hoa Tinh", "Chủ nguyên tắc, thẳng thắn, đào hoa, có năng lực quản lý, pháp chế hoặc nghệ thuật; nhạy cảm với Hóa Kỵ.", "Giữ chuẩn mực minh bạch, tránh nóng nảy hoặc vướng thị phi tình cảm."],
    "thiên phủ": ["Chính tinh • Lệnh Tinh", "Chủ kho tàng, ổn định, bảo toàn thành quả, điềm đạm, bao dung và giỏi quản lý hậu cần – tài sản.", "Tránh tâm lý quá cầu toàn, an toàn khiến bỏ lỡ cơ hội bứt phá mới."],
    "thái âm": ["Chính tinh • Phú Tinh", "Chủ điền sản, tinh tế, nội tâm sâu sắc, thẩm mỹ và tích lũy bền vững; đắc địa ban đêm (Dậu–Sửu).", "Tránh đa sầu đa cảm; nên đầu tư tích sản dài hạn thay vì lướt sóng ngắn."],
    "tham lang": ["Chính tinh • Đào Hoa / Dục Tinh", "Chủ giao tế rộng, đa tài, khéo léo, tham vọng lớn, hợp kinh doanh, ngoại giao, nghệ thuật hoặc huyền học.", "Tiết chế ham muốn nhất thời; gặp Hỏa/Linh thì bộc phát mạnh nhưng cần kỷ luật."],
    "cự môn": ["Chính tinh • Ám Tinh", "Chủ ngôn ngữ, biện luận, nghiên cứu sâu, phản biện sắc bén; dễ thành danh qua giảng dạy, luật, truyền thông.", "Cẩn trọng lời nói để tránh khẩu thiệt thị phi, nghi kỵ không đáng có."],
    "thiên tướng": ["Chính tinh • Ấn Tinh", "Chủ chính trực, trung tín, ngoại giao lịch thiệp, trợ lực đắc lực và có trách nhiệm cao với tập thể.", "Tránh cả nể hoặc gánh vác thay việc người khác quá sức mình."],
    "thiên lương": ["Chính tinh • Ấm Tinh", "Chủ che chở, y dược, giáo dục, đạo đức, sống có nguyên tắc và hay gặp quý nhân giải ách.", "Đừng quá khắt khe xét nét tiểu tiết khiến người xung quanh thấy áp lực."],
    "thất sát": ["Chính tinh • Quyền Tinh", "Chủ tiên phong, bản lĩnh thép, độc lập, dám nghĩ dám làm, hợp khai phá thị trường hoặc quản trị biến động.", "Tiết chế sự nóng vội; hành động có kế hoạch dài hơi sẽ thành công lớn."],
    "phá quân": ["Chính tinh • Hao Tinh", "Chủ cải cách, đột phá, tiên phong mở lối mới, không chịu khuôn sáo cũ; cuộc đời nhiều bước ngoặt lớn.", "Quản trị rủi ro tài chính chặt chẽ trước mỗi lần thay đổi lớn."],
    "hóa lộc": ["Tứ Hóa • Cát Tinh", "Chủ tài lộc, nhân duyên tốt, cơ hội thuận lợi và sự hanh thông ở cung tọa thủ.", "Tận dụng vận may để tích lũy nền tảng bền vững."],
    "hóa quyền": ["Tứ Hóa • Quyền Tinh", "Chủ thực quyền, chủ động, năng lực điều hành và khát vọng khẳng định vị thế.", "Dùng uy tín dẫn dắt thay vì áp đặt cứng nhắc."],
    "hóa khoa": ["Tứ Hóa • Văn / Giải Tinh", "Chủ học vấn, danh tiếng thanh sạch, tư duy sáng suốt và quý nhân hóa giải tai ách.", "Phát huy thế mạnh chuyên môn, bằng cấp và uy tín cá nhân."],
    "hóa kỵ": ["Tứ Hóa • Ám / Chấp Tinh", "Chủ trăn trở, thị phi, rào cản hoặc sự cầu toàn sâu sắc buộc đương số phải rèn luyện.", "Bình tĩnh kiểm tra kỹ giấy tờ, lời nói và chuyển hóa áp lực thành chuyên sâu."],
    "tuần": ["Không Vong • Trung Tính", "Làm chậm lại, đảo chiều hoặc giảm bớt sự bộc phát của các sao trong cung; giúp hãm bớt sát tinh.", "Giai đoạn đầu thường thử thách, về sau ổn định và chín chắn hơn."],
    "triệt": ["Không Vong • Trung Tính", "Cắt ngang hoặc ngăn trở mạnh ở tiền vận, làm giảm lực cả cát tinh lẫn hung tinh.", "Nên linh hoạt chuyển hướng sớm thay vì cố chấp đi lối mòn."],
};

export function lookupStarInfo(rawName: string): StarEntry {
    const clean = rawName.replace(/^(L\.|ĐV\.|ĐV\s*)/i, "").replace(/\(.*?\)/g, "").trim();
    const key = clean.toLowerCase();
    const elCode = getStarElement(clean);
    const element = EL_LABEL[elCode] || "Trung tính";
    const found = CORE_STARS[key] || Object.entries(CORE_STARS).find(([k]) => key.includes(k))?.[1];
    const isLuu = /^(L\.|ĐV\.)/i.test(rawName);
    if (found) {
        return {
            name: rawName,
            element,
            group: isLuu ? `${found[0]} (Sao Lưu Động)` : found[0],
            summary: found[1],
            advice: found[2],
        };
    }
    return {
        name: rawName,
        element,
        group: isLuu ? "Phụ tinh Lưu Niên / Đại Vận" : "Phụ tinh Bản Mệnh",
        summary: `Sao ${clean} mang hành ${element}, đóng vai trò bổ trợ sắc thái chi tiết cho chính tinh và cục diện cung tọa thủ.`,
        advice: "Xem xét kết hợp cùng Chính tinh bản cung và Tam hợp để đánh giá độ cát hung trọn vẹn.",
    };
}
