import PDFDocument from "pdfkit";

const drawDivider = (doc) => {
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
};

const renderTableRow = (doc, { columns, widths, y }) => {
  let x = doc.page.margins.left;
  columns.forEach((text, index) => {
    doc.text(text, x, y, { width: widths[index], align: index === columns.length - 1 ? "right" : "left" });
    x += widths[index];
  });
};

export const createQuotePdf = async ({ quote, items, baseUrl }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 54, left: 54, right: 54, bottom: 54 } });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text("Continuate Proposal", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#555555").text(`Quote ID: ${quote.id}`);
    doc.text(`Prepared for: ${quote.customer}`);
    doc.text(`Primary contact: ${quote.contactName ?? "—"} (${quote.contactEmail ?? "—"})`);
    doc.text(`Prepared by: ${quote.owner ?? "—"}`);
    doc.text(`Expires: ${quote.expiresAt ?? "—"}`);
    doc.moveDown(0.75);
    drawDivider(doc);
    doc.moveDown(0.75);

    doc.fillColor("#111111").fontSize(14).text("Scope of Services");
    doc.moveDown(0.4);

    const columnWidths = [220, 90, 80, 90];
    const tableStart = doc.y;
    doc.fontSize(10).fillColor("#555555");
    renderTableRow(doc, {
      columns: ["Service", "Category", "Qty", "Monthly"],
      widths: columnWidths,
      y: tableStart,
    });
    doc.moveDown(0.6);

    doc.fillColor("#111111");
    items.forEach((item) => {
      const rowY = doc.y;
      renderTableRow(doc, {
        columns: [
          item.name,
          item.category,
          `${item.quantity} ${item.unit ?? ""}`.trim(),
          new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
            Number(item.quantity || 0) * Number(item.unitPrice || 0),
          ),
        ],
        widths: columnWidths,
        y: rowY,
      });
      doc.moveDown(0.35);
      if (doc.y > doc.page.height - 180) {
        doc.addPage();
      }
    });

    doc.moveDown(0.6);
    drawDivider(doc);
    doc.moveDown(0.6);

    doc.fontSize(12).fillColor("#111111").text("Estimated Monthly Total", { continued: true });
    doc.fontSize(12).text(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(quote.total || 0)),
      { align: "right" },
    );

    doc.moveDown(0.8);
    doc.fontSize(12).fillColor("#111111").text("Assumptions");
    doc.fontSize(10).fillColor("#444444");
    (quote.assumptions ?? []).forEach((assumption) => {
      doc.text(`• ${assumption}`);
    });

    doc.moveDown(0.6);
    doc.fontSize(12).fillColor("#111111").text("Terms");
    doc.fontSize(10).fillColor("#444444");
    (quote.terms ?? []).forEach((term) => {
      doc.text(`• ${term}`);
    });

    doc.moveDown(0.8);
    doc.fontSize(10).fillColor("#555555").text(
      `Review and accept online: ${baseUrl.replace(/\/$/, "")}/quote/${quote.id}`,
    );

    doc.end();
  });
