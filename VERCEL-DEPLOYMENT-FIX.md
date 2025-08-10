# Vercel Deployment Guide

## ปัญหาที่พบ
เมื่อ deploy บน Vercel แล้วไม่สามารถเข้าถึง routes ต่อไปนี้ได้:
- `/lost-pets`
- `/found-pets` 
- `/found-search`
- `/rewards`

## สาเหตุ
1. **SPA Routing**: React Router ใช้ client-side routing แต่ Vercel ต้องการ configuration สำหรับ fallback ไปยัง index.html
2. **ไม่มี vercel.json**: Vercel ต้องการไฟล์ configuration เพื่อ handle routing

## การแก้ไข

### 1. สร้างไฟล์ vercel.json
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. ปรับปรุง vite.config.ts
เพิ่ม configuration สำหรับ SPA:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: undefined
    }
  }
},
server: {
  historyApiFallback: true
},
preview: {
  port: 4173,
  strictPort: true
}
```

## ขั้นตอนการ Deploy ใหม่

1. **Commit การเปลี่ยนแปลง**:
   ```bash
   git add .
   git commit -m "Add Vercel routing configuration"
   git push
   ```

2. **Redeploy บน Vercel**:
   - Vercel จะ auto-deploy เมื่อ push ไปยัง main branch
   - หรือไป Dashboard และคลิก "Redeploy"

3. **ทดสอบ**:
   - ลองเข้า https://paw-finder-main.vercel.app/lost-pets
   - ลองเข้า https://paw-finder-main.vercel.app/found-pets
   - ลองเข้า https://paw-finder-main.vercel.app/rewards

## การตรวจสอบ Local

ทดสอบ production build ใน local:
```bash
npm run build
npm run preview
```

จากนั้นลองเข้า:
- http://localhost:4173/lost-pets
- http://localhost:4173/found-pets
- http://localhost:4173/rewards

## หมายเหตุ

- การเปลี่ยนแปลงนี้จะไม่กระทบต่อ development (`npm run dev`)
- Routes ทั้งหมดจะทำงานได้ปกติหลังจาก deploy ใหม่
