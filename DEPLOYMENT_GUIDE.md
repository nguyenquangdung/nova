# Hướng dẫn Deploy "All-in-One" lên Cloudflare Pages

Chúc mừng! Dự án của bạn đã được chuyển đổi sang kiến trúc **Serverless**. Giờ đây bạn chỉ cần deploy duy nhất thư mục `client` lên Cloudflare là có cả Frontend lẫn Backend.

---

## Bước 1: Đẩy code lên GitHub

Nếu bạn đã làm bước này rồi thì bỏ qua. Nếu chưa:
```bash
git add .
git commit -m "Migrate to Cloudflare Functions"
git push origin main
```

---

## Bước 2: Deploy lên Cloudflare Pages

1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Pages**.
2. Bấm **Connect to Git** > Chọn repo `lark-task-sync`.
3. Cấu hình Build:
   - **Project Name:** `lark-task-sync`
   - **Framework:** `Vite` (hoặc React)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `client` (Rất quan trọng!)

4. **Environment Variables (Biến môi trường) - QUAN TRỌNG:**
   Bạn phải nhập các biến sau vào mục **Settings > Environment variables** trên Cloudflare Pages sau khi tạo project (hoặc ngay lúc setup):

   | Variable Name | Value |
   | :--- | :--- |
   | `LARK_APP_ID` | Copy từ file `.env` cũ |
   | `LARK_APP_SECRET` | Copy từ file `.env` cũ |
   | `SUPABASE_URL` | Copy từ file `.env` cũ |
   | `SUPABASE_SERVICE_KEY` | Copy từ file `.env` cũ |

   *(Lưu ý: Không cần `DATABASE_URL` hay `PORT` nữa)*

5. Bấm **Save and Deploy**.

---

## Bước 3: Cấu hình Lark Console

Vì tên miền đã thay đổi (Cloudflare cấp cho bạn domain dạng `https://lark-task-sync.pages.dev`), bạn cần vào **Lark Developer Console** để cập nhật:

1. Vào mục **Security Settings** -> **Redirect URLs**.
2. Thêm URL mới của bạn vào:
   `https://<YOUR-PROJECT>.pages.dev/api/auth/callback`
   *(Thay `<YOUR-PROJECT>` bằng tên project bạn đặt trên Cloudflare)*

---

Vậy là xong! App của bạn giờ chạy siêu nhanh, free 100% và không cần spin-up server lạnh. 🚀
