import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_dir = r"c:\Users\vinay\Desktop\Cortexx_SIH\farmer-app\public\reports"
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, "Wheat_Aphid_Infestation_Diagnosis_Report.pdf")

    # Also copy to artifacts dir so it's accessible via both links
    artifact_dir = r"C:\Users\vinay\.gemini\antigravity\brain\51387c08-51ca-4c2f-9f0d-2fd889dec8cf"
    artifact_pdf_path = os.path.join(artifact_dir, "Wheat_Aphid_Infestation_Diagnosis_Report.pdf")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1b5e20')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=6,
        spaceAfter=4
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#111827'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#374151')
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=body_style,
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#4b5563')
    )

    elements = []

    badge_data = [
        [
            Paragraph("<b>KISAN MITRA &bull; AI CROP DIAGNOSIS REPORT</b><br/><font size='13' color='#111827'><b>Wheat Aphid Infestation &mdash; likely Green Aphid / Grain Aphid</b></font>", title_style),
            Paragraph("<b>MATCH SCORE</b><br/><font size='15' color='#16a34a'><b>~95%</b></font><br/><font size='8' color='#6b7280'>Visual Match</font>", ParagraphStyle('Badge', parent=body_style, alignment=1))
        ]
    ]
    badge_table = Table(badge_data, colWidths=[420, 120])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#86efac')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bbf7d0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(badge_table)
    elements.append(Spacer(1, 8))

    overview_text = (
        "<b>Clinical Overview:</b><br/>"
        "The image clearly shows a large colony of small, soft-bodied green aphids feeding along the wheat leaf. "
        "<b>This is an insect pest infestation, not a fungal disease.</b><br/>"
        "Aphids suck plant sap and can cause yellowing, curling, reduced growth, and yield loss when populations become high. "
        "Some aphid species can also transmit plant viruses (e.g. Barley Yellow Dwarf Virus - BYDV)."
    )
    elements.append(Paragraph(overview_text, body_style))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("<b>What to Check on Your Crop (Diagnostic Indicators)</b>", h2_style))
    check_rows = [
        [Paragraph("<b>Observed Sign</b>", bold_body), Paragraph("<b>Diagnostic Interpretation</b>", bold_body)],
        [Paragraph("Many small green, soft-bodied insects clustered together", body_style), Paragraph("Aphid infestation is highly likely", bold_body)],
        [Paragraph("Aphids concentrated along the leaf", body_style), Paragraph("Typical feeding behavior", bold_body)],
        [Paragraph("Some winged adults among wingless aphids", body_style), Paragraph("Indicates the colony can spread to other plants", bold_body)],
        [Paragraph("Leaf yellowing or weakening", body_style), Paragraph("Can occur with heavy sap feeding", bold_body)],
        [Paragraph("Ants around aphid colonies", body_style), Paragraph("May indicate aphids (ants feed on secreted honeydew)", bold_body)],
    ]
    t_check = Table(check_rows, colWidths=[270, 270])
    t_check.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f3f4f6')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#d1d5db')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_check)
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("<b>Treatment Protocol</b>", h2_style))

    elements.append(Paragraph("<b>Phase 1: Immediate Steps</b>", subtitle_style))
    p1_steps = [
        "<b>1. Inspect the entire field:</b> Check whether aphids are confined to isolated patches, field edges, or are widely distributed across the wheat crop.",
        "<b>2. Check the undersides of leaves and stems:</b> Aphids often cluster along leaf veins, sheaths, and near developing heads.",
        "<b>3. Look for natural predators / beneficial insects:</b> Check for ladybugs (ladybird beetles), lacewing larvae, hoverfly larvae, or parasitized mummies before spraying insecticides.",
        "<b>4. Avoid unnecessary broad-spectrum spraying:</b> Overusing broad-spectrum insecticides can eliminate beneficial natural predators and exacerbate aphid outbreaks later.",
        "<b>5. Assess the growth stage of the wheat:</b> Aphid control is particularly critical from boot stage through grain-filling when yield impact is greatest."
    ]
    for step in p1_steps:
        elements.append(Paragraph(f"&bull; {step}", bullet_style))
    elements.append(Spacer(1, 6))

    elements.append(Paragraph("<b>Phase 2: Management & Chemical / Biological Interventions</b>", subtitle_style))
    p2_steps = [
        "<b>Economic Threshold Guidelines:</b> If aphid populations exceed local threshold guidelines (e.g. 5-10+ aphids per tiller/head depending on growth stage and local advisories):",
        "&bull; Consider an approved targeted aphid insecticide recommended by local agricultural extension services.",
        "&bull; Choose selective insecticides whenever possible to help conserve natural enemies.",
        "&bull; Always follow the label instructions regarding dosage, safety equipment, application timing, and pre-harvest interval (PHI).",
        "&bull; Rotate insecticide classes / modes of action (IRAC groups) to prevent aphids from developing insecticide resistance.",
        "&bull; Encourage beneficial insect populations by planting flowering border strips or avoiding preventive prophylactic calendar sprays."
    ]
    for step in p2_steps:
        elements.append(Paragraph(step, bullet_style))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("<b>Future Agronomy Insights & Key Prevention Rules</b>", h2_style))
    insights_text = (
        "Aphid numbers can multiply very quickly under moderate temperatures. In wheat, early feeding on flag leaves "
        "and developing heads can reduce grain number and grain weight. In addition to direct feeding damage, some aphids "
        "can transmit Barley Yellow Dwarf Virus (BYDV), making regular monitoring of field borders essential."
    )
    elements.append(Paragraph(insights_text, body_style))
    elements.append(Spacer(1, 6))

    rules_data = [
        [
            Paragraph("&bull; Regular field scouting &rarr; <b>Early detection</b><br/>&bull; Protect flag leaf and wheat heads &rarr; <b>Preserve grain yield</b><br/>&bull; Conserve beneficial insects &rarr; <b>Natural pest suppression</b>", body_style),
            Paragraph("&bull; Spray only above economic thresholds &rarr; <b>Prevent resistance</b><br/>&bull; Rotate insecticide modes of action &rarr; <b>Avoid chemical failure</b><br/>&bull; Monitor field borders first &rarr; <b>Catch migrations early</b>", body_style)
        ]
    ]
    t_rules = Table(rules_data, colWidths=[270, 270])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#a7f3d0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_rules)
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("<b>Important Field Distinction: Aphids vs. Diseases</b>", h2_style))
    dist_rows = [
        [Paragraph("<b>Issue / Pest / Disease</b>", bold_body), Paragraph("<b>Visible Presentation in Field</b>", bold_body)],
        [Paragraph("<b>Wheat Aphids</b>", bold_body), Paragraph("Small, live, moving green insects clustering along leaves and stems; sticky honeydew", body_style)],
        [Paragraph("<b>Leaf Rust</b>", bold_body), Paragraph("Orange/brown powdery fungal pustules scattered randomly across the leaf", body_style)],
        [Paragraph("<b>Loose Smut</b>", bold_body), Paragraph("Entire wheat head replaced by a dark black/brown powdery spore mass", body_style)],
        [Paragraph("<b>Powdery Mildew</b>", bold_body), Paragraph("White, fluffy/powdery fungal patches on the upper surface of leaves", body_style)],
    ]
    t_dist = Table(dist_rows, colWidths=[150, 390])
    t_dist.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f3f4f6')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#d1d5db')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_dist)
    elements.append(Spacer(1, 8))

    disclaimer_text = (
        "<i><b>Diagnostic Notice:</b> Exact aphid species (such as English grain aphid, bird cherry-oat aphid, or greenbug) "
        "is best confirmed through closer microscopic examination of body shape and cornicles. Recommendations should be aligned "
        "with local agricultural extension guidelines.</i>"
    )
    elements.append(Paragraph(disclaimer_text, callout_style))

    doc.build(elements)

    # Copy to artifact dir
    import shutil
    shutil.copy2(pdf_path, artifact_pdf_path)

    print("SUCCESS: PDF created at", pdf_path, "and copied to", artifact_pdf_path)

if __name__ == "__main__":
    generate_pdf()
