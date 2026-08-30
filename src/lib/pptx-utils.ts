import pptxgen from 'pptxgenjs';
import { PresentationData, Slide } from './types';

export function exportToPPTX(data: PresentationData, filename: string = 'Presentation.pptx') {
  const pptx = new pptxgen();

  pptx.layout = data.aspectRatio === '4:3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';
  pptx.title = data.title || 'Presentation';

  data.slides.forEach((slideData: Slide) => {
    const pptxSlide = pptx.addSlide();

    // Background color
    if (slideData.bgColor) {
      pptxSlide.background = { color: slideData.bgColor.replace('#', '') };
    } else {
      pptxSlide.background = { color: '0F172A' }; // Modern dark background
    }

    // Title
    if (slideData.title) {
      pptxSlide.addText(slideData.title, {
        x: 0.8,
        y: 0.6,
        w: 8.4,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: 'F8FAFC',
        fontFace: 'Arial',
      });
    }

    // Elements
    if (slideData.elements && slideData.elements.length > 0) {
      slideData.elements.forEach((elem) => {
        if (elem.type === 'text') {
          pptxSlide.addText(elem.content || '', {
            x: 0.8,
            y: 1.6,
            w: 8.4,
            h: 4.5,
            fontSize: elem.fontSize || 18,
            color: (elem.color || '#CBD5E1').replace('#', ''),
            fontFace: 'Arial',
            bullet: slideData.layout === 'content',
          });
        } else if (elem.type === 'image' && elem.content.startsWith('data:image')) {
          pptxSlide.addImage({
            data: elem.content,
            x: 1.0,
            y: 2.0,
            w: 4.5,
            h: 3.0,
          });
        } else if (elem.type === 'shape') {
          pptxSlide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: 1.4,
            w: 8.4,
            h: 0.05,
            fill: { color: '3B82F6' },
          });
        }
      });
    }

    // Speaker Notes
    if (slideData.speakerNotes) {
      pptxSlide.addNotes(slideData.speakerNotes);
    }
  });

  const cleanFilename = filename.endsWith('.pptx') ? filename : `${filename}.pptx`;
  pptx.writeFile({ fileName: cleanFilename });
}

export function createInitialPresentation(title: string = 'Untitled Presentation'): PresentationData {
  return {
    title,
    aspectRatio: '16:9',
    slides: [
      {
        id: 'slide_1',
        title: title,
        layout: 'title',
        bgColor: '#0f172a',
        elements: [
          {
            id: 'elem_1',
            type: 'text',
            content: 'Created with Document Studio ✦ v1.5',
            fontSize: 20,
            color: '#94a3b8',
          },
        ],
        speakerNotes: 'Welcome to your AI-generated presentation.',
      },
      {
        id: 'slide_2',
        title: 'Key Objectives',
        layout: 'content',
        bgColor: '#0f172a',
        elements: [
          {
            id: 'elem_2',
            type: 'text',
            content: '• Overview of key goals\n• Strategic milestones & timeline\n• Expected outcomes and next steps',
            fontSize: 18,
            color: '#e2e8f0',
          },
        ],
        speakerNotes: 'Detail the main objectives here.',
      },
    ],
  };
}
