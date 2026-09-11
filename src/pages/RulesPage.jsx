import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import { DEFAULT_RULES_HTML } from '../constants/defaultRulesText';
// Formatting saved by the admin's rich-text editor (indent, alignment, etc.)
// is encoded as ql-* CSS classes that only render correctly with Quill's own
// stylesheet loaded and a .ql-editor ancestor - both required here to make
// admin-edited formatting actually show up on this public page.
import 'react-quill/dist/quill.snow.css';

function RulesPage() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [rulesText, setRulesText] = useState('');

  useEffect(() => {
    Axios.get(`${baseURL}/user/get-homepage-text.php`)
      .then((res) => {
        if (res.data?.rules_text) {
          setRulesText(res.data.rules_text);
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage text:', err);
      });
  }, [baseURL]);

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: rulesText || DEFAULT_RULES_HTML }} />
        </Col>
      </Row>
    </Container>
  );
}

export default RulesPage;
