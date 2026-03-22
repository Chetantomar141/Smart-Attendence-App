import PDFDocument from 'pdfkit';

/**
 * Generate Fee Receipt PDF
 */
export const generateFeeReceipt = (student, fee) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fillColor('#2563eb').fontSize(24).text('SMART SCHOOL', { align: 'center' });
      doc.fontSize(10).fillColor('#666').text('Official Fee Receipt', { align: 'center' });
      doc.moveDown(2);

      // Receipt Info
      doc.fillColor('#000').fontSize(12).text(`Receipt No: REC-${Date.now().toString().slice(-6)}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Student Info
      doc.fontSize(14).fillColor('#2563eb').text('Student Details');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000');
      doc.text(`Name: ${student.name}`);
      doc.text(`Student ID: ${student.uniqueId}`);
      doc.text(`Class: ${student.class}`);
      doc.text(`Roll No: ${student.rollNo}`);
      doc.moveDown(2);

      // Fee Table
      doc.fontSize(14).fillColor('#2563eb').text('Fee Breakdown');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#666');
      doc.text('Description', 50, tableTop);
      doc.text('Amount (₹)', 450, tableTop, { align: 'right' });
      
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke('#eee');
      doc.moveDown();

      doc.fillColor('#000').fontSize(12);
      doc.text('Base Tuition Fee', 50, doc.y);
      doc.text(`₹${fee.total - (fee.transport || 0) - (fee.miscellaneous || 0)}`, 450, doc.y, { align: 'right' });
      doc.moveDown();

      doc.text('Transport Fee', 50, doc.y);
      doc.text(`₹${fee.transport || 0}`, 450, doc.y, { align: 'right' });
      doc.moveDown();

      doc.text('Miscellaneous Fee', 50, doc.y);
      doc.text(`₹${fee.miscellaneous || 0}`, 450, doc.y, { align: 'right' });
      doc.moveDown();

      doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke('#2563eb');
      doc.moveDown(0.5);

      doc.fontSize(14).font('Helvetica-Bold').text('Total Fee', 50, doc.y);
      doc.text(`₹${fee.total}`, 450, doc.y, { align: 'right' });
      doc.moveDown();

      doc.fontSize(14).fillColor('#059669').text('Amount Paid', 50, doc.y);
      doc.text(`₹${fee.paid}`, 450, doc.y, { align: 'right' });
      doc.moveDown();

      doc.fontSize(14).fillColor('#dc2626').text('Balance Due', 50, doc.y);
      doc.text(`₹${fee.total - fee.paid}`, 450, doc.y, { align: 'right' });
      doc.moveDown(3);

      // Footer
      doc.fontSize(10).fillColor('#999').text('This is a computer-generated receipt and does not require a physical signature.', { align: 'center' });
      doc.text('Thank you for choosing Smart School.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Attendance Report PDF
 */
export const generateAttendanceReport = (student, attendance) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fillColor('#2563eb').fontSize(24).text('SMART SCHOOL', { align: 'center' });
      doc.fontSize(10).fillColor('#666').text('Attendance Performance Report', { align: 'center' });
      doc.moveDown(2);

      // Student Info
      doc.fontSize(14).fillColor('#2563eb').text('Student Details');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000');
      doc.text(`Name: ${student.name}`);
      doc.text(`Student ID: ${student.uniqueId}`);
      doc.text(`Class: ${student.class}`);
      doc.text(`Roll No: ${student.rollNo}`);
      doc.moveDown(2);

      // Attendance Summary
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

      doc.fontSize(14).fillColor('#2563eb').text('Attendance Summary');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000');
      doc.text(`Total Working Days: ${totalDays}`);
      doc.text(`Present Days: ${presentDays}`);
      doc.text(`Absent Days: ${totalDays - presentDays}`);
      doc.text(`Attendance Percentage: ${percentage}%`);
      doc.moveDown(2);

      // History Table
      doc.fontSize(14).fillColor('#2563eb').text('Attendance History (Last 30 Records)');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#666');
      doc.text('Date', 50, tableTop);
      doc.text('Subject', 200, tableTop);
      doc.text('Status', 450, tableTop, { align: 'right' });
      
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke('#eee');
      doc.moveDown();

      doc.fillColor('#000').fontSize(10);
      attendance.slice(0, 30).forEach(record => {
        doc.text(record.date, 50, doc.y);
        doc.text(record.subject || 'General', 200, doc.y);
        doc.fillColor(record.status === 'present' ? '#059669' : '#dc2626')
           .text(record.status.toUpperCase(), 450, doc.y, { align: 'right' })
           .fillColor('#000');
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
