function createCenteredImageWithBorder(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Ensure there are no cross-origin issues
        img.src = imageSrc;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Padding and border setup
            const padding = 20; // Adjust as needed
            const border = 10; // Border thickness
            const canvasSize = Math.max(img.width, img.height) + padding * 2 + border * 2;
            canvas.width = canvasSize;
            canvas.height = canvasSize;

            // Fill the canvas with a white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the border
            ctx.fillStyle = 'black'; // Change border color here
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(border, border, canvas.width - border * 2, canvas.height - border * 2);

            // Center and draw the original image onto the canvas
            const x = (canvas.width - img.width) / 2;
            const y = (canvas.height - img.height) / 2;
            ctx.drawImage(img, x, y, img.width, img.height);

            // Convert the canvas to an image URL and resolve the promise
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
    });
}

// Export the function
export { createCenteredImageWithBorder };