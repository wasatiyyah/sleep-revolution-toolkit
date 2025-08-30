#!/usr/bin/env python3
"""
HTML to PDF Converter for Sleep Toolkit
Converts beautiful HTML designs to high-quality PDFs with preserved formatting
"""

import os
import sys
from pathlib import Path

try:
    import weasyprint
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
except ImportError:
    print("❌ WeasyPrint not installed. Installing now...")
    os.system("pip install weasyprint")
    import weasyprint
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration

def convert_html_to_pdf(html_file_path, output_pdf_path=None, optimize_for_mobile=False):
    """
    Convert HTML file to PDF with preserved styling
    
    Args:
        html_file_path (str): Path to HTML file
        output_pdf_path (str): Output PDF path (optional)
        optimize_for_mobile (bool): Optimize for mobile viewing
    """
    
    # Validate input file
    if not os.path.exists(html_file_path):
        print(f"❌ Error: HTML file not found: {html_file_path}")
        return False
    
    # Generate output path if not provided
    if not output_pdf_path:
        html_path = Path(html_file_path)
        output_pdf_path = html_path.parent / f"{html_path.stem}.pdf"
    
    print(f"🔄 Converting: {os.path.basename(html_file_path)}")
    print(f"📄 Output: {output_pdf_path}")
    
    try:
        # Font configuration for better text rendering
        font_config = FontConfiguration()
        
        # Additional CSS for PDF optimization
        pdf_css = CSS(string="""
            @page {
                margin: 0.5in;
                size: A4;
            }
            
            body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .emergency-card {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            
            .card {
                page-break-inside: avoid;
            }
            
            .no-print {
                display: none;
            }
        """, font_config=font_config)
        
        # Mobile optimization CSS
        mobile_css = CSS(string="""
            @page {
                margin: 0.3in;
                size: A4 portrait;
            }
            
            body {
                font-size: 14px;
                line-height: 1.4;
            }
            
            .emergency-card {
                margin-bottom: 15px;
                padding: 15px;
            }
            
            h1, h2, h3 {
                font-size: 1.2em;
                margin-bottom: 10px;
            }
            
            .card-content {
                font-size: 12px;
            }
        """, font_config=font_config) if optimize_for_mobile else None
        
        # Convert HTML to PDF
        html_doc = HTML(filename=html_file_path)
        
        # Apply CSS stylesheets
        stylesheets = [pdf_css]
        if mobile_css:
            stylesheets.append(mobile_css)
        
        # Generate PDF
        pdf_bytes = html_doc.write_pdf(
            stylesheets=stylesheets,
            font_config=font_config,
            optimize_images=True,
            presentational_hints=True
        )
        
        # Write PDF to file
        with open(output_pdf_path, 'wb') as pdf_file:
            pdf_file.write(pdf_bytes)
        
        # Get file size
        file_size = os.path.getsize(output_pdf_path)
        file_size_mb = file_size / (1024 * 1024)
        
        print(f"✅ Success! PDF created: {output_pdf_path}")
        print(f"📊 File size: {file_size_mb:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Error converting {html_file_path}: {str(e)}")
        return False

def convert_all_toolkit_files():
    """Convert all HTML toolkit files to PDF"""
    
    toolkit_dir = Path("toolkit/pdf-designs")
    output_dir = Path("toolkit/final-pdfs")
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    # HTML files to convert
    html_files = {
        "Emergency_Cards.html": {
            "output": "Quick_Reference_Emergency_Cards.pdf",
            "mobile": True
        },
        "Sleep_Revolution_Toolkit_Main_Guide.html": {
            "output": "Sleep_Revolution_Toolkit_Main_Guide.pdf",
            "mobile": False
        },
        "Sleep_Tracker.html": {
            "output": "30_Day_Sleep_Revolution_Tracker.pdf",
            "mobile": False
        },
        "Bonus_Materials.html": {
            "output": "Sleep_Revolution_Bonus_Materials.pdf",
            "mobile": False
        },
        "Audio_Instructions.html": {
            "output": "Sleep_Soundscapes_Instructions.pdf",
            "mobile": False
        }
    }
    
    successful_conversions = 0
    total_size_mb = 0
    
    print("🚀 Starting PDF conversion process...")
    print("=" * 50)
    
    for html_file, config in html_files.items():
        html_path = toolkit_dir / html_file
        pdf_path = output_dir / config["output"]
        
        if html_path.exists():
            success = convert_html_to_pdf(
                str(html_path), 
                str(pdf_path), 
                optimize_for_mobile=config["mobile"]
            )
            
            if success:
                successful_conversions += 1
                file_size = os.path.getsize(pdf_path) / (1024 * 1024)
                total_size_mb += file_size
                print(f"   Size: {file_size:.2f} MB")
            
            print("-" * 30)
        else:
            print(f"⚠️  HTML file not found: {html_file}")
    
    print(f"📊 Conversion Summary:")
    print(f"   ✅ Successful: {successful_conversions}/5")
    print(f"   📦 Total size: {total_size_mb:.2f} MB")
    print(f"   📁 Output folder: {output_dir}")
    
    if successful_conversions > 0:
        print("\n🎉 Your Sleep Revolution Toolkit PDFs are ready!")
        print(f"📂 Find them in: {output_dir.absolute()}")

def main():
    """Main function"""
    if len(sys.argv) > 1:
        # Convert specific file
        html_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        mobile_opt = "--mobile" in sys.argv
        
        success = convert_html_to_pdf(html_file, output_file, mobile_opt)
        if success:
            print("🎉 Conversion completed successfully!")
        else:
            print("❌ Conversion failed!")
            sys.exit(1)
    else:
        # Convert all files
        convert_all_toolkit_files()

if __name__ == "__main__":
    main()