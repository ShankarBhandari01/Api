import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

class PDFGenerator {
  constructor(fontSize = 11) {
    this.fontSize = fontSize;
  }

  async generateKitchenOrderPDF(data, hight = 300, width = 600) {
    this.data = data;
    this.hight = hight;
    this.width = width;
    await this.createPdfDoc();
    return this.drawPDF();
  }

  async createPdfDoc() {
    this.pdfDoc = await PDFDocument.create();
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  writeText(page, text, x, y) {
    page.drawText(text, {
      x,
      y,
      size: this.fontSize,
      font: this.font,
      color: rgb(0, 0, 0),
    });
  }

  async drawPDF() {
    const page = this.pdfDoc.addPage([this.hight, this.width]);
    const writeText = this.writeText.bind(this, page); // Bind page to writeText

    let y = 570;
    writeText("🍽️ KITCHEN ORDER TICKET", 50, y);
    y -= 20;
    writeText(`Table No: ${this.data.table_number}`, 20, y);
    y -= 15;
    writeText(`Order No: ${this.data.order_number}`, 20, y);
    y -= 15;
    writeText(`Order Time: ${this.data.order_time}`, 20, y);
    y -= 15;
    writeText(`Waiter: ${this.data.waiter_name}`, 20, y);
    y -= 25;

    writeText("Items:", 20, y);
    y -= 15;

    for (const item of this.data.items) {
      writeText(`• ${item.name} x${item.quantity}`, 30, y);
      y -= 15;
      if (item.notes) {
        writeText(`  (${item.notes})`, 40, y);
        y -= 15;
      }
    }

    const pdfBytes = await this.pdfDoc.save();
    return pdfBytes;
  }
}

export default PDFGenerator;
