from pdf2image import convert_from_path
import os

def pdf_to_images(pdf_path, output_folder, output_prefix="page"):
    """
    Converts a PDF file to a set of images, one image per page.

    Args:
        pdf_path (str): The path to the PDF file.
        output_folder (str): The folder where the images will be saved.
        output_prefix (str):  The prefix for the image filenames.  Defaults to "page".
    """

    try:
        # Create the output folder if it doesn't exist
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Convert PDF to a list of PIL Images
        images = convert_from_path(pdf_path)  #  poppler_path needed sometimes!

        # Save each image to a file
        for i, image in enumerate(images):
            image_path = os.path.join(output_folder, f"{output_prefix}_{i+1}.jpg")  # You can change the extension to .png or .tiff etc.
            image.save(image_path, "JPEG") # or "PNG", "TIFF"
            print(f"Page {i+1} saved to {image_path}")

        print(f"Successfully converted {pdf_path} to images in {output_folder}")

    except Exception as e:
        print(f"An error occurred: {e}")
        print("Possible issue:  Poppler may not be installed or accessible. See instructions below.")
        print("Check if Poppler is installed and its 'bin' directory is in your PATH.")


if __name__ == '__main__':
    # Example usage:
    pdf_file = "pdf/file.pdf"  # Replace with your PDF file
    output_directory = "output_images" # Replace with your desired output directory

    # Create a dummy example.pdf file if it doesn't exist (for testing)
    if not os.path.exists(pdf_file):
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(pdf_file)
        c.drawString(100, 750, "This is a sample PDF.")
        c.drawString(100, 700, "Page 2 will be created below.")
        c.showPage()
        c.drawString(100, 750, "This is the second page.")
        c.save()
        print(f"Created a dummy PDF '{pdf_file}' for testing.")


    pdf_to_images(pdf_file, output_directory)


# IMPORTANT NOTES:

# 1.  Install Required Libraries:
#    ```bash
#    pip install pdf2image Pillow reportlab
#    ```

# 2. Poppler Dependency:  `pdf2image` relies on the `poppler` library for PDF rendering.
#
#    *   **Windows:** Download the latest Poppler binaries from
#        https://github.com/oschwartz10612/poppler-windows/releases  (get the prebuilt binaries).
#        Extract the ZIP file. Add the `bin` directory inside the extracted folder to your system's PATH environment variable.  You might need to restart your computer after changing the PATH.
#
#    *   **macOS:**
#        ```bash
#        brew install poppler
#        ```
#
#    *   **Linux (Debian/Ubuntu):**
#        ```bash
#        sudo apt-get update
#        sudo apt-get install poppler-utils
#        ```
#
#    *   **Linux (Fedora/CentOS/RHEL):**
#        ```bash
#        sudo dnf install poppler-utils
#        ```

# 3.  Specifying Poppler Path (if needed): If `pdf2image` can't find Poppler automatically,
#     you can explicitly provide the path to the `poppler/bin` directory when calling `convert_from_path`:

#     ```python
#     from pdf2image import convert_from_path
#     images = convert_from_path(pdf_path, poppler_path=r"C:\path\to\poppler-xx\bin") # Replace with the actual path
#     ```
#     Make sure to use raw string (r"...") for the path on Windows to avoid backslash escape issues.  The `poppler_path` is an optional argument to convert_from_path.
#
# 4. Image Format and Quality:  You can control the image format (JPEG, PNG, TIFF, etc.)
#    and quality settings when saving the images using Pillow's `save()` method.
#
# 5. DPI (Resolution): The default DPI is typically 200. You can adjust the DPI using the `dpi` parameter in `convert_from_path` if you need higher or lower resolution images:
#     ```python
#     images = convert_from_path(pdf_path, dpi=300) # for 300 DPI
#     ```

# 6. Handling Encrypted PDFs:  `pdf2image` might have trouble with password-protected or encrypted PDFs.  You might need to use a different library (like `PyPDF2`) to decrypt the PDF first.