// lib/ai/lifemap-prompts.ts
const CHAPTER_GUIDES: Record<number, { title: string; outline: string }> = {
    1: {
        title: "CHƯƠNG I — TỔNG QUAN BẢN MỆNH, CỐT CÁCH, ƯU ĐIỂM & ĐIỂM YẾU CẦN TU DƯỠNG",
        outline: [
            "### 1. Bức Tranh Toàn Cục Âm Dương – Ngũ Hành – Bản Mệnh & Cục (giải mã mối quan hệ sinh khắc Mệnh–Cục, Mệnh–Thân, thế đứng Chính Tinh miếu/vượng/hãm)",
            "### 2. Giải Mã Cốt Cách & Tâm Thức Sâu Thẳm Tại Cung Mệnh Và Cung Thân (hành vi bản năng thời trẻ vs xu hướng trưởng thành hậu vận)",
            "### 3. Mạng Lưới Tam Hợp Mệnh – Tài – Quan & Tứ Hóa Gốc (Lộc, Quyền, Khoa, Kỵ tác động lên trục vận mệnh như thế nào)",
            "### 4. Năm (5) Ưu Điểm Thiên Bẩm Lớn Nhất Của Lá Số (phân tích từng ưu điểm kèm tổ hợp sao chứng minh và cách biến thành lợi thế cạnh tranh)",
            "### 5. Năm (5) Điểm Yếu & Cạm Bẫy Nội Tâm Cần Tu Dưỡng (chỉ thẳng điểm mù tính cách từ Sát tinh/Hóa Kỵ và phương pháp chuyển hóa cụ thể)",
            "### 6. Bài Học Linh Hồn & Định Vị Giá Trị Sống Cốt Lõi Của Đương Số",
        ].join("\n"),
    }, 2: {
        title: "CHƯƠNG II — BẢN ĐỒ SỰ NGHIỆP, NGÀNH NGHỀ TRỌNG ĐIỂM & CHIẾN LƯỢC TÀI LỘC",
        outline: [
            "### 1. Giải Phẫu Trục Sự Nghiệp: Cung Quan Lộc – Tài Bạch – Thiên Di – Điền Trạch",
            "### 2. Top 5 Nhóm Ngành Nghề & Vị Trí Chuyên Môn Thuận Thiên Thời Nhất (nêu rõ lý do theo bộ sao, môi trường phù hợp và lĩnh vực nên tránh)",
            "### 3. Mô Hình Phát Triển Tối Ưu: Làm Chủ, Chuyên Gia Độc Lập, Quản Trị Hệ Thống Hay Đầu Tư?",
            "### 4. Cơ Chế Kiếm Tiền, Tích Lũy Tài Sản & Cung Điền Trạch (cách dòng tiền đến, tài sản bền vững nằm ở đâu)",
            "### 5. Nhận Diện 4 Lỗ Hổng Thất Thoát Tài Chính & Bẫy Đầu Tư Cần Khóa Chặt",
            "### 6. Chiến Lược Xây Dựng Uy Tín, Thương Hiệu Cá Nhân & Quý Nhân Nâng Đỡ Trong Công Việc",
        ].join("\n"),
    }, 3: {
        title: "CHƯƠNG III — NHÂN DUYÊN, HÔN NHÂN, GIA ĐẠO & HỆ SINH THÁI QUAN HỆ",
        outline: [
            "### 1. Chân Dung Người Bạn Đời & Nghiệp Duyên Cung Phu Thê (tính cách, hoàn cảnh gặp gỡ, tương tác với Mệnh và Phúc Đức)",
            "### 2. Nhịp Sóng Tình Cảm, Các Giai Đoạn Thử Thách Hôn Nhân & Nghệ Thuật Giữ Lửa",
            "### 3. Cung Tử Tức: Duyên Con Cái, Phương Pháp Nuôi Dạy & Định Hướng Thế Hệ Sau",
            "### 4. Cung Phụ Mẫu & Huynh Đệ: Nền Tảng Gia Phong, Khoảng Cách Thế Hệ & Cách Hóa Giải Xung Khắc",
            "### 5. Cung Phúc Đức & Âm Đức Tổ Tiên: Nguồn Gốc Phước Báu Nuôi Dưỡng Hạnh Phúc Gia Đạo",
            "### 6. Cung Nô Bộc: Nghệ Thuật Chọn Bạn, Chọn Cộng Sự & Nhận Diện Tiểu Nhân",
        ].join("\n"),
    }, 4: {
        title: "CHƯƠNG IV — SỨC KHỎE THỂ CHẤT, TÂM LÝ HỌC BẢN MỆNH & BÌNH AN NỘI TÂM",
        outline: [
            "### 1. Bản Đồ Ngũ Hành Tạng Phủ Từ Cung Tật Ách & Mệnh (cơ quan cần chăm sóc đặc biệt theo hành khí lá số)",
            "### 2. Các Nhóm Rủi Ro Sức Khỏe Tiềm Ẩn Theo Từng Giai Đoạn Tuổi Tác & Chế Độ Phòng Ngừa",
            "### 3. Cấu Trúc Tâm Lý & Nguồn Gốc Gây Căng Thẳng, Lo Âu Nội Tâm Của Đương Số",
            "### 4. Cơ Chế Tự Chữa Lành, Quản Trị Cảm Xúc & Nâng Cao Chỉ Số Bình An (Phúc Đức)",
            "### 5. Nhịp Sinh Hoạt, Dinh Dưỡng, Vận Động & Không Gian Sống Hài Hòa Mệnh Cục",
            "### 6. Nghi Thức Dưỡng Tâm & Tái Tạo Năng Lượng Hằng Ngày",
        ].join("\n"),
    }, 5: {
        title: "CHƯƠNG V — CẨM NANG ỨNG XỬ THỰC CHIẾN: KHI GẶP CẢNH NÀO THÌ PHẢI LÀM GÌ?",
        outline: [
            "### 1. Cảnh 1 & 2: Khi Sự Nghiệp Chững Lại / Bị Chèn Ép & Khi Tài Chính Biến Động / Thua Lỗ (Dấu hiệu -> Sai lầm cần tránh -> 4 bước hóa giải)",
            "### 2. Cảnh 3: Khi Vướng Thị Phi, Hiểu Lầm, Kiện Tụng Hoặc Bị Tiểu Nhân Sau Lưng (Dấu hiệu -> Sai lầm cần tránh -> 4 bước hóa giải)",
            "### 3. Cảnh 4: Khi Đứng Trước Ngã Rẽ Chuyển Nghề, Khởi Nghiệp Hoặc Đi Xa Lập Nghiệp (Dấu hiệu -> Sai lầm cần tránh -> 4 bước hóa giải)",
            "### 4. Cảnh 5: Khi Hôn Nhân / Tình Cảm Rạn Nứt, Lạnh Nhạt Hoặc Bất Đồng Sâu Sắc (Dấu hiệu -> Sai lầm cần tránh -> 4 bước hóa giải)",
            "### 5. Cảnh 6: Khi Gia Đạo Bất Hòa, Áp Lực Hiếu Đạo Hoặc Khủng Hoảng Niềm Tin Người Thân (Dấu hiệu -> Sai lầm cần tránh -> 4 bước hóa giải)",
            "### 6. Cảnh 7 & 8: Khi Suy Kiệt Tinh Thần & Khi Đang Ở Đỉnh Cao Thuận Lợi (cách giữ phước tránh đảo chiều vận)",
        ].join("\n"),
    }, 6: {
        title: "CHƯƠNG VI — NHỮNG ĐIỀU TUYỆT ĐỐI NÊN TRÁNH & NGHỆ THUẬT TRÁNH HUNG ĐÓN CÁT",
        outline: [
            "### 1. Sáu (6) Thói Quen Tư Duy & Phản Xạ Cảm Xúc Tự Hủy Hoại Vận Khí Cần Đoạn Tuyệt",
            "### 2. Những Kiểu Hợp Tác Làm Ăn, Hùn Hạp, Cho Vay Mượn & Đầu Cơ Phải Tránh Xa Tuyệt Đối",
            "### 3. Những Môi Trường Sống, Mối Quan Hệ Độc Hại & Lời Nói Dễ Chiêu Mời Thị Phi",
            "### 4. Các Mốc Hạn Xấu Cần 'Án Binh Bất Động' Thay Vì Cố Đấm Ăn Xôi",
            "### 5. Nghệ Thuật Chuyển Hóa Năng Lượng Sát Tinh & Hóa Kỵ Thành Nội Lực Kỷ Luật",
            "### 6. Bảng Kiểm Tra Tự Rà Soát Tâm Thái Trước Mỗi Quyết Định Quan Trọng",
        ].join("\n"),
    }, 7: {
        title: "CHƯƠNG VII — LỘ TRÌNH 8 ĐẠI VẬN CUỘC ĐỜI (TỪ THIẾU NIÊN ĐẾN HẬU VẬN)",
        outline: [
            "### 1. Tổng Quan Nhịp Sóng 80 Năm Cuộc Đời & Quy Luật Vận Hành Đại Vận Trên Lá Số",
            "### 2. Đại Vận 1 & Đại Vận 2 (Nền Tảng Thiếu Niên & Khởi Đầu Lập Thân): Cung vị, sao hội, bài học và bước đệm",
            "### 3. Đại Vận 3 (Giai Đoạn Bứt Phá & Định Hình Vị Thế): Cơ hội vàng, thách thức và chiến lược hành động",
            "### 4. Đại Vận 4 (Giai Đoạn Chín Muồi & Tích Lũy Đỉnh Cao): Trọng tâm sự nghiệp, tài sản và gia đạo",
            "### 5. Đại Vận 5 (Giai Đoạn Chuyển Giao & Củng Cố Thành Quả): Quản trị rủi ro và mở rộng chiều sâu",
            "### 6. Đại Vận 6, 7 & 8 (Hậu Vận An Nhiên, Truyền Thừa & Viên Mãn): Giữ sức khỏe, dưỡng phúc và an hưởng",
        ].join("\n"),
    }, 8: {
        title: "CHƯƠNG VIII — KIM CHỈ NAM HÀNH ĐỘNG TRỌN ĐỜI & LỜI NHẮN GỬI RIÊNG",
        outline: [
            "### 1. Triết Lý Sống Cốt Lõi Dành Riêng Cho Cách Cục Lá Số Của Đương Số",
            "### 2. Mười (10) Nguyên Tắc Vàng Trong Ra Quyết Định Lớn Về Tiền Bạc, Công Danh & Tình Cảm",
            "### 3. Kế Hoạch Hành Động Cụ Thể Cho 90 Ngày Tới (gắn trực tiếp với Lưu Niên năm xem hạn hiện tại)",
            "### 4. Lộ Trình Mục Tiêu 1 Năm & 5 Năm Tiếp Theo Để Đón Đúng Thiên Thời",
            "### 5. Phương Pháp Gieo Nhân Lành, Tích Tạo Phúc Đức Bền Vững Cho Bản Thân & Gia Tộc",
            "### 6. Lời Nhắn Gửi Tâm Huyết Như Một Người Thầy Tri Kỷ Đồng Hành Trọn Đời",
        ].join("\n"),
    },
};
export function buildChapterPrompt(chapter: number, compactChart: string): string {
    const g = CHAPTER_GUIDES[chapter] || CHAPTER_GUIDES[1];
    return [
        `Bạn là đại sư Tử Vi Đẩu Số uyên bác (Nam Phái & Phi Tinh Tứ Hóa), đang viết ${g.title} trong bộ sách ĐẠI CẨM NANG BẢN ĐỒ CUỘC ĐỜI (toàn bộ 8 chương dài ~100.000 ký tự).`,
        "YÊU CẦU ĐỘ DÀI & CHIỀU SÂU BẮT BUỘC: Chương này PHẢI viết thật sâu sắc, giàu tính văn chương, thấu cảm và thực tiễn, đạt khoảng 12.000 - 14.000 ký tự tiếng Việt (~2.600 - 3.200 từ). Tuyệt đối không viết tóm tắt sơ sài; mỗi mục con dưới đây phải phân tích trọn vẹn 3-4 đoạn văn chi tiết (~2.000 - 2.300 ký tự/mục), dẫn chứng cụ thể tên Chính tinh, Phụ tinh, Tứ hóa, Tuần/Triệt, Ngũ hành và Địa chi trên lá số (dùng **in đậm** cho tên sao và tên cung).",
        "DỮ LIỆU LÁ SỐ ĐƯƠNG SỐ:\n" + compactChart,
        "CẤU TRÚC 6 MỤC BẮT BUỘC PHẢI TRIỂN KHAI ĐẦY ĐỦ:\n" + g.outline,
        chapter === 8 ? "\nỞ dòng cuối cùng sau mục 6, thêm đúng thẻ [MEM] kèm 1 câu đúc kết cốt lõi toàn lá số dưới 40 từ." : "",
    ].join("\n\n");
}
