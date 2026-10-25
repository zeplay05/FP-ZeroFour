import html2canvas from 'html2canvas';

export async function captureLotteryBoard(element, fileName = 'lottery-board-00-99.png') {
  if (!element) return;

  try {
    // Scroll element into view and wait briefly
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina)
      useCORS: true,
      logging: false,
      backgroundColor: null,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Ensure cloned element is clean and fully visible
        const target = clonedDoc.getElementById('lottery-capture-target');
        if (target) {
          target.style.transform = 'none';
          target.style.boxShadow = 'none';
          target.style.margin = '0 auto';
        }
      }
    });

    // Convert to image download
    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return imageURL;
  } catch (error) {
    console.error('Error capturing lottery board:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกภาพ กรุณาลองใหม่อีกครั้ง');
  }
}
