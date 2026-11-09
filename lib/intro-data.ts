// lib/intro-data.ts
export const FEATURES = [
    { title: "Engine An Sao Thuần TS & Bàn Cờ 4×4", desc: "Lịch Âm–Dương Hồ Ngọc Đức, 14 Chính tinh + ~90 Phụ tinh, Tuần/Triệt, Ngũ hành màu sao, Lưu niên (L.), Đại vận (ĐV.), Tiểu hạn & Nguyệt hạn T1–T12; hỗ trợ pinch-zoom & xuất ảnh 4K." },
    { title: "Bản Đồ Cuộc Đời Toàn Tập (6 Chương)", desc: "Tổng hợp 12 cung & 48 đường Phi Hóa thành cẩm nang 6 chương chuyên sâu, đọc liền mạch hoặc tải file .HTML / in PDF." },
    { title: "Luận Cung Cố Định 5 Phần (Cache 0 Token)", desc: "Phân tích thuần sao cố định theo Lục diện (Bản cung + Tam hợp + Xung chiếu + Nhị hợp + Giáp cung + Phi Tứ Hóa), mở lại tức thì không tốn token." },
    { title: "Timeline 12 Tháng & Xuất Lịch .ICS", desc: "Chấm điểm cát/hung 12 tháng Đẩu Quân T1–T12 trong năm xem, xem sao lưu từng tháng và xuất file .ics nhắc việc về điện thoại." },
    { title: "Biểu Đồ Đánh Giá AI Đa Tầng", desc: "Chấm điểm định lượng 4 tầng vận trình (Cố định • Đại vận • Lưu Thái Tuế • Tiểu hạn) dưới dạng Radar / Cột / Đường, tùy biến vô hạn khía cạnh." },
    { title: "Hợp Lá Số Đôi (Soi Duyên & Cộng Sự)", desc: "Đối chiếu chéo 2 lá số từ tài khoản hoặc nhập mới: Ngũ hành bản mệnh, Phu Thê / Nô Bộc và 4 đường Phi Tứ Hóa tương tác." },
    { title: "Định Giờ Sinh Ngược (Rectification)", desc: "Chọn 2–3 khung giờ nghi ngờ và nhập biến cố quá khứ để AI chấm điểm xác suất giờ sinh khớp nhất và áp dụng chỉ với 1 chạm." },
    { title: "Nhật Ký Chiêm Nghiệm & Từ Điển Sao", desc: "Chạm trực tiếp vào tên sao trên bàn cờ để tra cứu Ngũ hành – ý nghĩa; ghi lại sự kiện thực tế đồng bộ Cloud cho AI tham chiếu." },
    { title: "Trợ Lý Chat AI & Đồng Bộ Cloud Realtime", desc: "Cửa sổ chat kéo thả, co giãn tự do; Smart Router tự chọn tầng model Gemini tối ưu và đồng bộ Supabase mỗi 2 giây giữa mọi thiết bị." },
];

export const STEPS = [
    "Đăng nhập tài khoản để đồng bộ đa thiết bị (hoặc dùng Chế độ Khách), nhập thông tin sinh & Năm xem hạn → bấm An sao & Tính toán.",
    "Chạm vào bất kỳ ngôi sao nào trên bàn cờ 4×4 để mở Từ điển tra cứu nhanh; bấm Tải ảnh lá số (4K) ở góc trên để lưu ảnh nét căng.",
    "Xem Timeline 12 tháng (xuất lịch .ICS), lập Bản Đồ Cuộc Đời 6 chương hoặc bấm AI Luận Chuyên Sâu 5 phần cho từng cung.",
    "Trải nghiệm Biểu đồ đa tầng, Hợp lá số đôi, Định giờ sinh ngược hoặc ghi lại Nhật ký chiêm nghiệm thực tế bên dưới.",
    "Mở nút Hỏi Trợ Lý AI ở góc dưới bên trái để hỏi đáp trực tiếp theo cung đang chọn, kéo thả khung chat tùy ý.",
];

export const LIVE_TIPS = [
    "Mẹo hay: Chạm trực tiếp vào tên bất kỳ ngôi sao nào trên bàn cờ để xem Ngũ hành & lời khuyên ứng dụng!",
    "Đồng bộ tức thì: Mở cùng tài khoản trên điện thoại và máy tính để theo dõi kết quả luận giải theo thời gian thực.",
    "Không chắc giờ sinh? Dùng ngay công cụ Định Giờ Sinh Ngược bên dưới để AI đối chiếu biến cố quá khứ!",
    "Xuất lịch nhắc việc: Tải file .ICS ở mục Timeline 12 Tháng để lưu các mốc vận hạn năm vào lịch điện thoại.",
];

export const DAILY_CARDS = [
    { star: "Thiên Cơ Đắc Địa", color: "Xanh Ngọc Bảo", hour: "Giờ Thìn (07h–09h)", num: "03 • 08", msg: "Trí tuệ hanh thông, cực kỳ hợp lên ý tưởng mới, học kỹ năng hoặc giải quyết bài toán khó." },
    { star: "Thái Dương Quang Minh", color: "Đỏ San Hô", hour: "Giờ Tỵ (09h–11h)", num: "01 • 09", msg: "Năng lượng tỏa sáng, thuận lợi gặp gỡ quý nhân, trình bày kế hoạch và mở rộng kết nối." },
    { star: "Thiên Lộc Khai Môn", color: "Vàng Hổ Phách", hour: "Giờ Mùi (13h–15h)", num: "06 • 08", msg: "Tài khí khởi sắc, dễ đón tin vui về công việc, cơ hội hợp tác hoặc lộc nhỏ bất ngờ." },
    { star: "Hồng Loan Hỷ Tín", color: "Hồng Phấn", hour: "Giờ Dậu (17h–19h)", num: "02 • 07", msg: "Nhân duyên hài hòa, lời nói dễ tạo thiện cảm — thích hợp trò chuyện gắn kết hoặc chia sẻ niềm vui." },
    { star: "Tử Vi Đế Tinh", color: "Tím Hoàng Gia", hour: "Giờ Ngọ (11h–13h)", num: "05 • 09", msg: "Bản lĩnh vững vàng, giữ tâm thế điềm tĩnh chủ động sẽ biến thử thách thành bước tiến mới." },
    { star: "Văn Xương Đắc Khoa", color: "Trắng Bạc", hour: "Giờ Mão (05h–07h)", num: "04 • 09", msg: "Tư duy mạch lạc, hợp viết lách, ký kết giấy tờ, ôn luyện hoặc hoàn thiện hồ sơ quan trọng." },
    { star: "Thiên Phủ Tụ Bảo", color: "Nâu Vàng Đất", hour: "Giờ Tuất (19h–21h)", num: "05 • 08", msg: "Ngày tốt để sắp xếp lại kế hoạch tài chính, dọn gọn không gian sống và củng cố nền tảng." },
    { star: "Thiên Lương Ấm Tinh", color: "Xanh Lá Mạ", hour: "Giờ Dần (03h–05h)", num: "03 • 07", msg: "Bình an nội tâm, cho đi sự giúp đỡ chân thành hôm nay sẽ nhận lại duyên lành bất ngờ." },
];

export const TECH_STACK = ["Next.js 16", "React 19", "TypeScript 5", "Tailwind v4", "Gemini Smart Router", "Supabase Realtime", "4K Export"];
