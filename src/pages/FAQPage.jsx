import React, { useEffect, useState } from 'react';
import { Accordion, Container, Row, Col } from 'react-bootstrap';
import Axios from 'axios';
// Formatting saved by the admin's rich-text editor (indent, alignment, etc.)
// is encoded as ql-* CSS classes that only render correctly with Quill's own
// stylesheet loaded and a .ql-editor ancestor - both required here to make
// admin-edited formatting actually show up on this public page.
import 'react-quill/dist/quill.snow.css';

function FAQPage() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [faqSections, setFaqSections] = useState([]);

  useEffect(() => {
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
      .then(res => {
        // Parse JSON if it's stored as a string in DB
        let rawSections = res.data.faq_sections;
        if (typeof rawSections === 'string') {
          try {
            rawSections = JSON.parse(rawSections);
          } catch (e) {
            console.error('Invalid JSON in faqSections', e);
            rawSections = [];
          }
        }
        setFaqSections(rawSections);
      })
      .catch(err => console.error('Failed to load FAQs', err));
  }, [baseURL]);

  return (
    <Container className="my-5">
        <Row className='justify-content-center'>
            <Col md={6}>
            <h2 className="mb-4">Frequently Asked Questions</h2>
            {faqSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                    <h4 className="mb-3">{section.title}</h4>
                    <Accordion defaultActiveKey={`${sectionIndex}-0`}>
                    {section.faqs.map((faq, faqIndex) => (
                        <Accordion.Item
                        key={faqIndex}
                        eventKey={`${sectionIndex}-${faqIndex}`}
                        >
                        <Accordion.Header>{faq.question}</Accordion.Header>
                        <Accordion.Body>
                            <div
                            className="ql-editor p-0"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </Accordion.Body>
                        </Accordion.Item>
                    ))}
                    </Accordion>
                </div>
            ))}
            </Col>
        </Row>
    </Container>
  );
}

export default FAQPage;
