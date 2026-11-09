---
title: Component Patterns
category: guidelines
source: "Figma New One · node 1220:307"
figma_page: "↳ VNDS Style Document (For Dev)"
figma_node: "1220:307"
last_synced: 2026-11-06
status: draft
notes: Describes how to combine library components. Component specs (props, variants, tokens) are in the component pages and are not processed yet.
---

# Component Patterns

**Nguyên tắc (verbatim):** Dùng component có sẵn trong thư viện. Phần này mô tả cách kết hợp và thứ tự ưu tiên thông tin của các mẫu giao diện lặp lại trong sản phẩm, không mô tả lại token.

**Thứ tự đọc (verbatim):** Trong mọi khối dữ liệu: định danh (mã, tên) → giá trị chính → biến động → metadata. Định danh căn trái, số liệu căn phải.

## Data patterns (verbatim)

| Mẫu | Cấu tạo | Nguyên tắc |
|---|---|---|
| Panel (WebTrading) | Tiêu đề + tay kéo · hàng tiêu đề cột · nội dung · dòng tổng hợp (tuỳ chọn). | Không viền quanh panel; tách bằng nền. Tiêu đề cột nhạt, nhỏ. |
| Bảng dữ liệu | Hàng tiêu đề cột + các dòng dữ liệu nhịp đều. | Cột số căn phải, chữ số tabular. Không kẻ ô; dòng hover/chọn nổi bằng nền. |
| Sổ lệnh / độ sâu | Bên mua \| bên bán, thanh khối lượng phía sau số liệu, thanh tỷ lệ mua/bán. | Thanh khối lượng dùng màu trạng thái bản nhạt để số vẫn đọc được. |
| Danh sách mã (Mobile) | Logo tròn · mã + khối lượng \| giá trị + biến động. | Mỗi dòng một mã; biến động kèm mũi tên, % và số tiền; ngăn dòng bằng đường kẻ mảnh. |
| Nhóm thu gọn | Tiêu đề nhóm + nút mở/đóng · danh sách bên dưới. | Tiêu đề nhóm đậm hơn dòng; nhóm cách nhau rộng hơn dòng. |

## Action & feedback patterns (verbatim)

| Mẫu | Cấu tạo | Nguyên tắc |
|---|---|---|
| Quick actions | Icon trong ô vuông bo góc + nhãn ngắn bên dưới. | Tối đa 4–5 hành động; chỉ một hành động chính được tô màu. |
| Bộ chọn khoảng thời gian | Dãy lựa chọn ngang (1 ngày … 90 ngày). | Mục đang chọn nổi bằng nền; không gạch chân, không màu brand. |
| Tabs sản phẩm | Dãy tab chữ có gạch chân mục đang chọn. | Gạch chân và chữ mục đang chọn dùng màu brand; các mục còn lại trung tính. |
| Form đặt lệnh | Nhãn phía trên · ô nhập · nút tăng/giảm · gợi ý nhanh (10%, 25%…). | Giá trị nhập căn giữa, cỡ lớn; nút hành động cố định ở đáy. |
| Modal xác nhận | Icon trạng thái · tiêu đề · mô tả · 2 nút ngang (Hủy \| Xác nhận). | Nền phía sau làm tối; nút xác nhận bên phải, màu brand; nút hủy trung tính. |
| Nhãn trạng thái | Chữ trong khung pill (Thành công, Thất bại, Rủi ro cao). | Viền hoặc nền nhạt + chữ cùng họ màu; luôn có chữ, không chỉ dùng màu. |

## Selected-state summary (derived)

Collected from this page and [spacing-layout](../foundations/spacing-layout.md#layout--composition-verbatim-style-document-node-1220168):

| Control | Selected state | Brand color? |
|---|---|---|
| Product tabs (text tabs) | Underline + text in brand color | ✅ yes |
| Period selector (1 ngày … 90 ngày) | Raised background | ❌ no |
| WebTrading workspace tabs | Raised background | ❌ no |
| Table row hover/selected | Background | ❌ no |
| Buy / Sell buttons | Status color (green/red) | ❌ no |
| Confirm button in modal | Brand | ✅ yes |

> ⚠️ Possible conflict with "một điểm nhấn brand mỗi màn hình": the Mobile home screen has both the brand "Giao dịch" quick action and brand product-tab underline. Not confirmed yet. **Provisional:** the brand accent is one primary CTA; underlined text tabs may also use brand; workspace tabs, period selectors and segments use background only.
