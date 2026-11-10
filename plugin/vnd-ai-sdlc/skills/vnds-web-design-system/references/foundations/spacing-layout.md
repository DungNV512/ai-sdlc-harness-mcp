---
title: Spacing & Layout
category: foundations
source: "Figma New One · node 1218:168"
figma_page: "↳ VNDS Style Document (For Dev)"
figma_nodes:
  design_principles: "1218:168"
  color_usage: "1218:299"
  layout_and_composition: "1220:168"
last_synced: 2026-11-06
status: draft
notes: >
  Values collected from the Style Document. The full spacing scale and the radius tokens are NOT defined here;
  they are expected in page "↳ Spatial" (2:5), page "↳ Grid" (2:4) and the Foundation variables.
---

# Spacing & Layout

## Values defined in Figma

| Rule | Value | Scope | Source |
|---|---|---|---|
| Base grid | **4px**. Every spacing value is a spacing token. | all | 1218:168 |
| Inner padding (horizontal) | **8px** | Mobile App screens | 1218:168 |
| Panel inner padding | **8px** | WebTrading panels | 1218:168 |
| Gap between panels | **2px** | WebTrading | 1218:168 |
| Section spacing | **32px** | Mobile App | 1218:168 |
| Divider | **1px** thin line | all | 1218:168 |
| Corner radius | **8–12px** ("bo góc mềm"); edge-to-edge regions **0**; avatars/dots circular | all | 1218:168, 1220:168 |
| Design width | **1920px** desktop (WebTrading), **375px** mobile | — | 1220:168 |
| Touch target | **≥ 40px** | Mobile App | 1218:168 |
| Asset overlay | 375×311 rectangle at the top of the screen | Mobile Tài sản screen | 1218:299 |
| Asset glow | 247×147 ellipse, layer blur ≈ 80 | Mobile Tài sản screen | 1218:299 |

## Region separation

Separate regions in this order of preference:
1. **Background tone:** page background vs panel background (slight difference). Layering: page → panel → input field.
2. **Thin 1px divider.**
3. **2px gap** between panels (WebTrading).

**Never:** shadows, thick borders, floating rounded cards, card-in-card, or a border box around every block.

## Width behavior

- Backgrounds, panels and lists span the full width (edge-to-edge). Content inside keeps its padding.
- WebInfo: hero and content bands are full-bleed; text blocks have a limited width (TODO: value not defined yet).

## Layout & Composition (verbatim, Style Document node 1220:168)

**Lưới:** Mọi kích thước và khoảng cách bám lưới 4px, dùng giá trị spacing của thư viện.

**Edge-to-edge:** Vùng nền và danh sách chạm biên màn hình. Lề ngang nhỏ để nội dung gần biên nhưng không dính sát; chữ và vùng chạm luôn có khoảng đệm.

**Nhịp khoảng cách:** Khoảng cách tăng dần theo cấp: trong một cụm < giữa các cụm < giữa các section. Nhóm thông tin bằng khoảng cách trước, chỉ dùng đường kẻ khi cần tách dòng dữ liệu.

### WebTrading workspace

Bố cục dạng terminal, tận dụng tối đa màn hình desktop (**thiết kế ở 1920 px**).

| Vùng | Nội dung | Nguyên tắc |
|---|---|---|
| Top bar | Logo, hành động chính (Giao dịch, Nộp tiền), giờ và trạng thái thị trường, tài khoản. | Một CTA nổi bật duy nhất; còn lại là nút phụ hoặc thông tin. |
| Workspace tabs | Các tab làm việc như trình duyệt (Bảng giá, Giao dịch cổ phiếu…), thêm/đóng được. | Thấp, gọn; tab đang mở nổi bằng nền, không dùng màu brand. |
| Panel workspace | Biểu đồ + sổ lệnh (rộng nhất) · Độ sâu & khớp lệnh · Thông tin mã · Đặt lệnh (cố định bên phải). | Các panel ghép sát, cách nhau bằng khe hẹp lộ nền; mỗi panel có tiêu đề + tay kéo để sắp xếp lại. |
| Khu đặt lệnh | Chọn tài khoản, mã, loại lệnh, giá, khối lượng, hiệu lực; nút hành động ở đáy panel. | Luồng từ trên xuống theo thứ tự thao tác; nút Mua/Bán dùng màu trạng thái, nút phụ trung tính. |

### Mobile composition

Màn hình chính dạng một cột cuộn dọc (**thiết kế ở 375 px**).

| Khối | Nội dung | Nguyên tắc |
|---|---|---|
| Header | Avatar, nhãn mức rủi ro, tìm kiếm, menu. | Nằm trên nền gradient trạng thái; icon đơn sắc, gọn. |
| Asset hero | Nhãn, số dư lớn, biến động so với hôm qua, tiểu khoản, chấm phân trang. | Con số chính lớn nhất màn hình; biến động kèm mũi tên và màu trạng thái. |
| Biểu đồ | Biểu đồ tài sản full-bleed + bộ chọn khoảng thời gian (1 ngày, 7 ngày…). | Biểu đồ chạm hai biên; lựa chọn đang active nổi bằng nền, không dùng màu brand. |
| Quick actions | 4 hành động: Nộp tiền, Giao dịch, Rút tiền, Lịch sử. | Chia đều chiều ngang; chỉ hành động chính (Giao dịch) được tô màu brand. |
| Danh mục | Tabs sản phẩm, nhóm tài sản thu gọn được, danh sách mã. | Danh sách liền mạch, ngăn bằng đường kẻ mảnh; nhóm có tiêu đề và nút thu gọn. |

### Shape

Độ bo góc tăng theo kích thước và cấp độ nổi của phần tử.

| Phần tử | Quy tắc |
|---|---|
| Vùng edge-to-edge (panel, section, danh sách) | Không bo góc. |
| Tag, nhãn trạng thái nhỏ | Bo nhỏ, hoặc dạng pill cho nhãn trạng thái. |
| Nút, ô nhập, chip chọn | Bo vừa, đồng nhất trong cùng một màn hình. |
| Overlay (modal, bottom sheet) | Bo lớn nhất để tách khỏi nền. |
| Avatar, logo mã, chấm trạng thái | Hình tròn. |

> Radius values per level (small / medium / large) are not given. 1218:168 only says "bo góc mềm 8–12px". Not confirmed yet.

## Tokens

Spacing, radius and shadow tokens with values: [tokens/spacing-radius-shadow.md](../tokens/spacing-radius-shadow.md).

## TODO

- Radius values for small / medium / large, and the conflict with the ds-one implementation "button `radius-4`, card/panel `radius-8`": not confirmed yet. Provisional: keep ds-one component defaults; edge-to-edge regions `radius-0`; Popup/Modal `radius-12` (Popup Mobile `radius-16`).
- Breakpoints and grid columns (beyond the 1920px desktop and 375px mobile design widths): expected in page "↳ Grid" (2:4).

## Related

- [Design Style Direction](../brand/design-style-direction.md)
- [Color](./color.md)
