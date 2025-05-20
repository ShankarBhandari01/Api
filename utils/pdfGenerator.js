import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

class PDFGenerator {
  constructor(fontSize = 11) {
    this.fontSize = fontSize;
  }

  async generateKitchenOrderPDF(data) {
    this.data = data;
    this.pdfDoc = await PDFDocument.create();
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    return this.drawKot();
  }

  async drawKot() {
    const page = this.pdfDoc.addPage([300, 600]); // Small receipt-style page

    const drawText = (text, x, y) => {
      page.drawText(text, {
        x,
        y,
        size: this.fontSize,
        font: this.font,
        color: rgb(0, 0, 0),
      });
    };

    let y = 570;
    drawText("🍽️ KITCHEN ORDER TICKET", 50, y);
    y -= 20;
    drawText(`Table No: ${this.data.table_number}`, 20, y);
    y -= 15;
    drawText(`Order No: ${this.data.order_number}`, 20, y);
    y -= 15;
    drawText(`Order Time: ${this.data.order_time}`, 20, y);
    y -= 15;
    drawText(`Waiter: ${this.data.waiter_name}`, 20, y);
    y -= 25;

    drawText("Items:", 20, y);
    y -= 15;

    for (const item of this.data.items) {
      drawText(`• ${item.name} x${item.quantity}`, 30, y);
      y -= 15;
      if (item.notes) {
        drawText(`  (${item.notes})`, 40, y);
        y -= 15;
      }
    }

    const pdfBytes = await this.pdfDoc.save();
    return pdfBytes;
  }
}

export default PDFGenerator;
