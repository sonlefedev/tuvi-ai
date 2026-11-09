// lib/intro-data.ts
export const FEATURES = [
    { title: "Engine An Sao Thuần TypeScript & Bàn Cờ 4×4", desc: "Lịch Âm–Dương Hồ Ngọc Đức, 14 Chính tinh + ~90 Phụ tinh, Tuần/Triệt, Ngũ hành màu sao, Lưu niên (L.), Đại vận (ĐV.), Tiểu hạn & Nguyệt hạn T1–T12; hỗ trợ pinch-zoom trên điện thoại và xuất ảnh 4K HD." },
    { title: "Bản Đồ Cuộc Đời Toàn Tập (6 Chương)", desc: "Tổng hợp 12 cung & 48 đường Phi Hóa thành cẩm nang 6 chương (Cốt cách, Sự nghiệp, Tình duyên, Sức khỏe, Điều nên tránh, Kim chỉ nam), đọc liền mạch hoặc tải file .HTML / in PDF." },
    { title: "Luận Cung Cố Định 5 Phần (Cache 0 Token)", desc: "Phân tích thuần sao cố định theo Lục diện (Bản cung + Tam hợp + Xung chiếu + Nhị hợp + Giáp cung + Phi Tứ Hóa), tách bạch khỏi sao lưu niên và lưu cache mở lại tức thì." },
    { title: "Biểu Đồ Đánh Giá AI Đa Tầng", desc: "Chấm điểm định lượng 4 tầng vận trình (Cố định • Đại vận • Lưu Thái Tuế • Tiểu hạn) dưới dạng Radar / Cột / Đường, hỗ trợ nhập khía cạnh tùy biến vô hạn." },
    { title: "Trợ Lý Chat AI & Smart Router Đa Model", desc: "Cửa sổ chat kéo thả, co giãn tự do; tự phân loại câu hỏi nhanh/sâu để chọn đúng tầng model Gemini (Lite / Flash / Pro), xoay vòng toàn bộ pool chống quá tải và lưu ký ức theo từng năm hạn." },
    { title: "Tài Khoản & Đồng Bộ Cloud Realtime", desc: "Đăng nhập để đồng bộ tự động mỗi 2 giây qua Supabase Cloud: mọi lá số, bài luận cung, sách 6 chương, biểu đồ và trạng thái đang luận cập nhật tức thì giữa điện thoại và máy tính." },
];

export const STEPS = [
    "Đăng nhập tài khoản để đồng bộ đa thiết bị (hoặc dùng Chế độ Khách), nhập thông tin sinh & Năm xem hạn → bấm An sao & Tính toán.",
    "Chạm hoặc rê chuột vào từng cung trên bàn cờ 4×4 để soi Tam hợp – Xung chiếu; bấm Tải ảnh lá số (4K) ở góc trên bàn cờ để lưu về máy.",
    "Bấm Lập Bản Đồ Cuộc Đời (6 Chương) hoặc chọn cung bất kỳ để bấm AI Luận Chuyên Sâu 5 Phần (tự lưu Cache & đồng bộ Cloud).",
    "Chuyển xuống Biểu Đồ Đánh Giá AI Đa Tầng để xem điểm số 4 tầng vận hạn hoặc nhập khía cạnh riêng cần chấm điểm.",
    "Bấm nút Hỏi Trợ Lý AI ở góc dưới bên trái để hỏi đáp trực tiếp theo cung đang mở; dùng nút thùng rác trên thanh chat nếu muốn làm mới ký ức.",
];

export const TECH_STACK = [
    "Next.js 16 (App Router)", "React 19", "TypeScript 5", "Tailwind CSS v4",
    "Gemini Smart Router (NDJSON)", "Supabase Cloud Sync", "html-to-image (4K)", "Netlify CI/CD",
];
