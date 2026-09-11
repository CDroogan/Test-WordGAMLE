import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';

// Shown until the admin sets custom text via the "Rules of WordGAMLE" tab
// on the Admin Text page.
const DEFAULT_RULES_HTML = `
  <h1>The Rules of WordGAMLE</h1>
  <h4><strong>Friends, Gamlers, Word Nerds&hellip; Welcome to WordGAMLE.</strong></h4>
  <p>The first rule of WordGAMLE is: <strong>You always talk about WordGAMLE.</strong></p>
  <p>The second rule of WordGAMLE is: <strong>You ALWAYS. Talk. About WordGAMLE.</strong></p>
  <p>Third rule of WordGAMLE: <strong>If someone loses a game, repeats a yellow, falls for a red herring&hellip; be kind.</strong></p>
  <p>Fourth rule: <strong>As many people to a group as you like.</strong></p>
  <p>Fifth rule: <strong>Enter as many groups as you like, Gamlers.</strong></p>
  <p>Sixth rule: <strong>No hints, no cheating.</strong></p>
  <p>Seventh rule: <strong>You have only until the end of each Game Period to enter your result in WordGAMLE.</strong></p>
  <p>And the eighth and final rule: <strong>If this is your first night at Fight Club&hellip; Walk away and play a Word Game!</strong></p>
`;

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
          <div dangerouslySetInnerHTML={{ __html: rulesText || DEFAULT_RULES_HTML }} />
        </Col>
      </Row>
    </Container>
  );
}

export default RulesPage;
