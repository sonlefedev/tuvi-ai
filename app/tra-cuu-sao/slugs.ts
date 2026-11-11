export interface StarDetail {
    slug: string;
    name: string;
    element: string;
    group: string;
    summary: string;
    advice: string;
}

export const STAR_STATIC_LIST: StarDetail[] = [
    {
        slug: "tu-vi",
        name: "Tử Vi",
        element: "Thổ",
        group: "Chính tinh • Đế Tinh",
        summary: "Chủ quyền uy, lãnh đạo, tự tôn, bao quát và che chở; gặp Tả Hữu, Khôi Việt, Xương Khúc thì khí chất tôn quý, dễ nắm vị trí đứng đầu.",
        advice: "Cần giữ sự khiêm cung, lắng nghe cộng sự để tránh độc đoán hoặc cô độc."
    },
    {
        slug: "thien-co",
        name: "Thiên Cơ",
        element: "Mộc",
        group: "Chính tinh • Thiện Tinh",
        summary: "Chủ trí tuệ, mưu lược, linh hoạt, giỏi phân tích kỹ thuật, tham mưu và thích nghi nhanh với biến đổi.",
        advice: "Tránh suy nghĩ quá nhiều gây do dự; nên biến ý tưởng thành hành động dứt khoát."
    },
    {
        slug: "thai-duong",
        name: "Thái Dương",
        element: "Hỏa",
        group: "Chính tinh • Quý Tinh",
        summary: "Chủ quang minh, nhiệt huyết, cống hiến, danh tiếng và trách nhiệm xã hội; rực sáng ở Dần–Ngọ, dịu ở Thân–Hợi.",
        advice: "Chú ý giữ sức khỏe mắt/tim mạch và cân bằng giữa việc công với gia đình."
    },
    {
        slug: "vu-khuc",
        name: "Vũ Khúc",
        element: "Kim",
        group: "Chính tinh • Tài Tinh",
        summary: "Chủ tài chính, quyết đoán, thực tế, kỷ luật cao và năng lực quản trị tiền bạc, kinh doanh hoặc kỹ nghệ.",
        advice: "Nên mềm dẻo hơn trong giao tiếp tình cảm để tránh khô khan, cứng nhắc."
    },
    {
        slug: "thien-dong",
        name: "Thiên Đồng",
        element: "Thủy",
        group: "Chính tinh • Phúc Tinh",
        summary: "Chủ phúc hậu, hòa nhã, nghệ thuật, thích trải nghiệm và có duyên thay đổi môi trường sống/làm việc.",
        advice: "Cần rèn tính kiên trì trước áp lực để không dễ nản lòng giữa chừng."
    },
    {
        slug: "liem-trinh",
        name: "Liêm Trinh",
        element: "Hỏa",
        group: "Chính tinh • Tù / Đào Hoa Tinh",
        summary: "Chủ tính kỷ cương, thẳng thắn, cá tính quyết liệt, nhạy bén chính trị và pháp lý; đắc địa thì quyền biến, hãm địa dễ thị phi.",
        advice: "Giữ tinh thần thượng tôn pháp luật và hạn chế cố chấp trong quan hệ cộng sự."
    },
    {
        slug: "thien-phu",
        name: "Thiên Phủ",
        element: "Thổ",
        group: "Chính tinh • Lệnh Tinh",
        summary: "Chủ kho tàng, tài chính, bao dung, quản lý điềm tĩnh, cẩn trọng và giữ gìn tài sản bền vững.",
        advice: "Nên chủ động mở rộng đầu tư khi gặp thời cơ, tránh phòng thủ quá mức."
    },
    {
        slug: "thai-am",
        name: "Thái Âm",
        element: "Thủy",
        group: "Chính tinh • Phú Tinh",
        summary: "Chủ điền trạch, thẩm mỹ, tế nhị, tình cảm sâu sắc và khả năng tích lũy tài sản âm thầm mà bền chắc.",
        advice: "Tránh đa sầu đa cảm làm suy giảm ý chí quyết đoán trong công việc lớn."
    },
    {
        slug: "tham-lang",
        name: "Tham Lang",
        element: "Thủy / Mộc",
        group: "Chính tinh • Đào Hoa / Dục Tinh",
        summary: "Chủ giao tế, đa tài, năng động, thích khám phá và nắm bắt cơ hội kinh doanh mới.",
        advice: "Cần kiểm soát lòng tham và tính tùy hứng, tập trung vào mục tiêu cốt lõi."
    },
    {
        slug: "cu-mon",
        name: "Cự Môn",
        element: "Thủy",
        group: "Chính tinh • Ám Tinh",
        summary: "Chủ khẩu tài, ngôn ngữ, biện luận, phản biện, giảng dạy hoặc nghiên cứu chuyên sâu.",
        advice: "Uốn lưỡi trước khi nói, tránh tranh cãi vô thưởng vô phạt gây khẩu thiệt thị phi."
    },
    {
        slug: "thien-tuong",
        name: "Thiên Tướng",
        element: "Thủy",
        group: "Chính tinh • Ấn Tinh",
        summary: "Chủ quyền bính, trượng nghĩa, chu đáo, tận tụy và thích giúp đỡ người khác.",
        advice: "Chọn đúng người lãnh đạo hoặc đối tác uy tín để cống hiến, tránh bị lợi dụng lòng tốt."
    },
    {
        slug: "thien-luong",
        name: "Thiên Lương",
        element: "Mộc",
        group: "Chính tinh • Ấm Tinh",
        summary: "Chủ thọ trường, y dược, giáo dục, tâm linh, hòa giải và che chở cho người yếu thế.",
        advice: "Nên làm việc thiện nguyện và giữ tâm sáng, phát huy uy tín đạo đức trong nghề nghiệp."
    },
    {
        slug: "that-sat",
        name: "Thất Sát",
        element: "Kim",
        group: "Chính tinh • Quyền Tinh",
        summary: "Chủ dũng cảm, quyết đoán, tiên phong, dám đương đầu hiểm nguy và có khả năng hành động độc lập cao.",
        advice: "Cần tiết chế tính nóng nảy và lắng nghe ý kiến đóng góp của người xung quanh."
    },
    {
        slug: "pha-quan",
        name: "Phá Quân",
        element: "Thủy",
        group: "Chính tinh • Hao Tinh",
        summary: "Chủ đổi mới, bứt phá giới hạn, dám đập đi xây lại, sáng tạo trong nghịch cảnh.",
        advice: "Tránh mạo hiểm khi chưa có sự chuẩn bị và quản trị rủi ro tài chính chặt chẽ."
    },
    {
        slug: "hoa-loc",
        name: "Hóa Lộc",
        element: "Mộc",
        group: "Tứ Hóa • Cát Tinh",
        summary: "Chủ tài lộc dồi dào, thuận lợi hanh thông, cơ hội mở rộng và nhân duyên tốt.",
        advice: "Biết chia sẻ thành quả và tái đầu tư khôn ngoan khi thời vận đang lên."
    },
    {
        slug: "hoa-quyen",
        name: "Hóa Quyền",
        element: "Hỏa",
        group: "Tứ Hóa • Quyền Tinh",
        summary: "Chủ quyền lực, uy thế, sự thăng tiến, năng lực tự chủ và quyết tâm hành động.",
        advice: "Tránh lạm quyền hoặc áp đặt ý chí lên người khác."
    },
    {
        slug: "hoa-khoa",
        name: "Hóa Khoa",
        element: "Thủy",
        group: "Tứ Hóa • Văn / Giải Tinh",
        summary: "Chủ danh tiếng, học vấn, khoa bảng, năng lực giải tai cứu ách hàng đầu trong khoa Tử Vi.",
        advice: "Không ngừng trau dồi tri thức thực chất thay vì chỉ theo đuổi hư danh."
    },
    {
        slug: "hoa-ky",
        name: "Hóa Kỵ",
        element: "Thủy",
        group: "Tứ Hóa • Ám / Chấp Tinh",
        summary: "Chủ trắc trở, thị phi, chấp niệm và thử thách rèn luyện ý chí vượt khó.",
        advice: "Học cách buông bỏ chấp niệm, suy nghĩ cởi mở và biến chông gai thành kinh nghiệm sống."
    }
];